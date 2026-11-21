import { computeCanonicalTotals } from "../calculator.js";
import type { CanonicalInvoice } from "../types.js";

function formatFecDate(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

function formatFrenchDecimal(amount: number): string {
  return Math.abs(amount).toFixed(2).replace(".", ",");
}

function safeTsvCell(value: string): string {
  const cleaned = value.replace(/[\r\n\t]+/g, " ").trim();
  // Neutralize Spreadsheet Formula Injection (CVE-class DDE attack in accounting software)
  if (/^[=+\-@\u0000-\u001F]/.test(cleaned)) {
    return `'${cleaned}`;
  }
  return cleaned;
}

/**
 * Generates an official French DGFiP FEC (Fichier des Écritures Comptables — Art. L47 A-I LPF)
 * tab-delimited accounting export using French Plan Comptable Général (PCG):
 *  - 411000: Clients (Receivables)
 *  - 706000: Prestations de services (Revenue)
 *  - 445710: TVA collectée (Collected VAT)
 */
export function buildFrenchFecTsv(invoices: CanonicalInvoice[]): string {
  const header = [
    "JournalCode",
    "JournalLib",
    "EcritureNum",
    "EcritureDate",
    "CompteNum",
    "CompteLib",
    "CompAuxNum",
    "CompAuxLib",
    "PieceRef",
    "PieceDate",
    "EcritureLib",
    "Debit",
    "Credit",
    "EcritureLet",
    "DateLet",
    "ValidDate",
    "Montantdevise",
    "Idevise",
  ].join("\t");

  const lines: string[] = [header];
  let seq = 1;

  for (const inv of invoices) {
    const { totals } = computeCanonicalTotals(inv);
    const ecritureNum = `VT-${String(seq).padStart(6, "0")}`;
    const dt = formatFecDate(inv.issueDate);
    const isCredit = inv.typeCode === 381;
    const auxNum = `CLI-${inv.buyer.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase() || "001"}`;
    const safeBuyer = safeTsvCell(inv.buyer.name);
    const safeInvNum = safeTsvCell(inv.invoiceNumber);
    const label = safeTsvCell(`${isCredit ? "Avoir" : "Facture"} ${safeInvNum} - ${safeBuyer}`).slice(0, 80);

    // Entry 1: Customer Receivable (411000)
    lines.push(
      [
        "VT",
        "Journal des ventes",
        ecritureNum,
        dt,
        "411000",
        "Clients",
        auxNum,
        safeBuyer,
        safeInvNum,
        dt,
        label,
        isCredit ? "0,00" : formatFrenchDecimal(totals.taxInclusiveTotal),
        isCredit ? formatFrenchDecimal(totals.taxInclusiveTotal) : "0,00",
        "",
        "",
        dt,
        inv.currency !== "EUR" ? formatFrenchDecimal(totals.taxInclusiveTotal) : "",
        inv.currency !== "EUR" ? inv.currency : "",
      ].join("\t")
    );

    // Entry 2: Revenue HT (706000)
    lines.push(
      [
        "VT",
        "Journal des ventes",
        ecritureNum,
        dt,
        "706000",
        "Prestations de services",
        "",
        "",
        inv.invoiceNumber,
        dt,
        label,
        isCredit ? formatFrenchDecimal(totals.taxExclusiveTotal) : "0,00",
        isCredit ? "0,00" : formatFrenchDecimal(totals.taxExclusiveTotal),
        "",
        "",
        dt,
        "",
        "",
      ].join("\t")
    );

    // Entry 3: Collected VAT (445710) if VAT > 0
    if (totals.taxTotal > 0) {
      lines.push(
        [
          "VT",
          "Journal des ventes",
          ecritureNum,
          dt,
          "445710",
          "TVA collectée",
          "",
          "",
          inv.invoiceNumber,
          dt,
          label,
          isCredit ? formatFrenchDecimal(totals.taxTotal) : "0,00",
          isCredit ? "0,00" : formatFrenchDecimal(totals.taxTotal),
          "",
          "",
          dt,
          "",
          "",
        ].join("\t")
      );
    }

    seq++;
  }

  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
