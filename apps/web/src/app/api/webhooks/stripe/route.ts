import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhookForOrg } from "@/lib/webhooks/stripe-handler";

/**
 * Legacy endpoint: requires explicit ?orgId=... (prefer /api/webhooks/stripe/{orgId}).
 * Signature is ALWAYS verified against that org's own encrypted signing secret.
 */
export async function POST(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json(
      { error: "Use your tenant-scoped webhook URL: /api/webhooks/stripe/{orgId} (see Settings → Integrations)." },
      { status: 400 }
    );
  }
  return handleStripeWebhookForOrg(req, orgId);
}
