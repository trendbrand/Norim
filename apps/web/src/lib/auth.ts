import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "norminvoice_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  orgId: string;
  email: string;
  fullName: string;
  orgName: string;
  role: "owner" | "admin" | "accountant" | "member";
  exp: number;
}

const DEV_AUTH_SECRET_FALLBACK = "norminvoice_dev_fallback_secret_change_in_prod_32chars";

/** True when the configured AUTH_SECRET is strong enough to use. */
export function isAuthSecretValid(secret: string | undefined | null): secret is string {
  return Boolean(
    secret &&
      secret.length >= 32 &&
      secret !== DEV_AUTH_SECRET_FALLBACK &&
      !secret.includes("change_me")
  );
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (isAuthSecretValid(secret)) return secret;
  // Fail-fast in production instead of silently signing sessions with a world-known key.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: AUTH_SECRET must be set to a strong secret (>= 32 chars, not the default) in production."
    );
  }
  return DEV_AUTH_SECRET_FALLBACK;
}

export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getAuthSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = crypto.createHmac("sha256", getAuthSecret()).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

const rateWindows = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const list = (rateWindows.get(key) ?? []).filter((ts) => ts > now - windowMs);
  if (list.length >= maxRequests) {
    rateWindows.set(key, list);
    return { allowed: false, remaining: 0 };
  }
  list.push(now);
  rateWindows.set(key, list);
  return { allowed: true, remaining: maxRequests - list.length };
}
