import { NextRequest, NextResponse } from "next/server";
import { setIncomingInvoicePaymentStatus } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = (await req.json()) as { paymentStatus?: "PAID" | "UNPAID" };
  const nextStatus = body.paymentStatus === "PAID" ? "PAID" : "UNPAID";

  const updated = setIncomingInvoicePaymentStatus(access.ctx.orgId, id, nextStatus, access.ctx.actorEmail);
  if (!updated) {
    return NextResponse.json({ error: "Incoming invoice not found" }, { status: 404 });
  }
  return NextResponse.json({ incoming: updated });
}
