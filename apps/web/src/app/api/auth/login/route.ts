import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { consumeUserBackupCode, findUserByEmailDb, getUserTotp, verifyPasswordScrypt } from "@/lib/db-store";
import { verifyTotp } from "@/lib/totp";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = await enforceRateLimit(`auth_login:${ip}`, 20, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please wait 15 minutes before retrying." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string; password?: string; demo?: boolean; totpCode?: string; backupCode?: string };

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

    // Second factor (TOTP) when 2FA is enabled for this account.
    if (!body.demo && user.totpEnabled) {
      const code = (body.totpCode || "").trim();
      const backup = (body.backupCode || "").trim();
      let passed = false;
      if (code) {
        const t = getUserTotp(user.id);
        passed = Boolean(t.secret && verifyTotp(t.secret, code));
      } else if (backup) {
        passed = consumeUserBackupCode(user.id, backup);
      }
      if (!passed) {
        const attempted = Boolean(code || backup);
        // No code yet -> prompt for it (200). Wrong code -> 401.
        return NextResponse.json(
          { twoFactorRequired: true, ...(attempted ? { error: "Invalid authentication code." } : {}) },
          { status: attempted ? 401 : 200 }
        );
      }
    }

    const token = signSessionToken({
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
      fullName: user.fullName,
      orgName: user.orgName,
      role: user.role,
      sv: user.sessionVersion,
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
