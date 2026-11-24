"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, Crown, Gift, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: string) => void };
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: { items: Array<{ priceId: string; quantity: number }>; customData?: Record<string, string> }) => void;
      };
    };
  }
}

export const PRICING_PLANS = [
  {
    tier: "free",
    name: "Free",
    price: "€0",
    period: "/ forever",
    annualPrice: "€0",
    annualMonthly: "",
    annualSave: "",
    badge: "Always Free",
    desc: "Ideal for testing EN 16931 validation, inspecting supplier invoices, and occasional invoicing.",
    features: [
      "Unlimited zero-retention dual validator & viewer",
      "Up to 5 finalized e-invoices / month",
      "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML",
      "Plain-language EN, DE & FR rule explanations",
      "Instant EPC SEPA GiroCode QR preview",
    ],
    cta: "Sign Up Free",
    highlighted: false,
  },
  {
    tier: "starter",
    name: "Starter",
    price: "€12",
    period: "/ month",
    annualPrice: "€120",
    annualMonthly: "≈ €10/mo, billed yearly",
    annualSave: "Save €24",
    badge: "For Freelancers",
    desc: "For freelancers and Kleinunternehmer sending a handful of compliant invoices each month.",
    features: [
      "15-day free trial — no credit card required",
      "Up to 40 finalized e-invoices / month",
      "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML",
      "Incoming supplier inbox & SEPA pay links",
      "VIES VAT verification & GoBD audit chain",
    ],
    cta: "Start 15-Day Free Trial",
    highlighted: false,
  },
  {
    tier: "solo",
    name: "Solo",
    price: "€29",
    period: "/ month",
    annualPrice: "€290",
    annualMonthly: "≈ €24.17/mo, billed yearly",
    annualSave: "Save €58",
    badge: "Most Popular",
    desc: "Main plan for solo founders, consultants, and growing businesses automating European e-invoicing.",
    features: [
      "15-day free trial — no credit card required",
      "Up to 150 finalized e-invoices / month",
      "Recurring schedules, incoming inbox & automations",
      "VIES VAT verification, reports & DATEV / FEC exports",
      "Tamper-evident GoBD SHA-256 audit hash-chain",
    ],
    cta: "Start 15-Day Free Trial",
    highlighted: true,
  },
  {
    tier: "business",
    name: "Business",
    price: "€49",
    period: "/ month",
    annualPrice: "€490",
    annualMonthly: "≈ €40.83/mo, billed yearly",
    annualSave: "Save €98",
    badge: "Teams & Bridges",
    desc: "Complete Stripe & WooCommerce automation with multi-user approvals and EU archival.",
    features: [
      "Up to 500 finalized e-invoices / month",
      "Stripe & WooCommerce signed webhook bridges",
      "Action-Required queue + 1-click Leitweg-ID repair",
      "Multi-member RBAC & delegated accountant portal",
      "8-yr (DE BEG IV) / 10-yr (FR) archive exports",
    ],
    cta: "Choose Business",
    highlighted: false,
  },
  {
    tier: "agency",
    name: "Agency & API",
    price: "€129",
    period: "/ month",
    annualPrice: "€1,290",
    annualMonthly: "≈ €107.50/mo, billed yearly",
    annualSave: "Save €258",
    badge: "High Volume",
    desc: "Built for accounting firms, high-volume merchants, and ERP / SaaS developer teams.",
    features: [
      "Up to 2,500 finalized e-invoices / month",
      "Tenant-scoped Bearer API keys & TypeScript SDK",
      "Batch CSV to PDF/A-3 + XML ZIP converter",
      "Multi-client accountant review dashboard",
      "GDPR Art. 28 DPA & priority email support",
    ],
    cta: "Choose Agency",
    highlighted: false,
  },
] as const;

export function PaddlePricingSection() {
  const router = useRouter();
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");

  async function launchCheckout(tier: string) {
    setBusyTier(tier);
    setBanner(null);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, billingCycle: cycle }),
      });

      if (res.status === 401) {
        router.push(`/login?mode=register&plan=${encodeURIComponent(tier)}&cycle=${cycle}`);
        return;
      }

      const data = await res.json();

      if (data.mode === "paddle_overlay" && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
        if (!window.Paddle) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Paddle.js"));
            document.head.appendChild(s);
          });
        }
        if (window.Paddle) {
          if (data.environment === "sandbox") window.Paddle.Environment?.set("sandbox");
          window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
          window.Paddle.Checkout.open({
            items: [{ priceId: data.priceId, quantity: 1 }],
            customData: data.customData,
          });
        }
      } else {
        setBanner(data.message || `Activated ${tier.toUpperCase()} plan.`);
      }
    } finally {
      setBusyTier(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1 text-xs font-bold text-accent-700">
            <Gift className="h-3.5 w-3.5" /> Free plan available · 15-day free trial · No credit card required
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900">
            Transparent Plans for Every Stage of E-Invoicing
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
            Start free or evaluate full automation with a real 15-day free trial. Pay monthly, or save ~17% with annual
            billing (2 months free) — cancel renewal anytime.
          </p>
        </div>

        {/* Monthly / Annual billing toggle */}
        <div className="mt-7 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-lg px-4 py-1.5 transition ${cycle === "monthly" ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-800"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 transition ${cycle === "annual" ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-800"}`}
            >
              Annual
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">2 months free</span>
            </button>
          </div>
        </div>

        {banner && (
          <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{banner}</span>
            <Link href="/dashboard" className="font-bold underline">
              Open Dashboard →
            </Link>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                plan.highlighted
                  ? "border-accent-500 bg-gradient-to-b from-accent-50/50 to-white ring-2 ring-accent-500/20 shadow-card-hover"
                  : "border-slate-200 bg-white shadow-card hover:border-navy-200 hover:shadow-card-hover"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-navy-900">{plan.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                      plan.highlighted
                        ? "bg-accent-500 text-white"
                        : "bg-navy-50 text-navy-800"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="tabular-money text-3xl font-extrabold tracking-tight text-navy-900">
                    {cycle === "annual" ? plan.annualPrice : plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {plan.tier === "free" ? plan.period : cycle === "annual" ? "/ year" : plan.period}
                  </span>
                  {cycle === "annual" && plan.annualSave && (
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {plan.annualSave}
                    </span>
                  )}
                </p>
                {cycle === "annual" && plan.annualMonthly && (
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">{plan.annualMonthly}</p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{plan.desc}</p>
                <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-slate-700">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.tier === "free" ? (
                <Link
                  href="/login?mode=register"
                  className="mt-6 block rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-navy-900 transition hover:bg-navy-50"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={busyTier === plan.tier}
                  onClick={() => void launchCheckout(plan.tier)}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    plan.highlighted
                      ? "bg-accent-500 text-white shadow-sm hover:bg-accent-600"
                      : "bg-navy-900 text-white hover:bg-navy-800"
                  }`}
                >
                  {plan.highlighted && <Crown className="h-3.5 w-3.5" />}
                  {busyTier === plan.tier ? "Processing…" : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Enterprise Strip + Pre-Checkout Transparency */}
        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">Enterprise &amp; Custom Volume</p>
            <h3 className="mt-1 text-lg font-extrabold">Need dedicated onboarding, custom SLA, or ERP integration?</h3>
            <p className="mt-1 text-xs text-navy-200">
              Custom document volumes, multi-entity architecture, DPA execution, and tailored compliance routing.
            </p>
          </div>
          <Link
            href="/contact?topic=sales"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-accent-600"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            15-day trials never silently charge without authorization
          </span>
          <span>·</span>
          <Link href="/subscription-billing" className="underline hover:text-navy-900">
            Subscription &amp; Billing Policy
          </Link>
          <span>·</span>
          <Link href="/cancellation-refunds" className="underline hover:text-navy-900">
            Cancellation &amp; Refund Policy
          </Link>
        </p>
      </div>
    </section>
  );
}
