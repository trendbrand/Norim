import { NextRequest, NextResponse } from "next/server";
import { getInvoiceForOrg, getOrCreatePaymentToken } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

/**
 * Mints (or returns) the shareable public payment link for a finalized invoice.
 * The token is an unguessable capability; the public /pay/<token> page shows the
 * amount due and a scan-to-pay SEPA GiroCode. Drafts have no payable link.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const invoice = getInvoiceForOrg(access.ctx.orgId, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status === "DRAFT") {
    return NextResponse.json({ error: "Finalize the invoice before sharing a payment link." }, { status: 400 });
  }

  const token = getOrCreatePaymentToken(access.ctx.orgId, id);
  if (!token) {
    return NextResponse.json({ error: "Could not create payment link." }, { status: 400 });
  }

  return NextResponse.json({ token, url: `${req.nextUrl.origin}/pay/${token}` });
}
