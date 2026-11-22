import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, FileText, Repeat, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "E-Invoicing for Small Businesses | NormInvoice",
  description:
    "Spend less time managing invoices. Create compliant EN 16931 invoices, track paid vs. overdue bills, and export ready-to-file records.",
};

export default function SmallBusinessSolutionPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Building2 className="h-3.5 w-3.5" /> Solutions · Small Businesses &amp; Solo Founders
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Spend Less Time Managing Invoices
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            Running a growing business means handling customers, due dates, VAT rules, and documentation without a full
            accounting department. NormInvoice simplifies daily invoicing with clear validation and guided workflows.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login?mode=register" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600">
              Sign Up Free · 15-Day Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400">
              View Plans ($0 Free / $39 Solo)
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Guided EN 16931 Creation",
              text: "Save buyers, VAT IDs, IBAN details, and service rates once. Generate valid ZUGFeRD, Factur-X, or XRechnung files in seconds.",
            },
            {
              icon: Repeat,
              title: "Recurring & Payment Tracking",
              text: "Automate monthly retainers, monitor paid vs. overdue balances on your dashboard, and issue 1-click credit notes when needed.",
            },
            {
              icon: ShieldCheck,
              title: "Cross-Border Ready",
              text: "Support Kleinunternehmer § 19 UStG, EU Reverse Charge with VIES verification, and clean DATEV/FEC exports for your tax advisor.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                <c.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-extrabold text-navy-900">{c.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-card">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Note:</strong> NormInvoice provides structured invoicing software tools and technical validation,
              not individualized accounting or tax advice.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
