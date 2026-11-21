import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import {
  appendOrgAuditEvent,
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember,
} from "@/lib/db-store";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json({
    members: listTeamMembers(access.ctx.orgId),
    currentUserId: access.ctx.userId,
    currentRole: access.ctx.role,
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      email?: string;
      fullName?: string;
      role?: "owner" | "admin" | "accountant" | "member";
    };
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return NextResponse.json({ error: "Provide a valid teammate email address." }, { status: 400 });
    }
    const role = ["owner", "admin", "accountant", "member"].includes(body.role || "")
      ? body.role!
      : "accountant";

    const members = inviteTeamMember(access.ctx.orgId, body.email, body.fullName || "", role);
    appendOrgAuditEvent(access.ctx.orgId, null, "TEAM", "TEAM_MEMBER_INVITED", access.ctx.actorEmail, {
      invitedEmail: body.email.trim().toLowerCase(),
      role,
    });

    return NextResponse.json({ invited: true, members }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to invite member" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId query param" }, { status: 400 });
  }

  try {
    const removed = removeTeamMember(access.ctx.orgId, userId);
    if (!removed) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }
    appendOrgAuditEvent(access.ctx.orgId, null, "TEAM", "TEAM_MEMBER_REMOVED", access.ctx.actorEmail, {
      removedUserId: userId,
    });
    return NextResponse.json({ removed: true, members: listTeamMembers(access.ctx.orgId) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cannot remove member" },
      { status: 409 }
    );
  }
}
