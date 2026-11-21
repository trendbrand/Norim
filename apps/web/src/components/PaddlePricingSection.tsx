"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { useLocale } from "./LocaleProvider";

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

export function PaddlePricingSection() {
  const { t } = useLocale();
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  async function launchCheckout(tier: string) {
    setBusyTier(tier);
    setBanner(null);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier }),
      });
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
        setBanner(data.message || `Activated ${tier.toUpperCase()} sandbox plan!`);
      }
    } finally {
      setBusyTier(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.pricingHeading}</h2>
          <p className="mt-2.5 text-base leading-relaxed text-slate-600">{t.pricingSubtitle}</p>
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

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.plans.map((plan) => (
            <div
              key={plan.tier}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition ${
                plan.highlighted
                  ? "border-brand-600 bg-brand-50/30 ring-2 ring-brand-600/20 shadow-md"
                  : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3.5 flex items-baseline gap-1">
                  <span className="tabular-money text-3xl font-extrabold tracking-tight text-slate-900">{plan.price}</span>
                  <span className="text-xs font-medium text-slate-500">{plan.period}</span>
                </p>
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
                  href="/create"
                  className="mt-6 block rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={busyTier === plan.tier}
                  onClick={() => void launchCheckout(plan.tier)}
                  className={`mt-6 block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {busyTier === plan.tier ? "Opening Checkout..." : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
