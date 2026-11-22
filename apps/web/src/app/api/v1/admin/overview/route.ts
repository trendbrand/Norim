import { NextRequest, NextResponse } from "next/server";
import {
  adminSetOrgStatus,
  appendOrgAuditEvent,
  getPlatformAdminOverview,
  recordPlatformAdminAudit,
  updateContactInquiryStatus,
  updateSubscriptionForOrg,
} from "@/lib/db-store";
import { requireStaffAuth } from "@/lib/staff-auth";

const DEFAULT_QUOTAS: Record<"free" | "trial" | "solo" | "business" | "agency", number> = {
  free: 5,
  trial: 15,
  solo: 150,
  business: 500,
  agency: 2500,
};

export async function GET(req: NextRequest) {
  const access = await requireStaffAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json(getPlatformAdminOverview());
}

export async function PATCH(req: NextRequest) {
  const access = await requireStaffAuth(req);
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      orgId?: string;
      inquiryId?: string;
      inquiryStatus?: "OPEN" | "IN_REVIEW" | "RESOLVED";
      action?: "PLAN_OVERRIDE" | "SUSPEND" | "REACTIVATE" | "UPDATE_INQUIRY";
      planTier?: "free" | "trial" | "solo" | "business" | "agency";
      monthlyQuota?: number;
      reason?: string;
    };

    if (body.action === "UPDATE_INQUIRY") {
      if (!body.inquiryId || !body.inquiryStatus) {
        return NextResponse.json({ error: "inquiryId and inquiryStatus are required." }, { status: 400 });
      }
      const ok = updateContactInquiryStatus(body.inquiryId, body.inquiryStatus, access.ctx.staffEmail);
      if (!ok) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
      return NextResponse.json({ updated: true, inquiryStatus: body.inquiryStatus });
    }

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
        access.ctx.staffEmail
      );
      if (!ok) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      return NextResponse.json({ updated: true, orgStatus: body.action === "SUSPEND" ? "SUSPENDED" : "ACTIVE" });
    }

    if (!body.planTier || !(body.planTier in DEFAULT_QUOTAS)) {
      return NextResponse.json({ error: "Valid planTier (free/trial/solo/business/agency) required." }, { status: 400 });
    }
    const quota =
      typeof body.monthlyQuota === "number" && body.monthlyQuota > 0
        ? Math.floor(body.monthlyQuota)
        : DEFAULT_QUOTAS[body.planTier];

    const updated = updateSubscriptionForOrg(body.orgId, body.planTier, quota);
    appendOrgAuditEvent(body.orgId, null, "ADMIN-OVERRIDE", "ADMIN_PLAN_UPDATED", access.ctx.staffEmail, {
      planTier: body.planTier,
      monthlyQuota: quota,
      reason: body.reason || "Super-Admin plan update",
    });
    recordPlatformAdminAudit(
      access.ctx.staffEmail,
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
