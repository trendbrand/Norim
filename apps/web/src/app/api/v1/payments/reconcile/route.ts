import { NextRequest, NextResponse } from "next/server";
import {
  listInvoicePaymentsForOrg,
  listInvoicesForOrg,
  recordInvoicePayment,
} from "@/lib/db-store";
import { matchTransactions, parseBankCsv, type OpenReceivable } from "@/lib/bank-reconcile";
import { requireTenantAuth } from "@/lib/security";

function normRef(s: string): string {
  return (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Bank CSV reconciliation. With commit=false (default) it returns a dry-run
 * preview of matches; with commit=true it records the matched payments through
 * the normal payment ledger (idempotent: a row whose reference+amount already
 * exists on that invoice is skipped, so re-importing the same statement is safe).
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  let body: { csv?: string; commit?: boolean };
  try {
    body = (await req.json()) as { csv?: string; commit?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.csv || !body.csv.trim()) {
    return NextResponse.json({ error: "Provide bank statement CSV text." }, { status: 400 });
  }

  const open: OpenReceivable[] = listInvoicesForOrg(access.ctx.orgId)
    .filter((i) => i.status !== "DRAFT" && i.typeCode === 380)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      buyerName: i.buyerName,
      balanceDue: Number(Math.max(0, i.grossAmount - i.paidAmount).toFixed(2)),
      currency: i.currency,
    }))
    .filter((i) => i.balanceDue > 0);

  const txns = parseBankCsv(body.csv);
  const { matched, unmatched } = matchTransactions(txns, open);

  if (!body.commit) {
    return NextResponse.json({
      committed: false,
      parsed: txns.length,
      matched,
      unmatched,
    });
  }

  const existing = listInvoicePaymentsForOrg(access.ctx.orgId);
  let recordedCount = 0;
  let skippedCount = 0;
  const recorded: Array<{ invoiceNumber: string; amount: number }> = [];

  for (const m of matched) {
    const reference = m.txn.reference || m.invoiceNumber;
    const isDup = existing.some(
      (p) =>
        p.invoiceId === m.invoiceId &&
        normRef(p.reference) === normRef(reference) &&
        Math.abs(p.amount - m.appliedAmount) <= 0.01
    );
    if (isDup) {
      skippedCount++;
      continue;
    }
    const res = recordInvoicePayment(
      access.ctx.orgId,
      m.invoiceId,
      { amount: m.appliedAmount, method: "BANK_CSV", reference, valueDate: m.txn.date },
      access.ctx.actorEmail
    );
    if (res) {
      recordedCount++;
      recorded.push({ invoiceNumber: m.invoiceNumber, amount: m.appliedAmount });
    }
  }

  return NextResponse.json({
    committed: true,
    recordedCount,
    skippedCount,
    recorded,
    unmatched,
  });
}
