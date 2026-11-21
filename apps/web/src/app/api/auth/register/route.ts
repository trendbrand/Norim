import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, checkRateLimit, signSessionToken } from "@/lib/auth";
import { createNewAccountWithOrg, findUserByEmailDb } from "@/lib/db-store";
import { persistUserAndOrgToPostgres } from "@/lib/pg-persistence";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = checkRateLimit(`auth_register:${ip}`, 15, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      orgName?: string;
      countryCode?: string;
    };

    const emailOk = Boolean(body.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()));
    const pw = body.password || "";
    const pwStrong = pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);

    if (!emailOk || !pwStrong) {
      return NextResponse.json(
        { error: "Provide a valid work email and password (minimum 8 characters containing letters and numbers)." },
        { status: 400 }
      );
    }

    const created = createNewAccountWithOrg({
      email: body.email!,
      password: pw,
      fullName: body.fullName?.trim() || "Founder",
      orgName: body.orgName?.trim() || "My EU Business GmbH",
      countryCode: body.countryCode || "DE",
    });

    const dbUser = findUserByEmailDb(created.email);
    if (dbUser) {
      await persistUserAndOrgToPostgres({
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        fullName: dbUser.fullName,
        orgName: dbUser.orgName,
      });
    }

    const token = signSessionToken({
      userId: created.id,
      orgId: created.orgId,
      email: created.email,
      fullName: created.fullName,
      orgName: created.orgName,
      role: created.role,
    });

    const res = NextResponse.json({
      authenticated: true,
      onboardingCompleted: false,
      user: {
        id: created.id,
        orgId: created.orgId,
        email: created.email,
        fullName: created.fullName,
        orgName: created.orgName,
        role: created.role,
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
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json(
      { error: msg === "EMAIL_ALREADY_EXISTS" ? "An account with this email already exists." : msg },
      { status: msg === "EMAIL_ALREADY_EXISTS" ? 409 : 400 }
    );
  }
}
