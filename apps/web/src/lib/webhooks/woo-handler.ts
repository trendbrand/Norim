import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { WooCommerceOrderPayload, mapWooOrderToCanonical, verifyEuVatId } from "@norminvoice/einvoice-core";
import {
  getIntegrationSecretDecrypted,
  getSellerSettings,
  recordWebhookDeliveryLog,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
} from "@/lib/db-store";

function verifyWooSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim(), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function handleWooWebhookForOrg(req: NextRequest, orgId: string) {
  try {
    const rawBody = await req.text();
    const topic = req.headers.get("x-wc-webhook-topic") || "";
    if (topic === "ping" || rawBody.startsWith("webhook_id=")) {
      return NextResponse.json({ received: true, pong: true, service: "norminvoice-woo-bridge", orgId });
    }

    const secret = getIntegrationSecretDecrypted(orgId, "woocommerce");
    const ok = verifyWooSignature(rawBody, req.headers.get("x-wc-webhook-signature"), secret);
    if (!ok) {
      recordWebhookDeliveryLog(orgId, "woocommerce", "auth_rejected", 401, "Invalid or missing X-WC-Webhook-Signature");
      return NextResponse.json({ error: "Invalid or missing X-WC-Webhook-Signature" }, { status: 401 });
    }

    const settings = getSellerSettings(orgId);
    if (!settings) {
      return NextResponse.json({ error: "Unknown organization" }, { status: 404 });
    }

    const order = JSON.parse(rawBody) as WooCommerceOrderPayload;
    const vatMeta = order.meta_data?.find((m) =>
      ["_billing_eu_vat_id", "_billing_vat_number", "vat_number"].includes(m.key)
    )?.value;

    let buyerVatVerified: boolean | undefined;
    if (vatMeta) {
      const viesRes = await verifyEuVatId(vatMeta, { liveLookup: true });
      buyerVatVerified = viesRes.status === "VERIFIED" || viesRes.status === "PROVISIONAL";
    }

    const mapped = mapWooOrderToCanonical(order, sellerSettingsToCanonicalParty(settings), {
      iban: settings.iban,
      bic: settings.bic,
      buyerVatVerified,
    });

    const record = saveInvoiceForOrg(orgId, mapped.invoice, {
      source: "woocommerce",
      sourceRef: `WC-${order.number || order.id}`,
      actorEmail: "webhook:woocommerce",
    });

    recordWebhookDeliveryLog(orgId, "woocommerce", topic || "order.completed", 200, `Processed ${record.invoiceNumber} (${record.status})`);

    return NextResponse.json({
      received: true,
      invoice: record,
      actionRequired: mapped.actionRequired,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "WooCommerce webhook failed" },
      { status: 400 }
    );
  }
}

