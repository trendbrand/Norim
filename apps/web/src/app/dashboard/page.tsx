"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileArchive,
  FilePlus2,
  Loader2,
  ShoppingCart,
  UploadCloud,
  Users,
  Webhook,
} from "lucide-react";
import { Alert, Card, EmptyState, FORMAT_LABELS, PageHeader, StatusBadge, apiJson, btnPrimary, btnSecondary, formatMoney } from "@/components/ui";
import { useAppSession } from "@/components/AppShell";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  typeCode: number;
  issueDate: string;
  buyerName: string;
  buyerCountry: string;
  grossAmount: number;
  currency: string;
  targetFormat: string;
  status: string;
  source: string;
  createdAt: string;
  diagnostics: Array<{ ruleId: string; titleEn?: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, reload } = useAppSession();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<"stripe" | "woocommerce" | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [inv, cust] = await Promise.all([
        apiJson<{ invoices: InvoiceRow[] }>("/api/v1/invoices"),
        apiJson<{ customers: unknown[] }>("/api/v1/customers"),
      ]);
      setInvoices(inv.invoices);
      setCustomerCount(cust.customers.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function simulate(provider: "stripe" | "woocommerce") {
    setSimulating(provider);
    setToast(null);
    try {
      const r = await apiJson<{ invoice: InvoiceRow }>("/api/v1/integrations", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      setToast({ kind: "success", text: `Test ${provider} event processed → ${r.invoice.invoiceNumber} (${r.invoice.status}).` });
      await Promise.all([refresh(), reload()]);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Simulation failed" });
    } finally {
      setSimulating(null);
    }
  }

  const finalized = invoices.filter((i) => i.status !== "DRAFT");
  const actionItems = invoices.filter((i) => i.status === "ACTION_REQUIRED");
  const drafts = invoices.filter((i) => i.status === "DRAFT");
  const ym = new Date().toISOString().slice(0, 7);
  const revenueThisMonth = finalized
    .filter((i) => i.issueDate.startsWith(ym) && i.status !== "ACTION_REQUIRED")
    .reduce((s, i) => s + (i.typeCode === 381 ? -Math.abs(i.grossAmount) : i.grossAmount), 0);

  const isEmpty = !loading && invoices.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good to see you${session ? `, ${session.user.fullName.split(" ")[0]}` : ""}`}
        subtitle={session ? `${session.user.orgName} · overview of your e-invoicing activity` : undefined}
        actions={
          <>
            <Link href="/customers" className={btnSecondary}><Users className="h-4 w-4" /> Customers</Link>
            <Link href="/invoices/new" className={btnPrimary}><FilePlus2 className="h-4 w-4" /> New invoice</Link>
          </>
        }
      />

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Invoiced this month", value: formatMoney(revenueThisMonth), hint: "Net of credit notes" },
          { label: "Finalized invoices", value: String(finalized.length), hint: `${drafts.length} draft(s)` },
          { label: "Need attention", value: String(actionItems.length), hint: "Blocked before sending", warn: actionItems.length > 0 },
          { label: "Customers", value: String(customerCount), hint: "Saved buyers" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className={`mt-2 text-2xl font-extrabold tabular-money ${k.warn ? "text-amber-600" : "text-slate-900"}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : k.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
          </div>
        ))}
      </div>

      {isEmpty && (
        <Card title="Get started" description="Your workspace is empty. Pick one of these to issue your first compliant e-invoice.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { href: "/customers", icon: Users, title: "1. Add a customer", text: "Save buyer address & VAT ID once." },
              { href: "/invoices/new", icon: FilePlus2, title: "2. Create invoice", text: "ZUGFeRD, Factur-X, XRechnung, Peppol." },
              { href: "/batch", icon: UploadCloud, title: "Import CSV", text: "Convert up to 200 invoices at once." },
              { href: "/settings?tab=integrations", icon: Webhook, title: "Connect Stripe / Woo", text: "Fully automatic e-invoicing." },
            ].map((c) => (
              <Link key={c.title} href={c.href} className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40">
                <c.icon className="h-5 w-5 text-brand-600" />
                <p className="mt-2 text-sm font-bold text-slate-900">{c.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{c.text}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {actionItems.length > 0 && (
        <Card
          title={<span className="flex items-center gap-2 text-amber-800"><AlertTriangle className="h-4 w-4" /> Invoices that need your attention</span>}
          description="These were stopped before delivery because mandatory EN 16931 / XRechnung fields are missing. Open one to fix it in seconds."
        >
          <ul className="divide-y divide-slate-100">
            {actionItems.slice(0, 6).map((inv) => (
              <li key={inv.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-sm font-bold text-slate-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">
                    {inv.buyerName} · {inv.diagnostics.filter((d) => d.ruleId).map((d) => d.ruleId).slice(0, 3).join(", ")}
                  </p>
                </div>
                <Link href={`/invoices/${inv.id}`} className={btnSecondary}>Fix now <ArrowRight className="h-3.5 w-3.5" /></Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Recent invoices"
          actions={<Link href="/invoices" className="text-xs font-bold text-brand-700 hover:underline">View all →</Link>}
        >
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
          ) : invoices.length === 0 ? (
            <EmptyState title="No invoices yet" text="Create your first invoice or connect Stripe / WooCommerce." action={<Link href="/invoices/new" className={btnPrimary}>Create invoice</Link>} />
          ) : (
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {invoices.slice(0, 8).map((inv) => (
                    <tr key={inv.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/invoices/${inv.id}`)}>
                      <td className="px-6 py-3">
                        <p className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</p>
                        <p className="text-[11px] text-slate-500">{inv.issueDate} · {FORMAT_LABELS[inv.targetFormat] ?? inv.targetFormat}</p>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700">{inv.buyerName}</td>
                      <td className="px-6 py-3 text-right font-mono text-xs font-bold tabular-money">
                        {inv.typeCode === 381 ? "−" : ""}{formatMoney(Math.abs(inv.grossAmount), inv.currency)}
                      </td>
                      <td className="px-6 py-3 text-right"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Test your integrations" description="Sends a realistic test event into YOUR workspace only (counts toward quota).">
            <div className="space-y-2">
              <button type="button" disabled={simulating !== null} onClick={() => void simulate("stripe")} className={`${btnSecondary} w-full`}>
                {simulating === "stripe" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Webhook className="h-4 w-4" />} Send test Stripe invoice
              </button>
              <button type="button" disabled={simulating !== null} onClick={() => void simulate("woocommerce")} className={`${btnSecondary} w-full`}>
                {simulating === "woocommerce" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Send test WooCommerce order
              </button>
              <Link href="/settings?tab=integrations" className="block pt-1 text-center text-xs font-semibold text-brand-700 hover:underline">
                Configure webhooks →
              </Link>
            </div>
          </Card>

          <Card title="Accountant exports">
            <div className="space-y-2 text-xs">
              <Link href="/exports" className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 font-semibold text-slate-800 hover:bg-slate-50">
                <span className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-brand-600" /> DATEV, FEC & archive ZIP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Every action is SHA-256 hash-chained (GoBD).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
