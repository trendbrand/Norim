import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { markOrgPastDue, updateSubscriptionForOrg } from "@/lib/db-store";
import { isWebhookTimestampFresh, timingSafeHexEqual } from "@/lib/security";

const PLAN_QUOTAS: Record<"free" | "solo" | "business" | "agency", number> = {
  free: 3,
  solo: 100,
  business: 500,
  agency: 2500,
};

function verifyPaddleSignature(rawBody: string, header: string | null, secret: string): {
  valid: boolean;
  reason?: string;
} {
  if (!header) return { valid: false, reason: "Missing Paddle-Signature header" };
  const parts: Record<string, string> = {};
  for (const s of header.split(";")) {
    const idx = s.indexOf("=");
    if (idx > 0) parts[s.slice(0, idx).trim()] = s.slice(idx + 1).trim();
  }
  if (!parts.ts || !parts.h1) return { valid: false, reason: "Malformed Paddle-Signature header" };
  if (!isWebhookTimestampFresh(parts.ts, 300)) {
    return { valid: false, reason: "Paddle webhook timestamp outside 5-minute replay tolerance" };
  }
  const expected = crypto.createHmac("sha256", secret).update(`${parts.ts}:${rawBody}`, "utf8").digest("hex");
  return timingSafeHexEqual(expected, parts.h1)
    ? { valid: true }
    : { valid: false, reason: "Paddle signature mismatch" };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const secret = process.env.PADDLE_WEBHOOK_SECRET || "pdl_ntfset_norminvoice_default_verify";
    const check = verifyPaddleSignature(rawBody, req.headers.get("paddle-signature"), secret);
    if (!check.valid) {
      return NextResponse.json({ error: check.reason || "Invalid Paddle-Signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      event_type?: string;
      data?: { custom_data?: { plan_tier?: string; org_id?: string }; status?: string };
    };

    const orgId = payload.data?.custom_data?.org_id || "org_demo_nordcloud_01";
    const rawTier = payload.data?.custom_data?.plan_tier?.toLowerCase() ?? "solo";
    const tier = (["free", "solo", "business", "agency"].includes(rawTier) ? rawTier : "solo") as keyof typeof PLAN_QUOTAS;

    if (
      payload.event_type === "subscription.activated" ||
      payload.event_type === "subscription.updated" ||
      payload.event_type === "subscription.resumed"
    ) {
      // Successful payment / plan change -> active (also clears any grace/suspension).
      updateSubscriptionForOrg(orgId, tier, PLAN_QUOTAS[tier]);
    } else if (
      payload.event_type === "transaction.payment_failed" ||
      payload.event_type === "subscription.past_due"
    ) {
      // Failed renewal -> start the 5-day grace window; the lifecycle job suspends after it expires.
      markOrgPastDue(orgId);
    } else if (payload.event_type === "subscription.canceled") {
      updateSubscriptionForOrg(orgId, "free", PLAN_QUOTAS.free);
    }

    return NextResponse.json({ received: true, orgId, eventType: payload.event_type ?? "unknown" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Paddle webhook failed" },
      { status: 400 }
    );
  }
}
