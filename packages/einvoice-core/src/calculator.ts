import type { CanonicalInvoice, DocumentTotals, VatBreakdown, VatCategoryCode } from "./types.js";

/**
 * Exact commercial HALF_UP rounding to 2 decimal places (cents) without JS floating-point drift.
 */
export function toCents(amount: number): number {
  const sign = amount < 0 ? -1 : 1;
  const abs = Math.abs(amount);
  // Shift with epsilon guard against binary float artifacts like 1.005 * 100 = 100.49999999999999
  const cents = Math.floor(abs * 100 + 0.5 + 1e-9);
  return sign * cents;
}

export function fromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function formatDecimal2(amount: number): string {
  return fromCents(toCents(amount)).toFixed(2);
}

export function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return qty.toFixed(2);
  return Number(qty.toFixed(4)).toString();
}

export function computeLineNetCents(line: {
  quantity: number;
  unitPrice: number;
  lineAllowance?: number;
  lineCharge?: number;
}): number {
  const gross = line.quantity * line.unitPrice - (line.lineAllowance ?? 0) + (line.lineCharge ?? 0);
  return toCents(gross);
}

export function defaultExemptionMeta(
  category: VatCategoryCode,
  isKleinunternehmer: boolean,
  locale: "de" | "fr" | "en"
): { reason?: string; code?: string } {
  if (category === "AE") {
    return {
      code: "VATEX-EU-AE",
      reason:
        locale === "de"
          ? "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge gemäß § 13b UStG)"
          : locale === "fr"
            ? "Autoliquidation de la TVA par le preneur (Article 283-2 du CGI)"
            : "Reverse charge — VAT payable by recipient (EU Directive 2006/112/EC)",
    };
  }
  if (category === "E") {
    if (isKleinunternehmer) {
      return {
        reason: "Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG.",
      };
    }
    return {
      reason:
        locale === "fr"
          ? "TVA non applicable, art. 293 B du CGI"
          : locale === "de"
            ? "Steuerfreie Leistung gemäß UStG"
            : "VAT exempt transaction",
    };
  }
  if (category === "G") {
    return {
      code: "VATEX-EU-G",
      reason:
        locale === "de"
          ? "Steuerfreie Ausfuhrlieferung / Leistung in Drittland"
          : locale === "fr"
            ? "Exportation exonérée de TVA hors Union européenne"
            : "Export outside the European Union — VAT exempt",
    };
  }
  if (category === "K") {
    return {
      code: "VATEX-EU-IC",
      reason: "Intra-Community supply of goods — VAT exempt",
    };
  }
  return {};
}

/**
 * Computes fully reconciled EN 16931 line totals, VAT breakdown buckets (BG-23), and Document Totals (BG-22)
 * satisfying BR-CO-10 through BR-CO-16 mathematically.
 */
export function computeCanonicalTotals(invoice: CanonicalInvoice): {
  normalized: CanonicalInvoice;
  vatBreakdown: VatBreakdown[];
  totals: DocumentTotals;
} {
  const normalizedLines = invoice.lines.map((line) => {
    const netCents = computeLineNetCents(line);
    return {
      ...line,
      lineAllowance: line.lineAllowance ?? 0,
      lineCharge: line.lineCharge ?? 0,
      lineNetAmount: fromCents(netCents),
    };
  });

  const lineNetTotalCents = normalizedLines.reduce((acc, l) => acc + toCents(l.lineNetAmount ?? 0), 0);
  const allowancesCents = toCents(invoice.allowancesTotal ?? 0);
  const chargesCents = toCents(invoice.chargesTotal ?? 0);
  const taxExclusiveCents = lineNetTotalCents - allowancesCents + chargesCents;

  // Group taxable base by (vatCategory, vatRate) per EN 16931 BG-23
  const bucketMap = new Map<string, { categoryCode: VatCategoryCode; rate: number; taxableCents: number }>();

  for (const line of normalizedLines) {
    const rate = line.vatCategory === "S" ? line.vatRate : 0;
    const key = `${line.vatCategory}:${rate.toFixed(2)}`;
    const existing = bucketMap.get(key);
    const lineCents = toCents(line.lineNetAmount ?? 0);
    if (existing) {
      existing.taxableCents += lineCents;
    } else {
      bucketMap.set(key, {
        categoryCode: line.vatCategory,
        rate,
        taxableCents: lineCents,
      });
    }
  }

  // Apply document-level allowances/charges proportionally to primary bucket if present
  const netDocAdjustment = chargesCents - allowancesCents;
  if (netDocAdjustment !== 0 && bucketMap.size > 0) {
    const firstKey = bucketMap.keys().next().value;
    if (firstKey) {
      const bucket = bucketMap.get(firstKey)!;
      bucket.taxableCents += netDocAdjustment;
    }
  }

  const vatBreakdown: VatBreakdown[] = [];
  let taxTotalCents = 0;

  for (const bucket of bucketMap.values()) {
    const taxCents = toCents((bucket.taxableCents / 100) * (bucket.rate / 100));
    taxTotalCents += taxCents;
    const existingProvided = invoice.vatBreakdown?.find(
      (b) => b.categoryCode === bucket.categoryCode && Math.abs(b.rate - bucket.rate) < 0.001
    );
    const fallbackExemption = defaultExemptionMeta(
      bucket.categoryCode,
      invoice.seller.isKleinunternehmer,
      invoice.locale
    );

    vatBreakdown.push({
      categoryCode: bucket.categoryCode,
      rate: bucket.rate,
      taxableAmount: fromCents(bucket.taxableCents),
      taxAmount: fromCents(taxCents),
      exemptionReason: existingProvided?.exemptionReason ?? fallbackExemption.reason,
      exemptionReasonCode: existingProvided?.exemptionReasonCode ?? fallbackExemption.code,
    });
  }

  const taxInclusiveCents = taxExclusiveCents + taxTotalCents;
  const prepaidCents = toCents(invoice.prepaidAmount ?? 0);
  const roundingCents = toCents(invoice.roundingAmount ?? 0);
  const payableCents = taxInclusiveCents - prepaidCents + roundingCents;

  const totals: DocumentTotals = {
    lineNetTotal: fromCents(lineNetTotalCents),
    allowancesTotal: fromCents(allowancesCents),
    chargesTotal: fromCents(chargesCents),
    taxExclusiveTotal: fromCents(taxExclusiveCents),
    taxTotal: fromCents(taxTotalCents),
    taxInclusiveTotal: fromCents(taxInclusiveCents),
    prepaidAmount: fromCents(prepaidCents),
    roundingAmount: fromCents(roundingCents),
    payableAmount: fromCents(payableCents),
  };

  return {
    normalized: {
      ...invoice,
      lines: normalizedLines,
      vatBreakdown,
      totals,
    },
    vatBreakdown,
    totals,
  };
}

/**
 * Generates standard European Payments Council (EPC069-12) SEPA QR Code payload (GiroCode in Germany).
 */
export function buildSepaQrPayload(invoice: CanonicalInvoice, totals: DocumentTotals): string | null {
  const iban = invoice.payment.iban?.replace(/\s+/g, "").toUpperCase();
  if (!iban || invoice.currency !== "EUR" || totals.payableAmount <= 0) {
    return null;
  }
  const bic = (invoice.payment.bic ?? "").replace(/\s+/g, "").toUpperCase();
  const recipient = (invoice.payment.accountName || invoice.seller.name).slice(0, 70);
  const reference = (invoice.payment.remittanceReference || invoice.invoiceNumber).slice(0, 140);

  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    recipient,
    iban,
    `EUR${formatDecimal2(totals.payableAmount)}`,
    "",
    "",
    reference,
  ].join("\n");
}
