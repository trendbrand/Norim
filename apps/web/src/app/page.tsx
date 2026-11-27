"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Code2,
  Compass,
  FileCheck2,
  FileText,
  Gift,
  Globe2,
  Inbox,
  Lock,
  Repeat,
  Send,
  ShieldCheck,
  Users,
  Webhook,
} from "lucide-react";
import { EU_COUNTRY_MODULES } from "@norminvoice/einvoice-core";
import { ValidatorStudio } from "@/components/ValidatorStudio";
import { PaddlePricingSection } from "@/components/PaddlePricingSection";
import { COUNTRY_SLUG_MAP } from "@/lib/website-content";
import { useLocale } from "@/components/LocaleProvider";
import { HOME_STRINGS } from "@/lib/i18n";

const CODE_TO_SLUG = Object.fromEntries(
  Object.values(COUNTRY_SLUG_MAP).map((c) => [c.code, c.slug])
);

// Visual chrome (icons / step numbers) stays here; text comes from HOME_STRINGS.
const LIFECYCLE_ICONS = [FileText, FileCheck2, Send, ShieldCheck, Users];
const LIFECYCLE_STEP_NO = ["01", "02", "03", "04", "05"];

const SOLUTION_META = [
  { href: "/solutions/small-business", icon: Building2 },
  { href: "/solutions/finance-teams", icon: Inbox },
  { href: "/solutions/accountants", icon: Briefcase },
  { href: "/partners", icon: Code2 },
];

export default function HomePage() {
  const { locale } = useLocale();
  const h = HOME_STRINGS[locale];

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NormInvoice — Product of Trend&Brand",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "European e-invoicing & compliance platform: EN 16931 / ZUGFeRD 2.3 / Factur-X 1.07 / XRechnung 3.0.2 / Peppol BIS 3.0 validator and workspace, GoBD hash-chained archive, and DATEV/FEC exports.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0",
      highPrice: "129",
      offerCount: "5",
    },
    featureList: [
      "EN 16931 validation",
      "ZUGFeRD 2.3",
      "Factur-X 1.07",
      "XRechnung 3.0.2",
      "Peppol BIS 3.0",
      "Incoming supplier inbox",
      "Recurring invoices",
      "GoBD audit archive",
      "DATEV & FEC exports",
    ],
  };
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NormInvoice",
    legalName: "NormInvoice — Product of Trend&Brand",
    url: siteUrl,
    description: "European EN 16931 e-invoicing software (ZUGFeRD, Factur-X, XRechnung, Peppol BIS).",
    areaServed: "EU",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* 1. Deep Navy & Orange Enterprise Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        {/* Subtle brand orange geometric curves */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-navy-800/80 px-4 py-1.5 text-xs font-bold text-accent-300">
              <Gift className="h-3.5 w-3.5 text-accent-500" />
              {h.heroBadge}
            </span>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
              {h.heroTitleA}{" "}
              <span className="text-accent-500">{h.heroTitleB}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-100 sm:text-lg">
              {h.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-600 active:scale-[0.98]"
              >
                {h.ctaSignup} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?mode=register&plan=trial"
                className="inline-flex items-center gap-2 rounded-xl border border-accent-400/50 bg-navy-800 px-5 py-3.5 text-sm font-bold text-white transition hover:border-accent-400 hover:bg-navy-700"
              >
                {h.ctaTrial}
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-600 bg-navy-950/50 px-5 py-3.5 text-sm font-semibold text-navy-100 transition hover:border-navy-400 hover:text-white"
              >
                <Compass className="h-4 w-4 text-accent-400" />
                {h.ctaExplore}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-200">
              {h.trust.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Preserved Real Working Zero-Retention Validator Studio */}
      <section id="validator" className="border-b border-slate-200 bg-canvas py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">{h.valEyebrow}</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">{h.valTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{h.valSubtitle}</p>
            </div>
            <Link
              href="/tools/zugferd-vs-xrechnung"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-accent-600"
            >
              {h.valFormatLink}
            </Link>
          </div>
          <ValidatorStudio />
        </div>
      </section>

      {/* 3. End-to-End Invoice Lifecycle */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600">{h.lifeEyebrow}</span>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{h.lifeTitle}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">{h.lifeSubtitle}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {h.lifeSteps.map((item, i) => {
              const Icon = LIFECYCLE_ICONS[i] ?? FileText;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-canvas p-5 transition-all hover:border-accent-300 hover:bg-white hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-extrabold text-slate-400">{LIFECYCLE_STEP_NO[i]}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-navy-900">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Honest 13-Country Compliance Preview */}
      <section className="border-b border-slate-200 bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">{h.cEyebrow}</span>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{h.cTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{h.cSubtitle}</p>
            </div>
            <Link
              href="/countries"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800"
            >
              <Globe2 className="h-4 w-4 text-accent-500" /> {h.cViewAll}
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EU_COUNTRY_MODULES.slice(0, 8).map((m) => {
              const slug = CODE_TO_SLUG[m.code] || "germany";
              const badge =
                m.status === "LIVE_CORE"
                  ? { label: h.badgeAvailable, cls: "bg-emerald-100 text-emerald-800" }
                  : m.status === "PARTNER_ADAPTER"
                    ? { label: h.badgePartner, cls: "bg-amber-100 text-amber-800" }
                    : { label: h.badgePlanned, cls: "bg-slate-200 text-slate-700" };
              return (
                <Link
                  key={m.code}
                  href={`/countries/${slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-accent-400 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-navy-900 group-hover:text-accent-600">
                      {m.code} · {m.name}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-navy-700">{m.supportedFormats.slice(0, 2).join(" · ")}</p>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{m.mandateTimeline}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Solutions by Team + Integrations */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">{h.solEyebrow}</span>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900">{h.solTitle}</h2>
              <div className="mt-6 space-y-3.5">
                {h.solCards.map((s, i) => {
                  const meta = SOLUTION_META[i] ?? SOLUTION_META[0];
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={meta.href}
                      href={meta.href}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-canvas p-4 transition-all hover:border-accent-400 hover:bg-white hover:shadow-card"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-navy-900">{s.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.text}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-navy-800 bg-navy-900 p-7 text-white">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
                  <Lock className="h-3.5 w-3.5" /> {h.secBadge}
                </span>
                <h2 className="mt-4 text-2xl font-extrabold">{h.secTitle}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-navy-200">{h.secSubtitle}</p>

                <ul className="mt-6 space-y-3 text-xs text-navy-100">
                  {h.secBullets.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
                >
                  {h.secBtnSecurity} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy-600 bg-navy-800 px-4 py-2.5 text-xs font-bold text-white hover:border-navy-400"
                >
                  <Webhook className="h-3.5 w-3.5 text-accent-400" /> {h.secBtnIntegrations}
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy-600 px-4 py-2.5 text-xs font-semibold text-navy-200 hover:text-white"
                >
                  <Repeat className="h-3.5 w-3.5" /> {h.secBtnDocs}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Transparent Pricing Section ($0 Free, 15-Day Trial, $39 Solo, Business, Agency, Enterprise) */}
      <PaddlePricingSection />

      {/* 7. Quick FAQ + Final CTA */}
      <section className="border-t border-slate-200 bg-canvas py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-extrabold text-navy-900">{h.faqTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{h.faqSubtitle}</p>
            </div>
            <Link href="/faq" className="text-xs font-bold text-accent-700 hover:underline">
              {h.faqReadAll}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {h.faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <h3 className="text-sm font-extrabold text-navy-900">{item.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
