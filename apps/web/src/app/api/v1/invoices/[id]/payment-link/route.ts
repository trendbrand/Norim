import { NextRequest, NextResponse } from "next/server";
import { getInvoiceForOrg, getOrCreatePaymentToken } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

/**
 * Public origin for customer-facing links. Behind a reverse proxy (Caddy),
 * req.nextUrl.origin is the internal bind address (e.g. http://0.0.0.0:3000),
 * so prefer the proxy's forwarded host/proto, then an explicit APP_DOMAIN
 * (runtime env, unlike build-inlined NEXT_PUBLIC_*), then the raw origin.
 */
function publicOrigin(req: NextRequest): string {
  const fwHost = req.headers.get("x-forwarded-host");
  if (fwHost) {
    const host = fwHost.split(",")[0].trim();
    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
    if (host) return `${proto}://${host}`;
  }
  const domain = process.env.APP_DOMAIN?.trim();
  if (domain) return `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return req.nextUrl.origin;
}

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

  return NextResponse.json({ token, url: `${publicOrigin(req)}/pay/${token}` });
}
