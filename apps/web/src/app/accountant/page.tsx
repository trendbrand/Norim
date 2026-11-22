"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Inbox,
  Loader2,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  Alert,
  Card,
  EmptyState,
  PageHeader,
  apiJson,
  btnPrimary,
  formatMoney,
  inputCls,
  labelCls,
} from "@/components/ui";

interface Delegation {
  id: string;
  accountantEmail: string;
  accountantName: string;
  scope: "READ_EXPORT" | "FULL_BOOKKEEPING";
  expiresAt: string;
  revokedAt: string | null;
  grantedBy: string;
}

interface DelegatedClient {
  delegationId: string;
  orgId: string;
  orgName: string;
  countryCode: string;
  vatId: string;
  scope: string;
  expiresAt: string;
  outgoingCount: number;
  incomingCount: number;
  totalInvoiced: number;
  totalOutstanding: number;
  firstPassRate: number;
  gobdVerified: boolean;
}

interface ReviewItem {
  id: string;
  invoiceNumber: string;
  counterparty: string;
  grossAmount: number;
  currency: string;
  date: string;
  reasons: string[];
}

interface ClientReview {
  orgId: string;
  orgName: string;
  scope: "READ_EXPORT" | "FULL_BOOKKEEPING";
  expiresAt: string;
  gobdVerified: boolean;
  outgoing: ReviewItem[];
  incoming: ReviewItem[];
}

export default function AccountantWorkspacePage() {
  const [granted, setGranted] = useState<Delegation[]>([]);
  const [clients, setClients] = useState<DelegatedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"READ_EXPORT" | "FULL_BOOKKEEPING">("READ_EXPORT");
  const [expiresDays, setExpiresDays] = useState(365);

  const [review, setReview] = useState<ClientReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);

  async function openReview(orgId: string) {
    setReviewLoading(orgId);
    setToast(null);
    try {
      const data = await apiJson<{ review: ClientReview }>(`/api/v1/accountant/clients/${orgId}/review`);
      setReview(data.review);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Could not open client review" });
    } finally {
      setReviewLoading(null);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ grantedByMyOrg: Delegation[]; delegatedToMe: DelegatedClient[] }>(
        "/api/v1/accountant/delegations"
      );
      setGranted(data.grantedByMyOrg);
      setClients(data.delegatedToMe);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      await apiJson("/api/v1/accountant/delegations", {
        method: "POST",
        body: JSON.stringify({ accountantEmail: email, accountantName: name, scope, expiresDays }),
      });
      setEmail("");
      setName("");
      setToast({ kind: "success", text: "Time-bounded accountant delegation granted and logged in GoBD audit chain." });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Failed to grant delegation" });
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this external accountant's access immediately?")) return;
    await apiJson(`/api/v1/accountant/delegations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setToast({ kind: "success", text: "Delegation revoked." });
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accountant & Tax Advisor Workspace"
        subtitle="Manage time-bounded, revocable Steuerberater / Expert-comptable delegations with explicit consent scopes and multi-client visibility."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      <Card
        title={
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-600" /> Client Companies Delegated to Me ({clients.length})
          </span>
        }
        description="Shows only client organizations that granted your email active, non-expired consent."
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">Loading delegations…</div>
        ) : clients.length === 0 ? (
          <EmptyState
            title="No external client delegations assigned to your account"
            text="When a client company grants your email delegated access, their live compliance readiness, VAT totals, and GoBD chain status will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {clients.map((c) => (
              <div key={c.delegationId} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.orgName}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {c.countryCode} {c.vatId ? `· ${c.vatId}` : ""} · Scope: {c.scope}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> {c.gobdVerified ? "GoBD OK" : "Check"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-white p-2.5 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Invoiced</p>
                    <p className="font-mono font-bold text-slate-900">{formatMoney(c.totalInvoiced)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Open</p>
                    <p className="font-mono font-bold text-amber-700">{formatMoney(c.totalOutstanding)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">1st-Pass Valid</p>
                    <p className="font-mono font-bold text-emerald-700">{c.firstPassRate}%</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {c.outgoingCount} outgoing · {c.incomingCount} incoming · Consent valid until {c.expiresAt}
                </p>
                <button
                  type="button"
                  onClick={() => void openReview(c.orgId)}
                  disabled={reviewLoading !== null}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                >
                  {reviewLoading === c.orgId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                  Open review queue
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Grant Delegated Access to Your Tax Advisor"
        description="Your accountant can review compliance & download DATEV/FEC without owning your workspace. Revoke anytime."
      >
        <form onSubmit={grant} className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end">
          <label className={labelCls}>
            Accountant Email *
            <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="steuerberater@kanzlei.de" />
          </label>
          <label className={labelCls}>
            Firm / Advisor Name
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Kanzlei Weber & Partner" />
          </label>
          <label className={labelCls}>
            Permission Scope
            <select className={inputCls} value={scope} onChange={(e) => setScope(e.target.value as any)}>
              <option value="READ_EXPORT">Read & DATEV/FEC Export</option>
              <option value="FULL_BOOKKEEPING">Full Bookkeeping & Approvals</option>
            </select>
          </label>
          <label className={labelCls}>
            Consent Validity (Days)
            <input type="number" min={1} max={1095} className={`${inputCls} font-mono`} value={expiresDays} onChange={(e) => setExpiresDays(Number(e.target.value) || 365)} />
          </label>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Grant Access
          </button>
        </form>

        {granted.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Advisor</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Scope</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Expires</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {granted.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-slate-900">{d.accountantName || d.accountantEmail}</p>
                      <p className="text-[11px] text-slate-500">{d.accountantEmail}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono">{d.scope}</td>
                    <td className="px-4 py-2.5 font-mono">{d.expiresAt}</td>
                    <td className="px-4 py-2.5">
                      {d.revokedAt ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Revoked</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {!d.revokedAt && (
                        <button type="button" onClick={() => void revoke(d.id)} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline">
                          <Trash2 className="h-3.5 w-3.5" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setReview(null)}>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Review queue · {review.orgName}</h3>
                <p className="text-xs text-slate-500">
                  Scope: {review.scope} · Consent until {review.expiresAt} ·{" "}
                  <span className={review.gobdVerified ? "text-emerald-700" : "text-amber-700"}>
                    GoBD chain {review.gobdVerified ? "verified" : "needs check"}
                  </span>
                </p>
              </div>
              <button type="button" onClick={() => setReview(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
              Read-only, consent-scoped view. This access was recorded in {review.orgName}&apos;s audit chain.
            </p>

            {review.outgoing.length === 0 && review.incoming.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-bold text-slate-900">All clear — nothing needs attention.</p>
                <p className="text-xs text-slate-500">No blocked, overdue, duplicate or unapproved documents.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                <ReviewSection
                  title="Outgoing invoices needing attention"
                  icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                  items={review.outgoing}
                />
                <ReviewSection
                  title="Incoming supplier invoices needing attention"
                  icon={<Inbox className="h-4 w-4 text-brand-600" />}
                  items={review.incoming}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: ReviewItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800">
        {icon} {title} ({items.length})
      </p>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-900">{it.invoiceNumber}</span>
              <span className="font-mono font-bold text-slate-900">{formatMoney(it.grossAmount, it.currency)}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{it.counterparty} · {it.date}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {it.reasons.map((r, i) => (
                <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
