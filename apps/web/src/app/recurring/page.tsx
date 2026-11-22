"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Pause, Play, Plus, Repeat, Trash2, X } from "lucide-react";
import {
  Alert,
  Card,
  EmptyState,
  FORMAT_LABELS,
  PageHeader,
  apiJson,
  btnPrimary,
  btnSecondary,
  formatMoney,
  inputCls,
  labelCls,
} from "@/components/ui";

interface Schedule {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  nextRunDate: string;
  lastRunAt: string | null;
  active: boolean;
  profile: string;
  currency: string;
  lineName: string;
  quantity: number;
  unitCode: string;
  unitPrice: number;
  vatCategory: string;
  vatRate: number;
  runsCount: number;
}

interface Customer {
  id: string;
  legalName: string;
}

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    customerId: "",
    frequency: "MONTHLY" as "MONTHLY" | "QUARTERLY" | "YEARLY",
    nextRunDate: new Date().toISOString().slice(0, 10),
    lineName: "Monthly SaaS Retainer",
    quantity: 1,
    unitCode: "MON",
    unitPrice: 299,
    vatCategory: "S",
    vatRate: 19,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        apiJson<{ schedules: Schedule[] }>("/api/v1/recurring"),
        apiJson<{ customers: Customer[] }>("/api/v1/customers"),
      ]);
      setSchedules(s.schedules);
      setCustomers(c.customers);
      if (c.customers.length > 0 && !form.customerId) {
        setForm((p) => ({ ...p, customerId: c.customers[0]!.id }));
      }
    } finally {
      setLoading(false);
    }
  }, [form.customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusyId("create");
    setToast(null);
    try {
      await apiJson("/api/v1/recurring", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setToast({ kind: "success", text: `Created recurring schedule "${form.title}".` });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Failed to create schedule" });
    } finally {
      setBusyId(null);
    }
  }

  async function runNow(s: Schedule) {
    setBusyId(s.id);
    setToast(null);
    try {
      const res = await apiJson<{ invoice: { id: string; invoiceNumber: string } }>(`/api/v1/recurring/${s.id}`, {
        method: "POST",
      });
      setToast({ kind: "success", text: `Issued recurring invoice ${res.invoice.invoiceNumber}!` });
      await load();
      router.push(`/invoices/${res.invoice.id}`);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Run failed" });
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(s: Schedule) {
    setBusyId(s.id);
    await apiJson(`/api/v1/recurring/${s.id}`, { method: "PATCH", body: JSON.stringify({ active: !s.active }) });
    await load();
    setBusyId(null);
  }

  async function remove(s: Schedule) {
    if (!confirm(`Delete recurring schedule "${s.title}"?`)) return;
    await apiJson(`/api/v1/recurring/${s.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring E-Invoices"
        subtitle="Automate monthly, quarterly, or annual EN 16931 retainers with sequential numbering and GoBD archiving."
        actions={
          <button type="button" onClick={() => setShowForm(true)} className={btnPrimary}>
            <Plus className="h-4 w-4" /> New recurring schedule
          </button>
        }
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {showForm && (
        <Card
          title="New Recurring Schedule"
          actions={
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          }
        >
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Schedule Title *
              <input required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="AlpenWerk Monthly Support" />
            </label>
            <label className={labelCls}>
              Customer *
              <select required className={inputCls} value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
              </select>
            </label>
            <label className={labelCls}>
              Frequency
              <select className={inputCls} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
            <label className={labelCls}>
              Next Issue Date
              <input type="date" required className={inputCls} value={form.nextRunDate} onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })} />
            </label>
            <label className={labelCls}>
              Line Item Description *
              <input required className={inputCls} value={form.lineName} onChange={(e) => setForm({ ...form, lineName: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className={labelCls}>Qty<input type="number" className={`${inputCls} font-mono`} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })} /></label>
              <label className={labelCls}>Net Price (€)<input type="number" step="0.01" className={`${inputCls} font-mono`} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })} /></label>
              <label className={labelCls}>VAT %<input type="number" className={`${inputCls} font-mono`} value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: Number(e.target.value) || 0 })} /></label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={busyId !== null} className={btnPrimary}>
                <CheckCircle2 className="h-4 w-4" /> Save schedule
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Active & Paused Schedules (${schedules.length})`}>
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading schedules…</div>
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No recurring schedules yet"
            text="Set up a monthly retainer or subscription schedule to generate compliant e-invoices in one click."
            action={<button type="button" onClick={() => setShowForm(true)} className={btnPrimary}><Repeat className="h-4 w-4" /> Create first schedule</button>}
          />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Schedule / Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Cadence & Next Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount (Net)</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900">{s.title}</p>
                      <p className="text-[11px] text-slate-500">{s.customerName} · {FORMAT_LABELS[s.profile] ?? s.profile}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-mono font-semibold text-slate-800">{s.frequency} · Next {s.nextRunDate}</p>
                      <p className="text-[11px] text-slate-400">Issued {s.runsCount} time(s)</p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold tabular-money">
                      {formatMoney(s.quantity * s.unitPrice, s.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {s.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button type="button" disabled={busyId === s.id} onClick={() => void runNow(s)} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                          {busyId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Issue now
                        </button>
                        <button type="button" onClick={() => void toggle(s)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100" title={s.active ? "Pause" : "Resume"}>
                          {s.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" onClick={() => void remove(s)} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
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
