"use client";

import Link from "next/link";
import { ArrowRight, Compass, Database, FileSpreadsheet, Globe2, ShieldCheck, Webhook, Zap } from "lucide-react";
import { ValidatorStudio } from "@/components/ValidatorStudio";
import { PaddlePricingSection } from "@/components/PaddlePricingSection";
import { useLocale } from "@/components/LocaleProvider";

const FEATURE_ICONS = [Webhook, ShieldCheck, Zap, Database, FileSpreadsheet, Globe2];

export default function HomePage() {
  const { t } = useLocale();

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NormInvoice — EU E-Invoice Bridge & Dual Validator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Zero-retention ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2 validator and automated Stripe & WooCommerce EU e-invoicing bridge.",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />

      {/* Hero + Embedded Free Validator Studio */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white via-white to-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
              <Globe2 className="h-3.5 w-3.5" />
              {t.heroTag}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12]">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {t.ctaCreate} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {t.ctaDashboard}
              </Link>
              <Link
                href="/tools/zugferd-vs-xrechnung"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Compass className="h-4 w-4 text-brand-600" />
                {t.ctaQuiz}
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <ValidatorStudio />
          </div>
        </div>
      </section>

      {/* Active EU Mandate Strip */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.mandateHeading}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.mandates.map((m) => (
              <div key={m.country} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{m.country}</p>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                    {m.status}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">{m.deadline}</p>
                <p className="mt-1.5 font-mono text-[11px] font-medium text-slate-500">{m.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Production Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {t.featuresHeading}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{t.featuresSubtitle}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.features.map((f, idx) => {
              const Icon = FEATURE_ICONS[idx] ?? ShieldCheck;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Paddle Merchant of Record Pricing */}
      <PaddlePricingSection />
    </div>
  );
}
