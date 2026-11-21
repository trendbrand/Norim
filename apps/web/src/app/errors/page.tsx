import Link from "next/link";
import { listAllRuleEntries } from "@norminvoice/einvoice-core";

export const metadata = {
  title: "EN 16931, ZUGFeRD & XRechnung Error Code Wiki — NormInvoice",
  description:
    "Complete German, French & English troubleshooting guide for KoSIT, EN 16931, XRechnung 3.0.2 (BR-DE-*), mathematical (BR-CO-*), and PDF/A-3b validation errors.",
};

export default function ErrorsIndexPage() {
  const rules = listAllRuleEntries();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          EN 16931 · XRechnung 3.0.2 · ZUGFeRD 2.3 · Factur-X 1.07
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          EU E-Invoice Compliance Error Wiki
        </h1>
        <p className="mt-2 text-slate-600">
          Plain-language explanations and XML fix examples for official KoSIT Schematron, EN 16931 Business Rules, and PDF/A-3b container errors in English, German, and French.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <Link
            key={rule.ruleId}
            href={`/errors/${rule.ruleId}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded bg-red-50 px-2.5 py-0.5 font-mono text-xs font-bold text-red-700">
                {rule.ruleId}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                {rule.fieldBt} · {rule.standard}
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-brand-700">
              {rule.titleEn}
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">DE: {rule.titleDe}</p>
            <p className="mt-2 line-clamp-2 text-xs text-slate-600">{rule.messageEn}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
