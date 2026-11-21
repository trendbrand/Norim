import Link from "next/link";
import type { Metadata } from "next";
import { getRuleKnowledge, listAllRuleEntries } from "@norminvoice/einvoice-core";

export function generateStaticParams() {
  return listAllRuleEntries().map((r) => ({ ruleId: r.ruleId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}): Promise<Metadata> {
  const { ruleId } = await params;
  const rule = getRuleKnowledge(ruleId);
  return {
    title: `${rule.ruleId} (${rule.fieldBt}) — ${rule.titleEn} | NormInvoice`,
    description: `${rule.messageEn} ${rule.fixHintEn}`,
  };
}

export default async function RuleDetailPage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = await params;
  const rule = getRuleKnowledge(ruleId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/errors" className="text-xs font-semibold text-brand-600 hover:underline">
        ← All EN 16931 / XRechnung Rules
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-red-100 px-3 py-1 font-mono text-sm font-bold text-red-800">{rule.ruleId}</span>
          <span className="rounded bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
            Field: {rule.fieldBt}
          </span>
          <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{rule.standard}</span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{rule.titleEn}</h1>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">English Explanation & Fix</h2>
            <p className="mt-2 text-sm text-slate-800">{rule.messageEn}</p>
            <p className="mt-2 text-sm font-semibold text-brand-700">How to fix: {rule.fixHintEn}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Deutsch (Deutschland / XRechnung / ZUGFeRD)</h2>
            <p className="mt-1 text-sm font-bold text-slate-900">{rule.titleDe}</p>
            <p className="mt-1 text-sm text-slate-800">{rule.messageDe}</p>
            <p className="mt-2 text-sm font-semibold text-brand-700">Lösung: {rule.fixHintDe}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Français (France / Factur-X)</h2>
            <p className="mt-1 text-sm font-bold text-slate-900">{rule.titleFr}</p>
            <p className="mt-1 text-sm text-slate-800">{rule.messageFr}</p>
            <p className="mt-2 text-sm font-semibold text-brand-700">Correction : {rule.fixHintFr}</p>
          </div>

          {rule.exampleXml && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Compliant XML Snippet</h2>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-300">
                {rule.exampleXml}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-sm font-medium text-slate-700">
            Want to check if your invoice passes {rule.ruleId} right now?
          </p>
          <Link
            href="/"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Test in Free Zero-Retention Validator →
          </Link>
        </div>
      </div>
    </div>
  );
}
