"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileArchive,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  Users,
  X,
} from "lucide-react";

export interface AppSession {
  user: { id: string; orgId: string; email: string; fullName: string; orgName: string; role: string };
  onboardingCompleted: boolean;
  isSuperAdmin?: boolean;
  subscription: { planTier: string; monthlyQuota: number; status: string };
  quota: { tier: string; monthlyLimit: number; usedThisMonth: number; remaining: number; exceeded: boolean };
}

const SessionCtx = createContext<{ session: AppSession | null; reload: () => Promise<void> }>({
  session: null,
  reload: async () => {},
});

export function useAppSession() {
  return useContext(SessionCtx);
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Outgoing Invoices", icon: FileText },
  { href: "/inbox", label: "Incoming Inbox", icon: Inbox },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/catalog", label: "Products & Rates", icon: Package },
  { href: "/batch", label: "Batch CSV", icon: UploadCloud },
  { href: "/exports", label: "Exports & Audit", icon: FileArchive },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOnboarding = pathname.startsWith("/onboarding");

  const reload = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    if (!data.authenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setSession(data as AppSession);
    if (!data.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
    void reload().finally(() => setLoading(false));
  }, [reload]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading secure workspace…
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <SessionCtx.Provider value={{ session, reload }}>
        <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">NI</div>
                <span className="text-sm font-bold text-slate-900">NormInvoice</span>
              </div>
              <button type="button" onClick={() => void logout()} className="text-xs font-semibold text-slate-500 hover:text-red-600">
                Sign out
              </button>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </SessionCtx.Provider>
    );
  }

  const q = session.quota;
  const pct = Math.min(100, Math.round((q.usedThisMonth / Math.max(1, q.monthlyLimit)) * 100));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">NI</div>
        <div>
          <span className="block text-sm font-bold tracking-tight text-white">NormInvoice</span>
          <span className="block max-w-[150px] truncate text-[11px] text-slate-400">{session.user.orgName}</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {session.isSuperAdmin && (
          <Link
            href="/admin"
            className={`mt-3 flex items-center gap-3 rounded-lg border border-amber-500/30 px-3 py-2.5 text-sm font-semibold transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-amber-500/20 text-amber-300"
                : "text-amber-300/80 hover:bg-amber-500/10 hover:text-amber-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Super-Admin Panel
          </Link>
        )}
      </nav>

      <div className="space-y-3 px-4 pb-5">
        <Link href="/settings?tab=billing" className="block rounded-xl bg-slate-800/70 p-3.5 hover:bg-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <span>{q.tier} plan</span>
            <span className={q.exceeded ? "text-amber-400" : "text-slate-300"}>
              {q.usedThisMonth}/{q.monthlyLimit}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div className={`h-full rounded-full ${pct >= 90 ? "bg-amber-400" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">E-invoices this month</p>
        </Link>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 p-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{session.user.fullName}</p>
            <p className="truncate text-[11px] text-slate-400">
              {session.user.email} · {session.user.role}
            </p>
          </div>
          <button
            type="button"
            title="Sign out"
            onClick={() => void logout()}
            className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500">
          <ShieldCheck className="h-3 w-3 text-emerald-500" /> EU-hosted · GoBD hash-chained
        </p>
      </div>
    </div>
  );

  return (
    <SessionCtx.Provider value={{ session, reload }}>
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-900 lg:block">{sidebar}</aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">{sidebar}</aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <button type="button" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 p-2">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-bold text-slate-900">NormInvoice</span>
            <span className="w-9" />
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </SessionCtx.Provider>
  );
}
