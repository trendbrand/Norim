import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { StripeInvoiceLike, mapStripeInvoiceToCanonical, verifyEuVatId } from "@norminvoice/einvoice-core";
import {
  getIntegrationSecretDecrypted,
  getSellerSettings,
  recordWebhookDeliveryLog,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
} from "@/lib/db-store";
import { isWebhookTimestampFresh, timingSafeHexEqual } from "@/lib/security";

export function verifyStripeSignature(rawBody: string, sigHeader: string | null, secret: string): {
  valid: boolean;
  reason?: string;
} {
  if (!sigHeader) return { valid: false, reason: "Missing Stripe-Signature header" };
  if (!secret) return { valid: false, reason: "Stripe signing secret is not configured for this organization" };
  const parts: Record<string, string> = {};
  for (const kv of sigHeader.split(",")) {
    const idx = kv.indexOf("=");
    if (idx > 0) parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim();
  }
  if (!parts.t || !parts.v1) return { valid: false, reason: "Malformed Stripe-Signature header" };
  if (!isWebhookTimestampFresh(parts.t, 300)) {
    return { valid: false, reason: "Webhook timestamp outside 5-minute replay tolerance window" };
  }
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody}`, "utf8").digest("hex");
  const ok = timingSafeHexEqual(expected, parts.v1);
  return ok ? { valid: true } : { valid: false, reason: "Signature mismatch" };
}

export async function handleStripeWebhookForOrg(req: NextRequest, orgId: string) {
  try {
    const rawBody = await req.text();
    const orgSecret = getIntegrationSecretDecrypted(orgId, "stripe") || process.env.STRIPE_WEBHOOK_SECRET || "";
    const sigHeader = req.headers.get("stripe-signature");

    // STRICT: ALWAYS require valid HMAC-SHA256 + 5-min replay check! No ?simulate=true bypass.
    const check = verifyStripeSignature(rawBody, sigHeader, orgSecret);
    if (!check.valid) {
      recordWebhookDeliveryLog(orgId, "stripe", "auth_rejected", 401, check.reason || "Invalid Stripe-Signature");
      return NextResponse.json({ error: check.reason || "Invalid Stripe-Signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      type: string;
      data?: { object?: StripeInvoiceLike };
    };

    if (
      event.type !== "invoice.finalized" &&
      event.type !== "invoice.payment_succeeded" &&
      event.type !== "credit_note.created"
    ) {
      return NextResponse.json({ received: true, ignoredEventType: event.type });
    }

    const stripeObj = event.data?.object;
    if (!stripeObj) {
      return NextResponse.json({ error: "Missing Stripe event.data.object" }, { status: 400 });
    }
    if (event.type === "credit_note.created") {
      stripeObj.isCreditNote = true;
    }

    const settings = getSellerSettings(orgId);
    if (!settings) {
      return NextResponse.json({ error: "Unknown organization" }, { status: 404 });
    }

    const buyerVat = stripeObj.customer_tax_ids?.find((t) => t.type === "eu_vat")?.value;
    let buyerVatVerified: boolean | undefined;
    if (buyerVat) {
      const viesRes = await verifyEuVatId(buyerVat, { liveLookup: true });
      buyerVatVerified = viesRes.status === "VERIFIED" || viesRes.status === "PROVISIONAL";
    }

    const mapped = mapStripeInvoiceToCanonical(stripeObj, sellerSettingsToCanonicalParty(settings), {
      iban: settings.iban || "DE89370400440532013000",
      bic: settings.bic || "COBADEFFXXX",
      buyerVatVerified,
    });

    const record = saveInvoiceForOrg(orgId, mapped.invoice, {
      source: "stripe",
      sourceRef: stripeObj.id,
      actorEmail: "webhook:stripe",
    });

    recordWebhookDeliveryLog(orgId, "stripe", event.type, 200, `Processed ${record.invoiceNumber} (${record.status})`);

    return NextResponse.json({
      received: true,
      eventType: event.type,
      invoice: record,
      actionRequired: mapped.actionRequired,
      missingFields: mapped.missingFields,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe webhook processing error" },
      { status: 400 }
    );
  }
}

