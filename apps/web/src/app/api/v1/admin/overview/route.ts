import { NextRequest, NextResponse } from "next/server";
import {
  appendOrgAuditEvent,
  getPlatformAdminOverview,
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
      planTier?: "free" | "solo" | "business" | "agency";
      monthlyQuota?: number;
    };
    if (!body.orgId || !body.planTier || !(body.planTier in DEFAULT_QUOTAS)) {
      return NextResponse.json({ error: "Valid orgId and planTier (free/solo/business/agency) required." }, { status: 400 });
    }
    const quota =
      typeof body.monthlyQuota === "number" && body.monthlyQuota > 0
        ? Math.floor(body.monthlyQuota)
        : DEFAULT_QUOTAS[body.planTier];

    const updated = updateSubscriptionForOrg(body.orgId, body.planTier, quota);
    appendOrgAuditEvent(body.orgId, null, "ADMIN-OVERRIDE", "ADMIN_PLAN_UPDATED", access.ctx.actorEmail, {
      planTier: body.planTier,
      monthlyQuota: quota,
    });

    return NextResponse.json({ updated: true, subscription: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Admin plan update failed" },
      { status: 400 }
    );
  }
}
