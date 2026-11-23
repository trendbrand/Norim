import { computeCanonicalTotals, fromCents } from "../calculator.js";
import { validateCanonicalInvoice } from "../validator.js";
import type {
  CanonicalInvoice,
  FormatProfile,
  InvoiceLine,
  SellerParty,
  ValidationReport,
  VatCategoryCode,
} from "../types.js";

export interface ShopifyOrderPayload {
  id: number;
  order_number?: number;
  name?: string; // e.g. "#1001"
  created_at?: string; // ISO string
  currency: string;
  total_price?: string;
  total_tax?: string;
  taxes_included?: boolean;
  financial_status?: string; // "paid", "pending", …
  gateway?: string;
  payment_gateway_names?: string[];
  email?: string;
  contact_email?: string;
  note_attributes?: Array<{ name: string; value: string }>;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    zip?: string;
    country_code?: string;
    phone?: string;
  };
  customer?: { email?: string; first_name?: string; last_name?: string };
  line_items: Array<{
    id: number;
    title?: string;
    name?: string;
    quantity: number;
    price: string; // per-unit
    tax_lines?: Array<{ price: string; rate?: number; title?: string }>;
  }>;
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

function getNoteAttr(attrs: ShopifyOrderPayload["note_attributes"], keys: string[]): string | undefined {
  if (!attrs) return undefined;
  const lower = keys.map((k) => k.toLowerCase());
  const hit = attrs.find((a) => lower.includes((a.name || "").toLowerCase()));
  return hit?.value?.trim() || undefined;
}

/**
 * Maps a Shopify order webhook payload (orders/paid, orders/create, …) into a
 * validated Canonical EN 16931 Invoice. Mirrors the WooCommerce bridge: German
 * ZUGFeRD 2.3, French Factur-X 1.07, XRechnung 3.0.2 (via a leitweg_id note
 * attribute), intra-EU Reverse Charge (AE), and Kleinunternehmer § 19 UStG.
 */
export function mapShopifyOrderToCanonical(
  order: ShopifyOrderPayload,
  seller: SellerParty,
  options?: {
    iban?: string;
    bic?: string;
    buyerVatVerified?: boolean;
  }
): {
  invoice: CanonicalInvoice;
  validation: ValidationReport;
  actionRequired: boolean;
} {
  const billing = order.billing_address || {};
  const buyerCountry = (billing.country_code || seller.address.countryCode || "DE").toUpperCase();
  const buyerVatId = getNoteAttr(order.note_attributes, [
    "eu_vat_id",
    "vat_number",
    "vat",
    "_billing_eu_vat_id",
    "tax_id",
  ])
    ?.replace(/\s+/g, "")
    .toUpperCase();
  const leitwegId = getNoteAttr(order.note_attributes, ["leitweg_id", "leitweg", "buyer_reference"]);

  let targetProfile: FormatProfile = "ZUGFERD_EN16931";
  if (leitwegId) targetProfile = "XRECHNUNG_CII";
  else if (buyerCountry === "FR") targetProfile = "FACTURX_EN16931";
  else if (buyerCountry === "BE") targetProfile = "PEPPOL_BIS_3";

  const isDomestic = buyerCountry === seller.address.countryCode;
  const isIntraEu = !isDomestic && EU_COUNTRIES.has(buyerCountry);
  const isNonEu = !EU_COUNTRIES.has(buyerCountry);
  const taxesIncluded = Boolean(order.taxes_included);

  const lines: InvoiceLine[] = order.line_items.map((item, idx) => {
    const qty = item.quantity > 0 ? item.quantity : 1;
    const perUnit = Number(item.price) || 0;
    const lineTax = (item.tax_lines || []).reduce((s, tl) => s + (Number(tl.price) || 0), 0);
    const lineTotal = perUnit * qty;
    const lineNet = taxesIncluded ? Math.max(0, lineTotal - lineTax) : lineTotal;
    const declaredRate = item.tax_lines?.[0]?.rate ? Math.round(item.tax_lines[0]!.rate! * 1000) / 10 : 0;
    const computedRate = lineNet > 0 ? Math.round((lineTax / lineNet) * 1000) / 10 : declaredRate;

    let vatCategory: VatCategoryCode = "S";
    let vatRate = computedRate;
    if (seller.isKleinunternehmer) {
      vatCategory = "E";
      vatRate = 0;
    } else if (isNonEu) {
      vatCategory = "G";
      vatRate = 0;
    } else if (isIntraEu && buyerVatId && options?.buyerVatVerified !== false) {
      vatCategory = "AE";
      vatRate = 0;
    } else if (vatRate === 0 && isDomestic) {
      vatCategory = "E";
    }

    return {
      id: String(idx + 1),
      name: item.title || item.name || `Item ${idx + 1}`,
      quantity: qty,
      unitCode: "H87",
      unitPrice: Number((lineNet / qty).toFixed(4)),
      lineAllowance: 0,
      lineCharge: 0,
      lineNetAmount: Number(lineNet.toFixed(2)),
      vatCategory,
      vatRate,
    };
  });

  const orderNum = order.order_number ?? (order.name ? order.name.replace(/^#/, "") : order.id);
  const email = order.email || order.contact_email || order.customer?.email || "";
  const buyerName =
    billing.company?.trim() ||
    `${billing.first_name || order.customer?.first_name || ""} ${billing.last_name || order.customer?.last_name || ""}`.trim() ||
    email;

  const gateway = (order.gateway || order.payment_gateway_names?.[0] || "").toLowerCase();
  const isBankTransfer = /bank|manual|bacs|wire|überweisung|sepa/.test(gateway);
  const isPaid = (order.financial_status || "").toLowerCase() === "paid";

  const base: CanonicalInvoice = {
    invoiceNumber: `SH-${orderNum}`,
    issueDate: (order.created_at || new Date().toISOString()).slice(0, 10),
    typeCode: 380,
    currency: (order.currency || "EUR").toUpperCase(),
    buyerReference: leitwegId || `SH-ORD-${orderNum}`,
    notes: [`Generated automatically from Shopify Order ${order.name || `#${orderNum}`}`],
    locale: buyerCountry === "FR" ? "fr" : buyerCountry === "DE" || buyerCountry === "AT" ? "de" : "en",
    profile: targetProfile,
    seller,
    buyer: {
      name: buyerName,
      vatId: buyerVatId,
      electronicAddress: email,
      electronicAddressScheme: "EM",
      address: {
        street: billing.address1 || "",
        additionalLine: billing.address2 || undefined,
        postalCode: billing.zip || "",
        city: billing.city || "",
        countryCode: buyerCountry,
      },
    },
    payment: {
      meansCode: isBankTransfer ? "58" : "48",
      iban: options?.iban,
      bic: options?.bic,
      remittanceReference: `SH-${orderNum}`,
      paymentTerms: isBankTransfer ? "Payable by SEPA wire transfer" : "Paid via Shopify checkout",
    },
    lines,
    allowancesTotal: 0,
    chargesTotal: 0,
    prepaidAmount: isPaid && !isBankTransfer ? fromCents(Math.round((Number(order.total_price) || 0) * 100)) : 0,
    roundingAmount: 0,
  };

  const { normalized } = computeCanonicalTotals(base);
  const validation = validateCanonicalInvoice(normalized);

  return {
    invoice: normalized,
    validation,
    actionRequired: !validation.valid,
  };
}
