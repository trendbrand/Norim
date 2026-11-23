"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  FilePlus2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  Alert,
  Card,
  EmptyState,
  FORMAT_LABELS,
  PageHeader,
  apiJson,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
  labelCls,
} from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { CUSTOMERS_STRINGS } from "@/lib/i18n";

interface Customer {
  id: string;
  legalName: string;
  vatId: string;
  vatStatus: "VERIFIED" | "PROVISIONAL" | "INVALID" | "UNCHECKED";
  vatCheckedAt: string | null;
  leitwegId: string;
  electronicAddress: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  defaultFormat: string;
  notes: string;
}

const EMPTY_FORM = {
  legalName: "",
  vatId: "",
  vatStatus: "UNCHECKED" as Customer["vatStatus"],
  leitwegId: "",
  electronicAddress: "",
  street: "",
  postalCode: "",
  city: "",
  countryCode: "DE",
  defaultFormat: "ZUGFERD_EN16931",
  notes: "",
};

export default function CustomersPage() {
  const { locale } = useLocale();
  const t = CUSTOMERS_STRINGS[locale];
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viesLoading, setViesLoading] = useState(false);
  const [viesNote, setViesNote] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const qs = q?.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const data = await apiJson<{ customers: Customer[] }>(`/api/v1/customers${qs}`);
      setCustomers(data.customers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(search), 220);
    return () => clearTimeout(t);
  }, [search, load]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setViesNote(null);
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditingId(c.id);
    setForm({
      legalName: c.legalName,
      vatId: c.vatId,
      vatStatus: c.vatStatus,
      leitwegId: c.leitwegId,
      electronicAddress: c.electronicAddress,
      street: c.street,
      postalCode: c.postalCode,
      city: c.city,
      countryCode: c.countryCode,
      defaultFormat: c.defaultFormat,
      notes: c.notes,
    });
    setViesNote(null);
    setShowForm(true);
  }

  async function verifyVies() {
    if (!form.vatId.trim()) return;
    setViesLoading(true);
    setViesNote(null);
    try {
      const r = await apiJson<{ status: Customer["vatStatus"]; traderName?: string; note?: string }>(
        "/api/v1/vat/verify",
        {
          method: "POST",
          body: JSON.stringify({ vatId: form.vatId, liveLookup: true }),
        }
      );
      setForm((prev) => ({
        ...prev,
        vatStatus: r.status,
        legalName: prev.legalName || r.traderName || prev.legalName,
      }));
      setViesNote(`${t.vatStatus(r.status)}${r.traderName ? ` · ${r.traderName}` : ""}${r.note ? ` (${r.note})` : ""}`);
    } catch (e) {
      setViesNote(e instanceof Error ? e.message : t.viesFailed);
    } finally {
      setViesLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      if (editingId) {
        await apiJson(`/api/v1/customers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...form,
            vatCheckedAt: form.vatStatus !== "UNCHECKED" ? new Date().toISOString() : null,
          }),
        });
        setToast({ kind: "success", text: t.toastUpdated(form.legalName) });
      } else {
        await apiJson("/api/v1/customers", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            vatCheckedAt: form.vatStatus !== "UNCHECKED" ? new Date().toISOString() : null,
          }),
        });
        setToast({ kind: "success", text: t.toastAdded(form.legalName) });
      }
      setShowForm(false);
      await load(search);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.toastSaveFailed });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Customer) {
    if (!confirm(t.deletePrompt(c.legalName))) return;
    try {
      await apiJson(`/api/v1/customers/${c.id}`, { method: "DELETE" });
      setToast({ kind: "success", text: t.toastRemoved(c.legalName) });
      await load(search);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.toastDeleteFailed });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <button type="button" onClick={openNew} className={btnPrimary}>
            <Plus className="h-4 w-4" /> {t.addCustomer}
          </button>
        }
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {showForm && (
        <Card
          title={editingId ? t.formEdit : t.formNew}
          actions={
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          }
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              {t.fLegalName}
              <input required className={inputCls} value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder="AlpenWerk Maschinenbau GmbH" />
            </label>
            <label className={labelCls}>
              {t.fVatId}
              <div className="flex gap-2">
                <input
                  className={`${inputCls} font-mono uppercase`}
                  value={form.vatId}
                  onChange={(e) => setForm({ ...form, vatId: e.target.value, vatStatus: "UNCHECKED" })}
                  placeholder="DE198765431"
                />
                <button type="button" disabled={viesLoading} onClick={() => void verifyVies()} className="mt-1 whitespace-nowrap rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  {viesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.verifyVies}
                </button>
              </div>
              {viesNote && <span className="mt-1 block text-[11px] font-semibold text-brand-700">{viesNote}</span>}
            </label>
            <label className={labelCls}>
              {t.fLeitweg}
              <input className={`${inputCls} font-mono`} value={form.leitwegId} onChange={(e) => setForm({ ...form, leitwegId: e.target.value })} placeholder="04011000-1234512345-06 (German B2G)" />
            </label>
            <label className={labelCls}>
              {t.fInvoiceEmail}
              <input type="email" className={inputCls} value={form.electronicAddress} onChange={(e) => setForm({ ...form, electronicAddress: e.target.value })} placeholder="rechnungen@buyer.de" />
            </label>
            <label className={labelCls}>
              {t.fDefaultFormat}
              <select className={inputCls} value={form.defaultFormat} onChange={(e) => setForm({ ...form, defaultFormat: e.target.value })}>
                <option value="ZUGFERD_EN16931">ZUGFeRD 2.3 (PDF + XML)</option>
                <option value="FACTURX_EN16931">Factur-X 1.07 (PDF + XML)</option>
                <option value="XRECHNUNG_CII">XRechnung 3.0.2 CII</option>
                <option value="XRECHNUNG_UBL">XRechnung 3.0.2 UBL</option>
                <option value="PEPPOL_BIS_3">Peppol BIS 3.0</option>
              </select>
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              {t.fStreet}
              <input className={inputCls} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label className={labelCls}>{t.fPostalCode}<input className={inputCls} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></label>
              <label className={labelCls}>{t.fCity}<input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
              <label className={labelCls}>{t.fCountry}<input maxLength={2} className={`${inputCls} font-mono uppercase`} value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })} /></label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>{t.cancel}</button>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {editingId ? t.updateCustomer : t.saveCustomer}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4 max-w-md">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={`${inputCls} pl-9`} placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">{t.loading}</div>
        ) : customers.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            text={t.emptyText}
            action={
              <button type="button" onClick={openNew} className={btnPrimary}>
                <Plus className="h-4 w-4" /> {t.addFirst}
              </button>
            }
          />
        ) : (
          <div className="-mx-6 -mb-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">{t.thCompany}</th>
                  <th className="px-6 py-3 text-left font-semibold">{t.thVat}</th>
                  <th className="px-6 py-3 text-left font-semibold">{t.thRouting}</th>
                  <th className="px-6 py-3 text-right font-semibold">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-bold text-slate-900">{c.legalName}</p>
                      <p className="text-[11px] text-slate-500">
                        {c.postalCode} {c.city} ({c.countryCode}){c.electronicAddress ? ` · ${c.electronicAddress}` : ""}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-mono text-xs text-slate-800">{c.vatId || "—"}</p>
                      {c.vatId && (
                        <span
                          className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.vatStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.vatStatus === "PROVISIONAL"
                                ? "bg-amber-100 text-amber-800"
                                : c.vatStatus === "INVALID"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" /> {t.vatStatus(c.vatStatus)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-semibold text-slate-700">{FORMAT_LABELS[c.defaultFormat] ?? c.defaultFormat}</p>
                      {c.leitwegId && <p className="font-mono text-[11px] text-slate-500">BT-10: {c.leitwegId}</p>}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/invoices/new?customerId=${c.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-700"
                        >
                          <FilePlus2 className="h-3.5 w-3.5" /> {t.invoiceBtn}
                        </Link>
                        <button type="button" onClick={() => openEdit(c)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100" title={t.editTitle}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void handleDelete(c)} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50" title={t.deleteTitle}>
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
