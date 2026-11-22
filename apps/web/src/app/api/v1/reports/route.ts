import { NextRequest, NextResponse } from "next/server";
import { getOrgAnalyticsReport } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json(getOrgAnalyticsReport(access.ctx.orgId));
}
