import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * SEPARATE Platform Staff (Super-Admin) authentication realm (Master Plan ADR-002).
 *
 * This is deliberately independent from the customer session (`auth.ts`):
 *  - its own cookie (`ni_staff_session`), signed with its OWN secret (STAFF_AUTH_SECRET),
 *  - its own short step-up TTL,
 *  - its own identity allowlist (STAFF_ADMIN_EMAILS).
 * A customer session — even one whose email is a platform operator — can NEVER
 * reach the admin control plane. Staff must authenticate to this realm separately,
 * so staff cannot elevate through customer roles.
 */

export const STAFF_SESSION_COOKIE = "ni_staff_session";
const STAFF_TTL_SECONDS = 2 * 60 * 60; // 2h step-up session
const DEV_STAFF_SECRET_FALLBACK = "norminvoice_dev_staff_fallback_secret_change_in_prod_32c";

export interface StaffPayload {
  email: string;
  iat: number;
  exp: number;
}

function isStaffSecretValid(secret: string | undefined | null): secret is string {
  return Boolean(secret && secret.length >= 32 && secret !== DEV_STAFF_SECRET_FALLBACK && !secret.includes("change_me"));
}

function getStaffSecret(): string {
  const secret = process.env.STAFF_AUTH_SECRET;
  if (isStaffSecretValid(secret)) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: STAFF_AUTH_SECRET must be a strong secret, separate from AUTH_SECRET, in production.");
  }
  return DEV_STAFF_SECRET_FALLBACK;
}

/** Staff identity allowlist (separate from any customer role). */
export function isConfiguredStaff(email: string | undefined | null): boolean {
  if (!email) return false;
  const configured = (process.env.STAFF_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

/** Verify a staff password: scrypt hash (STAFF_ADMIN_PASSWORD_HASH="saltHex:hashHex") if set,
 *  otherwise a bootstrap plaintext STAFF_ADMIN_PASSWORD (dev / single-node bootstrap). */
export function verifyStaffPassword(email: string, password: string): boolean {
  if (!isConfiguredStaff(email) || !password) return false;
  const hash = process.env.STAFF_ADMIN_PASSWORD_HASH;
  if (hash && hash.includes(":")) {
    const [saltHex, expectedHex] = hash.split(":");
    try {
      const derived = crypto.scryptSync(password, Buffer.from(saltHex!, "hex"), 32).toString("hex");
      const a = Buffer.from(derived);
      const b = Buffer.from(expectedHex!);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  const plain = process.env.STAFF_ADMIN_PASSWORD;
  if (plain && plain.length >= 8) {
    const a = Buffer.from(password);
    const b = Buffer.from(plain);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return false;
}

export function signStaffToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: StaffPayload = { email: email.trim().toLowerCase(), iat: now, exp: now + STAFF_TTL_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getStaffSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyStaffToken(token: string | undefined | null): StaffPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac("sha256", getStaffSecret()).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as StaffPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    // Removal from the allowlist immediately revokes a still-valid token.
    if (!isConfiguredStaff(parsed.email)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffPayload | null> {
  const cookieStore = await cookies();
  return verifyStaffToken(cookieStore.get(STAFF_SESSION_COOKIE)?.value);
}

export interface StaffAuthContext {
  staffEmail: string;
}

/**
 * STRICT staff-realm guard for /api/v1/admin/*. Reads ONLY the staff cookie,
 * never the customer session, so a customer session cannot access admin APIs.
 */
export async function requireStaffAuth(
  _req: NextRequest
): Promise<{ ok: true; ctx: StaffAuthContext } | { ok: false; response: NextResponse }> {
  const staff = await getStaffSession();
  if (!staff) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/staff-unauthorized",
          title: "Staff Authentication Required",
          status: 401,
          detail: "The platform control plane requires a separate staff sign-in at /admin/login.",
        },
        { status: 401 }
      ),
    };
  }
  return { ok: true, ctx: { staffEmail: staff.email } };
}

export function buildStaffSessionCookie(token: string): {
  name: string;
  value: string;
  options: { httpOnly: true; secure: boolean; sameSite: "lax"; path: string; maxAge: number };
} {
  return {
    name: STAFF_SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Lax so the cookie rides top-level navigations to /admin (still CSRF-safe:
      // not sent on cross-site POSTs, and the API also enforces same-origin).
      sameSite: "lax",
      path: "/",
      maxAge: STAFF_TTL_SECONDS,
    },
  };
}
