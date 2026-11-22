import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PaddlePricingSection } from "@/components/PaddlePricingSection";

export const metadata = {
  title: "Pricing | NormInvoice — Free Plan, 15-Day Trial & $39/mo Solo",
  description:
    "Clear SaaS pricing for NormInvoice: $0 Free plan, real 15-day Free Trial with no credit card required, $39/month Solo plan, Business, Agency, and Enterprise.",
};

export default function PricingPage() {
  return (
    <div className="bg-canvas">
      <section className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-navy-800 px-3.5 py-1 text-xs font-bold text-accent-400">
            Simple, Predictable Subscriptions
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Plans for Every Stage of Your E-Invoicing Journey
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-100 sm:text-base">
            Start with our ongoing Free plan or test full workspace workflows with a 15-day free trial. No credit card
            is required to begin, and renewals can be cancelled anytime in Settings.
          </p>
        </div>
      </section>

      <PaddlePricingSection />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <ShieldCheck className="h-5 w-5 text-accent-500" /> What Checkout Shows Before You Pay
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            In line with our{" "}
            <Link href="/subscription-billing" className="font-bold text-navy-900 underline">
              Subscription &amp; Billing Policy
            </Link>
            , every paid upgrade transparently displays:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Contracting entity / Merchant of Record",
              "Exact currency & billing interval",
              "Applicable VAT or reverse-charge treatment",
              "Included monthly document quota",
              "Trial expiry & non-silent-billing behavior",
              "Online cancellation & refund policy links",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-canvas px-3.5 py-2.5 font-semibold text-navy-900">
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
