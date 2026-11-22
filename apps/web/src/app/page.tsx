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

const CODE_TO_SLUG = Object.fromEntries(
  Object.values(COUNTRY_SLUG_MAP).map((c) => [c.code, c.slug])
);

const LIFECYCLE_STEPS = [
  {
    step: "01",
    title: "Create",
    text: "Build structured invoices with saved customers, product rates, tax rules, credit notes, and recurring schedules.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Validate",
    text: "Run deterministic EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung checks with plain-language diagnostics before sending.",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Exchange",
    text: "Deliver hybrid PDF/A-3b + XML documents through email, webhook bridges, or configured network partners.",
    icon: Send,
  },
  {
    step: "04",
    title: "Track & Archive",
    text: "Keep validation, delivery, payment, and GoBD SHA-256 hash-chained archival statuses strictly distinct and auditable.",
    icon: ShieldCheck,
  },
  {
    step: "05",
    title: "Collaborate",
    text: "Review incoming supplier bills, approve exceptions, and export clean DATEV EXTF or French FEC ledgers for your accountant.",
    icon: Users,
  },
];

const HOME_FAQS = [
  {
    q: "Is NormInvoice free to try?",
    a: "Yes. You can use our zero-retention public validator without an account, sign up on the ongoing Free plan ($0/month), or evaluate the full platform with a real 15-day free trial — no credit card required.",
  },
  {
    q: "Does a passed validation guarantee tax-authority acceptance?",
    a: "No. Validation checks evaluate your invoice against supported technical standards (EN 16931, BR-DE-*, BR-FR-*). Legal tax treatment and external gateway acceptance depend on your transaction and recipient.",
  },
  {
    q: "Which European countries are currently supported?",
    a: "Core EN 16931 workflows (Germany ZUGFeRD/XRechnung, France Factur-X, Belgium/Netherlands/Austria Peppol BIS 3.0) are live in the workspace, while national clearance gateways (KSeF, SdI, PDP, RO e-Factura) are transparently labeled as Partner-Operated or Planned.",
  },
  {
    q: "Can I cancel my paid subscription online?",
    a: "Yes. Workspace owners can switch plans or cancel upcoming renewal directly in Settings > Billing at any time, with zero hidden fees.",
  },
];

export default function HomePage() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NormInvoice — Product of Trend&Brand",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "European E-Invoicing & Financial Automation Platform: zero-retention ZUGFeRD, Factur-X & XRechnung validator, outgoing & incoming e-invoices, GoBD hash-chained archive, and DATEV/FEC exports.",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />

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
              NormInvoice — Product of Trend&amp;Brand · Free plan + 15-day free trial
            </span>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
              Stay Compliant Across Europe.{" "}
              <span className="text-accent-500">Automate Your E-Invoicing.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-100 sm:text-lg">
              Create, validate, send, receive, and archive EN 16931 electronic invoices (ZUGFeRD 2.3, Factur-X 1.07,
              XRechnung 3.0.2 &amp; Peppol BIS 3.0) in one clear, multi-tenant SaaS workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-600 active:scale-[0.98]"
              >
                Sign Up Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?mode=register&plan=trial"
                className="inline-flex items-center gap-2 rounded-xl border border-accent-400/50 bg-navy-800 px-5 py-3.5 text-sm font-bold text-white transition hover:border-accent-400 hover:bg-navy-700"
              >
                Start 15-Day Free Trial
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-600 bg-navy-950/50 px-5 py-3.5 text-sm font-semibold text-navy-100 transition hover:border-navy-400 hover:text-white"
              >
                <Compass className="h-4 w-4 text-accent-400" />
                Explore the Platform
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-200">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free plan available ($0/mo)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 15-day trial · No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Solo plan $39/month
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Preserved Real Working Zero-Retention Validator Studio */}
      <section id="validator" className="border-b border-slate-200 bg-canvas py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                Try Immediately · No Account Required
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
                Zero-Retention Dual E-Invoice Validator &amp; Viewer
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Drop any ZUGFeRD 2.3, Factur-X 1.07, or XRechnung 3.0.2 XML/PDF — inspected strictly in memory and
                wiped immediately after returning your report.
              </p>
            </div>
            <Link
              href="/tools/zugferd-vs-xrechnung"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-accent-600"
            >
              Need help choosing a format? Format Finder →
            </Link>
          </div>
          <ValidatorStudio />
        </div>
      </section>

      {/* 3. End-to-End Invoice Lifecycle */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
              One Workspace, Complete Lifecycle
            </span>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
              E-Invoicing Without the Operational Complexity
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
              Built around one shared canonical EN 16931 engine with country-aware rules — so outgoing invoices,
              incoming supplier bills, payments, and audit logs stay cleanly synchronized.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {LIFECYCLE_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-canvas p-5 transition-all hover:border-accent-300 hover:bg-white hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-extrabold text-slate-400">{item.step}</span>
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
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                13 European Markets · Honest Status Labels
              </span>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
                Country-Aware Rules, Never Overpromised
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Every market clearly distinguishes what is live today in the core workspace versus partner-operated
                gateways or planned roadmap modules.
              </p>
            </div>
            <Link
              href="/countries"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800"
            >
              <Globe2 className="h-4 w-4 text-accent-500" /> View All 13 Countries
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EU_COUNTRY_MODULES.slice(0, 8).map((m) => {
              const slug = CODE_TO_SLUG[m.code] || "germany";
              const badge =
                m.status === "LIVE_CORE"
                  ? { label: "Available", cls: "bg-emerald-100 text-emerald-800" }
                  : m.status === "PARTNER_ADAPTER"
                    ? { label: "Partner-Operated", cls: "bg-amber-100 text-amber-800" }
                    : { label: "Planned", cls: "bg-slate-200 text-slate-700" };
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
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                Built for Every Finance Role
              </span>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900">
                Tailored Workflows for Growing Teams
              </h2>
              <div className="mt-6 space-y-3.5">
                {[
                  {
                    href: "/solutions/small-business",
                    icon: Building2,
                    title: "Small Businesses & Solo Founders",
                    text: "Create EN 16931 invoices in minutes, manage customers & products, and keep track of paid vs. overdue bills.",
                  },
                  {
                    href: "/solutions/finance-teams",
                    icon: Inbox,
                    title: "Finance & Operations Teams",
                    text: "Combine outgoing billing, incoming supplier approvals, duplicate checks, partial payments, and automation rules.",
                  },
                  {
                    href: "/solutions/accountants",
                    icon: Briefcase,
                    title: "Accountants & Tax Advisors",
                    text: "Consent-gated multi-client portal with 1-click DATEV EXTF, French FEC, GoBD audit dossiers, and hash-chain proofs.",
                  },
                  {
                    href: "/partners",
                    icon: Code2,
                    title: "Developers & Integration Partners",
                    text: "Signed Stripe & WooCommerce webhooks, Bearer API keys, REST validation API, and zero-dependency TypeScript SDK.",
                  },
                ].map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-canvas p-4 transition-all hover:border-accent-400 hover:bg-white hover:shadow-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-navy-900">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-navy-800 bg-navy-900 p-7 text-white">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
                  <Lock className="h-3.5 w-3.5" /> Security, Privacy &amp; Honest Architecture
                </span>
                <h2 className="mt-4 text-2xl font-extrabold">
                  Engineered for Real Audits — Not Marketing Buzzwords
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-navy-200">
                  We publish only security and compliance controls actually implemented in code — never fabricated ISO
                  badges, fake customer logos, or unverified uptime promises.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-navy-100">
                  {[
                    "Strict multi-tenant organization isolation on every database query and API endpoint.",
                    "Per-user random-salt scrypt password hashing, HMAC-SHA256 sessions & AES-256-GCM webhook secret encryption.",
                    "Tamper-evident SHA-256 hash-chained GoBD audit log with one-click chain verification.",
                    "Self-hosted web fonts, XXE/DTD XML attack rejection, CSRF origin blocking & OWASP CSP headers.",
                    "Signed Stripe & WooCommerce bridges plus WordPress HPOS-compatible WooCommerce plugin.",
                  ].map((pt) => (
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
                  Security &amp; Trust Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy-600 bg-navy-800 px-4 py-2.5 text-xs font-bold text-white hover:border-navy-400"
                >
                  <Webhook className="h-3.5 w-3.5 text-accent-400" /> Explore Integrations
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-navy-600 px-4 py-2.5 text-xs font-semibold text-navy-200 hover:text-white"
                >
                  <Repeat className="h-3.5 w-3.5" /> API Docs
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
              <h2 className="text-2xl font-extrabold text-navy-900">Frequently Asked Questions</h2>
              <p className="mt-1 text-sm text-slate-600">Straight answers on plans, country support, and compliance boundaries.</p>
            </div>
            <Link href="/faq" className="text-xs font-bold text-accent-700 hover:underline">
              Read all FAQs →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {HOME_FAQS.map((item) => (
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
