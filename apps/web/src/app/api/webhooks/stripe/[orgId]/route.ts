import { NextRequest } from "next/server";
import { handleStripeWebhookForOrg } from "@/lib/webhooks/stripe-handler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params;
  return handleStripeWebhookForOrg(req, orgId);
}
