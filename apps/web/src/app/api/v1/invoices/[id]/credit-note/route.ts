import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import { enforceOrgMonthlyQuota } from "@/lib/quota";
import { issueCreditNoteForInvoice } from "@/lib/db-store";

/**
 * 1-Click GoBD-Compliant Credit Note (Gutschrift / Stornorechnung TypeCode 381)
 * Automatically references original invoice (BT-25) and consumes creditNotePrefix sequence.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  const quota = enforceOrgMonthlyQuota(access.ctx.orgId, 1);
  if (!quota.allowed) return quota.response;

  const { id } = await context.params;
  let reason = "";
  try {
    const body = (await req.json()) as { reason?: string };
    reason = body.reason?.trim() || "";
  } catch {
    // optional JSON body
  }

  const creditNote = issueCreditNoteForInvoice(access.ctx.orgId, id, access.ctx.actorEmail, reason);
  if (!creditNote) {
    return NextResponse.json({ error: "Original invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ creditNote }, { status: 201 });
}
