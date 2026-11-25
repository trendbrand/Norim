import { NextRequest, NextResponse } from "next/server";
import { createAuthTokenForEmail } from "@/lib/db-store";
import { dispatchTransactionalEmail } from "@/lib/email-dispatcher";
import { enforceRateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/security";
import { publicOrigin } from "@/lib/public-url";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = await enforceRateLimit(`auth_forgot:${ip}`, 10, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many reset requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const created = createAuthTokenForEmail(email, "RESET_PASSWORD");
    let devResetPath: string | undefined;

    if (created) {
      const origin = publicOrigin(req);
      const resetPath = `/reset-password?token=${encodeURIComponent(created.token)}`;
      const resetUrl = `${origin}${resetPath}`;
      await dispatchTransactionalEmail({
        to: created.email,
        subject: "Reset your NormInvoice password",
        html: `<p>Hello ${escapeHtml(created.fullName)},</p><p>We received a request to reset your NormInvoice password. This single-use link expires in 60 minutes:</p><p><a href="${resetUrl}">Reset Password</a></p><p>If you did not request this, you can safely ignore this message.</p>`,
      }).catch(() => {});

      // In local development without RESEND_API_KEY, expose the reset path strictly for non-production verification
      if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
        devResetPath = resetPath;
      }
    }

    // Security invariant: never reveal whether an account exists for a given email
    return NextResponse.json({
      accepted: true,
      message:
        "If an account exists for that email address, a password reset link has been sent. Please check your inbox.",
      ...(devResetPath ? { devResetPath } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Unable to process password reset request." }, { status: 400 });
  }
}
