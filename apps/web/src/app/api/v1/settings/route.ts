import { NextRequest, NextResponse } from "next/server";
import {
  appendOrgAuditEvent,
  getOrgById,
  getSellerSettings,
  listOrgAuditEvents,
  updateSellerSettings,
  verifyOrgAuditHashChain,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";
import { persistSellerProfileToPostgres } from "@/lib/pg-persistence";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const settings = getSellerSettings(access.ctx.orgId);
  const org = getOrgById(access.ctx.orgId);
  const auditEvents = listOrgAuditEvents(access.ctx.orgId);
  const chainVerification = verifyOrgAuditHashChain(access.ctx.orgId);

  return NextResponse.json({
    org,
    settings,
    auditEvents,
    chainVerification,
  });
}

export async function PUT(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const updated = updateSellerSettings(access.ctx.orgId, body);
    appendOrgAuditEvent(access.ctx.orgId, null, "SETTINGS", "SELLER_SETTINGS_UPDATED", access.ctx.actorEmail, {
      legalName: updated.legalName,
      vatId: updated.vatId,
      defaultFormat: updated.defaultFormat,
    });
    await persistSellerProfileToPostgres(access.ctx.orgId, updated);
    return NextResponse.json({ saved: true, settings: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 400 }
    );
  }
}
