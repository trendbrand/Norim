"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  Eye,
  FileCode2,
  Loader2,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import type { CanonicalInvoice } from "@norminvoice/einvoice-core";
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
  approvalStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
  poReference: string | null;
  isDuplicate: boolean;
  hasOriginalXml: boolean;
  sha256Xml: string;
  archiveLockedUntil: string;
  canonical: CanonicalInvoice;
}

export default function IncomingInboxPage() {
  const [items, setItems] = useState<IncomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<IncomingInvoice | null>(null);
  const [rawXml, setRawXml] = useState<string | null>(null);
  const [rawXmlLoading, setRawXmlLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function openPreview(it: IncomingInvoice) {
    setRawXml(null);
    setPreviewItem(it);
  }

  async function loadRawXml(id: string) {
    setRawXmlLoading(true);
    try {
      const res = await fetch(`/api/v1/inbox/${id}/download?artifact=xml`);
      if (!res.ok) throw new Error("Could not load original XML");
      setRawXml(await res.text());
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Could not load original XML" });
    } finally {
      setRawXmlLoading(false);
    }
  }

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
        text: `Archived ${data.incoming.invoiceNumber} from ${data.incoming.sellerName}${data.incoming.isDuplicate ? " (⚠ Duplicate detected!)" : ""}.`,
      });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Failed to archive supplier invoice" });
    } finally {
      setUploading(false);
    }
  }

  async function patchIncoming(id: string, patch: { paymentStatus?: "PAID" | "UNPAID"; approvalStatus?: "APPROVED" | "REJECTED" }) {
    try {
      await apiJson(`/api/v1/inbox/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Update failed" });
    }
  }

  const unpaidTotal = items.filter((i) => i.paymentStatus === "UNPAID" && i.approvalStatus !== "REJECTED").reduce((s, i) => s + i.grossAmount, 0);
  const pendingApproval = items.filter((i) => i.approvalStatus === "PENDING_REVIEW").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligent Incoming Supplier Inbox (Eingangsrechnungen)"
        subtitle="Receive, validate, detect duplicates, match PO numbers, approve, and GoBD-archive ZUGFeRD, Factur-X, and XRechnung supplier invoices."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Archived Docs</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Pending Approval</p>
          <p className={`mt-2 text-2xl font-extrabold ${pendingApproval > 0 ? "text-amber-600" : "text-slate-900"}`}>{pendingApproval}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Open Payables</p>
          <p className="mt-2 text-2xl font-extrabold tabular-money text-brand-700">{formatMoney(unpaidTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Duplicates Flagged</p>
          <p className="mt-2 text-2xl font-extrabold text-red-700">{items.filter((i) => i.isDuplicate).length}</p>
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-7 text-center transition hover:border-brand-400 hover:bg-brand-50/20">
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
        {uploading ? <Loader2 className="h-7 w-7 animate-spin text-brand-600" /> : <UploadCloud className="h-7 w-7 text-brand-600" />}
        <p className="mt-2.5 text-sm font-bold text-slate-900">
          {uploading ? "Extracting XML, checking duplicates & GoBD-archiving…" : "Drop or Upload Supplier E-Invoice (.pdf or .xml)"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Automatic duplicate detection, EN 16931 validation, PO extraction (BT-13), and 8–10 year GoBD SHA-256 lock.
        </p>
      </label>

      <Card title="Supplier Invoice Queue">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading inbox…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Your incoming inbox is empty" text="Upload any supplier's ZUGFeRD PDF or XRechnung XML above." />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Invoice / PO</th>
                  <th className="px-5 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-5 py-3 text-left font-semibold">Compliance & Approval</th>
                  <th className="px-5 py-3 text-right font-semibold">Gross</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{it.invoiceNumber}</span>
                        {it.isDuplicate && (
                          <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            <AlertTriangle className="h-3 w-3" /> DUPLICATE
                          </span>
                        )}
                        {it.poReference && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                            PO: {it.poReference}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{it.issueDate} · {it.detectedStandard}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{it.sellerName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{it.sellerCountry}{it.sellerVatId ? ` · ${it.sellerVatId}` : ""}</p>
                    </td>
                    <td className="px-5 py-3 space-y-1">
                      <div>
                        {it.validationPassed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> EN 16931 Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> Issues Found
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            it.approvalStatus === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : it.approvalStatus === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {it.approvalStatus.replace("_", " ")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            it.paymentStatus === "PAID" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {it.paymentStatus === "PAID" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                          {it.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold tabular-money text-slate-900">
                      {formatMoney(it.grossAmount, it.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1">
                        <button type="button" onClick={() => openPreview(it)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100" title="Preview">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <a href={`/api/v1/inbox/${it.id}/download?artifact=xml`} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100" title="Download original XML">
                          <FileCode2 className="h-3.5 w-3.5" />
                        </a>
                        {it.approvalStatus !== "APPROVED" && (
                          <button type="button" onClick={() => void patchIncoming(it.id, { approvalStatus: "APPROVED" })} className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100" title="Approve">
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {it.approvalStatus !== "REJECTED" && (
                          <button type="button" onClick={() => void patchIncoming(it.id, { approvalStatus: "REJECTED" })} className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100" title="Reject">
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => void patchIncoming(it.id, { paymentStatus: it.paymentStatus === "PAID" ? "UNPAID" : "PAID" })} className={btnSecondary}>
                          {it.paymentStatus === "PAID" ? "Unpaid" : "Mark Paid"}
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

      {/* Readable Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setPreviewItem(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Supplier Invoice {previewItem.invoiceNumber}</h3>
                <p className="text-xs text-slate-500">
                  {previewItem.sellerName} · {previewItem.detectedStandard} · GoBD Locked until {previewItem.archiveLockedUntil}
                </p>
              </div>
              <button type="button" onClick={() => setPreviewItem(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-slate-100 py-3">
              <button
                type="button"
                onClick={() => (rawXml ? setRawXml(null) : void loadRawXml(previewItem.id))}
                className={btnSecondary}
              >
                {rawXmlLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
                {rawXml ? "Hide original XML" : "View original XML"}
              </button>
              <a href={`/api/v1/inbox/${previewItem.id}/download?artifact=xml`} className={btnSecondary}>
                <FileCode2 className="h-4 w-4" /> Download XML
              </a>
              <a href={`/api/v1/inbox/${previewItem.id}/download?artifact=json`} className={btnSecondary}>
                <Download className="h-4 w-4" /> Download JSON
              </a>
              <span className="ml-auto text-[11px] text-slate-400">
                {previewItem.hasOriginalXml ? "Original supplier bytes preserved" : "Re-serialized view"}
              </span>
            </div>

            {rawXml !== null && (
              <div>
                <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase text-slate-400">
                  Original received XML (as sent by supplier)
                </p>
                <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-emerald-300">
                  {rawXml}
                </pre>
              </div>
            )}

            <p className="mb-1.5 mt-4 text-[11px] font-bold uppercase text-slate-400">Parsed line items (EN 16931)</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Line Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewItem.canonical.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">{l.name}</td>
                      <td className="px-3 py-2 text-right font-mono">{l.quantity} {l.unitCode}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatMoney(l.unitPrice, previewItem.currency)}</td>
                      <td className="px-3 py-2 text-right font-mono">{l.vatCategory} {l.vatRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="text-slate-500">SHA-256 Digest</p>
                <p className="font-mono text-[11px] text-slate-700">{previewItem.sha256Xml.slice(0, 32)}…</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Gross Payable</p>
                <p className="font-mono text-base font-extrabold text-brand-700">{formatMoney(previewItem.grossAmount, previewItem.currency)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
