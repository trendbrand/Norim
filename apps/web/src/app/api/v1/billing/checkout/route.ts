import { NextRequest, NextResponse } from "next/server";
import {
  appendOrgAuditEvent,
  getSubscriptionForOrg,
  updateSubscriptionForOrg,
} from "@/lib/db-store";
import { getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";

const PLAN_CONFIG: Record<"free" | "solo" | "business" | "agency", { priceEur: number; quota: number; paddlePriceId: string }> = {
  free: {
    priceEur: 0,
    quota: 3,
    paddlePriceId: "",
  },
  solo: {
    priceEur: 19,
    quota: 100,
    paddlePriceId: process.env.PADDLE_PRICE_SOLO || "pri_norminvoice_solo_19eur",
  },
  business: {
    priceEur: 49,
    quota: 500,
    paddlePriceId: process.env.PADDLE_PRICE_BUSINESS || "pri_norminvoice_business_49eur",
  },
  agency: {
    priceEur: 129,
    quota: 2500,
    paddlePriceId: process.env.PADDLE_PRICE_AGENCY || "pri_norminvoice_agency_129eur",
  },
};

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const subscription = getSubscriptionForOrg(access.ctx.orgId);
  const quota = getOrgMonthlyQuotaStatus(access.ctx.orgId);

  return NextResponse.json({
    activePlan: {
      tier: subscription.planTier,
      monthlyQuota: subscription.monthlyQuota,
      status: subscription.status,
      usedThisMonth: quota.usedThisMonth,
      remaining: quota.remaining,
    },
    paddleEnv: process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox",
    paddleConfigured: Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN),
    plans: PLAN_CONFIG,
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const body = (await req.json()) as { planTier?: string };
  const tier = (body.planTier?.toLowerCase() ?? "business") as keyof typeof PLAN_CONFIG;
  const cfg = PLAN_CONFIG[tier];
  if (!cfg) {
    return NextResponse.json({ error: "Unknown plan tier" }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && tier !== "free") {
    return NextResponse.json({
      mode: "paddle_overlay",
      priceId: cfg.paddlePriceId,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox",
      customData: { plan_tier: tier, org_id: access.ctx.orgId },
    });
  }

  const updated = updateSubscriptionForOrg(access.ctx.orgId, tier, cfg.quota);
  appendOrgAuditEvent(access.ctx.orgId, null, "BILLING", "SUBSCRIPTION_PLAN_CHANGED", access.ctx.actorEmail, {
    planTier: tier,
    monthlyQuota: cfg.quota,
  });

  return NextResponse.json({
    mode: "sandbox_activated",
    activePlan: {
      tier: updated.planTier,
      monthlyQuota: updated.monthlyQuota,
      status: updated.status,
    },
    message: `Plan switched to ${tier.toUpperCase()} (€${cfg.priceEur}/mo · ${cfg.quota} invoices/mo). Configure NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to enable live Paddle MoR Checkout.`,
  });
}
