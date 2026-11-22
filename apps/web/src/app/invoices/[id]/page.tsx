"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  FileCheck2,
  FileCode2,
  FileText,
  Loader2,
  Mail,
  Network,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import type { CanonicalInvoice, ValidationDiagnostic } from "@norminvoice/einvoice-core";
import {
  Alert,
  Card,
  FORMAT_LABELS,
  PageHeader,
  StatusBadge,
  apiJson,
  btnDanger,
  btnPrimary,
  btnSecondary,
  formatMoney,
  inputCls,
  labelCls,
} from "@/components/ui";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  typeCode: 380 | 381;
  precedingInvoiceNumber: string | null;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  buyerName: string;
  buyerCountry: string;
  buyerVatId: string | null;
  targetFormat: string;
  status: "DRAFT" | "VALIDATED" | "DELIVERED" | "ACTION_REQUIRED";
  validationPassed: boolean;
  diagnostics: ValidationDiagnostic[];
  sha256Xml: string;
  archiveLockedUntil: string;
  deliveredTo: string | null;
  deliveredAt: string | null;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  paidAmount: number;
  paidAt: string | null;
  approvalStatus: "NONE" | "APPROVED" | "REJECTED";
  accountingStatus: "UNPOSTED" | "EXPORTED";
  source: string;
  sourceRef: string;
  canonical: CanonicalInvoice;
}

interface AuditEvent {
  id: number;
  eventType: string;
  actorEmail: string;
  eventHash: string;
  prevHash: string;
  createdAt: string;
}

interface TransmissionJob {
  id: string;
  channel: string;
  recipient: string;
  status: "QUEUED" | "SENDING" | "SENT" | "FAILED" | "DEAD";
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  provider: string | null;
  providerRef: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [inv, setInv] = useState<InvoiceDetail | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [transmissions, setTransmissions] = useState<TransmissionJob[]>([]);
  const [epcQrDataUrl, setEpcQrDataUrl] = useState<string | null>(null);
  const [xmlPreview, setXmlPreview] = useState("");
  const [showXml, setShowXml] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Repair form state
  const [repairRef, setRepairRef] = useState("");
  const [repairVat, setRepairVat] = useState("");
  const [repairContactName, setRepairContactName] = useState("");
  const [repairContactPhone, setRepairContactPhone] = useState("");
  const [repairContactEmail, setRepairContactEmail] = useState("");

  // Email modal/inline state
  const [recipientEmail, setRecipientEmail] = useState("");

  // Credit note reason
  const [cnReason, setCnReason] = useState("");
  const [showCnBox, setShowCnBox] = useState(false);

  // Team comments (Module F13)
  const [comments, setComments] = useState<Array<{ id: string; authorEmail: string; body: string; createdAt: string }>>([]);
  const [commentInput, setCommentInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cmtData, txData] = await Promise.all([
        apiJson<{
          invoice: InvoiceDetail;
          auditEvents: AuditEvent[];
          epcQrDataUrl: string | null;
          xmlPreview: string;
        }>(`/api/v1/invoices/${id}`),
        apiJson<{ comments: Array<{ id: string; authorEmail: string; body: string; createdAt: string }> }>(
          `/api/v1/invoices/${id}/comments`
        ),
        apiJson<{ transmissions: TransmissionJob[] }>(`/api/v1/invoices/${id}/transmissions`),
      ]);
      setInv(data.invoice);
      setAuditEvents(data.auditEvents);
      setEpcQrDataUrl(data.epcQrDataUrl);
      setXmlPreview(data.xmlPreview);
      setComments(cmtData.comments);
      setTransmissions(txData.transmissions);
      setRepairRef(data.invoice.canonical.buyerReference || "04011000-1234512345-06");
      setRepairVat(data.invoice.canonical.buyer.vatId || "");
      setRepairContactName(data.invoice.canonical.seller.contact?.name || "Accounting");
      setRepairContactPhone(data.invoice.canonical.seller.contact?.phone || "+49 30 901820");
      setRepairContactEmail(
        data.invoice.canonical.seller.contact?.email || data.invoice.canonical.seller.electronicAddress || ""
      );
      setRecipientEmail(data.invoice.canonical.buyer.electronicAddress || "");
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Invoice not found" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRepair(e: React.FormEvent) {
    e.preventDefault();
    if (!inv) return;
    setBusy("repair");
    setToast(null);
    try {
      await apiJson("/api/v1/invoices", {
        method: "PATCH",
        body: JSON.stringify({
          id: inv.id,
          buyerReference: repairRef,
          buyerVatId: repairVat || undefined,
          sellerContactName: repairContactName,
          sellerContactPhone: repairContactPhone,
          sellerContactEmail: repairContactEmail,
        }),
      });
      setToast({ kind: "success", text: "Compliance fields patched and invoice re-validated." });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Patch failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleFinalizeDraft() {
    if (!inv) return;
    setBusy("finalize");
    setToast(null);
    try {
      await apiJson(`/api/v1/invoices/${inv.id}/finalize`, { method: "POST" });
      setToast({ kind: "success", text: "Draft finalized, assigned sequential number, and GoBD-archived." });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Finalize failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleDeleteDraft() {
    if (!inv || !confirm(`Permanently delete draft ${inv.invoiceNumber}?`)) return;
    setBusy("delete");
    try {
      await apiJson(`/api/v1/invoices/${inv.id}`, { method: "DELETE" });
      router.push("/invoices");
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Delete failed" });
      setBusy(null);
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!inv) return;
    setBusy("email");
    setToast(null);
    try {
      const r = await apiJson<{
        delivered: boolean;
        queued?: boolean;
        alreadySent?: boolean;
        to?: string;
        cc?: string | null;
        status?: string;
        nextAttemptAt?: string;
        note?: string;
      }>(`/api/v1/invoices/${inv.id}/send`, {
        method: "POST",
        body: JSON.stringify({ recipientEmail }),
      });
      if (r.delivered) {
        setToast({
          kind: "success",
          text: r.alreadySent
            ? `Already delivered to ${r.to} — no duplicate sent (idempotent).`
            : `E-invoice delivered to ${r.to}${r.cc ? ` (CC: ${r.cc})` : ""} and logged in GoBD audit chain.`,
        });
      } else {
        setToast({
          kind: "success",
          text:
            r.note ||
            `Delivery safely queued (${r.status}) — it will be retried automatically${r.nextAttemptAt ? ` (next ~${r.nextAttemptAt.slice(11, 16)} UTC)` : ""}.`,
        });
      }
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Email dispatch failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleSendPeppol() {
    if (!inv) return;
    setBusy("peppol");
    setToast(null);
    try {
      const r = await apiJson<{ delivered: boolean; status?: string; to?: string }>(
        `/api/v1/invoices/${inv.id}/send`,
        { method: "POST", body: JSON.stringify({ channel: "peppol" }) }
      );
      setToast({
        kind: "success",
        text: r.delivered
          ? `Transmitted via Peppol to ${r.to}.`
          : `Queued for Peppol delivery (${r.status}).`,
      });
    } catch (err) {
      // Honest failure (e.g. no certified Access Point configured) — surfaced, not hidden.
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Peppol delivery failed" });
    } finally {
      await load();
      setBusy(null);
    }
  }

  async function handleTogglePaid() {
    if (!inv) return;
    setBusy("paid");
    setToast(null);
    try {
      const nextStatus = inv.paymentStatus === "PAID" ? "UNPAID" : "PAID";
      await apiJson(`/api/v1/invoices/${inv.id}/paid`, {
        method: "POST",
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      setToast({ kind: "success", text: `Invoice marked as ${nextStatus} and logged in GoBD audit trail.` });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Payment status update failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleApproval(approvalStatus: "APPROVED" | "REJECTED") {
    if (!inv) return;
    setBusy("approve");
    try {
      await apiJson(`/api/v1/invoices/${inv.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approvalStatus }),
      });
      setToast({ kind: "success", text: `Invoice marked ${approvalStatus}.` });
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Approval failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!inv || !commentInput.trim()) return;
    setBusy("comment");
    try {
      await apiJson(`/api/v1/invoices/${inv.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: commentInput }),
      });
      setCommentInput("");
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleCreditNote() {
    if (!inv) return;
    setBusy("credit");
    setToast(null);
    try {
      const r = await apiJson<{ creditNote: { id: string; invoiceNumber: string } }>(
        `/api/v1/invoices/${inv.id}/credit-note`,
        {
          method: "POST",
          body: JSON.stringify({ reason: cnReason }),
        }
      );
      router.push(`/invoices/${r.creditNote.id}`);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Credit note creation failed" });
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading invoice…
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="space-y-4">
        <Alert kind="error">Invoice not found in your organization.</Alert>
        <Link href="/invoices" className={btnSecondary}>
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
      </div>
    );
  }

  const isUbl = inv.targetFormat === "XRECHNUNG_UBL" || inv.targetFormat === "PEPPOL_BIS_3";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/invoices" className="inline-flex items-center gap-1 hover:text-brand-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Invoices
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-800">{inv.invoiceNumber}</span>
      </div>

      <PageHeader
        title={
          <>
            {inv.typeCode === 381 ? "Credit Note" : "Invoice"}{" "}
            <span className="whitespace-nowrap">{inv.invoiceNumber}</span>
          </>
        }
        subtitle={`${FORMAT_LABELS[inv.targetFormat] ?? inv.targetFormat} · Issued ${inv.issueDate}${inv.precedingInvoiceNumber ? ` · References ${inv.precedingInvoiceNumber}` : ""}`}
        actions={
          <>
            <StatusBadge status={inv.status} />
            {inv.status === "DRAFT" && (
              <>
                <Link href={`/invoices/new?draft=${inv.id}`} className={btnSecondary}>
                  Edit draft
                </Link>
                <button type="button" disabled={busy !== null} onClick={() => void handleFinalizeDraft()} className={btnPrimary}>
                  {busy === "finalize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} Finalize & archive
                </button>
                <button type="button" disabled={busy !== null} onClick={() => void handleDeleteDraft()} className={btnDanger}>
                  <Trash2 className="h-4 w-4" /> Delete draft
                </button>
              </>
            )}
            {inv.status !== "DRAFT" && (
              <>
                {!isUbl && (
                  <a href={`/api/v1/invoices/${inv.id}/download?artifact=pdf`} className={btnPrimary}>
                    <FileText className="h-4 w-4" /> Download PDF/A-3
                  </a>
                )}
                <a href={`/api/v1/invoices/${inv.id}/download?artifact=xml`} className={btnSecondary}>
                  <FileCode2 className="h-4 w-4" /> Download XML
                </a>
                <a href={`/api/v1/invoices/${inv.id}/download?artifact=json`} className={btnSecondary}>
                  <Download className="h-4 w-4" /> JSON
                </a>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void handleTogglePaid()}
                  className={inv.paymentStatus === "PAID" ? btnSecondary : "inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"}
                >
                  <CheckCircle2 className="h-4 w-4" /> {inv.paymentStatus === "PAID" ? "Paid ✓ (Undo)" : "Mark as Paid"}
                </button>
                {inv.typeCode === 380 && (
                  <button type="button" onClick={() => setShowCnBox((v) => !v)} className={btnSecondary}>
                    <RotateCcw className="h-4 w-4" /> Issue Credit Note (381)
                  </button>
                )}
              </>
            )}
          </>
        }
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {/* Multi-Dimensional Status Strip (Master Plan Section 3.3) */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm sm:grid-cols-5">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Validation</p>
          <p className={`mt-0.5 font-bold ${inv.validationPassed ? "text-emerald-700" : "text-amber-700"}`}>
            {inv.validationPassed ? "EN 16931 Passed" : "Blocked / Issues"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Approval</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="font-bold text-slate-800">{inv.approvalStatus}</span>
            {inv.approvalStatus !== "APPROVED" && inv.status !== "DRAFT" && (
              <button type="button" onClick={() => void handleApproval("APPROVED")} className="text-[10px] font-bold text-brand-700 underline">
                Approve
              </button>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Delivery</p>
          <p className="mt-0.5 font-bold text-slate-800">{inv.deliveredTo ? "Delivered" : inv.status === "DRAFT" ? "Not sent" : "Ready"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Payment (Separate)</p>
          <p className={`mt-0.5 font-bold ${inv.paymentStatus === "PAID" ? "text-emerald-700" : inv.paymentStatus === "PARTIAL" ? "text-sky-700" : "text-amber-700"}`}>
            {inv.paymentStatus}{inv.paidAmount > 0 && inv.paymentStatus === "PARTIAL" ? ` (${formatMoney(inv.paidAmount, inv.currency)})` : ""}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Accounting</p>
          <p className="mt-0.5 font-bold text-slate-800">{inv.accountingStatus}</p>
        </div>
      </div>

      {showCnBox && (
        <Card
          title="Issue GoBD Credit Note (TypeCode 381)"
          description={`Creates a linked Stornorechnung referencing BT-25 = ${inv.invoiceNumber} using your credit note sequence.`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className={`${labelCls} flex-1`}>
              Reason (optional, included in BT-22 notes)
              <input
                className={inputCls}
                value={cnReason}
                onChange={(e) => setCnReason(e.target.value)}
                placeholder="e.g. Duplicate billing or customer refund"
              />
            </label>
            <button type="button" disabled={busy !== null} onClick={() => void handleCreditNote()} className={btnPrimary}>
              {busy === "credit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Confirm & issue credit note
            </button>
          </div>
        </Card>
      )}

      {inv.status === "ACTION_REQUIRED" && (
        <Card
          title={
            <span className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Compliance Repair Required (Blocked before sending)
            </span>
          }
          description="Fix the missing EN 16931 / XRechnung fields below and re-validate immediately."
        >
          <div className="mb-4 space-y-2">
            {inv.diagnostics.map((d, i) => (
              <div key={i} className="rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-950">
                <span className="font-mono font-bold text-red-700">{d.ruleId}</span> ({d.fieldBt}): {d.messageEn}
              </div>
            ))}
          </div>
          <form onSubmit={handleRepair} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className={labelCls}>
              Buyer Reference / Leitweg-ID (BT-10)
              <input className={`${inputCls} font-mono`} value={repairRef} onChange={(e) => setRepairRef(e.target.value)} />
            </label>
            <label className={labelCls}>
              Buyer EU VAT ID (BT-48)
              <input className={`${inputCls} font-mono uppercase`} value={repairVat} onChange={(e) => setRepairVat(e.target.value)} />
            </label>
            <label className={labelCls}>
              Seller Contact Name (BT-41)
              <input className={inputCls} value={repairContactName} onChange={(e) => setRepairContactName(e.target.value)} />
            </label>
            <label className={labelCls}>
              Seller Contact Phone (BT-42)
              <input className={inputCls} value={repairContactPhone} onChange={(e) => setRepairContactPhone(e.target.value)} />
            </label>
            <label className={labelCls}>
              Seller Contact Email (BT-43)
              <input type="email" className={inputCls} value={repairContactEmail} onChange={(e) => setRepairContactEmail(e.target.value)} />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={busy !== null} className={`${btnPrimary} w-full`}>
                {busy === "repair" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />} Patch & Re-Validate
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Invoice Preview */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Document Summary">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Seller (BG-4)</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{inv.canonical.seller.name}</p>
                <p className="text-xs text-slate-600">{inv.canonical.seller.address.street}</p>
                <p className="text-xs text-slate-600">
                  {inv.canonical.seller.address.postalCode} {inv.canonical.seller.address.city} ({inv.canonical.seller.address.countryCode})
                </p>
                {inv.canonical.seller.vatId && (
                  <p className="mt-1 font-mono text-xs text-slate-700">VAT: {inv.canonical.seller.vatId}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Buyer (BG-7)</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{inv.canonical.buyer.name}</p>
                <p className="text-xs text-slate-600">{inv.canonical.buyer.address.street}</p>
                <p className="text-xs text-slate-600">
                  {inv.canonical.buyer.address.postalCode} {inv.canonical.buyer.address.city} ({inv.canonical.buyer.address.countryCode})
                </p>
                {inv.canonical.buyer.vatId && (
                  <p className="mt-1 font-mono text-xs text-slate-700">VAT: {inv.canonical.buyer.vatId}</p>
                )}
                {inv.canonical.buyerReference && (
                  <p className="font-mono text-xs text-slate-700">BT-10: {inv.canonical.buyerReference}</p>
                )}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Item</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Qty</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Unit price</th>
                    <th className="px-4 py-2.5 text-right font-semibold">VAT</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Net total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inv.canonical.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{l.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{l.quantity} {l.unitCode}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{formatMoney(l.unitPrice, inv.currency)}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{l.vatCategory} {l.vatRate}%</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">
                        {formatMoney(l.lineNetAmount ?? l.quantity * l.unitPrice, inv.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <dl className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Net total (BT-109)</dt>
                  <dd className="font-mono font-semibold">{formatMoney(inv.netAmount, inv.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">VAT total (BT-110)</dt>
                  <dd className="font-mono font-semibold">{formatMoney(inv.taxAmount, inv.currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold">
                  <dt>Gross payable (BT-115)</dt>
                  <dd className="font-mono text-brand-700">{formatMoney(inv.grossAmount, inv.currency)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card
            title="Structured EN 16931 XML"
            actions={
              <button type="button" onClick={() => setShowXml((v) => !v)} className={btnSecondary}>
                <Code2 className="h-4 w-4" /> {showXml ? "Hide XML" : "Inspect XML"}
              </button>
            }
          >
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span>
                <strong className="text-slate-800">SHA-256:</strong>{" "}
                <code className="font-mono text-[11px]">{inv.sha256Xml}</code>
              </span>
              <span>
                <strong className="text-slate-800">GoBD WORM lock until:</strong>{" "}
                <span className="font-mono font-semibold text-emerald-700">{inv.archiveLockedUntil}</span>
              </span>
            </div>
            {showXml && (
              <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-emerald-300">
                {xmlPreview}
              </pre>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Email Dispatch, EPC QR, Per-Invoice GoBD Audit */}
        <div className="space-y-6">
          {inv.validationPassed && inv.status !== "DRAFT" && (
            <Card title="Send E-Invoice by Email" description="Attaches compliant PDF/A-3 + XML and CCs your accountant if configured.">
              <form onSubmit={handleSendEmail} className="space-y-3">
                <label className={labelCls}>
                  Recipient Email (BT-49)
                  <input
                    type="email"
                    required
                    className={inputCls}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="accounting@buyer.eu"
                  />
                </label>
                <button type="submit" disabled={busy !== null} className={`${btnPrimary} w-full`}>
                  {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send E-Invoice
                </button>
                {inv.deliveredTo && (
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Last sent to {inv.deliveredTo} ({inv.deliveredAt?.slice(0, 10)})
                  </p>
                )}
              </form>
            </Card>
          )}

          {inv.validationPassed &&
            inv.status !== "DRAFT" &&
            inv.canonical.buyer.electronicAddressScheme &&
            inv.canonical.buyer.electronicAddressScheme.toUpperCase() !== "EM" &&
            inv.canonical.buyer.electronicAddress && (
              <Card
                title={
                  <span className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-brand-600" /> Peppol Network Delivery
                  </span>
                }
                description="Send over the OpenPeppol four-corner network via a certified Access Point."
              >
                <p className="text-xs text-slate-600">
                  Recipient participant:{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {inv.canonical.buyer.electronicAddressScheme}::{inv.canonical.buyer.electronicAddress}
                  </span>
                </p>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void handleSendPeppol()}
                  className={`${btnSecondary} mt-3 w-full`}
                >
                  {busy === "peppol" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />} Send via
                  Peppol
                </button>
                <p className="mt-2 text-[11px] text-slate-400">
                  Requires a connected certified Access Point. Delivery status appears in the Transmission Outbox below.
                </p>
              </Card>
            )}

          {transmissions.length > 0 && (
            <Card
              title="Transmission Outbox"
              description="Durable, idempotent delivery jobs (ADR-004) — retried automatically, never double-sent."
            >
              <ol className="space-y-2.5">
                {transmissions.map((t) => {
                  const style =
                    t.status === "SENT"
                      ? { cls: "text-emerald-700", Icon: CheckCircle2 }
                      : t.status === "DEAD"
                        ? { cls: "text-red-700", Icon: XCircle }
                        : t.status === "SENDING"
                          ? { cls: "text-sky-700", Icon: Send }
                          : { cls: "text-amber-700", Icon: Clock };
                  const Icon = style.Icon;
                  return (
                    <li key={t.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 font-bold ${style.cls}`}>
                          <Icon className="h-3.5 w-3.5" /> {t.status}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-slate-400">{t.channel}</span>
                      </div>
                      <p className="mt-1 truncate text-slate-700">→ {t.recipient}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Attempt {t.attempts}/{t.maxAttempts}
                        {(t.status === "QUEUED" || t.status === "FAILED") && t.nextAttemptAt
                          ? ` · next retry ${t.nextAttemptAt.slice(0, 16).replace("T", " ")} UTC`
                          : ""}
                        {t.status === "SENT" && t.providerRef ? ` · ref ${t.providerRef}` : ""}
                      </p>
                      {t.lastError && t.status !== "SENT" && (
                        <p className="mt-1 rounded border border-red-100 bg-red-50/70 px-2 py-1 font-mono text-[10px] text-red-700">
                          {t.lastError}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Card>
          )}

          {epcQrDataUrl && (
            <Card title="EPC SEPA GiroCode QR" description="Scannable by EU banking apps (SCT).">
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={epcQrDataUrl} alt="EPC SEPA Payment QR Code" className="h-40 w-40 rounded-lg border border-slate-200 p-1" />
                <p className="mt-2 font-mono text-[11px] text-slate-600">{inv.canonical.payment.iban}</p>
              </div>
            </Card>
          )}

          <Card title="Team Collaboration & Notes" description="Immutable internal review thread (Master Plan F13).">
            <div className="space-y-2.5">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400">No internal comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{c.authorEmail}</span>
                      <span>{c.createdAt.slice(0, 16).replace("T", " ")}</span>
                    </div>
                    <p className="mt-1 text-slate-700">{c.body}</p>
                  </div>
                ))
              )}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add review note or @mention…"
                  className={`${inputCls} mt-0 text-xs`}
                />
                <button type="submit" disabled={busy !== null || !commentInput.trim()} className={btnSecondary}>
                  Post
                </button>
              </form>
            </div>
          </Card>

          <Card title="GoBD Audit Trail" description="Append-only SHA-256 hash-chained events for this document.">
            {auditEvents.length === 0 ? (
              <p className="text-xs text-slate-500">No audit events recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {auditEvents.map((ev) => (
                  <li key={ev.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-900">{ev.eventType}</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ev.actorEmail} · {ev.createdAt.slice(0, 19).replace("T", " ")}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-slate-400">SHA-256: {ev.eventHash}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
