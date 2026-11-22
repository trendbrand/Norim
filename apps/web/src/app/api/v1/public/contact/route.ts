import { NextRequest, NextResponse } from "next/server";
import { createContactInquiry } from "@/lib/db-store";
import { enforceRateLimit } from "@/lib/rate-limit";

const ALLOWED_TOPICS = new Set([
  "sales",
  "support",
  "billing",
  "privacy",
  "partners",
  "general",
]);

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = await enforceRateLimit(`public_contact:${ip}`, 10, 15 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many submissions from your network. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      company?: string;
      country?: string;
      topic?: string;
      message?: string;
      marketingOptIn?: boolean;
      website?: string; // Honeypot field — must stay empty
    };

    // Anti-spam honeypot check
    if (body.website && body.website.trim().length > 0) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    const topic = ALLOWED_TOPICS.has((body.topic || "").toLowerCase())
      ? (body.topic || "general").toLowerCase()
      : "general";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Please provide your full name (2–120 characters)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid work email address." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 4000) {
      return NextResponse.json({ error: "Please enter a message between 10 and 4,000 characters." }, { status: 400 });
    }

    const saved = createContactInquiry({
      name,
      email,
      company: (body.company || "").trim().slice(0, 160),
      country: (body.country || "").trim().slice(0, 80),
      topic,
      message,
      marketingOptIn: Boolean(body.marketingOptIn),
    });

    return NextResponse.json(
      {
        submitted: true,
        inquiryId: saved.id,
        createdAt: saved.createdAt,
        message: `Thank you. Your inquiry (${saved.id}) has been recorded for the NormInvoice team at official@trendandbrands.com.`,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit inquiry." },
      { status: 400 }
    );
  }
}
