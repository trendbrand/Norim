import Link from "next/link";
import { ArrowRight, BarChart3, Inbox, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "E-Invoicing for Finance Teams | NormInvoice",
  description:
    "One workspace for finance operations: outgoing billing, incoming supplier inbox, approvals, receivables ageing, and audit logs.",
};

export default function FinanceTeamsSolutionPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Users className="h-3.5 w-3.5" /> Solutions · Finance &amp; Operations Teams
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            One Workspace for Finance Operations
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            Organize outgoing and incoming invoices, manage exceptions, and track drafts, validations, approvals,
            deliveries, and payments as distinct, auditable lifecycle states.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login?mode=register" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600">
              Start 15-Day Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact?topic=sales" className="rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400">
              Discuss Your Workflow
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: Inbox,
              title: "Incoming Supplier AP Inbox",
              text: "Ingest supplier XML/PDF e-invoices, run automatic duplicate detection, inspect original XML vs. parsed lines, and enforce Owner/Admin approval gates.",
            },
            {
              icon: BarChart3,
              title: "Receivables, Payments & VAT Reports",
              text: "Record partial or full SEPA settlements, track 30/60+ day ageing buckets, and analyze monthly revenue, VAT categories, and country volume.",
            },
            {
              icon: ShieldCheck,
              title: "Role-Based Access & GoBD Integrity",
              text: "Enforce Owner, Admin, Member, and Accountant RBAC roles with every invoice, payment, and comment sealed in a SHA-256 hash chain.",
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
