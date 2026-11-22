/**
 * Bank statement (CSV) → invoice reconciliation matching.
 *
 * Pure, deterministic logic (no I/O) so it is unit-testable: parse a bank CSV
 * into transactions, then match each credit to an open receivable by remittance
 * reference (strong) or unique exact amount (medium). Produces a preview; the
 * route decides whether to record the matched payments.
 */

export interface BankTxn {
  date: string; // yyyy-mm-dd
  amount: number; // absolute credit amount
  reference: string;
  raw: string;
}

export interface OpenReceivable {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  balanceDue: number;
  currency: string;
}

export interface ReconcileMatch {
  txn: BankTxn;
  invoiceId: string;
  invoiceNumber: string;
  buyerName: string;
  appliedAmount: number;
  confidence: "reference" | "amount";
}

export interface ReconcileResult {
  matched: ReconcileMatch[];
  unmatched: BankTxn[];
}

function normalizeRef(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Parse a European or ISO amount string ("1.234,56", "1234.56", "€1,000.00"). */
export function parseAmount(raw: string): number | null {
  let s = raw.replace(/[^0-9.,-]/g, "").trim();
  if (!s) return null;
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    // The last-occurring separator is the decimal separator.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Normalize a date cell to yyyy-mm-dd; returns "" if unrecognizable. */
export function parseDate(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/);
  if (m) {
    const d = m[1]!.padStart(2, "0");
    const mo = m[2]!.padStart(2, "0");
    let y = m[3]!;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${mo}-${d}`;
  }
  return "";
}

function splitRow(line: string, delim: string): string[] {
  return line.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, "$1").trim());
}

const DATE_HEADERS = ["date", "datum", "valuedate", "bookingdate", "buchungstag"];
const AMOUNT_HEADERS = ["amount", "betrag", "credit", "value", "haben"];
const REF_HEADERS = ["reference", "purpose", "verwendungszweck", "memo", "description", "remittance", "details"];

/** Parse a bank CSV (comma or semicolon) into credit transactions. */
export function parseBankCsv(csv: string): BankTxn[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const delim = (lines[0]!.match(/;/g)?.length ?? 0) > (lines[0]!.match(/,/g)?.length ?? 0) ? ";" : ",";
  const firstCells = splitRow(lines[0]!, delim).map((c) => c.toLowerCase().replace(/[^a-z]/g, ""));
  const hasHeader = firstCells.some(
    (c) => DATE_HEADERS.includes(c) || AMOUNT_HEADERS.includes(c) || REF_HEADERS.includes(c)
  );

  let dateIdx = 0;
  let amountIdx = 1;
  let refIdx = 2;
  let dataLines = lines;

  if (hasHeader) {
    dateIdx = firstCells.findIndex((c) => DATE_HEADERS.includes(c));
    amountIdx = firstCells.findIndex((c) => AMOUNT_HEADERS.includes(c));
    refIdx = firstCells.findIndex((c) => REF_HEADERS.includes(c));
    if (dateIdx < 0) dateIdx = 0;
    if (amountIdx < 0) amountIdx = 1;
    if (refIdx < 0) refIdx = 2;
    dataLines = lines.slice(1);
  }

  const txns: BankTxn[] = [];
  for (const line of dataLines) {
    const cells = splitRow(line, delim);
    const amount = parseAmount(cells[amountIdx] ?? "");
    if (amount === null || Math.abs(amount) < 0.005) continue; // skip non-amount / zero rows
    txns.push({
      date: parseDate(cells[dateIdx] ?? "") || new Date().toISOString().slice(0, 10),
      amount: Math.abs(amount),
      reference: (cells[refIdx] ?? cells.slice(refIdx).join(" ") ?? "").trim(),
      raw: line,
    });
  }
  return txns;
}

/**
 * Match transactions to open receivables. Each invoice is allocated at most
 * once. Reference match (the remittance contains the invoice number) wins over
 * a unique exact-amount match.
 */
export function matchTransactions(txns: BankTxn[], open: OpenReceivable[]): ReconcileResult {
  const used = new Set<string>();
  const matched: ReconcileMatch[] = [];
  const unmatched: BankTxn[] = [];

  // Pass 1: strong reference matches first (most reliable).
  const pending: BankTxn[] = [];
  for (const txn of txns) {
    const ref = normalizeRef(txn.reference);
    const hit = open.find(
      (inv) => !used.has(inv.id) && inv.invoiceNumber.length >= 3 && ref.includes(normalizeRef(inv.invoiceNumber))
    );
    if (hit) {
      used.add(hit.id);
      matched.push({
        txn,
        invoiceId: hit.id,
        invoiceNumber: hit.invoiceNumber,
        buyerName: hit.buyerName,
        appliedAmount: Number(Math.min(txn.amount, hit.balanceDue).toFixed(2)),
        confidence: "reference",
      });
    } else {
      pending.push(txn);
    }
  }

  // Pass 2: unique exact-amount matches among the remaining.
  for (const txn of pending) {
    const candidates = open.filter((inv) => !used.has(inv.id) && Math.abs(inv.balanceDue - txn.amount) <= 0.01);
    if (candidates.length === 1) {
      const hit = candidates[0]!;
      used.add(hit.id);
      matched.push({
        txn,
        invoiceId: hit.id,
        invoiceNumber: hit.invoiceNumber,
        buyerName: hit.buyerName,
        appliedAmount: Number(Math.min(txn.amount, hit.balanceDue).toFixed(2)),
        confidence: "amount",
      });
    } else {
      unmatched.push(txn);
    }
  }

  return { matched, unmatched };
}
