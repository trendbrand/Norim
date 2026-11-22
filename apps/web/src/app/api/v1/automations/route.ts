import { NextRequest, NextResponse } from "next/server";
import {
  listAutomationRulesForOrg,
  listAutomationRunsForOrg,
  toggleAutomationRuleForOrg,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json({
    rules: listAutomationRulesForOrg(access.ctx.orgId),
    runs: listAutomationRunsForOrg(access.ctx.orgId),
  });
}

export async function PATCH(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const body = (await req.json()) as { id?: string; enabled?: boolean };
  if (!body.id) {
    return NextResponse.json({ error: "Missing automation rule id" }, { status: 400 });
  }
  const updated = toggleAutomationRuleForOrg(
    access.ctx.orgId,
    body.id,
    Boolean(body.enabled),
    access.ctx.actorEmail
  );
  if (!updated) return NextResponse.json({ error: "Automation rule not found" }, { status: 404 });
  return NextResponse.json({ rule: updated });
}
