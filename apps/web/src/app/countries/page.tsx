import Link from "next/link";
import { ArrowRight, ExternalLink, Globe2, Info } from "lucide-react";
import { EU_COUNTRY_MODULES } from "@norminvoice/einvoice-core";
import { COUNTRY_SLUG_MAP } from "@/lib/website-content";

export const metadata = {
  title: "Countries & Standards (13 European Markets) | NormInvoice",
  description:
    "Explore NormInvoice's 13-country European e-invoicing compliance matrix: Germany, Belgium, France, Poland, Italy, Spain, Romania, Croatia, Greece, Netherlands, Austria, Portugal, and UK.",
};

const CODE_TO_SLUG = Object.fromEntries(Object.values(COUNTRY_SLUG_MAP).map((c) => [c.code, c.slug]));

export default function CountriesPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Globe2 className="h-3.5 w-3.5" /> 13 European Markets · Honest Status Transparency
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Local Rules. One Consistent Workspace.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-100">
            Electronic invoicing obligations vary significantly across Europe. NormInvoice combines one shared EN 16931
            canonical engine with country-specific modules — clearly labeled by real availability.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950">
            <strong>Available (Core Live):</strong> Tested in our deterministic engine for the formats &amp; exports listed.
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950">
            <strong>Partner-Operated:</strong> Requires an independent accredited Access Point or clearance partner.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
            <strong>Planned:</strong> Localized profile tracked on our roadmap; not yet live for statutory submission.
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-navy-900 text-white uppercase">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold">Country</th>
                  <th className="px-5 py-3.5 text-left font-bold">Status</th>
                  <th className="px-5 py-3.5 text-left font-bold">Formats / Network</th>
                  <th className="px-5 py-3.5 text-left font-bold">Mandate Timeline</th>
                  <th className="px-5 py-3.5 text-right font-bold">Guide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EU_COUNTRY_MODULES.map((m) => {
                  const slug = CODE_TO_SLUG[m.code] || "germany";
                  const badge =
                    m.status === "LIVE_CORE"
                      ? { label: "Available", cls: "bg-emerald-100 text-emerald-800" }
                      : m.status === "PARTNER_ADAPTER"
                        ? { label: "Partner-Operated", cls: "bg-amber-100 text-amber-800" }
                        : { label: "Planned", cls: "bg-slate-100 text-slate-700" };

                  return (
                    <tr key={m.code} className="hover:bg-canvas">
                      <td className="px-5 py-4 font-extrabold text-navy-900 whitespace-nowrap">
                        {m.code} · {m.name}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                        {m.supportedFormats.join(", ")}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-md">{m.mandateTimeline}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <a
                            href={m.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-navy-900"
                          >
                            Source <ExternalLink className="h-3 w-3" />
                          </a>
                          <Link
                            href={`/countries/${slug}`}
                            className="inline-flex items-center gap-1 font-bold text-accent-700 hover:underline"
                          >
                            Details <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
          <p>
            Regulatory timelines are anchored to official tax-authority publications and European Commission country
            sheets, but local legislation changes over time. Always confirm your company&apos;s specific filing and
            archival obligations with a qualified local tax advisor.
          </p>
        </div>
      </div>
    </div>
  );
}
