import { computeCanonicalTotals } from "../calculator.js";
import type { CanonicalInvoice } from "../types.js";

export interface DatevExportOptions {
  consultantNumber?: string; // Beraternummer
  clientNumber?: string; // Mandantennummer
  fiscalYearStart?: string; // YYYYMMDD e.g. 20260101
  chartOfAccounts?: "SKR03" | "SKR04";
}

function formatGermanDecimal(amount: number): string {
  return Math.abs(amount).toFixed(2).replace(".", ",");
}

function formatDatevDate(isoDate: string): string {
  // DDMM format required by DATEV Buchungsstapel
  const [, month, day] = isoDate.split("-");
  return `${day}${month}`;
}

function resolveRevenueAccount(
  category: string,
  rate: number,
  skr: "SKR03" | "SKR04"
): { account: string; buCode: string } {
  if (category === "AE") {
    return skr === "SKR03" ? { account: "8336", buCode: "40" } : { account: "4336", buCode: "40" };
  }
  if (category === "E" || category === "G") {
    return skr === "SKR03" ? { account: "8120", buCode: "" } : { account: "4120", buCode: "" };
  }
  if (Math.abs(rate - 7) < 0.1) {
    return skr === "SKR03" ? { account: "8300", buCode: "2" } : { account: "4300", buCode: "2" };
  }
  // Standard 19% DE (or EU standard)
  return skr === "SKR03" ? { account: "8400", buCode: "3" } : { account: "4400", buCode: "3" };
}

function sanitizeCsvFormula(value: string): string {
  const cleaned = value.replace(/[\r\n\t]+/g, " ").trim();
  // Neutralize Excel / LibreOffice CSV Formula Injection (DDE / macro execution)
  if (/^[=+\-@\u0000-\u001F]/.test(cleaned)) {
    return `'${cleaned}`;
  }
  return cleaned;
}

function csvQuote(value: string): string {
  const safe = sanitizeCsvFormula(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Generates a German Steuerberater-ready DATEV EXTF (v700) Buchungsstapel CSV file
 * with UTF-8 BOM, semicolon separators, German decimal commas, SKR03/SKR04 accounts,
 * and automatic BU-Schlüssel tax codes.
 */
export function buildDatevExtfCsv(invoices: CanonicalInvoice[], opts: DatevExportOptions = {}): string {
  const consultant = opts.consultantNumber ?? "10001";
  const client = opts.clientNumber ?? "20001";
  const skr = opts.chartOfAccounts ?? "SKR03";
  const nowStamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 17);
  const year = invoices[0]?.issueDate.slice(0, 4) ?? String(new Date().getFullYear());
  const fyStart = opts.fiscalYearStart ?? `${year}0101`;

  // Row 1: Official DATEV EXTF Header
  const extfHeader = [
    csvQuote("EXTF"),
    "700",
    "21",
    csvQuote("Buchungsstapel"),
    "12",
    nowStamp,
    "",
    csvQuote("NI"),
    csvQuote("NormInvoice"),
    "",
    consultant,
    client,
    fyStart,
    "4",
    `${year}0101`,
    `${year}1231`,
    csvQuote("NormInvoice E-Rechnungen"),
    "",
    "1",
    "0",
    "0",
    csvQuote("EUR"),
    "",
    "",
    "",
    "",
    csvQuote(skr === "SKR03" ? "03" : "04"),
  ].join(";");

  // Row 2: DATEV Column Headers
  const columns = [
    "Umsatz (ohne Soll/Haben-Kz)",
    "Soll/Haben-Kennzeichen",
    "WKZ Umsatz",
    "Kurs",
    "Basis-Umsatz",
    "WKZ Basis-Umsatz",
    "Konto",
    "Gegenkonto (ohne BU-Schlüssel)",
    "BU-Schlüssel",
    "Belegdatum",
    "Belegfeld 1",
    "Belegfeld 2",
    "Skonto",
    "Buchungstext",
    "EU-Land u. UStID",
  ].join(";");

  const rows: string[] = [extfHeader, columns];

  for (const inv of invoices) {
    const { vatBreakdown } = computeCanonicalTotals(inv);
    const debitCredit = inv.typeCode === 381 ? "H" : "S"; // Credit Note reverses booking direction
    const debtorAccount = "10000"; // Collective Accounts Receivable (Debitor)

    for (const bucket of vatBreakdown) {
      const grossBucket = bucket.taxableAmount + bucket.taxAmount;
      const { account, buCode } = resolveRevenueAccount(bucket.categoryCode, bucket.rate, skr);
      const bookingText = `${inv.buyer.name} - ${inv.invoiceNumber}`.slice(0, 60);
      const euVatField = inv.buyer.vatId ?? "";

      rows.push(
        [
          formatGermanDecimal(grossBucket),
          csvQuote(debitCredit),
          csvQuote(inv.currency),
          "",
          "",
          "",
          debtorAccount,
          account,
          csvQuote(buCode),
          formatDatevDate(inv.issueDate),
          csvQuote(inv.invoiceNumber.slice(0, 36)),
          csvQuote(inv.payment.dueDate ? formatDatevDate(inv.payment.dueDate) : ""),
          "",
          csvQuote(bookingText),
          csvQuote(euVatField),
        ].join(";")
      );
    }
  }

  return "\uFEFF" + rows.join("\r\n") + "\r\n";
}
