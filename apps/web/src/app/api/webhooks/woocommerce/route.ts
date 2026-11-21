import { NextRequest, NextResponse } from "next/server";
import { handleWooWebhookForOrg } from "@/lib/webhooks/woo-handler";

/**
 * Legacy endpoint: requires explicit ?orgId=... (prefer /api/webhooks/woocommerce/{orgId}).
 */
export async function POST(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    const topic = req.headers.get("x-wc-webhook-topic") || "";
    if (topic === "ping") {
      return NextResponse.json({ received: true, pong: true, service: "norminvoice-woo-bridge" });
    }
    return NextResponse.json(
      { error: "Use your tenant-scoped webhook URL: /api/webhooks/woocommerce/{orgId} (see Settings → Integrations)." },
      { status: 400 }
    );
  }
  return handleWooWebhookForOrg(req, orgId);
}
