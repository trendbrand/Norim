import { computeCanonicalTotals, fromCents, toCents } from "../calculator.js";
import { validateCanonicalInvoice } from "../validator.js";
import type {
  CanonicalInvoice,
  FormatProfile,
  InvoiceLine,
  SellerParty,
  ValidationReport,
  VatCategoryCode,
} from "../types.js";

export interface StripeInvoiceLike {
  id: string;
  number?: string | null;
  created: number; // unix seconds
  due_date?: number | null;
  currency: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
  customer_tax_ids?: Array<{ type: string; value: string }>;
  subtotal?: number; // cents
  total?: number; // cents
  amount_paid?: number; // cents
  metadata?: Record<string, string>;
  lines: {
    data: Array<{
      id: string;
      description?: string | null;
      quantity?: number | null;
      amount: number; // cents net or gross depending on tax_amounts
      unit_amount_excluding_tax?: string | null;
      tax_amounts?: Array<{
        amount: number;
        inclusive: boolean;
        tax_rate?: { percentage?: number; display_name?: string } | string;
      }>;
    }>;
  };
  isCreditNote?: boolean;
  precedingInvoiceNumber?: string;
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

function unixToIsoDate(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

/**
 * Converts a Stripe Invoice / Credit Note webhook payload + Org Seller Profile into a
 * validated Canonical EN 16931 Invoice with automatic Reverse Charge / Kleinunternehmer / Export detection
 * and €0.01 Stripe rounding reconciliation (BT-114).
 */
export function mapStripeInvoiceToCanonical(
  stripeInv: StripeInvoiceLike,
  seller: SellerParty,
  options?: {
    defaultFormat?: FormatProfile;
    iban?: string;
    bic?: string;
    buyerVatVerified?: boolean;
  }
): {
  invoice: CanonicalInvoice;
  validation: ValidationReport;
  actionRequired: boolean;
  missingFields: string[];
} {
  const buyerCountry = (stripeInv.customer_address?.country || seller.address.countryCode || "DE").toUpperCase();
  const euVatEntry = stripeInv.customer_tax_ids?.find(
    (t) => t.type === "eu_vat" || /^[A-Z]{2}[A-Z0-9]{2,13}$/i.test(t.value)
  );
  const buyerVatId = euVatEntry?.value?.replace(/\s+/g, "").toUpperCase();

  // Determine default format by buyer country / metadata override
  let targetProfile: FormatProfile = options?.defaultFormat ?? "ZUGFERD_EN16931";
  if (stripeInv.metadata?.einvoice_format) {
    const req = stripeInv.metadata.einvoice_format.toUpperCase();
    if (req === "XRECHNUNG_UBL" || req === "XRECHNUNG_CII" || req === "FACTURX_EN16931" || req === "ZUGFERD_EN16931") {
      targetProfile = req;
    }
  } else if (stripeInv.metadata?.leitweg_id) {
    targetProfile = "XRECHNUNG_CII";
  } else if (buyerCountry === "FR") {
    targetProfile = "FACTURX_EN16931";
  }

  // Tax regime resolution
  const isDomestic = buyerCountry === seller.address.countryCode;
  const isIntraEu = !isDomestic && EU_COUNTRIES.has(buyerCountry);
  const isNonEuExport = !EU_COUNTRIES.has(buyerCountry);

  const lines: InvoiceLine[] = stripeInv.lines.data.map((l, idx) => {
    const qty = l.quantity && l.quantity > 0 ? l.quantity : 1;
    const taxObj = l.tax_amounts?.[0];
    let taxPct =
      taxObj && typeof taxObj.tax_rate === "object" && typeof taxObj.tax_rate?.percentage === "number"
        ? taxObj.tax_rate.percentage
        : 0;

    let vatCategory: VatCategoryCode = "S";
    if (seller.isKleinunternehmer) {
      vatCategory = "E";
      taxPct = 0;
    } else if (isNonEuExport) {
      vatCategory = "G";
      taxPct = 0;
    } else if (isIntraEu && buyerVatId && options?.buyerVatVerified !== false) {
      vatCategory = "AE";
      taxPct = 0;
    } else if (taxPct === 0 && isDomestic) {
      vatCategory = "E";
    }

    // Compute net line amount cleanly (handle inclusive Stripe tax if present)
    const rawLineCents = taxObj?.inclusive ? l.amount - taxObj.amount : l.amount;
    const lineNet = fromCents(rawLineCents);
    const unitPrice = Number((lineNet / qty).toFixed(4));

    return {
      id: String(idx + 1),
      name: l.description?.trim() || `Subscription / Service Item ${idx + 1}`,
      quantity: qty,
      unitCode: "C62",
      unitPrice,
      lineAllowance: 0,
      lineCharge: 0,
      lineNetAmount: lineNet,
      vatCategory,
      vatRate: taxPct,
    };
  });

  const baseInvoice: CanonicalInvoice = {
    invoiceNumber: stripeInv.number || `STRIPE-${stripeInv.id.slice(-8).toUpperCase()}`,
    issueDate: unixToIsoDate(stripeInv.created),
    typeCode: stripeInv.isCreditNote ? 381 : 380,
    currency: (stripeInv.currency || "eur").toUpperCase(),
    buyerReference: stripeInv.metadata?.leitweg_id || stripeInv.metadata?.buyer_reference || undefined,
    purchaseOrderReference: stripeInv.metadata?.po_number || undefined,
    precedingInvoiceReference: stripeInv.precedingInvoiceNumber || undefined,
    notes: [`Generated automatically from Stripe ${stripeInv.id}`],
    locale: buyerCountry === "FR" ? "fr" : buyerCountry === "DE" || buyerCountry === "AT" ? "de" : "en",
    profile: targetProfile,
    seller,
    buyer: {
      name: stripeInv.customer_name?.trim() || stripeInv.customer_email || "Unknown Customer",
      vatId: buyerVatId,
      electronicAddress: stripeInv.customer_email || undefined,
      electronicAddressScheme: "EM",
      address: {
        street: stripeInv.customer_address?.line1?.trim() || "",
        additionalLine: stripeInv.customer_address?.line2?.trim() || undefined,
        postalCode: stripeInv.customer_address?.postal_code?.trim() || "",
        city: stripeInv.customer_address?.city?.trim() || "",
        countryCode: buyerCountry,
      },
    },
    payment: {
      meansCode: stripeInv.amount_paid && stripeInv.total && stripeInv.amount_paid >= stripeInv.total ? "48" : "58",
      iban: options?.iban,
      bic: options?.bic,
      remittanceReference: stripeInv.number || stripeInv.id,
      dueDate: stripeInv.due_date ? unixToIsoDate(stripeInv.due_date) : undefined,
      paymentTerms:
        stripeInv.amount_paid && stripeInv.total && stripeInv.amount_paid >= stripeInv.total
          ? "Paid via Stripe"
          : "Payable within 14 days",
    },
    lines,
    allowancesTotal: 0,
    chargesTotal: 0,
    prepaidAmount: fromCents(stripeInv.amount_paid ?? 0),
    roundingAmount: 0,
  };

  // Reconcile €0.01 Stripe rounding difference cleanly via BT-114 if Stripe total differs by <= 2 cents
  const { normalized, totals } = computeCanonicalTotals(baseInvoice);
  if (typeof stripeInv.total === "number") {
    const diffCents = stripeInv.total - toCents(totals.taxInclusiveTotal);
    if (diffCents !== 0 && Math.abs(diffCents) <= 2) {
      normalized.roundingAmount = fromCents(diffCents);
      const recomputed = computeCanonicalTotals(normalized);
      normalized.totals = recomputed.totals;
      normalized.vatBreakdown = recomputed.vatBreakdown;
    }
  }

  const validation = validateCanonicalInvoice(normalized);
  const missingFields = validation.diagnostics.filter((d) => d.severity === "error").map((d) => d.fieldBt);

  return {
    invoice: normalized,
    validation,
    actionRequired: !validation.valid,
    missingFields,
  };
}
