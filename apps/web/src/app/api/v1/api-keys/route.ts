import { NextRequest, NextResponse } from "next/server";
import {
  appendOrgAuditEvent,
  createApiKeyForOrg,
  listApiKeysForOrg,
  revokeApiKeyForOrg,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;
  return NextResponse.json({ keys: listApiKeysForOrg(access.ctx.orgId) });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as { name?: string; scopes?: string[] };
    const scopes =
      Array.isArray(body.scopes) && body.scopes.length > 0
        ? body.scopes
        : ["validate", "generate", "exports:read"];

    const created = createApiKeyForOrg(access.ctx.orgId, body.name || "Production Integration Key", scopes);
    appendOrgAuditEvent(access.ctx.orgId, null, created.record.keyPrefix, "API_KEY_CREATED", access.ctx.actorEmail, {
      name: created.record.name,
      scopes,
    });

    return NextResponse.json({
      created: true,
      key: created.record,
      plaintextKey: created.plaintextKey,
      warning: "Store this API key safely now — it will never be displayed in plaintext again.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create API key" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing key id" }, { status: 400 });
  }
  const ok = revokeApiKeyForOrg(access.ctx.orgId, id);
  if (!ok) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }
  appendOrgAuditEvent(access.ctx.orgId, null, id, "API_KEY_REVOKED", access.ctx.actorEmail, { keyId: id });
  return NextResponse.json({ revoked: true, id });
}
