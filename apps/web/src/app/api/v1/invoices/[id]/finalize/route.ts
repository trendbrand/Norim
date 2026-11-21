import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import { enforceOrgMonthlyQuota } from "@/lib/quota";
import { consumeNextInvoiceNumber, getInvoiceForOrg, saveInvoiceForOrg } from "@/lib/db-store";

/**
 * Finalize a DRAFT: assigns the next gapless sequential number (GoBD), validates, and archives it.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const draft = getInvoiceForOrg(access.ctx.orgId, id);
  if (!draft) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (draft.status !== "DRAFT") {
    return NextResponse.json({ error: "Invoice is already finalized." }, { status: 409 });
  }

  const quota = enforceOrgMonthlyQuota(access.ctx.orgId, 1);
  if (!quota.allowed) return quota.response;

  const canonical = structuredClone(draft.canonical);
  if (canonical.invoiceNumber.startsWith("ENTWURF-")) {
    canonical.invoiceNumber = consumeNextInvoiceNumber(access.ctx.orgId, canonical.typeCode === 381 ? 381 : 380);
  }
  canonical.issueDate = new Date().toISOString().slice(0, 10);

  const finalized = saveInvoiceForOrg(access.ctx.orgId, canonical, {
    id: draft.id,
    customerId: draft.customerId,
    source: draft.source,
    sourceRef: draft.sourceRef,
    actorEmail: access.ctx.actorEmail,
    saveAsDraft: false,
  });

  return NextResponse.json({ invoice: finalized });
}
