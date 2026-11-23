"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Crown,
  Eye,
  FilePlus2,
  FileText,
  Inbox,
  Loader2,
  Package,
  Rocket,
  Send,
  ShoppingCart,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import {
  Alert,
  Card,
  EmptyState,
  FORMAT_LABELS,
  SkeletonCard,
  StatusBadge,
  apiJson,
  btnPrimary,
  btnSecondary,
  formatMoney,
} from "@/components/ui";
import { useAppSession } from "@/components/AppShell";
import { useLocale } from "@/components/LocaleProvider";
import { DASHBOARD_STRINGS, type DashboardStrings } from "@/lib/i18n";

interface DashboardPayload {
  days: number;
  kpis: {
    totalInvoices: number;
    sentCount: number;
    paidCount: number;
    overdueCount: number;
    draftCount: number;
    actionRequiredCount: number;
    totalCustomers: number;
    totalProducts: number;
    invoicedThisMonth: number;
  };
  trendSeries: Array<{ date: string; label: string; created: number; sent: number; paid: number }>;
  statusBreakdown: { total: number; paid: number; sent: number; draft: number; overdue: number };
  recentInvoices: Array<{
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
    displayStatus: string;
    diagnostics: Array<{ ruleId: string }>;
  }>;
  actionRequired: Array<{
    id: string;
    invoiceNumber: string;
    buyerName: string;
    diagnostics: Array<{ ruleId: string }>;
  }>;
  getStarted: Array<{ id: string; label: string; done: boolean; href: string }>;
  subscription: {
    planTier: string;
    monthlyQuota: number;
    trialActive: boolean;
    trialDaysRemaining: number;
    trialEndsAt: string | null;
  };
  quota: { tier: string; monthlyLimit: number; usedThisMonth: number; remaining: number };
}

function InvoiceTrendChart({
  series,
  t,
}: {
  series: DashboardPayload["trendSeries"];
  t: DashboardStrings;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const w = 520;
  const h = 190;
  const padL = 28;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const maxVal = Math.max(
    4,
    ...series.map((d) => Math.max(d.created, d.sent, d.paid))
  );

  const xAt = (idx: number) =>
    padL + (series.length <= 1 ? innerW / 2 : (idx / (series.length - 1)) * innerW);
  const yAt = (v: number) => padT + innerH - (v / maxVal) * innerH;

  const pathFor = (key: "created" | "sent" | "paid") =>
    series.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(d[key]).toFixed(1)}`).join(" ");

  const areaFor = (key: "created" | "sent" | "paid") => {
    if (series.length === 0) return "";
    return `${pathFor(key)} L${xAt(series.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${xAt(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
  };

  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  const activePt = hovered !== null ? series[hovered] : series[series.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-4 font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {t.legendCreated}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent-500" /> {t.legendSent}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> {t.legendPaid}</span>
        </div>
        {activePt && (
          <span className="rounded-lg bg-canvas px-2.5 py-1 font-mono text-[11px] font-bold text-navy-900">
            {activePt.label}: {activePt.created} {t.legendCreated.toLowerCase()} · {activePt.sent} {t.legendSent.toLowerCase()} · {activePt.paid} {t.legendPaid.toLowerCase()}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48 overflow-visible" role="img" aria-label="Invoice trend chart">
        <defs>
          <linearGradient id="trendBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FD7C05" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FD7C05" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={yAt(t)} x2={w - padR} y2={yAt(t)} stroke="#E2E8F0" strokeDasharray="3 3" />
            <text x={padL - 8} y={yAt(t) + 3} textAnchor="end" className="fill-slate-400 text-[10px] font-mono">
              {t}
            </text>
          </g>
        ))}

        <path d={areaFor("created")} fill="url(#trendBlue)" />
        <path d={areaFor("sent")} fill="url(#trendOrange)" />
        <path d={pathFor("created")} fill="none" stroke="#2563EB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor("sent")} fill="none" stroke="#FD7C05" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor("paid")} fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

        {series.map((d, i) => (
          <g key={d.date} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <circle cx={xAt(i)} cy={yAt(d.created)} r={hovered === i ? 5 : 3.2} fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
            <circle cx={xAt(i)} cy={yAt(d.sent)} r={hovered === i ? 5 : 3.2} fill="#FD7C05" stroke="#fff" strokeWidth="1.5" />
            <circle cx={xAt(i)} cy={yAt(d.paid)} r={hovered === i ? 5 : 3.2} fill="#16A34A" stroke="#fff" strokeWidth="1.5" />
            <text x={xAt(i)} y={h - 6} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {d.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusDonutChart({ breakdown, t }: { breakdown: DashboardPayload["statusBreakdown"]; t: DashboardStrings }) {
  const total = breakdown.total;
  const segments = [
    { label: t.statusPaid, count: breakdown.paid, color: "#16A34A" },
    { label: t.statusSent, count: breakdown.sent, color: "#2563EB" },
    { label: t.statusDraft, count: breakdown.draft, color: "#FD7C05" },
    { label: t.statusOverdue, count: breakdown.overdue, color: "#DC2626" },
  ];

  const r = 46;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="Invoice status breakdown">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#E2E8F0" strokeWidth="14" />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.count <= 0) return null;
              const len = (seg.count / total) * circ;
              const dash = `${len} ${circ - len}`;
              const curOffset = -offset;
              offset += len;
              return (
                <circle
                  key={seg.label}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={dash}
                  strokeDashoffset={curOffset}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-navy-900 tabular-money">{total}</span>
          <span className="text-[10px] font-semibold text-slate-500">{t.invoicesWord}</span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-2 text-xs">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          return (
            <li key={seg.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold text-navy-800">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label}
              </span>
              <span className="font-mono text-xs font-bold text-navy-900 tabular-money">
                {seg.count} <span className="font-normal text-slate-400">{pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { reload } = useAppSession();
  const { locale } = useLocale();
  const t = DASHBOARD_STRINGS[locale];
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<"stripe" | "woocommerce" | "shopify" | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const refresh = useCallback(async (windowDays = days) => {
    setLoading(true);
    try {
      const res = await apiJson<DashboardPayload>(`/api/v1/dashboard?days=${windowDays}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void refresh(days);
  }, [days, refresh]);

  async function simulate(provider: "stripe" | "woocommerce" | "shopify") {
    setSimulating(provider);
    setToast(null);
    try {
      const r = await apiJson<{ invoice: { invoiceNumber: string; status: string } }>("/api/v1/integrations", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      setToast({ kind: "success", text: t.toastOk(provider, r.invoice.invoiceNumber, r.invoice.status) });
      await Promise.all([refresh(days), reload()]);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : t.toastFail });
    } finally {
      setSimulating(null);
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><SkeletonCard lines={5} /></div>
          <SkeletonCard lines={5} />
        </div>
      </div>
    );
  }

  const k = data?.kpis ?? {
    totalInvoices: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0,
    draftCount: 0,
    actionRequiredCount: 0,
    totalCustomers: 0,
    totalProducts: 0,
    invoicedThisMonth: 0,
  };
  const sub = data?.subscription;
  const quota = data?.quota;
  const isPaidTier = Boolean(sub && ["solo", "business", "agency"].includes(sub.planTier));
  const completedSteps = (data?.getStarted || []).filter((s) => s.done).length;
  const trialPct = sub?.trialActive
    ? Math.max(8, Math.min(100, Math.round(((15 - (sub.trialDaysRemaining || 0)) / 15) * 100)))
    : quota
      ? Math.min(100, Math.round((quota.usedThisMonth / Math.max(1, quota.monthlyLimit)) * 100))
      : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {/* 1. Approved 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t.kpiTotal,
            value: String(k.totalInvoices),
            hint: t.kpiTotalHint(formatMoney(k.invoicedThisMonth)),
            icon: FileText,
            iconCls: "bg-blue-50 text-blue-600",
          },
          {
            label: t.kpiSent,
            value: String(k.sentCount),
            hint: t.kpiSentHint(k.draftCount, k.totalCustomers),
            icon: Send,
            iconCls: "bg-emerald-50 text-emerald-600",
          },
          {
            label: t.kpiPaid,
            value: String(k.paidCount),
            hint: t.kpiPaidHint,
            icon: CheckCircle2,
            iconCls: "bg-accent-50 text-accent-600",
          },
          {
            label: t.kpiOverdue,
            value: String(k.overdueCount),
            hint: k.overdueCount > 0 ? t.kpiOverdueDue : t.kpiOverdueClear,
            icon: Clock,
            iconCls: k.overdueCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600",
            danger: k.overdueCount > 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:shadow-card-hover"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconCls}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
              <p className={`mt-0.5 text-2xl font-extrabold tabular-money ${card.danger ? "text-red-700" : "text-navy-900"}`}>
                {card.value}
              </p>
              <p className="truncate text-[11px] text-slate-400">{card.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action-Required Alert (Preserved Real Validation Halt Queue) */}
      {data && data.actionRequired.length > 0 && (
        <Card
          title={
            <span className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" /> {t.attentionTitle(data.actionRequired.length)}
            </span>
          }
          description={t.attentionDesc}
        >
          <ul className="divide-y divide-slate-100">
            {data.actionRequired.map((inv) => (
              <li key={inv.id} className="flex flex-col justify-between gap-2 py-2.5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-xs font-bold text-navy-900">{inv.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-500">
                    {inv.buyerName} · {inv.diagnostics.map((d) => d.ruleId).slice(0, 3).join(", ")}
                  </p>
                </div>
                <Link href={`/invoices/${inv.id}`} className={btnSecondary}>
                  {t.fixNow} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 2. Middle Analytics Row: Invoice Trend + Invoice Status Donut + Your Plan Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card
          className="lg:col-span-5"
          title={t.trendTitle}
          description={t.trendDesc}
          actions={
            <select
              aria-label={t.trendTitle}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-canvas px-2.5 py-1 text-xs font-bold text-navy-900"
            >
              <option value={7}>{t.tfLast(7)}</option>
              <option value={14}>{t.tfLast(14)}</option>
              <option value={30}>{t.tfLast(30)}</option>
              <option value={90}>{t.tfLast(90)}</option>
            </select>
          }
        >
          {data && <InvoiceTrendChart series={data.trendSeries} t={t} />}
        </Card>

        <Card
          className="lg:col-span-4"
          title={t.statusTitle}
          description={t.statusDesc}
        >
          {data && <StatusDonutChart breakdown={data.statusBreakdown} t={t} />}
        </Card>

        <Card
          className="lg:col-span-3"
          title={
            <span className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-accent-500" /> {t.yourPlan}
            </span>
          }
        >
          <div className="space-y-3">
            <div>
              <p className="text-lg font-extrabold capitalize text-navy-900">
                {sub?.trialActive ? t.freeTrial : `${(sub?.planTier || "free").charAt(0).toUpperCase() + (sub?.planTier || "free").slice(1)} ${t.planWord}`}
              </p>
              <p className="text-xs font-semibold text-accent-700">
                {sub?.trialActive
                  ? t.daysRemaining(sub.trialDaysRemaining ?? 0)
                  : t.invoicesUsed(quota?.usedThisMonth ?? 0, quota?.monthlyLimit ?? 5)}
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${trialPct}%` }} />
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {t.upToInvoices(quota?.monthlyLimit ?? 15)}
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {t.enGoBD}
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {isPaidTier ? t.activeSub : t.noCard}
              </li>
            </ul>

            <Link
              href="/settings?tab=billing"
              className={`${btnPrimary} w-full py-2.5`}
            >
              {isPaidTier ? t.manageSub : t.upgradeSoloPrice}
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. Lower Row: Recent Invoices + Right Rail (Quick Actions, Get Started, Webhook Tests) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card
          className="lg:col-span-8"
          title={t.recentTitle}
          description={t.recentDesc}
          actions={
            <Link href="/invoices" className="text-xs font-extrabold text-accent-700 hover:underline">
              {t.viewAll}
            </Link>
          }
        >
          {!data || data.recentInvoices.length === 0 ? (
            <EmptyState
              title={t.emptyTitle}
              text={t.emptyText}
              action={
                <Link href="/invoices/new" className={btnPrimary}>
                  <FilePlus2 className="h-4 w-4" /> {t.createFirst}
                </Link>
              }
            />
          ) : (
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="border-b border-slate-100 bg-canvas text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">{t.thInvoiceNo}</th>
                    <th className="px-4 py-3 text-left">{t.thCustomer}</th>
                    <th className="px-4 py-3 text-left">{t.thDate}</th>
                    <th className="px-4 py-3 text-right">{t.thAmount}</th>
                    <th className="px-4 py-3 text-right">{t.thStatus}</th>
                    <th className="px-6 py-3 text-right">{t.thView}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="cursor-pointer transition hover:bg-canvas"
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-mono font-bold text-navy-900">{inv.invoiceNumber}</p>
                        <p className="text-[10.5px] text-slate-400">
                          {FORMAT_LABELS[inv.targetFormat] ?? inv.targetFormat}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-navy-900">{inv.buyerName}</span>
                        <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                          {inv.buyerCountry}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-navy-900 tabular-money">
                        {inv.typeCode === 381 ? "−" : ""}
                        {formatMoney(Math.abs(inv.grossAmount), inv.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <StatusBadge status={inv.displayStatus} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-900">
                          <Eye className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-4">
          {/* Quick Actions 2x2 Grid (Matches Approved Design) */}
          <Card
            title={
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent-500" /> {t.quickActions}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { href: "/invoices/new", icon: FilePlus2, label: t.qaCreate, cls: "bg-accent-50 text-accent-600" },
                { href: "/inbox", icon: Inbox, label: t.qaInbox, cls: "bg-blue-50 text-blue-600" },
                { href: "/customers", icon: Users, label: t.qaCustomer, cls: "bg-emerald-50 text-emerald-600" },
                { href: "/catalog", icon: Package, label: t.qaProduct, cls: "bg-navy-50 text-navy-800" },
              ].map((qa) => (
                <Link
                  key={qa.label}
                  href={qa.href}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-canvas p-3.5 text-center transition hover:border-accent-400 hover:bg-white hover:shadow-card"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${qa.cls}`}>
                    <qa.icon className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-navy-900">{qa.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Real Get Started Progress Checklist (Matches Approved Design) */}
          <Card
            title={
              <span className="flex items-center gap-1.5">
                <Rocket className="h-4 w-4 text-accent-500" /> {t.getStarted(completedSteps, data?.getStarted.length ?? 4)}
              </span>
            }
          >
            <ul className="space-y-2.5 text-xs">
              {(data?.getStarted || []).map((step) => (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-canvas"
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className={step.done ? "font-semibold text-navy-900" : "font-medium text-slate-600"}>
                      {step.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Preserved Integration Webhook Tests */}
          <Card title={t.testIntegrations} description={t.testIntegrationsDesc}>
            <div className="space-y-2">
              <button
                type="button"
                disabled={simulating !== null}
                onClick={() => void simulate("stripe")}
                className={`${btnSecondary} w-full`}
              >
                {simulating === "stripe" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Webhook className="h-4 w-4 text-accent-500" />}
                {t.testStripe}
              </button>
              <button
                type="button"
                disabled={simulating !== null}
                onClick={() => void simulate("woocommerce")}
                className={`${btnSecondary} w-full`}
              >
                {simulating === "woocommerce" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4 text-accent-500" />}
                {t.testWoo}
              </button>
              <button
                type="button"
                disabled={simulating !== null}
                onClick={() => void simulate("shopify")}
                className={`${btnSecondary} w-full`}
              >
                {simulating === "shopify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4 text-accent-500" />}
                {t.testShopify}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Bottom Solo Upgrade Promo Strip (Hidden automatically when already on paid tier) */}
      {!isPaidTier && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-base font-extrabold">{t.promoTitle}</p>
            <p className="mt-1 text-xs text-navy-200">{t.promoText}</p>
            <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] font-semibold text-navy-100">
              {t.promoBullets.map((b) => (
                <span key={b}>✓ {b}</span>
              ))}
            </div>
          </div>
          <Link
            href="/settings?tab=billing"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-accent-600"
          >
            <Crown className="h-4 w-4" /> {t.promoCta}
          </Link>
        </div>
      )}
    </div>
  );
}
