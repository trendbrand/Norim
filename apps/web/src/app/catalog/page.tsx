"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Edit3, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  Alert,
  Card,
  EmptyState,
  PageHeader,
  apiJson,
  btnPrimary,
  btnSecondary,
  formatMoney,
  inputCls,
  labelCls,
} from "@/components/ui";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitCode: string;
  unitPrice: number;
  vatCategory: string;
  vatRate: number;
}

const EMPTY = {
  sku: "",
  name: "",
  description: "",
  unitCode: "HUR",
  unitPrice: 120,
  vatCategory: "S",
  vatRate: 19,
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ products: Product[] }>("/api/v1/catalog");
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description,
      unitCode: p.unitCode,
      unitPrice: p.unitPrice,
      vatCategory: p.vatCategory,
      vatRate: p.vatRate,
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      if (editingId) {
        await apiJson(`/api/v1/catalog/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
        setToast({ kind: "success", text: `Updated "${form.name}".` });
      } else {
        await apiJson("/api/v1/catalog", { method: "POST", body: JSON.stringify(form) });
        setToast({ kind: "success", text: `Added "${form.name}" to your catalog.` });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}" from catalog?`)) return;
    await apiJson(`/api/v1/catalog/${p.id}`, { method: "DELETE" });
    setToast({ kind: "success", text: `Removed "${p.name}".` });
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Service Rates Catalog"
        subtitle="Save reusable services, hourly rates, and SaaS SKUs to insert them into invoices with one click."
        actions={
          <button type="button" onClick={openNew} className={btnPrimary}>
            <Plus className="h-4 w-4" /> Add item
          </button>
        }
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {showForm && (
        <Card
          title={editingId ? "Edit catalog item" : "New catalog item"}
          actions={
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          }
        >
          <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Item / Service Name *
              <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Senior Engineering Consulting" />
            </label>
            <label className={labelCls}>
              SKU / Code
              <input className={`${inputCls} font-mono uppercase`} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="CONS-01" />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Description
              <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label className={labelCls}>
                Unit (UN/ECE)
                <select className={inputCls} value={form.unitCode} onChange={(e) => setForm({ ...form, unitCode: e.target.value })}>
                  <option value="HUR">Hour (HUR)</option>
                  <option value="DAY">Day (DAY)</option>
                  <option value="MON">Month (MON)</option>
                  <option value="H87">Piece (H87)</option>
                  <option value="C62">Unit (C62)</option>
                </select>
              </label>
              <label className={labelCls}>
                Net Unit Price (€)
                <input type="number" step="0.01" className={`${inputCls} font-mono`} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })} />
              </label>
              <label className={labelCls}>
                Default VAT
                <select
                  className={inputCls}
                  value={`${form.vatCategory}:${form.vatRate}`}
                  onChange={(e) => {
                    const [cat, rate] = e.target.value.split(":");
                    setForm({ ...form, vatCategory: cat!, vatRate: Number(rate) });
                  }}
                >
                  <option value="S:19">19% (DE)</option>
                  <option value="S:7">7% (DE)</option>
                  <option value="S:20">20% (FR/AT)</option>
                  <option value="S:21">21% (BE/NL)</option>
                  <option value="AE:0">0% Reverse Charge</option>
                  <option value="E:0">0% Exempt (§19)</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save item
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Saved Items (${products.length})`}>
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading catalog…</div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products or rates saved yet"
            text="Add your recurring services, hourly rates, or SKUs to speed up invoicing."
            action={<button type="button" onClick={openNew} className={btnPrimary}><Plus className="h-4 w-4" /> Add first item</button>}
          />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">SKU / Item</th>
                  <th className="px-6 py-3 text-left font-semibold">Unit</th>
                  <th className="px-6 py-3 text-right font-semibold">Net Price</th>
                  <th className="px-6 py-3 text-right font-semibold">VAT</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-bold text-slate-900">
                        {p.sku && <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{p.sku}</span>}
                        {p.name}
                      </p>
                      {p.description && <p className="text-[11px] text-slate-500">{p.description}</p>}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">{p.unitCode}</td>
                    <td className="px-6 py-3 text-right font-mono font-bold tabular-money">{formatMoney(p.unitPrice)}</td>
                    <td className="px-6 py-3 text-right font-mono text-slate-700">{p.vatCategory} {p.vatRate}%</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button type="button" onClick={() => openEdit(p)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => void remove(p)} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
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
