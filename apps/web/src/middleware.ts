import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PROTECTED_PAGE_PREFIXES = [
  "/dashboard",
  "/invoices",
  "/inbox",
  "/compliance",
  "/payments",
  "/accountant",
  "/recurring",
  "/automations",
  "/reports",
  "/customers",
  "/catalog",
  "/batch",
  "/exports",
  "/settings",
  "/onboarding",
  "/create",
];

// The platform control plane is a SEPARATE realm: it is gated by the staff
// session cookie below, never by the customer session.
const STAFF_SESSION_COOKIE = "ni_staff_session";
const DEV_STAFF_SECRET_FALLBACK = "norminvoice_dev_staff_fallback_secret_change_in_prod_32c";

function base64UrlToUint8Array(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Edge-compatible Web Crypto HMAC-SHA256 session cookie verifier!
 * Ensures unauthenticated visitors NEVER access protected workspace pages.
 */
const DEV_AUTH_SECRET_FALLBACK = "norminvoice_dev_fallback_secret_change_in_prod_32chars";

function edgeAuthSecretValid(secret: string | undefined): secret is string {
  return Boolean(
    secret && secret.length >= 32 && secret !== DEV_AUTH_SECRET_FALLBACK && !secret.includes("change_me")
  );
}

async function verifyEdgeSessionCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encoded, sigB64] = parts;
  if (!encoded || !sigB64) return false;

  const secret = process.env.AUTH_SECRET || DEV_AUTH_SECRET_FALLBACK;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = base64UrlToUint8Array(sigB64);
  const validSig = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, enc.encode(encoded));
  if (!validSig) return false;

  try {
    const payloadText = new TextDecoder().decode(base64UrlToUint8Array(encoded));
    const payload = JSON.parse(payloadText) as { exp?: number };
    return Boolean(payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

async function verifyEdgeStaffCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encoded, sigB64] = parts;
  if (!encoded || !sigB64) return false;

  const secret = process.env.STAFF_AUTH_SECRET || DEV_STAFF_SECRET_FALLBACK;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sigBytes = base64UrlToUint8Array(sigB64);
  const validSig = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, enc.encode(encoded));
  if (!validSig) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encoded))) as { exp?: number };
    return Boolean(payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Fail closed: in production, refuse all traffic if AUTH_SECRET is missing/default,
  //    rather than silently verifying sessions with a world-known dev key.
  if (process.env.NODE_ENV === "production" && !edgeAuthSecretValid(process.env.AUTH_SECRET)) {
    return NextResponse.json(
      {
        type: "https://norminvoice.eu/problems/misconfigured",
        title: "Service Misconfigured",
        status: 503,
        detail: "AUTH_SECRET is not set to a strong production value.",
      },
      { status: 503 }
    );
  }

  // 1. Strict Page Auth Gate: redirect unauthenticated visitors to /login?next=...
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isProtectedPage) {
    const token = req.cookies.get("norminvoice_session")?.value;
    const isAuthenticated = await verifyEdgeSessionCookie(token);
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 1b. Separate staff realm gate: /admin pages require the staff cookie, NOT the
  //     customer session. Unauthenticated staff are sent to the staff sign-in.
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login") {
    const staffToken = req.cookies.get(STAFF_SESSION_COOKIE)?.value;
    if (!(await verifyEdgeStaffCookie(staffToken))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 2. CSRF Same-Origin Guard on browser-initiated API mutations
  if (
    MUTATING_METHODS.has(req.method) &&
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/webhooks/") &&
    !req.headers.get("authorization")
  ) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json(
            { type: "https://norminvoice.eu/problems/csrf-blocked", title: "Cross-Origin Request Blocked", status: 403 },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json({ error: "Invalid Origin header" }, { status: 403 });
      }
    }
  }

  const res = NextResponse.next();

  // 3. OWASP Security Headers + Self-Hosted Font CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.paddle.com https://sandbox-api.paddle.com",
    "frame-src https://buy.paddle.com https://sandbox-buy.paddle.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
