import { NextRequest, NextResponse } from "next/server";
import { buildDatevExtfCsv } from "@norminvoice/einvoice-core";
import { appendOrgAuditEvent, listInvoicesForOrg } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const skrParam = req.nextUrl.searchParams.get("skr");
  const chartOfAccounts = skrParam === "SKR04" ? "SKR04" : "SKR03";
  const fromDate = req.nextUrl.searchParams.get("from") || undefined;
  const toDate = req.nextUrl.searchParams.get("to") || undefined;
  const consultant = req.nextUrl.searchParams.get("consultant") || "10001";
  const client = req.nextUrl.searchParams.get("client") || "20001";

  const validatedInvoices = listInvoicesForOrg(access.ctx.orgId, { fromDate, toDate })
    .filter((r) => r.validationPassed && r.status !== "DRAFT")
    .map((r) => r.canonical);

  const csv = buildDatevExtfCsv(validatedInvoices, {
    chartOfAccounts,
    consultantNumber: consultant,
    clientNumber: client,
  });

  appendOrgAuditEvent(access.ctx.orgId, null, "DATEV-EXTF", "EXPORT_DATEV_DOWNLOADED", access.ctx.actorEmail, {
    chartOfAccounts,
    count: validatedInvoices.length,
    fromDate: fromDate ?? null,
    toDate: toDate ?? null,
  });

  const filename = `EXTF_NormInvoice_Buchungsstapel_${chartOfAccounts}_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
