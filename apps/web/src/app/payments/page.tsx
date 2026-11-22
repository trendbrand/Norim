"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, CreditCard, Loader2, Plus } from "lucide-react";
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

interface ReceivableRow {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  grossAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  deliveryStatus: string;
}

interface PaymentEntry {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
  valueDate: string;
  recordedBy: string;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<ReceivableRow[]>([]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("SEPA_TRANSFER");
  const [reference, setReference] = useState("");
  const [valueDate, setValueDate] = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ invoices: ReceivableRow[]; payments: PaymentEntry[] }>("/api/v1/payments");
      setInvoices(data.invoices);
      setPayments(data.payments);
      const firstOpen = data.invoices.find((i) => i.paymentStatus !== "PAID");
      if (firstOpen && !selectedInvoiceId) {
        setSelectedInvoiceId(firstOpen.id);
        setAmount(String(firstOpen.balanceDue));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedInvoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoiceId || !amount) return;
    setSaving(true);
    setToast(null);
    try {
      await apiJson("/api/v1/payments", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          amount: Number(amount),
          method,
          reference,
          valueDate,
        }),
      });
      setToast({ kind: "success", text: "Payment recorded and reconciled against invoice balance (GoBD logged)." });
      setReference("");
      await load();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Payment failed" });
    } finally {
      setSaving(false);
    }
  }

  const openTotal = invoices.reduce((s, i) => s + i.balanceDue, 0);
  const paidTotal = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const openInvoices = invoices.filter((i) => i.paymentStatus !== "PAID");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Receivables Reconciliation"
        subtitle="Payment state is tracked independently from e-invoice delivery. Record full or partial SEPA transfers and monitor open balances."
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Collected</p>
          <p className="mt-2 text-2xl font-extrabold tabular-money text-emerald-700">{formatMoney(paidTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Open Balance Due</p>
          <p className="mt-2 text-2xl font-extrabold tabular-money text-amber-600">{formatMoney(openTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Recorded Settlements</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{payments.length}</p>
        </div>
      </div>

      {openInvoices.length > 0 && (
        <Card title="Record Full or Partial Payment" description="Automatically updates invoice payment status (UNPAID -> PARTIAL -> PAID).">
          <form onSubmit={recordPayment} className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end">
            <label className={`${labelCls} sm:col-span-2`}>
              Open Invoice
              <select
                className={inputCls}
                value={selectedInvoiceId}
                onChange={(e) => {
                  setSelectedInvoiceId(e.target.value);
                  const found = invoices.find((x) => x.id === e.target.value);
                  if (found) setAmount(String(found.balanceDue));
                }}
              >
                {openInvoices.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} — {i.buyerName} (Due: {formatMoney(i.balanceDue, i.currency)})
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Amount (€)
              <input type="number" step="0.01" required className={`${inputCls} font-mono`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className={labelCls}>
              Method
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="SEPA_TRANSFER">SEPA Bank Transfer</option>
                <option value="SEPA_DEBIT">SEPA Direct Debit</option>
                <option value="STRIPE_CARD">Stripe / Card</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Record Payment
            </button>
            <label className={`${labelCls} sm:col-span-3`}>
              Bank Remittance Reference (optional)
              <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. SEPA-20261122-991" />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Value Date
              <input type="date" className={inputCls} value={valueDate} onChange={(e) => setValueDate(e.target.value)} />
            </label>
          </form>
        </Card>
      )}

      <Card title="Receivables Ledger">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading receivables…</div>
        ) : invoices.length === 0 ? (
          <EmptyState title="No finalized invoices yet" text="Finalized invoices will appear here for payment reconciliation." />
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Invoice</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-right font-semibold">Gross</th>
                  <th className="px-5 py-3 text-right font-semibold">Paid</th>
                  <th className="px-5 py-3 text-right font-semibold">Balance Due</th>
                  <th className="px-5 py-3 text-left font-semibold">Payment State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${i.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                        {i.invoiceNumber}
                      </Link>
                      <p className="text-[11px] text-slate-400">Due: {i.dueDate || i.issueDate}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{i.buyerName}</td>
                    <td className="px-5 py-3 text-right font-mono">{formatMoney(i.grossAmount, i.currency)}</td>
                    <td className="px-5 py-3 text-right font-mono text-emerald-700">{formatMoney(i.paidAmount, i.currency)}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold">{formatMoney(i.balanceDue, i.currency)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          i.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : i.paymentStatus === "PARTIAL"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {i.paymentStatus === "PAID" ? <CheckCircle2 className="h-3 w-3" /> : i.paymentStatus === "PARTIAL" ? <CreditCard className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {i.paymentStatus}
                      </span>
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
