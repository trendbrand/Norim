import { NextRequest } from "next/server";
import { handleWooWebhookForOrg } from "@/lib/webhooks/woo-handler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params;
  return handleWooWebhookForOrg(req, orgId);
}
