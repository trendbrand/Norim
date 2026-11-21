import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, checkRateLimit, signSessionToken } from "@/lib/auth";
import { findUserByEmailDb, verifyPasswordScrypt } from "@/lib/db-store";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = checkRateLimit(`auth_login:${ip}`, 20, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please wait 15 minutes before retrying." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string; password?: string; demo?: boolean };

    if (body.demo && process.env.ENABLE_DEMO_LOGIN === "false") {
      return NextResponse.json({ error: "Demo login is disabled in production." }, { status: 403 });
    }

    const user = body.demo
      ? findUserByEmailDb("founder@nordcloud-gmbh.de")
      : body.email
        ? findUserByEmailDb(body.email)
        : null;

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!body.demo) {
      if (!body.password || !verifyPasswordScrypt(body.password, user.passwordHash)) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
    }

    const token = signSessionToken({
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
      fullName: user.fullName,
      orgName: user.orgName,
      role: user.role,
    });

    const res = NextResponse.json({
      authenticated: true,
      onboardingCompleted: user.onboardingCompleted,
      user: {
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        fullName: user.fullName,
        orgName: user.orgName,
        role: user.role,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 400 }
    );
  }
}
