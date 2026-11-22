import { NextRequest, NextResponse } from "next/server";
import { getDelegatedClientReview } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

/**
 * Accountant review queue for one delegated client.
 * Authorization is by CONSENT, not membership: the caller (an authenticated
 * accountant in their own org) may only read a client that granted their email
 * an active, non-expired, non-revoked delegation. The data-layer verifies this
 * and records the access in the client's audit chain.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  const { orgId } = await context.params;
  const review = getDelegatedClientReview(access.ctx.actorEmail, orgId);
  if (!review) {
    return NextResponse.json(
      { error: "No active delegation consent for this client, or consent has expired/been revoked." },
      { status: 403 }
    );
  }

  return NextResponse.json({ review });
}
