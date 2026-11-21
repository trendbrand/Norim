import { NextRequest, NextResponse } from "next/server";
import { buildFrenchFecTsv } from "@norminvoice/einvoice-core";
import { appendOrgAuditEvent, listInvoicesForOrg } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const fromDate = req.nextUrl.searchParams.get("from") || undefined;
  const toDate = req.nextUrl.searchParams.get("to") || undefined;

  const valid = listInvoicesForOrg(access.ctx.orgId, { fromDate, toDate })
    .filter((r) => r.validationPassed && r.status !== "DRAFT")
    .map((r) => r.canonical);

  const tsv = buildFrenchFecTsv(valid);
  appendOrgAuditEvent(access.ctx.orgId, null, "DGFIP-FEC", "EXPORT_FEC_DOWNLOADED", access.ctx.actorEmail, {
    count: valid.length,
    fromDate: fromDate ?? null,
    toDate: toDate ?? null,
  });

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `FEC_NormInvoice_${stamp}.txt`;

  return new NextResponse(tsv, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
