import Link from "next/link";
import { ArrowRight, BookOpen, CreditCard, FileCheck2, Globe2, Inbox, Mail, ShieldCheck, Wrench } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "Help Center | NormInvoice — Guides & Documentation",
  description:
    "Find step-by-step guidance for creating EN 16931 invoices, fixing validation errors, configuring webhooks, and managing subscriptions.",
};

const TOPICS = [
  { icon: Wrench, title: "Getting Started", text: "Set up company profile, VAT ID, IBAN, numbering prefix, and team roles.", href: "/login?mode=register" },
  { icon: FileCheck2, title: "EN 16931 Validation Errors", text: "Plain-language explanations for 45+ BR-DE-*, BR-CO-*, and BR-FR-* rule codes.", href: "/errors" },
  { icon: Globe2, title: "Country Workflows & Formats", text: "Compare ZUGFeRD, Factur-X, XRechnung, Peppol BIS 3.0, and 13 EU markets.", href: "/countries" },
  { icon: Inbox, title: "Format Finder Tool", text: "Interactive decision guide to choose the right EU invoice standard.", href: "/tools/zugferd-vs-xrechnung" },
  { icon: BookOpen, title: "API & Webhook Docs", text: "Connect Stripe, WooCommerce, Bearer API keys, and TypeScript SDK.", href: "/docs" },
  { icon: CreditCard, title: "Plans, Trials & Billing", text: "Manage your Free plan, 15-day trial, Solo ($39/mo) upgrade, or cancellation.", href: "/subscription-billing" },
  { icon: ShieldCheck, title: "Security, GDPR & Data Export", text: "Download Art. 20 exports, review our DPA, or inspect Subprocessor disclosures.", href: "/security" },
];

export default function HelpCenterPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">Help Center</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">How Can We Help?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            Browse documentation for e-invoice creation, validation diagnostics, European country standards,
            integrations, and billing.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:border-accent-400 hover:shadow-card-hover"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                <t.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-extrabold text-navy-900 group-hover:text-accent-600">{t.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{t.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-accent-700">
                Open Guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div className="text-xs text-slate-600">
            <h2 className="text-base font-extrabold text-navy-900">Need Personalized Support?</h2>
            <p className="mt-1">
              Email <strong className="text-navy-900">{BRAND_CONTACT.email}</strong> with your organization name and
              invoice reference. Never include passwords or secret API keys.
            </p>
          </div>
          <Link
            href="/contact?topic=support"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            <Mail className="h-3.5 w-3.5" /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
