import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | NormInvoice",
  description:
    "Clear answers about NormInvoice plans, 15-day free trials, European e-invoicing compliance boundaries, integrations, and privacy.",
};

const FAQ_GROUPS = [
  {
    category: "Product & Compliance",
    items: [
      {
        q: "What is NormInvoice?",
        a: "NormInvoice (Product of Trend&Brand) is a subscription-based software platform for creating, validating, receiving, archiving, and exporting European electronic invoices (EN 16931, ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0).",
      },
      {
        q: "Is NormInvoice a government agency or tax authority?",
        a: "No. NormInvoice is commercial SaaS software. We do not act as a bank, tax authority, or government-accredited clearance operator unless expressly authorized and verified.",
      },
      {
        q: "Does a passed validation automatically make every invoice legally compliant?",
        a: "No. Technical validation checks your document against supported EN 16931 and national rulesets, but final tax treatment, VAT categorization, and recipient or gateway acceptance remain the responsibility of the issuer and their qualified tax advisor.",
      },
      {
        q: "Which European countries are supported?",
        a: "See our live Countries & Standards page for all 13 European markets, where each country is clearly marked Available (Core), Partner-Operated, or Planned.",
      },
    ],
  },
  {
    category: "Free Plan, 15-Day Trial & Subscriptions",
    items: [
      {
        q: "How do the Free plan and 15-day Free Trial work?",
        a: "New accounts receive a real database-tracked 15-day Free Trial with no credit card required (up to 15 finalized invoices and full workspace access). When the trial ends without a paid upgrade, your workspace moves cleanly to our ongoing $0 Free plan (up to 5 invoices/month) — you are never silently billed.",
      },
      {
        q: "What does the Solo plan ($39/month) include?",
        a: "Solo ($39/month) unlocks up to 150 finalized e-invoices per month, recurring invoice schedules, incoming supplier inbox, automation rules, VIES VAT checks, reporting, and DATEV/FEC accounting exports.",
      },
      {
        q: "Can I cancel my subscription online?",
        a: "Yes. Workspace owners and admins can cancel upcoming renewal directly from Settings > Billing & Quota at any time, or by emailing official@trendandbrands.com.",
      },
    ],
  },
  {
    category: "Privacy, Security & Operations",
    items: [
      {
        q: "What happens to files uploaded to the free public validator?",
        a: "Public validator uploads are processed strictly in volatile RAM (zero-retention) and discarded immediately after your compliance report is generated.",
      },
      {
        q: "Can I export all my company invoices and audit logs?",
        a: "Yes. You can export individual XML/PDF files, monthly ZIP archives, DATEV EXTF, French FEC ledgers, GoBD procedural dossiers, and full GDPR Art. 20 JSON exports at any time.",
      },
      {
        q: "How do I contact NormInvoice?",
        a: `Email ${BRAND_CONTACT.email}, call ${BRAND_CONTACT.phone}, or submit the Contact form directly on this website.`,
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <HelpCircle className="h-3.5 w-3.5" /> Clear Answers
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-2.5 text-sm text-navy-100">
            Transparent details on NormInvoice capabilities, trials, pricing, and legal boundaries.
          </p>
        </section>

        {FAQ_GROUPS.map((group) => (
          <section key={group.category} className="space-y-3">
            <h2 className="text-base font-extrabold text-navy-900">{group.category}</h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                  <h3 className="text-sm font-extrabold text-navy-900">{item.q}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-sm font-bold text-navy-900">Still have a specific question?</p>
          <p className="mt-1 text-xs text-slate-600">Our team is happy to help clarify country support, integrations, or enterprise terms.</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}
