import { NextRequest, NextResponse } from "next/server";
import { recordPlatformAdminAudit } from "@/lib/db-store";
import {
  STAFF_SESSION_COOKIE,
  buildStaffSessionCookie,
  signStaffToken,
  verifyStaffPassword,
} from "@/lib/staff-auth";

/**
 * Staff-realm sign-in (separate from customer /api/auth). On success it issues the
 * dedicated `ni_staff_session` cookie — it does NOT touch the customer session.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (!verifyStaffPassword(email, password)) {
    // Generic message — never reveal whether the email is a configured operator.
    return NextResponse.json(
      { error: "Invalid staff credentials, or staff access is not configured for this account." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, staffEmail: email });
  const cookie = buildStaffSessionCookie(signStaffToken(email));
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  recordPlatformAdminAudit(email, "STAFF_LOGIN", null, "Staff realm sign-in");
  return res;
}

/** Staff sign-out: clears the staff cookie only. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
