import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import { appendOrgAuditEvent, exportAllOrgDataGdpr } from "@/lib/db-store";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  const payload = exportAllOrgDataGdpr(access.ctx.orgId);
  appendOrgAuditEvent(access.ctx.orgId, null, "GDPR-ART20", "GDPR_DATA_PORTABILITY_EXPORTED", access.ctx.actorEmail, {
    invoiceCount: payload.invoices.length,
    customerCount: payload.customers.length,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="NormInvoice_GDPR_Art20_Export_${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
