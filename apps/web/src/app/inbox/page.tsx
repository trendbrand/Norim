"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Inbox, Loader2, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { Alert, Card, EmptyState, PageHeader, apiJson, btnSecondary, formatMoney } from "@/components/ui";

interface IncomingInvoice {
  id: string;
  filename: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  sellerName: string;
  sellerVatId: string | null;
  sellerCountry: string;
  currency: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  detectedStandard: string;
  validationPassed: boolean;
  paymentStatus: "UNPAID" | "PAID";
  paidAt: string | null;
  sha256Xml: string;
  archiveLockedUntil: string;
}

export default function IncomingInboxPage() {
  const [items, setItems] = useState<IncomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ incoming: IncomingInvoice[] }>("/api/v1/inbox");
      setItems(data.incoming);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/v1/inbox", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setToast({
        kind: "success",
        text: `Archived supplier invoice ${data.incoming.invoiceNumber} from ${data.incoming.sellerName} (${data.incoming.detectedStandard}).`,
      });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Failed to archive supplier invoice" });
    } finally {
      setUploading(false);
    }
  }

  async function togglePaid(item: IncomingInvoice) {
    const next = item.paymentStatus === "PAID" ? "UNPAID" : "PAID";
    try {
      await apiJson(`/api/v1/inbox/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: next }),
      });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Update failed" });
    }
  }

  const unpaidTotal = items.filter((i) => i.paymentStatus === "UNPAID").reduce((s, i) => s + i.grossAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Supplier E-Invoice Inbox (Eingangsrechnungen)"
        subtitle="Fulfill the 2025 German B2B E-Rechnungspflicht: receive, validate, read, and GoBD-archive ZUGFeRD, Factur-X, and XRechnung supplier invoices."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Archived Supplier Docs</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Open Payables (Unpaid)</p>
          <p className="mt-2 text-2xl font-extrabold tabular-money text-amber-600">{formatMoney(unpaidTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">EN 16931 Validated</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            {items.filter((i) => i.validationPassed).length} / {items.length}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-brand-400 hover:bg-brand-50/20">
        <input
          type="file"
          accept=".pdf,.xml,application/pdf,application/xml,text/xml"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFileUpload(f);
            e.target.value = "";
          }}
        />
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-brand-600" /> : <UploadCloud className="h-8 w-8 text-brand-600" />}
        <p className="mt-3 text-sm font-bold text-slate-900">
          {uploading ? "Extracting XML, validating EN 16931 & GoBD-archiving…" : "Drop or Upload Supplier E-Invoice (.pdf or .xml)"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Automatically extracts ZUGFeRD 2.3 / Factur-X / XRechnung 3.0.2 CII & UBL, checks compliance, and locks SHA-256 hash for 8–10 years.
        </p>
      </label>

      <Card title="Archived Incoming Invoices">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading inbox…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Your incoming inbox is empty"
            text="Upload any supplier's ZUGFeRD PDF or XRechnung XML above to validate and archive it."
          />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Invoice / File</th>
                  <th className="px-5 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-5 py-3 text-left font-semibold">Standard & Check</th>
                  <th className="px-5 py-3 text-right font-semibold">Gross</th>
                  <th className="px-5 py-3 text-left font-semibold">Payment</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-mono font-bold text-slate-900">{it.invoiceNumber}</p>
                      <p className="text-[11px] text-slate-500">{it.issueDate} · {it.filename}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{it.sellerName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{it.sellerCountry}{it.sellerVatId ? ` · ${it.sellerVatId}` : ""}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-700">{it.detectedStandard}</p>
                      {it.validationPassed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" /> EN 16931 Valid · Locked until {it.archiveLockedUntil}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                          <XCircle className="h-3.5 w-3.5" /> Validation Warnings
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold tabular-money text-slate-900">
                      {formatMoney(it.grossAmount, it.currency)}
                    </td>
                    <td className="px-5 py-3">
                      {it.paymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          <Clock className="h-3 w-3" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" onClick={() => void togglePaid(it)} className={btnSecondary}>
                        <Inbox className="h-3.5 w-3.5" /> {it.paymentStatus === "PAID" ? "Mark Unpaid" : "Mark Paid"}
                      </button>
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
