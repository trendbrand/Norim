import { NextRequest, NextResponse } from "next/server";
import {
  ShopifyOrderPayload,
  StripeInvoiceLike,
  WooCommerceOrderPayload,
  mapShopifyOrderToCanonical,
  mapStripeInvoiceToCanonical,
  mapWooOrderToCanonical,
} from "@norminvoice/einvoice-core";
import { requireTenantAuth } from "@/lib/security";
import { enforceOrgMonthlyQuota } from "@/lib/quota";
import {
  appendOrgAuditEvent,
  getSellerSettings,
  listIntegrationsForOrg,
  listWebhookLogsForOrg,
  recordWebhookDeliveryLog,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
  upsertIntegrationForOrg,
} from "@/lib/db-store";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const origin = req.nextUrl.origin;
  return NextResponse.json({
    orgId: access.ctx.orgId,
    webhookUrls: {
      stripe: `${origin}/api/webhooks/stripe/${access.ctx.orgId}`,
      woocommerce: `${origin}/api/webhooks/woocommerce/${access.ctx.orgId}`,
      shopify: `${origin}/api/webhooks/shopify/${access.ctx.orgId}`,
    },
    integrations: listIntegrationsForOrg(access.ctx.orgId),
    webhookLogs: listWebhookLogsForOrg(access.ctx.orgId),
  });
}

export async function PUT(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      provider: "stripe" | "woocommerce" | "shopify" | "smtp" | "outbound_webhook";
      enabled?: boolean;
      newSecret?: string;
      rotateSecret?: boolean;
      config?: Record<string, unknown>;
    };

    if (!["stripe", "woocommerce", "shopify", "smtp", "outbound_webhook"].includes(body.provider)) {
      return NextResponse.json({ error: "Invalid integration provider" }, { status: 400 });
    }

    const res = upsertIntegrationForOrg(access.ctx.orgId, body.provider, {
      enabled: body.enabled,
      newSecret: body.newSecret,
      rotateSecret: body.rotateSecret,
      config: body.config,
    });

    appendOrgAuditEvent(access.ctx.orgId, null, body.provider.toUpperCase(), "INTEGRATION_UPDATED", access.ctx.actorEmail, {
      provider: body.provider,
      enabled: res.record.enabled,
      rotatedSecret: Boolean(res.rotatedPlaintext),
    });

    return NextResponse.json({
      saved: true,
      integration: res.record,
      rotatedPlaintext: res.rotatedPlaintext ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save integration" },
      { status: 400 }
    );
  }
}

/**
 * Authenticated In-App Integration Test Simulator (strictly scoped to caller's orgId!)
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const quota = enforceOrgMonthlyQuota(access.ctx.orgId, 1);
  if (!quota.allowed) return quota.response;

  try {
    const body = (await req.json()) as { provider: "stripe" | "woocommerce" | "shopify" };
    const settings = getSellerSettings(access.ctx.orgId);
    if (!settings) {
      return NextResponse.json({ error: "Complete seller settings first." }, { status: 400 });
    }
    const seller = sellerSettingsToCanonicalParty(settings);

    if (body.provider === "stripe") {
      const stamp = Date.now().toString().slice(-4);
      const mockStripe: StripeInvoiceLike = {
        id: `in_test_${stamp}`,
        number: `STR-2026-${stamp}`,
        created: Math.floor(Date.now() / 1000),
        due_date: Math.floor(Date.now() / 1000) + 14 * 86400,
        currency: "eur",
        customer_name: "Atelier Lumière SAS",
        customer_email: "finance@atelier-lumiere.fr",
        customer_address: {
          line1: "14 Rue de Rivoli",
          postal_code: "75004",
          city: "Paris",
          country: "FR",
        },
        customer_tax_ids: [{ type: "eu_vat", value: "FR40303265045" }],
        lines: {
          data: [
            {
              id: `il_test_${stamp}`,
              description: "NormInvoice Business API Subscription (Monthly)",
              quantity: 1,
              amount: 29900,
              tax_amounts: [],
            },
          ],
        },
      };
      const mapped = mapStripeInvoiceToCanonical(mockStripe, seller, {
        iban: settings.iban || "DE89370400440532013000",
        bic: settings.bic || "COBADEFFXXX",
        buyerVatVerified: true,
      });
      const stored = saveInvoiceForOrg(access.ctx.orgId, mapped.invoice, {
        source: "stripe",
        sourceRef: mockStripe.id,
        actorEmail: access.ctx.actorEmail,
      });
      recordWebhookDeliveryLog(access.ctx.orgId, "stripe", "invoice.finalized (test)", 200, `Created ${stored.invoiceNumber} (${stored.status})`);
      return NextResponse.json({ simulated: true, provider: "stripe", invoice: stored });
    }

    if (body.provider === "woocommerce") {
      const orderNum = String(4500 + (Date.now() % 400));
      const mockOrder: WooCommerceOrderPayload = {
        id: Number(orderNum),
        number: orderNum,
        date_created: new Date().toISOString(),
        currency: "EUR",
        total: "238.00",
        total_tax: "38.00",
        billing: {
          first_name: "Stefan",
          last_name: "Berger",
          company: "Berger Industrietechnik GmbH",
          address_1: "Industriestraße 88",
          postcode: "70565",
          city: "Stuttgart",
          country: "DE",
          email: "buchhaltung@berger-industrie.de",
        },
        meta_data: [{ key: "_billing_eu_vat_id", value: "DE147852369" }],
        line_items: [
          { id: 1, name: "Industrial Telemetry Sensor Kit", quantity: 2, subtotal: "200.00", total: "200.00", total_tax: "38.00" },
        ],
      };
      const mapped = mapWooOrderToCanonical(mockOrder, seller, {
        iban: settings.iban || "DE89370400440532013000",
        bic: settings.bic || "COBADEFFXXX",
        buyerVatVerified: true,
      });
      const stored = saveInvoiceForOrg(access.ctx.orgId, mapped.invoice, {
        source: "woocommerce",
        sourceRef: `WC-${orderNum}`,
        actorEmail: access.ctx.actorEmail,
      });
      recordWebhookDeliveryLog(access.ctx.orgId, "woocommerce", "order.completed (test)", 200, `Created ${stored.invoiceNumber} (${stored.status})`);
      return NextResponse.json({ simulated: true, provider: "woocommerce", invoice: stored });
    }

    if (body.provider === "shopify") {
      const orderNum = 1000 + (Date.now() % 500);
      const mockOrder: ShopifyOrderPayload = {
        id: orderNum,
        order_number: orderNum,
        name: `#${orderNum}`,
        created_at: new Date().toISOString(),
        currency: "EUR",
        total_price: "238.00",
        total_tax: "38.00",
        taxes_included: false,
        financial_status: "paid",
        gateway: "shopify_payments",
        email: "accounts@novatext-studio.de",
        note_attributes: [{ name: "eu_vat_id", value: "DE147852369" }],
        billing_address: {
          first_name: "Katrin",
          last_name: "Hoffmann",
          company: "NovaText Studio GmbH",
          address1: "Medienpark 12",
          city: "Köln",
          zip: "50670",
          country_code: "DE",
        },
        line_items: [
          { id: 1, title: "Premium Content Licensing Pack", quantity: 2, price: "100.00", tax_lines: [{ price: "38.00", rate: 0.19 }] },
        ],
      };
      const mapped = mapShopifyOrderToCanonical(mockOrder, seller, {
        iban: settings.iban || "DE89370400440532013000",
        bic: settings.bic || "COBADEFFXXX",
        buyerVatVerified: true,
      });
      const stored = saveInvoiceForOrg(access.ctx.orgId, mapped.invoice, {
        source: "shopify",
        sourceRef: `SH-${orderNum}`,
        actorEmail: access.ctx.actorEmail,
      });
      recordWebhookDeliveryLog(access.ctx.orgId, "shopify", "orders/paid (test)", 200, `Created ${stored.invoiceNumber} (${stored.status})`);
      return NextResponse.json({ simulated: true, provider: "shopify", invoice: stored });
    }

    return NextResponse.json({ error: "Unsupported provider for test simulation" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Test simulation failed" },
      { status: 400 }
    );
  }
}
