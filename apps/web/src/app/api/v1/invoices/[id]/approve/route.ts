import { NextRequest, NextResponse } from "next/server";
import { setOutgoingInvoiceApproval } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "accountant"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = (await req.json()) as { approvalStatus?: "APPROVED" | "REJECTED" };
  const next = body.approvalStatus === "REJECTED" ? "REJECTED" : "APPROVED";

  const updated = setOutgoingInvoiceApproval(access.ctx.orgId, id, next, access.ctx.actorEmail);
  if (!updated) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ invoice: updated });
}
