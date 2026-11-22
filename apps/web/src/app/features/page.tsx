import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileText,
  Globe2,
  Inbox,
  Repeat,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "Features Overview | NormInvoice — Product of Trend&Brand",
  description:
    "Explore NormInvoice's production capabilities: EN 16931 creation & validation, incoming supplier inbox, recurring billing, payments, GoBD audit logs, and accounting exports.",
};

const MODULES = [
  {
    icon: FileText,
    status: "Available",
    title: "Structured Invoice Creation & Credit Notes",
    text: "Issue sequential EN 16931 invoices and TypeCode 381 credit notes in ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL), and Peppol BIS 3.0.",
  },
  {
    icon: FileCheck2,
    status: "Available",
    title: "Deterministic Pre-Send Validation & Repair",
    text: "Catch missing Leitweg-IDs (BR-DE-15), VAT breakdown mismatches (BR-CO-15), and malformed IBANs before delivery, with plain-language EN/DE/FR guidance.",
  },
  {
    icon: Inbox,
    status: "Available",
    title: "Incoming Supplier E-Invoice Inbox (AP)",
    text: "Upload, parse, validate, detect duplicates, approve supplier bills, and preserve original supplier XML alongside parsed views.",
  },
  {
    icon: Repeat,
    status: "Available",
    title: "Recurring Billing & Batch CSV Converter",
    text: "Automate monthly, quarterly, or annual invoice schedules and batch-convert CSV exports into validated PDF/A-3 + XML ZIP bundles.",
  },
  {
    icon: CreditCard,
    status: "Available",
    title: "Payments, Partial Settlements & AR Ageing",
    text: "Record SEPA transfers and partial payments, track paid vs. overdue invoices, and monitor receivables ageing buckets.",
  },
  {
    icon: Zap,
    status: "Available",
    title: "Workflow Automation Rules",
    text: "Configure organization-scoped automation triggers for pre-send validation gates, automatic accountant CC, and incoming approval holds.",
  },
  {
    icon: FileArchive,
    status: "Available",
    title: "GoBD Audit Hash-Chain & DATEV / FEC Exports",
    text: "Every workspace mutation is cryptographically linked in an append-only SHA-256 chain. Export DATEV EXTF v700, French FEC, and GoBD dossiers.",
  },
  {
    icon: Briefcase,
    status: "Available",
    title: "Delegated Accountant Portal & Team RBAC",
    text: "Grant time-bounded, revocable read/export access to external Steuerberater or finance reviewers with full access attestation.",
  },
  {
    icon: Webhook,
    status: "Available",
    title: "Stripe, WooCommerce, REST API & TypeScript SDK",
    text: "HMAC-SHA256 verified Stripe & WooCommerce webhooks (with HPOS WordPress plugin), Bearer API keys, and official SDK.",
  },
  {
    icon: BarChart3,
    status: "Available",
    title: "Real-Time Analytics & VAT Reporting",
    text: "Track invoice trends, status distributions, VAT rate summaries, and country breakdowns directly from live workspace records.",
  },
  {
    icon: Globe2,
    status: "Phased (13 Markets)",
    title: "Country Compliance Modules & Network Routing",
    text: "Core EU formats are live; national clearance networks (Peppol Access Points, French PDP, Polish KSeF, Italian SdI) are transparently labeled Partner-Operated or Planned.",
  },
  {
    icon: ShieldCheck,
    status: "Available",
    title: "Multi-Tenant Security & GDPR Sovereignty",
    text: "Strict org-level isolation, AES-256-GCM secret encryption, scrypt auth, XXE XML defense, and self-service GDPR Art. 20 export & Art. 17 erasure.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            Platform Capabilities
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything Your E-Invoice Workflow Needs, Connected
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-100 sm:text-base">
            From zero-retention validation to outgoing automation, incoming supplier approvals, and GoBD-aligned
            accountant exports — every feature below reflects real implemented product behavior.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600"
            >
              Start Free or 15-Day Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400"
            >
              See Supported Countries
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800">
                    {m.status}
                  </span>
                </div>
                <h2 className="mt-4 text-base font-extrabold text-navy-900">{m.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{m.text}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950">
          <strong>Transparent Availability Notice:</strong> Features, integrations, and country modules are labeled{" "}
          <em>Available</em>, <em>Partner-Operated</em>, or <em>Planned</em>. Only features marked Available for your
          workspace should be treated as production-ready. Validation does not replace independent tax or legal advice.
        </div>
      </div>
    </div>
  );
}
