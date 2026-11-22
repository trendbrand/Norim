import { NextRequest, NextResponse } from "next/server";
import { getInvoiceForOrg, listTransmissionJobsForOrg } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

/**
 * List the durable transmission-outbox jobs for one invoice (ADR-004 observability).
 * Tenant-scoped: only jobs belonging to the caller's org for an invoice they own.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const invoice = getInvoiceForOrg(access.ctx.orgId, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({
    transmissions: listTransmissionJobsForOrg(access.ctx.orgId, id),
  });
}
