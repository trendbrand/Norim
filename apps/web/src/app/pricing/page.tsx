import Link from "next/link";
import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { PaddlePricingSection } from "@/components/PaddlePricingSection";
import { PRICING_PAGE_STRINGS } from "@/lib/i18n";
import { resolveLocale } from "@/lib/website-content";

export const metadata = {
  title: "Pricing | NormInvoice — Free Plan, 15-Day Trial & Starter from €12/mo",
  description:
    "Clear SaaS pricing for NormInvoice: €0 Free plan, real 15-day Free Trial with no credit card required, Starter €12/month, Solo, Business, Agency, and Enterprise. All prices excl. VAT, B2B only.",
};

export default async function PricingPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = PRICING_PAGE_STRINGS[locale];
  return (
    <div className="bg-canvas">
      <section className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-navy-800 px-3.5 py-1 text-xs font-bold text-accent-400">
            {t.badge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-100 sm:text-base">{t.desc}</p>
        </div>
      </section>

      <PaddlePricingSection />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <ShieldCheck className="h-5 w-5 text-accent-500" /> {t.checkoutTitle}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {t.checkoutIntroPre}
            <Link href="/subscription-billing" className="font-bold text-navy-900 underline">
              {t.billingPolicyLabel}
            </Link>
            {t.checkoutIntroPost}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            {t.items.map((item) => (
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
