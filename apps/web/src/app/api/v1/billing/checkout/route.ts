import { NextRequest, NextResponse } from "next/server";
import {
  appendOrgAuditEvent,
  cancelSubscriptionRenewalForOrg,
  getSubscriptionForOrg,
  updateSubscriptionForOrg,
} from "@/lib/db-store";
import { getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";

// Annual billing: customers pay for 10 months and get 12 (≈17% / "2 months free").
// Monthly prices are unchanged; annualUsd = priceUsd * 10.
const PLAN_CONFIG: Record<
  "free" | "trial" | "solo" | "business" | "agency",
  {
    name: string;
    priceUsd: number;
    priceEur: number;
    annualUsd: number;
    annualEur: number;
    quota: number;
    paddlePriceId: string;
    paddlePriceIdAnnual: string;
    description: string;
  }
> = {
  free: {
    name: "Free",
    priceUsd: 0,
    priceEur: 0,
    annualUsd: 0,
    annualEur: 0,
    quota: 5,
    paddlePriceId: "",
    paddlePriceIdAnnual: "",
    description: "Ongoing free tier with core validation and up to 5 finalized e-invoices per month.",
  },
  trial: {
    name: "15-Day Free Trial",
    priceUsd: 0,
    priceEur: 0,
    annualUsd: 0,
    annualEur: 0,
    quota: 15,
    paddlePriceId: "",
    paddlePriceIdAnnual: "",
    description: "15-day full-feature evaluation with no credit card required.",
  },
  solo: {
    name: "Solo",
    priceUsd: 39,
    priceEur: 39,
    annualUsd: 390,
    annualEur: 390,
    quota: 150,
    paddlePriceId: process.env.PADDLE_PRICE_SOLO || "pri_norminvoice_solo_39usd",
    paddlePriceIdAnnual: process.env.PADDLE_PRICE_SOLO_ANNUAL || "pri_norminvoice_solo_390usd_yr",
    description: "Main individual & small-business plan: 150 invoices/mo, validation, recurring, automations & exports.",
  },
  business: {
    name: "Business",
    priceUsd: 49,
    priceEur: 49,
    annualUsd: 490,
    annualEur: 490,
    quota: 500,
    paddlePriceId: process.env.PADDLE_PRICE_BUSINESS || "pri_norminvoice_business_49usd",
    paddlePriceIdAnnual: process.env.PADDLE_PRICE_BUSINESS_ANNUAL || "pri_norminvoice_business_490usd_yr",
    description: "Growing finance teams: 500 invoices/mo, Stripe & WooCommerce webhooks, approvals & GoBD archive.",
  },
  agency: {
    name: "Agency & API",
    priceUsd: 129,
    priceEur: 129,
    annualUsd: 1290,
    annualEur: 1290,
    quota: 2500,
    paddlePriceId: process.env.PADDLE_PRICE_AGENCY || "pri_norminvoice_agency_129usd",
    paddlePriceIdAnnual: process.env.PADDLE_PRICE_AGENCY_ANNUAL || "pri_norminvoice_agency_1290usd_yr",
    description: "Multi-client teams, accounting practices & high-throughput API workloads (2,500 invoices/mo).",
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
      currency: subscription.currency,
      trialActive: subscription.trialActive,
      trialDaysRemaining: subscription.trialDaysRemaining,
      trialStartedAt: subscription.trialStartedAt,
      trialEndsAt: subscription.trialEndsAt,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
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

  const body = (await req.json()) as { planTier?: string; action?: "upgrade" | "cancel"; billingCycle?: "monthly" | "annual" };
  const cycle: "monthly" | "annual" = body.billingCycle === "annual" ? "annual" : "monthly";

  if (body.action === "cancel") {
    const updated = cancelSubscriptionRenewalForOrg(access.ctx.orgId, access.ctx.actorEmail);
    return NextResponse.json({
      cancelled: true,
      activePlan: updated,
      message: "Auto-renewal cancelled. Your current plan access remains active through the end of the current period.",
    });
  }

  const tier = (body.planTier?.toLowerCase() ?? "solo") as keyof typeof PLAN_CONFIG;
  const cfg = PLAN_CONFIG[tier];
  if (!cfg) {
    return NextResponse.json({ error: "Unknown plan tier" }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && tier !== "free" && tier !== "trial") {
    return NextResponse.json({
      mode: "paddle_overlay",
      priceId: cycle === "annual" ? cfg.paddlePriceIdAnnual : cfg.paddlePriceId,
      billingCycle: cycle,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox",
      customData: { plan_tier: tier, billing_cycle: cycle, org_id: access.ctx.orgId },
    });
  }

  const updated = updateSubscriptionForOrg(access.ctx.orgId, tier, cfg.quota);
  appendOrgAuditEvent(access.ctx.orgId, null, "BILLING", "SUBSCRIPTION_PLAN_CHANGED", access.ctx.actorEmail, {
    planTier: tier,
    billingCycle: cycle,
    monthlyQuota: cfg.quota,
    priceUsd: cycle === "annual" ? cfg.annualUsd : cfg.priceUsd,
  });

  const priceLabel = cycle === "annual" ? `$${cfg.annualUsd}/year` : `$${cfg.priceUsd}/month`;
  return NextResponse.json({
    mode: "sandbox_activated",
    activePlan: updated,
    message: `Plan switched to ${cfg.name.toUpperCase()} (${priceLabel} · ${cfg.quota} invoices/mo).`,
  });
}

export async function DELETE(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const updated = cancelSubscriptionRenewalForOrg(access.ctx.orgId, access.ctx.actorEmail);
  return NextResponse.json({
    cancelled: true,
    activePlan: updated,
    message: "Subscription renewal cancelled and recorded in the workspace audit trail.",
  });
}
