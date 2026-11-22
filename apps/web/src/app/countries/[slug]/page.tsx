import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { EU_COUNTRY_MODULES } from "@norminvoice/einvoice-core";
import { COUNTRY_SLUG_MAP } from "@/lib/website-content";

export function generateStaticParams() {
  return Object.keys(COUNTRY_SLUG_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = COUNTRY_SLUG_MAP[slug];
  if (!info) return { title: "Country Not Found | NormInvoice" };
  return {
    title: `${info.name} E-Invoicing Workflows | NormInvoice`,
    description: info.summary,
  };
}

export default async function CountryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = COUNTRY_SLUG_MAP[slug];
  if (!info) notFound();

  const mod = EU_COUNTRY_MODULES.find((m) => m.code === info.code);
  const badge =
    mod?.status === "LIVE_CORE"
      ? { label: "Available (Core Engine)", cls: "bg-emerald-100 text-emerald-800" }
      : mod?.status === "PARTNER_ADAPTER"
        ? { label: "Partner-Operated Connectivity", cls: "bg-amber-100 text-amber-800" }
        : { label: "Planned / Phased Module", cls: "bg-slate-200 text-slate-800" };

  return (
    <div className="bg-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Link href="/countries" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-accent-600">
          <ArrowLeft className="h-3.5 w-3.5" /> All 13 European Countries
        </Link>

        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy-800 px-3 py-1 font-mono text-xs font-bold text-accent-400">
              {info.code} · {info.name}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>{badge.label}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{info.headline}</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-100">{info.summary}</p>
        </section>

        {mod && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Formats &amp; Standard</p>
              <p className="mt-2 font-mono text-xs font-bold text-navy-900">{mod.supportedFormats.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ruleset Version</p>
              <p className="mt-2 font-mono text-xs font-bold text-navy-900">{mod.rulesetVersion}</p>
              <p className="mt-1 text-[11px] text-slate-500">Effective: {mod.effectiveDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivery Model</p>
              <p className="mt-2 text-xs font-bold text-navy-900">{mod.networkModel}</p>
              <a
                href={mod.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-700 hover:underline"
              >
                Official Authority Source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
          <h2 className="text-lg font-extrabold text-navy-900">Recommended Workflow in NormInvoice</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            {info.workflow.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {mod && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-canvas p-4 text-xs text-slate-700">
              <p className="font-bold text-navy-900">Mandate Timeline Reference</p>
              <p className="mt-1">{mod.mandateTimeline}</p>
              <p className="mt-2 font-bold text-navy-900">Key Required Identifiers</p>
              <ul className="mt-1.5 space-y-1">
                {mod.requiredFields.map((rf) => (
                  <li key={rf.bt}>
                    <span className="font-mono font-bold text-navy-900">{rf.bt}</span> — {rf.label} ({rf.when})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs leading-relaxed text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Important Compliance Scope Limitation</p>
            <p className="mt-1">{info.limitation}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-navy-900">
            <ShieldCheck className="h-5 w-5 text-accent-500" />
            Ready to test {info.name} workflows in a real workspace?
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/contact?topic=sales"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-slate-50"
            >
              Ask About {info.name}
            </Link>
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
            >
              Start 15-Day Free Trial <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
