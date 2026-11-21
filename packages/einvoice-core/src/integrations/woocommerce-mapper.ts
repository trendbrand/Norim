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

export interface WooCommerceOrderPayload {
  id: number;
  number: string;
  date_created: string; // ISO string
  currency: string;
  total: string;
  total_tax: string;
  payment_method?: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    email: string;
  };
  meta_data?: Array<{ key: string; value: string }>;
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    subtotal: string;
    total: string;
    total_tax: string;
  }>;
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

function getMeta(meta: WooCommerceOrderPayload["meta_data"], keys: string[]): string | undefined {
  if (!meta) return undefined;
  const hit = meta.find((m) => keys.includes(m.key));
  return hit?.value?.trim() || undefined;
}

/**
 * Maps a WooCommerce order webhook payload into a validated Canonical EN 16931 Invoice.
 * Supports German ZUGFeRD 2.3, French Factur-X 1.07, XRechnung 3.0.2 (via _billing_leitweg_id),
 * Intra-EU Reverse Charge (AE), and Kleinunternehmer § 19 UStG.
 */
export function mapWooOrderToCanonical(
  order: WooCommerceOrderPayload,
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
  const buyerCountry = (order.billing.country || seller.address.countryCode || "DE").toUpperCase();
  const buyerVatId = getMeta(order.meta_data, [
    "_billing_eu_vat_id",
    "_billing_vat_number",
    "vat_number",
    "_vat_number",
  ])
    ?.replace(/\s+/g, "")
    .toUpperCase();
  const leitwegId = getMeta(order.meta_data, ["_billing_leitweg_id", "leitweg_id", "buyer_reference"]);

  let targetProfile: FormatProfile = "ZUGFERD_EN16931";
  if (leitwegId) targetProfile = "XRECHNUNG_CII";
  else if (buyerCountry === "FR") targetProfile = "FACTURX_EN16931";
  else if (buyerCountry === "BE") targetProfile = "PEPPOL_BIS_3";

  const isDomestic = buyerCountry === seller.address.countryCode;
  const isIntraEu = !isDomestic && EU_COUNTRIES.has(buyerCountry);
  const isNonEu = !EU_COUNTRIES.has(buyerCountry);

  const lines: InvoiceLine[] = order.line_items.map((item, idx) => {
    const qty = item.quantity > 0 ? item.quantity : 1;
    const netTotal = Number(item.total) || 0;
    const taxTotal = Number(item.total_tax) || 0;
    const computedRate = netTotal > 0 ? Math.round((taxTotal / netTotal) * 1000) / 10 : 0;

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
      name: item.name,
      quantity: qty,
      unitCode: "H87",
      unitPrice: Number((netTotal / qty).toFixed(4)),
      lineAllowance: 0,
      lineCharge: 0,
      lineNetAmount: netTotal,
      vatCategory,
      vatRate,
    };
  });

  const buyerName =
    order.billing.company?.trim() || `${order.billing.first_name} ${order.billing.last_name}`.trim() || order.billing.email;

  const base: CanonicalInvoice = {
    invoiceNumber: `WC-${order.number || order.id}`,
    issueDate: (order.date_created || new Date().toISOString()).slice(0, 10),
    typeCode: 380,
    currency: (order.currency || "EUR").toUpperCase(),
    buyerReference: leitwegId || `WC-ORD-${order.number || order.id}`,
    notes: [`Generated automatically from WooCommerce Order #${order.number || order.id}`],
    locale: buyerCountry === "FR" ? "fr" : buyerCountry === "DE" || buyerCountry === "AT" ? "de" : "en",
    profile: targetProfile,
    seller,
    buyer: {
      name: buyerName,
      vatId: buyerVatId,
      electronicAddress: order.billing.email,
      electronicAddressScheme: "EM",
      address: {
        street: order.billing.address_1 || "",
        additionalLine: order.billing.address_2 || undefined,
        postalCode: order.billing.postcode || "",
        city: order.billing.city || "",
        countryCode: buyerCountry,
      },
    },
    payment: {
      meansCode: order.payment_method === "bacs" ? "58" : "48",
      iban: options?.iban,
      bic: options?.bic,
      remittanceReference: `WC-${order.number || order.id}`,
      paymentTerms: order.payment_method === "bacs" ? "Payable by SEPA wire transfer" : "Paid via WooCommerce checkout",
    },
    lines,
    allowancesTotal: 0,
    chargesTotal: 0,
    prepaidAmount: order.payment_method === "bacs" ? 0 : fromCents(Math.round((Number(order.total) || 0) * 100)),
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
