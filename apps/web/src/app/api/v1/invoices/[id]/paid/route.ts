import { NextRequest, NextResponse } from "next/server";
import { setInvoicePaymentStatus } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { paymentStatus?: "PAID" | "UNPAID" };
  const nextStatus = body.paymentStatus === "UNPAID" ? "UNPAID" : "PAID";

  const updated = setInvoicePaymentStatus(access.ctx.orgId, id, nextStatus, access.ctx.actorEmail);
  if (!updated) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  return NextResponse.json({ invoice: updated });
}
