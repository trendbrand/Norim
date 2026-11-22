import { NextRequest, NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/db-store";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = await enforceRateLimit(`auth_reset:${ip}`, 15, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
    }

    const body = (await req.json()) as { token?: string; password?: string };
    if (!body.token?.trim() || !body.password) {
      return NextResponse.json({ error: "Reset token and new password are required." }, { status: 400 });
    }

    const result = consumePasswordResetToken(body.token.trim(), body.password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Invalid or expired reset link." }, { status: 400 });
    }

    return NextResponse.json({
      reset: true,
      message: "Your password has been updated. All previous sessions have been revoked. You may now log in.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to reset password." }, { status: 400 });
  }
}
