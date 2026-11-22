import { NextRequest, NextResponse } from "next/server";
import { getOrgDashboardSnapshot, getSubscriptionForOrg } from "@/lib/db-store";
import { getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const daysParam = Number(req.nextUrl.searchParams.get("days") || "30");
  const days = [7, 14, 30, 90].includes(daysParam) ? daysParam : 30;

  const snapshot = getOrgDashboardSnapshot(access.ctx.orgId, days);
  const subscription = getSubscriptionForOrg(access.ctx.orgId);
  const quota = getOrgMonthlyQuotaStatus(access.ctx.orgId);

  return NextResponse.json({
    ...snapshot,
    subscription,
    quota,
  });
}
