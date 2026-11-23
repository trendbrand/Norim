import { NextRequest } from "next/server";
import { handleShopifyWebhookForOrg } from "@/lib/webhooks/shopify-handler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params;
  return handleShopifyWebhookForOrg(req, orgId);
}
