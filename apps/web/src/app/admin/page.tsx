"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Alert, Card, PageHeader, apiJson, btnPrimary, btnSecondary, formatMoney } from "@/components/ui";

interface AdminOverview {
  kpis: {
    totalOrganizations: number;
    totalUsers: number;
    totalOutgoingInvoices: number;
    totalIncomingInvoices: number;
    estimatedMrrEur: number;
  };
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    onboardingCompleted: boolean;
    planTier: "free" | "solo" | "business" | "agency";
    monthlyQuota: number;
    monthlyUsed: number;
    invoiceCount: number;
    incomingCount: number;
    customerCount: number;
    memberCount: number;
    gobdChainVerified: boolean;
    createdAt: string;
  }>;
  recentWebhooks: Array<{
    id: number;
    orgId: string;
    provider: string;
    eventType: string;
    statusCode: number;
    summary: string;
    createdAt: string;
  }>;
}

export default function SuperAdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrg, setSavingOrg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiJson<AdminOverview>("/api/v1/admin/overview");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Super-Admin access required");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateOrgPlan(orgId: string, planTier: "free" | "solo" | "business" | "agency") {
    setSavingOrg(orgId);
    setToast(null);
    try {
      await apiJson("/api/v1/admin/overview", {
        method: "PATCH",
        body: JSON.stringify({ orgId, planTier }),
      });
      setToast(`Updated organization ${orgId} to ${planTier.toUpperCase()} plan.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingOrg(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Platform Super-Admin Control Plane…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Platform Super-Admin" subtitle="Restricted to NormInvoice platform operators." />
        <Alert kind="error">{error || "Access denied (HTTP 403)."}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Super-Admin Control Plane"
        subtitle="Monitor all EU tenant organizations, estimated MRR, GoBD hash-chain health, plan overrides, and platform-wide webhook telemetry."
        actions={
          <button type="button" onClick={() => void load()} className={btnSecondary}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        }
      />

      {toast && <Alert kind="success">{toast}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Estimated MRR", value: formatMoney(data.kpis.estimatedMrrEur), accent: true },
          { label: "Organizations", value: String(data.kpis.totalOrganizations) },
          { label: "Registered Users", value: String(data.kpis.totalUsers) },
          { label: "Outgoing E-Invoices", value: String(data.kpis.totalOutgoingInvoices) },
          { label: "Incoming Archived", value: String(data.kpis.totalIncomingInvoices) },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className={`mt-2 text-2xl font-extrabold tabular-money ${k.accent ? "text-brand-700" : "text-slate-900"}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <Card
        title={`Registered Tenant Organizations (${data.organizations.length})`}
        description="Manually override any organization's plan tier & monthly quota (recorded in that tenant's GoBD audit trail)."
      >
        <div className="-mx-6 -my-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Organization</th>
                <th className="px-5 py-3 text-left font-semibold">Owner</th>
                <th className="px-5 py-3 text-left font-semibold">Docs (Out / In)</th>
                <th className="px-5 py-3 text-left font-semibold">Quota</th>
                <th className="px-5 py-3 text-left font-semibold">GoBD Chain</th>
                <th className="px-5 py-3 text-right font-semibold">Plan Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-900">{org.name}</p>
                    <p className="font-mono text-[11px] text-slate-400">{org.id}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    <p>{org.ownerEmail}</p>
                    <p className="text-[11px] text-slate-400">
                      {org.memberCount} member(s) · {org.onboardingCompleted ? "Onboarded" : "Pending setup"}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-800">
                    {org.invoiceCount} out / {org.incomingCount} in
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-700">
                    {org.monthlyUsed} / {org.monthlyQuota}
                  </td>
                  <td className="px-5 py-3">
                    {org.gobdChainVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                        <ShieldAlert className="h-3.5 w-3.5" /> Broken
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select
                      disabled={savingOrg === org.id}
                      value={org.planTier}
                      onChange={(e) => void updateOrgPlan(org.id, e.target.value as any)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-slate-800"
                    >
                      <option value="free">FREE (3/mo)</option>
                      <option value="solo">SOLO (€19 · 100/mo)</option>
                      <option value="business">BUSINESS (€49 · 500/mo)</option>
                      <option value="agency">AGENCY (€129 · 2,500/mo)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Platform-Wide Webhook Telemetry (Latest 25)">
        {data.recentWebhooks.length === 0 ? (
          <p className="text-xs text-slate-500">No webhook deliveries recorded yet.</p>
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 text-left font-semibold">Time</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Org</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Provider</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Event</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentWebhooks.map((w) => (
                  <tr key={w.id}>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">{w.createdAt.slice(0, 19).replace("T", " ")}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-slate-600">{w.orgId}</td>
                    <td className="px-5 py-2.5 font-bold uppercase">{w.provider}</td>
                    <td className="px-5 py-2.5 font-mono">{w.eventType}</td>
                    <td className="px-5 py-2.5">
                      {w.statusCode < 300 ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> {w.statusCode}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-red-700"><XCircle className="h-3.5 w-3.5" /> {w.statusCode}</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-slate-600">{w.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
