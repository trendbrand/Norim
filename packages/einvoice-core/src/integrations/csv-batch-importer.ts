import { computeCanonicalTotals } from "../calculator.js";
import { validateCanonicalInvoice } from "../validator.js";
import type {
  CanonicalInvoice,
  FormatProfile,
  SellerParty,
  ValidationReport,
  VatCategoryCode,
} from "../types.js";

export interface BatchCsvRowResult {
  rowNumber: number;
  invoiceNumber: string;
  buyerName: string;
  buyerCountry: string;
  profile: FormatProfile;
  grossAmount: number;
  currency: string;
  valid: boolean;
  errorCount: number;
  errors: string[];
  invoice: CanonicalInvoice;
  validation: ValidationReport;
}

function parseLocalizedNumber(raw: string | undefined): number {
  if (!raw) return 0;
  let cleaned = raw.trim().replace(/\s+/g, "");
  // Handle European format like "1.250,50" vs "149,50" vs "149.50"
  if (cleaned.includes(",") && cleaned.includes(".")) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseCsvLines(csvText: string): string[][] {
  const cleaned = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];
  const firstLine = cleaned.split(/\r?\n/)[0] || "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    const next = cleaned[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(cell.trim());
        cell = "";
      } else if (ch === "\r" && next === "\n") {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
        i++;
      } else if (ch === "\n") {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.length > 0));
}

function coerceProfile(raw: string | undefined, buyerCountry: string, hasLeitweg: boolean): FormatProfile {
  const up = (raw || "").trim().toUpperCase();
  if (
    up === "ZUGFERD_EN16931" ||
    up === "FACTURX_EN16931" ||
    up === "XRECHNUNG_CII" ||
    up === "XRECHNUNG_UBL" ||
    up === "PEPPOL_BIS_3"
  ) {
    return up;
  }
  if (hasLeitweg) return "XRECHNUNG_CII";
  if (buyerCountry === "FR") return "FACTURX_EN16931";
  if (buyerCountry === "BE") return "PEPPOL_BIS_3";
  return "ZUGFERD_EN16931";
}

function coerceVatCat(raw: string | undefined): VatCategoryCode {
  const up = (raw || "S").trim().toUpperCase();
  if (up === "S" || up === "AE" || up === "E" || up === "Z" || up === "G" || up === "K" || up === "O") {
    return up;
  }
  return "S";
}

/**
 * Parses a European (semicolon or comma delimited) batch invoice CSV into
 * Canonical EN 16931 Invoices with per-row compliance validation.
 */
export function parseBatchInvoicesCsv(
  csvText: string,
  seller: SellerParty,
  paymentDefaults: { iban?: string; bic?: string }
): BatchCsvRowResult[] {
  const matrix = parseCsvLines(csvText);
  if (matrix.length < 2) return [];

  const headers = matrix[0]!.map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  const col = (row: string[], ...names: string[]): string => {
    for (const n of names) {
      const idx = headers.indexOf(n);
      if (idx >= 0 && row[idx] !== undefined) return row[idx]!;
    }
    return "";
  };

  const results: BatchCsvRowResult[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const r = matrix[i]!;
    const invoiceNumber = col(r, "invoice_number", "rechnungsnummer", "number") || `BATCH-${i}`;
    const issueDate = col(r, "issue_date", "datum", "date") || new Date().toISOString().slice(0, 10);
    const dueDate = col(r, "due_date", "faelligkeitsdatum") || undefined;
    const currency = (col(r, "currency", "waehrung") || "EUR").toUpperCase();
    const buyerName = col(r, "buyer_name", "kunde", "customer_name");
    const buyerStreet = col(r, "buyer_street", "strasse", "street");
    const buyerZip = col(r, "buyer_zip", "plz", "postal_code");
    const buyerCity = col(r, "buyer_city", "ort", "city");
    const buyerCountry = (col(r, "buyer_country", "land", "country") || "DE").toUpperCase();
    const buyerVatId = col(r, "buyer_vat_id", "ust_id", "vat_id") || undefined;
    const buyerEmail = col(r, "buyer_email", "email") || undefined;
    const buyerRef = col(r, "buyer_reference", "leitweg_id", "bt_10") || undefined;
    const itemName = col(r, "item_name", "position", "description") || "Professional Services";
    const qty = parseLocalizedNumber(col(r, "quantity", "menge", "qty")) || 1;
    const unitPrice = parseLocalizedNumber(col(r, "unit_price", "einzelpreis", "net_amount"));
    const vatCategory = seller.isKleinunternehmer ? "E" : coerceVatCat(col(r, "vat_category", "steuerkategorie"));
    const vatRate = vatCategory === "S" ? parseLocalizedNumber(col(r, "vat_rate", "ust_satz", "tax_rate")) : 0;
    const profile = coerceProfile(col(r, "profile", "format"), buyerCountry, Boolean(buyerRef && buyerRef.includes("-")));

    const baseInvoice: CanonicalInvoice = {
      invoiceNumber,
      issueDate,
      typeCode: 380,
      currency,
      buyerReference: buyerRef,
      notes: ["Batch generated via NormInvoice CSV Converter"],
      locale: buyerCountry === "FR" ? "fr" : buyerCountry === "DE" || buyerCountry === "AT" ? "de" : "en",
      profile,
      seller,
      buyer: {
        name: buyerName,
        vatId: buyerVatId?.replace(/\s+/g, "").toUpperCase(),
        electronicAddress: buyerEmail,
        electronicAddressScheme: "EM",
        address: {
          street: buyerStreet,
          postalCode: buyerZip,
          city: buyerCity,
          countryCode: buyerCountry,
        },
      },
      payment: {
        meansCode: "58",
        iban: paymentDefaults.iban,
        bic: paymentDefaults.bic,
        dueDate,
        paymentTerms: dueDate ? `Payable by ${dueDate}` : "Payable within 14 days",
        remittanceReference: invoiceNumber,
      },
      lines: [
        {
          id: "1",
          name: itemName,
          quantity: qty,
          unitCode: "C62",
          unitPrice,
          lineAllowance: 0,
          lineCharge: 0,
          vatCategory,
          vatRate,
        },
      ],
      allowancesTotal: 0,
      chargesTotal: 0,
      prepaidAmount: 0,
      roundingAmount: 0,
    };

    const { normalized, totals } = computeCanonicalTotals(baseInvoice);
    const validation = validateCanonicalInvoice(normalized);
    const errorDiags = validation.diagnostics.filter((d) => d.severity === "error");

    results.push({
      rowNumber: i,
      invoiceNumber: normalized.invoiceNumber,
      buyerName: normalized.buyer.name || "(Missing Buyer Name)",
      buyerCountry,
      profile,
      grossAmount: totals.taxInclusiveTotal,
      currency: normalized.currency,
      valid: validation.valid,
      errorCount: errorDiags.length,
      errors: errorDiags.map((d) => `${d.ruleId}: ${d.titleEn}`),
      invoice: normalized,
      validation,
    });
  }

  return results;
}

export const SAMPLE_EU_BATCH_CSV = [
  "invoice_number;issue_date;due_date;profile;buyer_name;buyer_street;buyer_zip;buyer_city;buyer_country;buyer_vat_id;buyer_email;buyer_reference;item_name;quantity;unit_price;vat_category;vat_rate",
  "RE-2026-9001;2026-11-20;2026-12-04;ZUGFERD_EN16931;AlpenWerk Maschinenbau GmbH;Maximilianstraße 45;80539;München;DE;DE198765431;rechnungen@alpenwerk.de;PO-8821;Monthly SaaS Enterprise Seat;5;149,50;S;19",
  "FA-2026-9002;2026-11-20;2026-12-20;FACTURX_EN16931;HexaLogistique SARL;12 Cours Lafayette;69003;Lyon;FR;FR82451234567;compta@hexalogistique.fr;BC-LYON-26;Cross-Border API Hosting;1;890,00;AE;0",
  "XR-2026-9003;2026-11-20;2026-12-04;XRECHNUNG_UBL;Bundesamt Digital;Willy-Brandt-Straße 1;10557;Berlin;DE;;e-rechnung@bund.de;04011000-1234512345-06;EN 16931 Compliance Audit;8;165,00;S;19",
  "ERR-2026-9004;2026-11-20;2026-12-04;XRECHNUNG_CII;Missing Leitweg GmbH;Hauptstraße 10;10115;Berlin;DE;DE123456789;ap@missing.de;;Advisory Hours (Intentionally missing BT-10);2;120,00;S;19",
].join("\r\n");
