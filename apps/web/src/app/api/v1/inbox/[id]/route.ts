import { NextRequest, NextResponse } from "next/server";
import {
  setIncomingInvoiceApproval,
  setIncomingInvoicePaymentStatus,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = (await req.json()) as {
    paymentStatus?: "PAID" | "UNPAID";
    approvalStatus?: "APPROVED" | "REJECTED" | "PENDING_REVIEW";
    poReference?: string;
  };

  let updated = null;
  if (body.approvalStatus) {
    updated = setIncomingInvoiceApproval(
      access.ctx.orgId,
      id,
      body.approvalStatus,
      access.ctx.actorEmail,
      body.poReference
    );
  }
  if (body.paymentStatus) {
    updated = setIncomingInvoicePaymentStatus(
      access.ctx.orgId,
      id,
      body.paymentStatus === "PAID" ? "PAID" : "UNPAID",
      access.ctx.actorEmail
    );
  }

  if (!updated) {
    return NextResponse.json({ error: "Incoming invoice not found" }, { status: 404 });
  }
  return NextResponse.json({ incoming: updated });
}
