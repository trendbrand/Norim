"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Webhook,
  XCircle,
} from "lucide-react";
import { EU_COUNTRY_MODULES } from "@norminvoice/einvoice-core";
import { Alert, Card, PageHeader, apiJson, btnSecondary, formatMoney } from "@/components/ui";

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
    orgStatus: "ACTIVE" | "SUSPENDED";
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
  adminAudit: Array<{
    id: number;
    actorEmail: string;
    action: string;
    targetOrgId: string | null;
    reason: string;
    createdAt: string;
  }>;
}

export default function SuperAdminPage() {
  const [tab, setTab] = useState<"tenants" | "rules" | "gateways" | "audit">("tenants");
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
        body: JSON.stringify({ orgId, action: "PLAN_OVERRIDE", planTier, reason: "Staff plan override" }),
      });
      setToast(`Updated organization ${orgId} to ${planTier.toUpperCase()} plan (logged in staff audit).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingOrg(null);
    }
  }

  async function toggleOrgStatus(orgId: string, current: "ACTIVE" | "SUSPENDED") {
    const action = current === "SUSPENDED" ? "REACTIVATE" : "SUSPEND";
    const reason = prompt(`Mandatory reason code to ${action} tenant ${orgId} (min 5 chars):`);
    if (!reason || reason.trim().length < 5) return;
    setSavingOrg(orgId);
    setToast(null);
    try {
      await apiJson("/api/v1/admin/overview", {
        method: "PATCH",
        body: JSON.stringify({ orgId, action, reason }),
      });
      setToast(`Tenant ${orgId} ${action === "SUSPEND" ? "SUSPENDED" : "REACTIVATED"} (reason logged).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
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
        <PageHeader title="Platform Super-Admin" subtitle="Restricted to designated NormInvoice platform operators." />
        <Alert kind="error">{error || "Access denied (HTTP 403)."}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Super-Admin Control Plane"
        subtitle="Internal staff operations — tenant directory, 13-country rule pack registry, gateway telemetry, and immutable privileged action log."
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
          { label: "Country Rule Packs", value: String(EU_COUNTRY_MODULES.length) },
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

      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {[
          { id: "tenants", label: "Organizations & Plans", icon: ShieldCheck },
          { id: "rules", label: "13-Country Rule Packs (A05)", icon: Globe2 },
          { id: "gateways", label: "Gateway Telemetry (A07)", icon: Webhook },
          { id: "audit", label: "Privileged Staff Audit (A09)", icon: ShieldAlert },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold ${
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "tenants" && (
        <Card
          title={`Tenant Directory (${data.organizations.length})`}
          description="No default invoice-body access (Master Plan Section 2.1). Suspensions require a mandatory reason code."
        >
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Organization</th>
                  <th className="px-5 py-3 text-left font-semibold">Owner & Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Docs (Out / In)</th>
                  <th className="px-5 py-3 text-left font-semibold">GoBD Chain</th>
                  <th className="px-5 py-3 text-right font-semibold">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900">{org.name}</p>
                      <p className="font-mono text-[11px] text-slate-400">{org.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-700">{org.ownerEmail}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${org.orgStatus === "SUSPENDED" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                        {org.orgStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-800">
                      {org.invoiceCount} / {org.incomingCount} ({org.monthlyUsed}/{org.monthlyQuota} mo)
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
                      <div className="inline-flex items-center gap-2">
                        <select
                          disabled={savingOrg === org.id}
                          value={org.planTier}
                          onChange={(e) => void updateOrgPlan(org.id, e.target.value as any)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold uppercase"
                        >
                          <option value="free">FREE</option>
                          <option value="solo">SOLO</option>
                          <option value="business">BUSINESS</option>
                          <option value="agency">AGENCY</option>
                        </select>
                        <button
                          type="button"
                          disabled={savingOrg === org.id}
                          onClick={() => void toggleOrgStatus(org.id, org.orgStatus)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            org.orgStatus === "SUSPENDED"
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          <Ban className="h-3 w-3" /> {org.orgStatus === "SUSPENDED" ? "Reactivate" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "rules" && (
        <Card title="Versioned 13-Country Compliance Rule Registry" description="Source-anchored national rulesets with confidence & effective dates.">
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Country</th>
                  <th className="px-5 py-3 text-left font-semibold">Ruleset Version</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Effective</th>
                  <th className="px-5 py-3 text-left font-semibold">Confidence</th>
                  <th className="px-5 py-3 text-right font-semibold">Authority Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EU_COUNTRY_MODULES.map((m) => (
                  <tr key={m.code} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">{m.code} · {m.name}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-700">{m.rulesetVersion}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.status === "LIVE_CORE" ? "bg-emerald-100 text-emerald-800" : m.status === "PARTNER_ADAPTER" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600">{m.effectiveDate}</td>
                    <td className="px-5 py-3 font-mono text-[11px]">{m.confidence}</td>
                    <td className="px-5 py-3 text-right">
                      <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                        Official <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "gateways" && (
        <Card title="Platform-Wide Webhook & Gateway Telemetry">
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
                    <th className="px-5 py-2.5 text-left font-semibold">HTTP</th>
                    <th className="px-5 py-2.5 text-left font-semibold">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentWebhooks.map((w) => (
                    <tr key={w.id}>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">{w.createdAt.slice(0, 19).replace("T", " ")}</td>
                      <td className="px-5 py-2.5 font-mono text-[11px]">{w.orgId}</td>
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
      )}

      {tab === "audit" && (
        <Card title="Privileged Platform Staff Audit Log" description="Every plan override and tenant suspension is permanently recorded with actor & reason code.">
          {data.adminAudit.length === 0 ? (
            <p className="text-xs text-slate-500">No privileged staff actions recorded yet.</p>
          ) : (
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-semibold">Time</th>
                    <th className="px-5 py-2.5 text-left font-semibold">Staff Actor</th>
                    <th className="px-5 py-2.5 text-left font-semibold">Action</th>
                    <th className="px-5 py-2.5 text-left font-semibold">Target Org</th>
                    <th className="px-5 py-2.5 text-left font-semibold">Reason Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.adminAudit.map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">{a.createdAt.slice(0, 19).replace("T", " ")}</td>
                      <td className="px-5 py-2.5 font-semibold text-slate-800">{a.actorEmail}</td>
                      <td className="px-5 py-2.5 font-mono font-bold text-brand-700">{a.action}</td>
                      <td className="px-5 py-2.5 font-mono text-[11px]">{a.targetOrgId || "—"}</td>
                      <td className="px-5 py-2.5 text-slate-700">{a.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
