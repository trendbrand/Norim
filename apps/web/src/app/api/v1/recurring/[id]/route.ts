import { NextRequest, NextResponse } from "next/server";
import {
  deleteRecurringScheduleForOrg,
  runRecurringScheduleNow,
  toggleRecurringScheduleForOrg,
} from "@/lib/db-store";
import { enforceOrgMonthlyQuota } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";

/**
 * Trigger immediate execution of a recurring schedule -> issues a real sequential EN 16931 invoice!
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const quota = enforceOrgMonthlyQuota(access.ctx.orgId, 1);
  if (!quota.allowed) return quota.response;

  const { id } = await context.params;
  try {
    const res = runRecurringScheduleNow(access.ctx.orgId, id, access.ctx.actorEmail);
    if (!res) return NextResponse.json({ error: "Recurring schedule not found" }, { status: 404 });
    return NextResponse.json(res, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to run recurring schedule" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = (await req.json()) as { active?: boolean };
  const updated = toggleRecurringScheduleForOrg(access.ctx.orgId, id, Boolean(body.active));
  if (!updated) return NextResponse.json({ error: "Recurring schedule not found" }, { status: 404 });
  return NextResponse.json({ schedule: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const ok = deleteRecurringScheduleForOrg(access.ctx.orgId, id);
  if (!ok) return NextResponse.json({ error: "Recurring schedule not found" }, { status: 404 });
  return NextResponse.json({ deleted: true, id });
}
