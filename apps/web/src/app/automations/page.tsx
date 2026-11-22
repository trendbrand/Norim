"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FlaskConical, Loader2, Play, X, Zap } from "lucide-react";
import { Alert, Card, PageHeader, apiJson, btnPrimary, btnSecondary, formatMoney } from "@/components/ui";

interface AutomationRule {
  id: string;
  ruleKey: string;
  name: string;
  triggerEvent: string;
  actionSummary: string;
  enabled: boolean;
  executionsCount: number;
  lastRunAt: string | null;
  updatedAt: string;
}

interface AutomationMatch {
  invoiceId: string;
  invoiceNumber: string;
  counterparty: string;
  grossAmount: number;
  currency: string;
  dueDate: string | null;
  daysOverdue: number;
}

interface AutomationPlan {
  ruleName: string;
  triggerEvent: string;
  scheduled: boolean;
  willDo: string;
  matches: AutomationMatch[];
}

interface AutomationRun {
  id: string;
  ruleKey: string;
  triggerEvent: string;
  outcome: string;
  matchedCount: number;
  detail: string;
  dryRun: boolean;
  createdAt: string;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [plan, setPlan] = useState<AutomationPlan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiJson<{ rules: AutomationRule[]; runs: AutomationRun[] }>("/api/v1/automations");
      setRules(r.rules);
      setRuns(r.runs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleRule(rule: AutomationRule) {
    setBusyId(rule.id);
    setToast(null);
    try {
      await apiJson("/api/v1/automations", {
        method: "PATCH",
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
      setToast({ kind: "success", text: `${rule.name} ${!rule.enabled ? "enabled" : "paused"} (GoBD audit logged).` });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Failed to update automation" });
    } finally {
      setBusyId(null);
    }
  }

  async function act(rule: AutomationRule, dryRun: boolean) {
    setBusyId(rule.id);
    setToast(null);
    try {
      const res = await apiJson<{ plan: AutomationPlan; run: AutomationRun }>(
        `/api/v1/automations/${rule.id}/run`,
        { method: "POST", body: JSON.stringify({ dryRun }) }
      );
      if (dryRun) {
        setPlan(res.plan);
      } else {
        setToast({ kind: "success", text: `${rule.name}: ${res.run.outcome} — ${res.run.detail}` });
      }
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Automation run failed" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automations & Compliance Gates"
        subtitle="Event-driven rules for pre-send validation, accountant CC dispatch, incoming approvals, and overdue follow-ups. Simulate any rule before running it; every run is logged."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading automation rules…
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {rules.map((r) => (
              <Card key={r.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-xl p-2.5 ${r.enabled ? "bg-accent-50 text-accent-600" : "bg-slate-100 text-slate-400"}`}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{r.name}</h3>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                          {r.triggerEvent}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{r.actionSummary}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Executions: {r.executionsCount}
                        {r.lastRunAt ? ` · last ${r.lastRunAt.slice(0, 16).replace("T", " ")}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" disabled={busyId === r.id} onClick={() => void act(r, true)} className={btnSecondary} title="Dry-run: preview without executing">
                      <FlaskConical className="h-4 w-4" /> Simulate
                    </button>
                    {r.ruleKey === "overdue_payment_reminder" && (
                      <button type="button" disabled={busyId === r.id || !r.enabled} onClick={() => void act(r, false)} className={btnPrimary} title={r.enabled ? "Execute now" : "Enable the rule first"}>
                        {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run now
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void toggleRule(r)}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        r.enabled ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r.enabled ? "Enabled ✓" : "Paused — Enable"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card title="Run history" description="Every simulation and execution is recorded.">
            {runs.length === 0 ? (
              <p className="text-xs text-slate-400">No automation runs yet. Use Simulate or Run now above.</p>
            ) : (
              <ol className="space-y-2">
                {runs.map((run) => (
                  <li key={run.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${run.dryRun ? "bg-sky-100 text-sky-800" : run.outcome === "EXECUTED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {run.dryRun ? "SIMULATED" : run.outcome}
                      </span>
                      <span className="ml-2 font-mono text-slate-500">{run.ruleKey}</span>
                      <p className="mt-0.5 truncate text-slate-600">{run.detail}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-400">{run.createdAt.slice(0, 16).replace("T", " ")}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </>
      )}

      {plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setPlan(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <FlaskConical className="h-4 w-4 text-sky-600" /> Simulation · {plan.ruleName}
                </h3>
                <p className="text-xs text-slate-500">{plan.triggerEvent} · dry-run (nothing was executed)</p>
              </div>
              <button type="button" onClick={() => setPlan(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{plan.willDo}</p>
            {plan.matches.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase text-slate-400">Would affect ({plan.matches.length})</p>
                {plan.matches.map((m) => (
                  <div key={m.invoiceId} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{m.invoiceNumber}</span>
                      <span className="text-slate-500"> · {m.counterparty} · due {m.dueDate}</span>
                      <span className="ml-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{m.daysOverdue}d overdue</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatMoney(m.grossAmount, m.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
