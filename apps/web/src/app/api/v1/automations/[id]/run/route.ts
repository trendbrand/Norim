import { NextRequest, NextResponse } from "next/server";
import { runAutomationRule } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

/**
 * Simulate (dryRun=true, default) or execute (dryRun=false) an automation rule.
 * Both paths are recorded in the automation run history. Execution performs only
 * internal, non-destructive actions — no outbound message is auto-sent.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  let dryRun = true;
  try {
    const body = (await req.json()) as { dryRun?: boolean };
    if (body.dryRun === false) dryRun = false;
  } catch {
    // default dry-run
  }

  const result = runAutomationRule(access.ctx.orgId, id, dryRun, access.ctx.actorEmail);
  if (!result) return NextResponse.json({ error: "Automation rule not found" }, { status: 404 });
  return NextResponse.json(result, { status: dryRun ? 200 : 201 });
}
