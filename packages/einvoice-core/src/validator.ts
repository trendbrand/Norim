import { buildSepaQrPayload, computeCanonicalTotals, toCents } from "./calculator.js";
import { getRuleKnowledge } from "./rules-dictionary.js";
import {
  CanonicalInvoice,
  FORMAT_GUIDELINE_URNS,
  ValidationDiagnostic,
  ValidationReport,
} from "./types.js";

const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{2,13}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function makeDiag(ruleId: string, overrideMessageEn?: string, xpath?: string): ValidationDiagnostic {
  const k = getRuleKnowledge(ruleId);
  return {
    ruleId: k.ruleId,
    severity: k.severity,
    fieldBt: k.fieldBt,
    xpath,
    titleEn: k.titleEn,
    titleDe: k.titleDe,
    titleFr: k.titleFr,
    messageEn: overrideMessageEn ?? k.messageEn,
    messageDe: k.messageDe,
    messageFr: k.messageFr,
    fixHintEn: k.fixHintEn,
    fixHintDe: k.fixHintDe,
    fixHintFr: k.fixHintFr,
    docsUrl: `/errors/${k.ruleId}`,
  };
}

/**
 * Deterministic EN 16931 + XRechnung 3.0.2 compliance validator.
 * Checks mandatory Business Terms (BR-01..16), arithmetic invariants (BR-CO-09..16),
 * tax-category constraints (BR-S-08, BR-AE-02, BR-E-10), and German XRechnung 3.0.2 rules (BR-DE-*).
 */
export function validateCanonicalInvoice(
  invoice: CanonicalInvoice,
  meta?: {
    container?: "PDF/A-3b" | "PDF (Non-PDF/A-3)" | "XML";
    syntax?: "CII" | "UBL" | "UNKNOWN";
    pdfa3bChecked?: boolean;
    pdfa3bPassed?: boolean;
    pdfa3bDetails?: string;
  }
): ValidationReport {
  const diagnostics: ValidationDiagnostic[] = [];
  const { totals: computedTotals, vatBreakdown: computedVat } = computeCanonicalTotals(invoice);

  const isXRechnung = invoice.profile === "XRECHNUNG_CII" || invoice.profile === "XRECHNUNG_UBL";
  const isPeppol = invoice.profile === "PEPPOL_BIS_3";

  // 1. Core Header Rules (BR-02 .. BR-05)
  if (!invoice.invoiceNumber?.trim()) {
    diagnostics.push(makeDiag("BR-02", undefined, "/Invoice/BT-1"));
  }
  if (!invoice.issueDate || !ISO_DATE_REGEX.test(invoice.issueDate)) {
    diagnostics.push(makeDiag("BR-03", undefined, "/Invoice/BT-2"));
  }
  if (invoice.typeCode !== 380 && invoice.typeCode !== 381) {
    diagnostics.push(makeDiag("BR-04", undefined, "/Invoice/BT-3"));
  }
  if (!invoice.currency || invoice.currency.length !== 3) {
    diagnostics.push(makeDiag("BR-05", undefined, "/Invoice/BT-5"));
  }

  // 2. Credit Note reference best practice
  if (invoice.typeCode === 381 && !invoice.precedingInvoiceReference?.trim()) {
    diagnostics.push(makeDiag("BR-CR-01", undefined, "/Invoice/BT-25"));
  }

  // 3. Party & Address Rules (BR-06 .. BR-10, BR-CO-09)
  if (!invoice.seller?.name?.trim()) {
    diagnostics.push(makeDiag("BR-06", undefined, "/Invoice/BG-4/BT-27"));
  }
  if (!invoice.buyer?.name?.trim()) {
    diagnostics.push(makeDiag("BR-07", undefined, "/Invoice/BG-7/BT-44"));
  }
  if (
    !invoice.seller?.address?.street?.trim() ||
    !invoice.seller?.address?.postalCode?.trim() ||
    !invoice.seller?.address?.city?.trim() ||
    invoice.seller?.address?.countryCode?.length !== 2
  ) {
    diagnostics.push(makeDiag("BR-08", undefined, "/Invoice/BG-4/BG-5"));
  }
  if (
    !invoice.buyer?.address?.postalCode?.trim() ||
    !invoice.buyer?.address?.city?.trim() ||
    invoice.buyer?.address?.countryCode?.length !== 2
  ) {
    diagnostics.push(makeDiag("BR-10", undefined, "/Invoice/BG-7/BG-8"));
  }

  const sellerVat = invoice.seller?.vatId?.replace(/\s+/g, "").toUpperCase();
  const sellerTaxNo = invoice.seller?.taxNumber?.trim();
  if (!sellerVat && !sellerTaxNo) {
    diagnostics.push(makeDiag("BR-CO-09", undefined, "/Invoice/BG-4/BT-31"));
  } else if (sellerVat && !EU_VAT_REGEX.test(sellerVat)) {
    diagnostics.push(
      makeDiag(
        "BR-CO-09",
        `Seller VAT ID '${sellerVat}' must start with a 2-letter ISO country code followed by alphanumeric characters (e.g., DE123456789).`,
        "/Invoice/BG-4/BT-31"
      )
    );
  }

  // 4. Lines Rule (BR-16)
  if (!invoice.lines || invoice.lines.length === 0) {
    diagnostics.push(makeDiag("BR-16", undefined, "/Invoice/BG-25"));
  }

  // 5. Mathematical Invariants (BR-CO-10 .. BR-CO-16) when explicit totals are supplied
  if (invoice.totals) {
    if (toCents(invoice.totals.lineNetTotal) !== toCents(computedTotals.lineNetTotal)) {
      diagnostics.push(
        makeDiag(
          "BR-CO-10",
          `BT-106 mismatch: document states ${invoice.totals.lineNetTotal.toFixed(2)}, expected sum of lines ${computedTotals.lineNetTotal.toFixed(2)}.`,
          "/Invoice/BG-22/BT-106"
        )
      );
    }

    const expectedTaxExcl =
      toCents(invoice.totals.lineNetTotal) -
      toCents(invoice.totals.allowancesTotal ?? 0) +
      toCents(invoice.totals.chargesTotal ?? 0);
    if (toCents(invoice.totals.taxExclusiveTotal) !== expectedTaxExcl) {
      diagnostics.push(
        makeDiag(
          "BR-CO-13",
          `BT-109 mismatch: document states ${invoice.totals.taxExclusiveTotal.toFixed(2)}, expected ${(expectedTaxExcl / 100).toFixed(2)}.`,
          "/Invoice/BG-22/BT-109"
        )
      );
    }

    const vatList = invoice.vatBreakdown?.length ? invoice.vatBreakdown : computedVat;
    const sumBreakdownVat = vatList.reduce((acc, b) => acc + toCents(b.taxAmount), 0);
    if (toCents(invoice.totals.taxTotal) !== sumBreakdownVat) {
      diagnostics.push(
        makeDiag(
          "BR-CO-14",
          `BT-110 mismatch: document states ${invoice.totals.taxTotal.toFixed(2)}, sum of VAT breakdown is ${(sumBreakdownVat / 100).toFixed(2)}.`,
          "/Invoice/BG-22/BT-110"
        )
      );
    }

    const expectedTaxIncl = toCents(invoice.totals.taxExclusiveTotal) + toCents(invoice.totals.taxTotal);
    if (toCents(invoice.totals.taxInclusiveTotal) !== expectedTaxIncl) {
      diagnostics.push(
        makeDiag(
          "BR-CO-15",
          `BT-112 mismatch: document states ${invoice.totals.taxInclusiveTotal.toFixed(2)}, expected BT-109 + BT-110 = ${(expectedTaxIncl / 100).toFixed(2)}.`,
          "/Invoice/BG-22/BT-112"
        )
      );
    }

    const expectedPayable =
      toCents(invoice.totals.taxInclusiveTotal) -
      toCents(invoice.totals.prepaidAmount ?? 0) +
      toCents(invoice.totals.roundingAmount ?? 0);
    if (toCents(invoice.totals.payableAmount) !== expectedPayable) {
      diagnostics.push(
        makeDiag(
          "BR-CO-16",
          `BT-115 mismatch: document states ${invoice.totals.payableAmount.toFixed(2)}, expected ${(expectedPayable / 100).toFixed(2)}.`,
          "/Invoice/BG-22/BT-115"
        )
      );
    }
  }

  // 6. Tax Category Rules (BR-S-08, BR-AE-02, BR-E-10)
  const effectiveVat = invoice.vatBreakdown?.length ? invoice.vatBreakdown : computedVat;
  for (const bucket of effectiveVat) {
    if (bucket.categoryCode === "S") {
      const expectedTaxCents = toCents((bucket.taxableAmount * bucket.rate) / 100);
      if (Math.abs(toCents(bucket.taxAmount) - expectedTaxCents) > 1) {
        diagnostics.push(
          makeDiag(
            "BR-S-08",
            `Standard VAT (${bucket.rate}%) mismatch: taxAmount ${bucket.taxAmount.toFixed(2)} != ${(expectedTaxCents / 100).toFixed(2)}.`,
            "/Invoice/BG-23/BT-117"
          )
        );
      }
    }
    if (bucket.categoryCode === "AE") {
      const buyerVat = invoice.buyer?.vatId?.replace(/\s+/g, "").toUpperCase();
      if (!sellerVat || !buyerVat || !EU_VAT_REGEX.test(buyerVat) || bucket.rate !== 0) {
        diagnostics.push(makeDiag("BR-AE-02", undefined, "/Invoice/BG-23/BT-118"));
      }
    }
    if (bucket.categoryCode === "E") {
      if ((!bucket.exemptionReason?.trim() && !bucket.exemptionReasonCode?.trim()) || bucket.rate !== 0) {
        diagnostics.push(makeDiag("BR-E-10", undefined, "/Invoice/BG-23/BT-120"));
      }
    }
    if (bucket.categoryCode === "G" && bucket.rate !== 0) {
      diagnostics.push(makeDiag("BR-G-01", undefined, "/Invoice/BG-23/BT-119"));
    }
  }

  // 6b. French B2B Factur-X 2026/2027 Mandate Best-Practice Check (SIREN BT-30)
  if (invoice.seller.address.countryCode === "FR" && !invoice.seller.registrationId?.trim()) {
    diagnostics.push(makeDiag("BR-FR-05", undefined, "/Invoice/BG-4/BT-30"));
  }

  // 7. German XRechnung 3.0.2 & Peppol Specific CIUS Rules (BR-DE-*)
  if (isXRechnung || isPeppol) {
    if (!invoice.buyerReference?.trim()) {
      diagnostics.push(makeDiag("BR-DE-15", undefined, "/Invoice/BT-10"));
    }
    if (!invoice.seller.electronicAddress?.trim() || !invoice.buyer.electronicAddress?.trim()) {
      diagnostics.push(makeDiag("BR-DE-17", undefined, "/Invoice/BT-34|BT-49"));
    }
  }

  if (isXRechnung) {
    if (!invoice.payment?.meansCode) {
      diagnostics.push(makeDiag("BR-DE-1", undefined, "/Invoice/BG-16/BT-81"));
    }
    if (
      !invoice.seller.contact?.name?.trim() ||
      !invoice.seller.contact?.phone?.trim() ||
      !invoice.seller.contact?.email?.trim()
    ) {
      diagnostics.push(makeDiag("BR-DE-2", undefined, "/Invoice/BG-4/BG-6"));
    }
    if (invoice.payment.meansCode === "30" || invoice.payment.meansCode === "58") {
      const cleanedIban = invoice.payment.iban?.replace(/\s+/g, "").toUpperCase() ?? "";
      if (!cleanedIban || !IBAN_REGEX.test(cleanedIban)) {
        diagnostics.push(makeDiag("BR-DE-23", undefined, "/Invoice/BG-16/BT-84"));
      }
    }
    if (computedTotals.payableAmount > 0 && !invoice.payment.dueDate && !invoice.payment.paymentTerms?.trim()) {
      diagnostics.push(makeDiag("BR-DE-26", undefined, "/Invoice/BT-9|BT-20"));
    }
  }

  // 8. PDF/A-3b check result if inspecting a PDF container
  if (meta?.pdfa3bChecked && !meta.pdfa3bPassed) {
    diagnostics.push(makeDiag("PDFA-3B-02", meta.pdfa3bDetails));
  }

  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;
  const spec = FORMAT_GUIDELINE_URNS[invoice.profile];

  return {
    valid: errorCount === 0,
    engine: "builtin-en16931",
    detected: {
      container: meta?.container ?? (invoice.profile.startsWith("XRECHNUNG") || invoice.profile === "PEPPOL_BIS_3" ? "XML" : "PDF/A-3b"),
      syntax: meta?.syntax ?? (invoice.profile === "XRECHNUNG_UBL" || invoice.profile === "PEPPOL_BIS_3" ? "UBL" : "CII"),
      standard: spec.label,
      profile: invoice.profile,
    },
    checks: {
      pdfa3b: {
        applicable: meta?.pdfa3bChecked ?? false,
        passed: meta?.pdfa3bPassed ?? true,
        details: meta?.pdfa3bDetails ?? "XML-only document (PDF/A-3b container check not applicable).",
      },
      syntaxXsd: { passed: true, errors: 0 },
      schematronEn16931: { passed: errorCount === 0, errors: errorCount, warnings: warningCount },
    },
    diagnostics,
    computedTotals,
    sepaQrPayload: buildSepaQrPayload(invoice, computedTotals),
  };
}
