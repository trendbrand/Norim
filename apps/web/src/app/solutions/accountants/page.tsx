import Link from "next/link";
import { ArrowRight, Briefcase, FileArchive, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "E-Invoicing for Accountants & Tax Advisors | NormInvoice",
  description:
    "Streamline client document handoffs with consent-gated multi-client review, DATEV EXTF, French FEC exports, and verified GoBD audit chains.",
};

export default function AccountantsSolutionPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Briefcase className="h-3.5 w-3.5" /> Solutions · Accountants &amp; Tax Advisors
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            A Cleaner Handoff Between Businesses and Accountants
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            Eliminate scattered email PDFs, missing Leitweg-IDs, and unvalidated totals. Review client exception queues
            and download structured DATEV EXTF or French FEC ledgers in one portal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact?topic=partners" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600">
              Discuss Accountant Partnerships <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login?mode=register" className="rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400">
              Try Accountant Portal
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Consent-Gated Multi-Client Access",
              text: "Clients grant time-bounded, revocable delegation to your firm email — every delegated review is attested in the client's audit trail.",
            },
            {
              icon: FileArchive,
              title: "DATEV EXTF & French FEC Exports",
              text: "Download SKR03/SKR04 DATEV EXTF v700 CSVs, DGFiP FEC files, complete XML/PDF ZIP archives, and generated GoBD dossiers.",
            },
            {
              icon: ShieldCheck,
              title: "Auto-CC & Exception Visibility",
              text: "Receive automatic copies of validated outgoing invoices and quickly spot overdue bills, pending AP approvals, or duplicate supplier uploads.",
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
      </div>
    </div>
  );
}
