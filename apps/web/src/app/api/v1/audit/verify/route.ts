import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import { listOrgAuditEvents, verifyOrgAuditHashChain } from "@/lib/db-store";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const invoiceId = req.nextUrl.searchParams.get("invoiceId") || undefined;
  const verification = verifyOrgAuditHashChain(access.ctx.orgId);
  const events = listOrgAuditEvents(access.ctx.orgId, invoiceId);

  return NextResponse.json({
    verification,
    events,
  });
}
