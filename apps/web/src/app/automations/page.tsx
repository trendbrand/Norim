"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { Alert, Card, PageHeader, apiJson } from "@/components/ui";

interface AutomationRule {
  id: string;
  ruleKey: string;
  name: string;
  triggerEvent: string;
  actionSummary: string;
  enabled: boolean;
  executionsCount: number;
  updatedAt: string;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiJson<{ rules: AutomationRule[] }>("/api/v1/automations");
      setRules(r.rules);
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
      setToast({
        kind: "success",
        text: `${rule.name} ${!rule.enabled ? "enabled" : "paused"} (logged in GoBD audit chain).`,
      });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Failed to update automation" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automations & Compliance Gates"
        subtitle="Configure event-driven rules for pre-send validation, accountant CC dispatch, incoming invoice approvals, and overdue payment follow-ups."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading automation rules…
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-xl p-2.5 ${r.enabled ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-400"}`}>
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
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => void toggleRule(r)}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    r.enabled
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r.enabled ? "Enabled ✓" : "Paused — Enable"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
