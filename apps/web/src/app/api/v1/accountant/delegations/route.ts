import { NextRequest, NextResponse } from "next/server";
import {
  createAccountantDelegation,
  listDelegatedClientsForAccountant,
  listOrgDelegations,
  revokeAccountantDelegation,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  return NextResponse.json({
    grantedByMyOrg: listOrgDelegations(access.ctx.orgId),
    delegatedToMe: listDelegatedClientsForAccountant(access.ctx.actorEmail),
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      accountantEmail?: string;
      accountantName?: string;
      scope?: "READ_EXPORT" | "FULL_BOOKKEEPING";
      expiresDays?: number;
    };
    if (!body.accountantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.accountantEmail.trim())) {
      return NextResponse.json({ error: "Provide a valid accountant email address." }, { status: 400 });
    }
    const delegation = createAccountantDelegation(
      access.ctx.orgId,
      {
        accountantEmail: body.accountantEmail,
        accountantName: body.accountantName,
        scope: body.scope,
        expiresDays: body.expiresDays,
      },
      access.ctx.actorEmail
    );
    return NextResponse.json({ delegation }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to grant delegation" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing delegation id" }, { status: 400 });
  const ok = revokeAccountantDelegation(access.ctx.orgId, id, access.ctx.actorEmail);
  if (!ok) return NextResponse.json({ error: "Delegation not found" }, { status: 404 });
  return NextResponse.json({ revoked: true, id });
}
