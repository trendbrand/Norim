import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, SessionPayload } from "./auth";
import { authenticateBearerApiKeyDb } from "./db-store";

export function sanitizeSafeFilename(input: string, fallback = "document"): string {
  const cleaned = input
    .replace(/[/\\]+/g, "-")
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "")
    .slice(0, 64);
  return cleaned || fallback;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function timingSafeHexEqual(expectedHex: string, actualHex: string): boolean {
  if (!/^[0-9a-fA-F]+$/.test(actualHex) || expectedHex.length !== actualHex.length) {
    return false;
  }
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(actualHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isWebhookTimestampFresh(unixSecondsStr: string, toleranceSeconds = 300): boolean {
  const ts = Number(unixSecondsStr);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.abs(nowSec - ts) <= toleranceSeconds;
}

export interface TenantAuthContext {
  orgId: string;
  userId: string | null;
  actorEmail: string;
  role: "owner" | "admin" | "accountant" | "member" | "api_key";
  via: "session" | "api_key";
  session: SessionPayload | null;
  apiKeyPrefix?: string;
}

/**
 * STRICT Tenant-Scoped Authentication & Authorization Guard.
 * NO unauthenticated fallback! Every protected API requires EITHER:
 *  1) A valid HttpOnly HMAC-signed session cookie (`norminvoice_session`), OR
 *  2) A valid active Bearer API key (`Authorization: Bearer ni_live_...`)
 * Returns HTTP 401 Unauthorized on any unauthenticated or invalid request.
 */
export async function requireTenantAuth(
  req: NextRequest,
  options?: { allowApiKey?: boolean; allowedRoles?: Array<TenantAuthContext["role"]> }
): Promise<{ ok: true; ctx: TenantAuthContext } | { ok: false; response: NextResponse }> {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    if (options?.allowApiKey === false) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "This endpoint requires an interactive user session." },
          { status: 403 }
        ),
      };
    }
    const key = authenticateBearerApiKeyDb(authHeader);
    if (!key) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            type: "https://norminvoice.eu/problems/unauthorized",
            title: "Invalid or Revoked API Key",
            status: 401,
          },
          { status: 401 }
        ),
      };
    }
    return {
      ok: true,
      ctx: {
        orgId: key.orgId,
        userId: null,
        actorEmail: `api:${key.keyPrefix}`,
        role: "api_key",
        via: "api_key",
        session: null,
        apiKeyPrefix: key.keyPrefix,
      },
    };
  }

  const session = await getServerSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/unauthorized",
          title: "Authentication Required",
          status: 401,
          detail: "Please sign in at /login or pass a valid Authorization: Bearer ni_live_... API key.",
        },
        { status: 401 }
      ),
    };
  }

  if (options?.allowedRoles && !options.allowedRoles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/forbidden",
          title: "Insufficient Permissions",
          status: 403,
          detail: `Your workspace role (${session.role}) does not have permission for this action.`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    ctx: {
      orgId: session.orgId,
      userId: session.userId,
      actorEmail: session.email,
      role: session.role,
      via: "session",
      session,
    },
  };
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  // Hardening: when the public demo is enabled, its well-known shared account can
  // NEVER be super-admin — even if that address is mistakenly added to
  // SUPERADMIN_EMAILS — so the demo password can never become a control-plane backdoor.
  if (process.env.ENABLE_DEMO_LOGIN === "true" && normalized === "founder@nordcloud-gmbh.de") {
    return false;
  }
  // No hardcoded default: super-admin access requires explicit SUPERADMIN_EMAILS config.
  const configured = (process.env.SUPERADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(normalized);
}

/**
 * STRICT Platform Super-Admin Guard (for /api/v1/admin/*).
 * Regular tenant users receive HTTP 403 Forbidden.
 */
export async function requireSuperAdmin(
  req: NextRequest
): Promise<{ ok: true; ctx: TenantAuthContext } | { ok: false; response: NextResponse }> {
  const auth = await requireTenantAuth(req, { allowApiKey: false });
  if (!auth.ok) return auth;
  if (!isSuperAdminEmail(auth.ctx.actorEmail)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/forbidden",
          title: "Platform Super-Admin Required",
          status: 403,
          detail: "Only designated platform operators can access the Super-Admin control plane.",
        },
        { status: 403 }
      ),
    };
  }
  return auth;
}
