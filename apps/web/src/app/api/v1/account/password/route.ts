import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import { appendOrgAuditEvent, changeUserPassword } from "@/lib/db-store";

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ error: "Both currentPassword and newPassword are required." }, { status: 400 });
    }
    const res = changeUserPassword(access.ctx.userId!, body.currentPassword, body.newPassword);
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    appendOrgAuditEvent(access.ctx.orgId, null, "ACCOUNT", "PASSWORD_CHANGED", access.ctx.actorEmail, {
      userId: access.ctx.userId,
    });

    return NextResponse.json({ changed: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Password change failed" },
      { status: 400 }
    );
  }
}
