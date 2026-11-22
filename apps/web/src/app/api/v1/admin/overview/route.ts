import { NextRequest, NextResponse } from "next/server";
import {
  adminSetOrgStatus,
  appendOrgAuditEvent,
  getPlatformAdminOverview,
  recordPlatformAdminAudit,
  updateSubscriptionForOrg,
} from "@/lib/db-store";
import { requireSuperAdmin } from "@/lib/security";

const DEFAULT_QUOTAS: Record<"free" | "solo" | "business" | "agency", number> = {
  free: 3,
  solo: 100,
  business: 500,
  agency: 2500,
};

export async function GET(req: NextRequest) {
  const access = await requireSuperAdmin(req);
  if (!access.ok) return access.response;

  return NextResponse.json(getPlatformAdminOverview());
}

export async function PATCH(req: NextRequest) {
  const access = await requireSuperAdmin(req);
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      orgId?: string;
      action?: "PLAN_OVERRIDE" | "SUSPEND" | "REACTIVATE";
      planTier?: "free" | "solo" | "business" | "agency";
      monthlyQuota?: number;
      reason?: string;
    };

    if (!body.orgId) {
      return NextResponse.json({ error: "orgId is required." }, { status: 400 });
    }

    if (body.action === "SUSPEND" || body.action === "REACTIVATE") {
      if (!body.reason?.trim() || body.reason.trim().length < 5) {
        return NextResponse.json(
          { error: "A mandatory reason code (min 5 characters) is required for tenant status changes." },
          { status: 400 }
        );
      }
      const ok = adminSetOrgStatus(
        body.orgId,
        body.action === "SUSPEND" ? "SUSPENDED" : "ACTIVE",
        body.reason,
        access.ctx.actorEmail
      );
      if (!ok) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      return NextResponse.json({ updated: true, orgStatus: body.action === "SUSPEND" ? "SUSPENDED" : "ACTIVE" });
    }

    if (!body.planTier || !(body.planTier in DEFAULT_QUOTAS)) {
      return NextResponse.json({ error: "Valid planTier (free/solo/business/agency) required." }, { status: 400 });
    }
    const quota =
      typeof body.monthlyQuota === "number" && body.monthlyQuota > 0
        ? Math.floor(body.monthlyQuota)
        : DEFAULT_QUOTAS[body.planTier];

    const updated = updateSubscriptionForOrg(body.orgId, body.planTier, quota);
    appendOrgAuditEvent(body.orgId, null, "ADMIN-OVERRIDE", "ADMIN_PLAN_UPDATED", access.ctx.actorEmail, {
      planTier: body.planTier,
      monthlyQuota: quota,
      reason: body.reason || "Super-Admin plan update",
    });
    recordPlatformAdminAudit(
      access.ctx.actorEmail,
      `PLAN_SET_${body.planTier.toUpperCase()}`,
      body.orgId,
      body.reason || "Super-Admin plan override"
    );

    return NextResponse.json({ updated: true, subscription: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Admin action failed" },
      { status: 400 }
    );
  }
}
