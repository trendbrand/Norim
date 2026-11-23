import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ShopifyOrderPayload, mapShopifyOrderToCanonical, verifyEuVatId } from "@norminvoice/einvoice-core";
import {
  getIntegrationSecretDecrypted,
  getSellerSettings,
  recordWebhookDeliveryLog,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
} from "@/lib/db-store";

// Shopify signs the RAW request body with the app's webhook secret and sends
// the base64 HMAC-SHA256 digest in X-Shopify-Hmac-Sha256.
function verifyShopifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim(), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function noteAttr(order: ShopifyOrderPayload, keys: string[]): string | undefined {
  const lower = keys.map((k) => k.toLowerCase());
  return order.note_attributes?.find((a) => lower.includes((a.name || "").toLowerCase()))?.value?.trim() || undefined;
}

export async function handleShopifyWebhookForOrg(req: NextRequest, orgId: string) {
  try {
    const rawBody = await req.text();
    const topic = req.headers.get("x-shopify-topic") || "";

    const secret = getIntegrationSecretDecrypted(orgId, "shopify");
    const ok = verifyShopifySignature(rawBody, req.headers.get("x-shopify-hmac-sha256"), secret);
    if (!ok) {
      recordWebhookDeliveryLog(orgId, "shopify", "auth_rejected", 401, "Invalid or missing X-Shopify-Hmac-Sha256");
      return NextResponse.json({ error: "Invalid or missing X-Shopify-Hmac-Sha256" }, { status: 401 });
    }

    const settings = getSellerSettings(orgId);
    if (!settings) {
      return NextResponse.json({ error: "Unknown organization" }, { status: 404 });
    }

    const order = JSON.parse(rawBody) as ShopifyOrderPayload;

    const vatMeta = noteAttr(order, ["eu_vat_id", "vat_number", "vat", "tax_id"]);
    let buyerVatVerified: boolean | undefined;
    if (vatMeta) {
      const viesRes = await verifyEuVatId(vatMeta, { liveLookup: true });
      buyerVatVerified = viesRes.status === "VERIFIED" || viesRes.status === "PROVISIONAL";
    }

    const mapped = mapShopifyOrderToCanonical(order, sellerSettingsToCanonicalParty(settings), {
      iban: settings.iban,
      bic: settings.bic,
      buyerVatVerified,
    });

    const orderNum = order.order_number ?? (order.name ? order.name.replace(/^#/, "") : order.id);
    const record = saveInvoiceForOrg(orgId, mapped.invoice, {
      source: "shopify",
      sourceRef: `SH-${orderNum}`,
      actorEmail: "webhook:shopify",
    });

    recordWebhookDeliveryLog(orgId, "shopify", topic || "orders/paid", 200, `Processed ${record.invoiceNumber} (${record.status})`);

    return NextResponse.json({
      received: true,
      invoice: record,
      actionRequired: mapped.actionRequired,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Shopify webhook failed" },
      { status: 400 }
    );
  }
}
