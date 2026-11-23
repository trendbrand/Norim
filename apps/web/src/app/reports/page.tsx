"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Card, PageHeader, apiJson, btnSecondary, formatMoney } from "@/components/ui";

interface AnalyticsReport {
  generatedAt: string;
  kpis: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    firstPassValidationRate: number;
    deliveryRate: number;
    outgoingCount: number;
    incomingCount: number;
    payablesUnpaid: number;
    payablesPendingApproval: number;
  };
  ageing: { current: number; days1to30: number; days31to60: number; days60plus: number };
  vatSummary: Array<{ category: string; rate: number; netTotal: number; taxTotal: number }>;
  byCountry: Array<{ country: string; count: number; grossTotal: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiJson<AnalyticsReport>("/api/v1/reports")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Computing real-time financial & compliance analytics…
      </div>
    );
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial, Receivables Ageing & VAT Analytics"
        subtitle="100% live metrics computed directly from your organization's GoBD-archived invoices and incoming payables."
        actions={
          <>
            <a href="/api/v1/reports/export?format=csv" className={btnSecondary}>
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </a>
            <a href="/api/v1/reports/export?format=json" className={btnSecondary}>
              <Download className="h-4 w-4" /> Export JSON
            </a>
            <Link href="/exports" className={btnSecondary}>
              <Download className="h-4 w-4" /> DATEV / FEC
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Invoiced (Valid)", value: formatMoney(k.totalInvoiced), sub: `${k.outgoingCount} finalized docs` },
          { label: "Collected (Paid)", value: formatMoney(k.totalCollected), sub: "Settled invoices", color: "text-emerald-700" },
          { label: "Outstanding Receivables", value: formatMoney(k.totalOutstanding), sub: "Awaiting payment", color: k.totalOutstanding > 0 ? "text-amber-600" : "text-slate-900" },
          { label: "First-Pass Compliance Rate", value: `${k.firstPassValidationRate}%`, sub: `${k.deliveryRate}% delivered to buyers`, color: "text-brand-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{card.label}</p>
            <p className={`mt-2 text-2xl font-extrabold tabular-money ${card.color || "text-slate-900"}`}>{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Receivables Overdue Ageing" description="Unpaid outgoing invoices grouped by days past due date (BT-9).">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Current / Not Due", val: data.ageing.current, cls: "bg-slate-50 text-slate-900" },
              { label: "1–30 Days Overdue", val: data.ageing.days1to30, cls: "bg-amber-50 text-amber-800" },
              { label: "31–60 Days Overdue", val: data.ageing.days31to60, cls: "bg-orange-50 text-orange-800" },
              { label: "60+ Days Overdue", val: data.ageing.days60plus, cls: "bg-red-50 text-red-800" },
            ].map((b) => (
              <div key={b.label} className={`rounded-xl border border-slate-200 p-3.5 ${b.cls}`}>
                <p className="text-[11px] font-semibold opacity-80">{b.label}</p>
                <p className="mt-1.5 font-mono text-sm font-extrabold tabular-money">{formatMoney(b.val)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
            <strong>Incoming Supplier Payables:</strong> {formatMoney(k.payablesUnpaid)} unpaid across {k.incomingCount} archived supplier document(s) ({k.payablesPendingApproval} pending approval).
          </div>
        </Card>

        <Card title="Revenue & Volume by Buyer Country">
          {data.byCountry.length === 0 ? (
            <p className="text-xs text-slate-500">No finalized invoices yet.</p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {data.byCountry.map((c) => (
                <div key={c.country} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                  <span className="font-mono font-bold text-slate-900">{c.country}</span>
                  <span className="text-slate-500">{c.count} invoice(s)</span>
                  <span className="font-mono font-bold tabular-money text-slate-900">{formatMoney(c.grossTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-600" /> VAT Breakdown Summary (UStVA / Steuerberater Overview)
          </span>
        }
      >
        {data.vatSummary.length === 0 ? (
          <p className="text-xs text-slate-500">No VAT breakdown data yet.</p>
        ) : (
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">EN 16931 Category</th>
                  <th className="px-6 py-3 text-right font-semibold">Rate</th>
                  <th className="px-6 py-3 text-right font-semibold">Net Base (BT-116)</th>
                  <th className="px-6 py-3 text-right font-semibold">VAT Amount (BT-117)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.vatSummary.map((v) => (
                  <tr key={`${v.category}:${v.rate}`}>
                    <td className="px-6 py-3 font-mono font-bold text-slate-900">{v.category}</td>
                    <td className="px-6 py-3 text-right font-mono">{v.rate}%</td>
                    <td className="px-6 py-3 text-right font-mono tabular-money">{formatMoney(v.netTotal)}</td>
                    <td className="px-6 py-3 text-right font-mono font-bold tabular-money text-brand-700">{formatMoney(v.taxTotal)}</td>
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
