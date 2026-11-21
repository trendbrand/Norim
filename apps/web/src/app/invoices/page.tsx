"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePlus2, Search } from "lucide-react";
import { Card, EmptyState, FORMAT_LABELS, PageHeader, StatusBadge, apiJson, btnPrimary, formatMoney, inputCls } from "@/components/ui";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  typeCode: number;
  issueDate: string;
  dueDate: string | null;
  buyerName: string;
  buyerCountry: string;
  buyerVatId: string | null;
  grossAmount: number;
  currency: string;
  targetFormat: string;
  status: string;
  source: string;
}

const TABS = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "VALIDATED", label: "Validated" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "ACTION_REQUIRED", label: "Action required" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const qs = new URLSearchParams();
      if (status !== "ALL") qs.set("status", status);
      if (search.trim()) qs.set("search", search.trim());
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      void apiJson<{ invoices: InvoiceRow[] }>(`/api/v1/invoices?${qs.toString()}`)
        .then((d) => setRows(d.invoices))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [status, search, from, to]);

  const total = rows
    .filter((r) => r.status !== "DRAFT" && r.status !== "ACTION_REQUIRED")
    .reduce((s, r) => s + (r.typeCode === 381 ? -Math.abs(r.grossAmount) : r.grossAmount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Every invoice and credit note in your workspace. Finalized documents are immutable and archived (GoBD)."
        actions={<Link href="/invoices/new" className={btnPrimary}><FilePlus2 className="h-4 w-4" /> New invoice</Link>}
      />

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatus(t.key)}
                className={`rounded-lg px-3 py-1.5 ${status === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputCls} pl-9`} placeholder="Search number, customer or VAT ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
            <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
          </div>
        </div>
      </Card>

      <Card
        title={`${rows.length} document(s)`}
        description={rows.length ? `Total invoiced (net of credit notes): ${formatMoney(total)}` : undefined}
      >
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No invoices match" text="Adjust your filters or create a new invoice." action={<Link href="/invoices/new" className={btnPrimary}>Create invoice</Link>} />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Number</th>
                  <th className="px-6 py-3 text-left font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold">Format</th>
                  <th className="px-6 py-3 text-left font-semibold">Source</th>
                  <th className="px-6 py-3 text-right font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const isUbl = r.targetFormat === "XRECHNUNG_UBL" || r.targetFormat === "PEPPOL_BIS_3";
                  return (
                    <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/invoices/${r.id}`)}>
                      <td className="px-6 py-3">
                        <p className="font-mono text-xs font-bold text-slate-900">
                          {r.invoiceNumber}
                          {r.typeCode === 381 && <span className="ml-1.5 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">CREDIT</span>}
                        </p>
                        <p className="text-[11px] text-slate-500">{r.issueDate}{r.dueDate ? ` · due ${r.dueDate}` : ""}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs font-semibold text-slate-900">{r.buyerName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{r.buyerCountry}{r.buyerVatId ? ` · ${r.buyerVatId}` : ""}</p>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">{FORMAT_LABELS[r.targetFormat] ?? r.targetFormat}</td>
                      <td className="px-6 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">{r.source}</span></td>
                      <td className="px-6 py-3 text-right font-mono text-xs font-bold tabular-money">
                        {r.typeCode === 381 ? "−" : ""}{formatMoney(Math.abs(r.grossAmount), r.currency)}
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {r.status !== "DRAFT" && (
                          <div className="inline-flex gap-1.5">
                            {!isUbl && (
                              <a href={`/api/v1/invoices/${r.id}/download?artifact=pdf`} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-50">PDF</a>
                            )}
                            <a href={`/api/v1/invoices/${r.id}/download?artifact=xml`} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100">XML</a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
