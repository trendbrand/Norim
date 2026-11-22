import { NextRequest, NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "@/lib/db-store";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: string };
    if (!body.token?.trim()) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const result = consumeEmailVerificationToken(body.token.trim());
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Invalid or expired verification link." }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      email: result.email,
      message: "Your email address has been verified.",
    });
  } catch {
    return NextResponse.json({ error: "Email verification failed." }, { status: 400 });
  }
}
