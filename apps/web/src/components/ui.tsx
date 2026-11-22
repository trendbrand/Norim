"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Clock, FileEdit, Send, XCircle } from "lucide-react";

export const inputCls =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 disabled:bg-slate-100";
export const labelCls = "block text-xs font-semibold text-navy-800";
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-accent-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const btnNavy =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-navy-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 transition-all duration-150 hover:border-navy-200 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition-all duration-150 hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            {title && <h2 className="text-sm font-bold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "success" | "error" | "info" | "warning"; children: React.ReactNode }) {
  const cls = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-navy-200 bg-navy-50 text-navy-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`animate-fade-in-up rounded-xl border px-4 py-3 text-xs font-semibold ${cls}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    DRAFT: { cls: "bg-amber-50 text-amber-800 border border-amber-200/80", icon: <FileEdit className="h-3.5 w-3.5" />, label: "Draft" },
    VALIDATED: { cls: "bg-emerald-50 text-emerald-800 border border-emerald-200/80", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Validated" },
    DELIVERED: { cls: "bg-sky-50 text-sky-800 border border-sky-200/80", icon: <Send className="h-3.5 w-3.5" />, label: "Sent" },
    SENT: { cls: "bg-sky-50 text-sky-800 border border-sky-200/80", icon: <Send className="h-3.5 w-3.5" />, label: "Sent" },
    PAID: { cls: "bg-emerald-100 text-emerald-800 border border-emerald-200", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Paid" },
    OVERDUE: { cls: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle className="h-3.5 w-3.5" />, label: "Overdue" },
    ACTION_REQUIRED: { cls: "bg-amber-100 text-amber-900 border border-amber-300", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Action required" },
  };
  const m = map[status] ?? { cls: "bg-slate-100 text-slate-700", icon: <Clock className="h-3.5 w-3.5" />, label: status };
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${m.cls}`}>
      {m.icon} {m.label}
    </span>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="skeleton-shimmer h-4 w-36 rounded-md" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="skeleton-shimmer h-3 rounded-md" style={{ width: `${92 - idx * 14}%` }} />
        ))}
      </div>
    </div>
  );
}

export function formatMoney(amount: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export const FORMAT_LABELS: Record<string, string> = {
  ZUGFERD_EN16931: "ZUGFeRD 2.3",
  FACTURX_EN16931: "Factur-X 1.07",
  XRECHNUNG_CII: "XRechnung CII",
  XRECHNUNG_UBL: "XRechnung UBL",
  PEPPOL_BIS_3: "Peppol BIS 3",
};

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-canvas px-6 py-12 text-center">
      <p className="text-sm font-bold text-navy-900">{title}</p>
      <p className="mt-1 max-w-md text-xs text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export async function apiJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  if (!res.ok) {
    const msg = data?.detail || data?.error || data?.title || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}
