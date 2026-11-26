"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  ChevronDown,
  CreditCard,
  Crown,
  FileArchive,
  FileText,
  Gift,
  Globe2,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Repeat,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
  Zap,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { CopilotPanel } from "./CopilotPanel";
import { BrandLogo } from "./BrandLogo";
import { useLocale } from "./LocaleProvider";
import { APP_STRINGS } from "@/lib/i18n";

export interface AppSession {
  user: {
    id: string;
    orgId: string;
    email: string;
    fullName: string;
    orgName: string;
    role: string;
    emailVerified?: boolean;
  };
  onboardingCompleted: boolean;
  isSuperAdmin?: boolean;
  subscription: {
    planTier: string;
    monthlyQuota: number;
    status: string;
    currency?: string;
    trialActive?: boolean;
    trialDaysRemaining?: number;
    trialEndsAt?: string | null;
    cancelAtPeriodEnd?: boolean;
    suspended?: boolean;
  };
  quota: { tier: string; monthlyLimit: number; usedThisMonth: number; remaining: number; exceeded: boolean };
}

interface NotificationItem {
  id: string;
  kind: "warning" | "info" | "success";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

const SessionCtx = createContext<{ session: AppSession | null; reload: () => Promise<void> }>({
  session: null,
  reload: async () => {},
});

export function useAppSession() {
  return useContext(SessionCtx);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const t = APP_STRINGS[locale];
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [invoicesExpanded, setInvoicesExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const isOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    setNotifOpen(false);
    setUserMenuOpen(false);
    void reload().finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    if (!session || isOnboarding) return;
    void fetch("/api/v1/dashboard?days=30", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  }, [session, isOnboarding, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-sm font-bold text-navy-800">
          <Loader2 className="h-4 w-4 animate-spin text-accent-500" /> {t.loadingWorkspace}
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <SessionCtx.Provider value={{ session, reload }}>
        <div className="min-h-screen bg-canvas">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
              <BrandLogo variant="light" />
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs font-bold text-slate-500 hover:text-red-600"
              >
                {t.signOut}
              </button>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </SessionCtx.Provider>
    );
  }

  const q = session.quota;
  const sub = session.subscription;
  const pct = Math.min(100, Math.round((q.usedThisMonth / Math.max(1, q.monthlyLimit)) * 100));
  const isPaidTier = ["solo", "business", "agency"].includes(sub.planTier);
  const firstName = session.user.fullName.split(" ")[0] || "there";
  const initials = session.user.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItemCls = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
      active
        ? "bg-accent-500 text-white shadow-sm"
        : "text-navy-100 hover:bg-navy-800 hover:text-white"
    }`;

  const subItemCls = (active: boolean) =>
    `flex items-center gap-2.5 rounded-lg py-2 pl-10 pr-3 text-xs font-medium transition-colors ${
      active
        ? "bg-navy-800 text-accent-400 font-bold"
        : "text-navy-200 hover:bg-navy-800/70 hover:text-white"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className="px-5 pt-5 pb-3">
        <Link href="/dashboard" className="inline-block">
          <BrandLogo variant="dark" />
        </Link>
        <p className="mt-2 truncate text-[11px] font-medium text-navy-300">{session.user.orgName}</p>
      </div>

      {/* Quick Search & Copilot */}
      <div className="space-y-1.5 px-3.5 pb-3">
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-navy-700 bg-navy-800/80 px-3 py-2 text-xs text-navy-200 transition hover:border-navy-500 hover:text-white"
        >
          <span className="flex items-center gap-2"><Search className="h-3.5 w-3.5 text-accent-400" /> {t.search}</span>
          <kbd className="rounded bg-navy-700 px-1.5 py-0.5 font-mono text-[10px] text-navy-200">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-accent-500/35 bg-accent-500/15 px-3 py-2 text-xs font-bold text-accent-200 transition hover:bg-accent-500/25 hover:text-white"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-400" /> {t.copilot}
        </button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Workspace navigation" className="flex-1 space-y-1 overflow-y-auto px-3.5 pb-3">
        <Link href="/dashboard" className={navItemCls(pathname === "/dashboard")}>
          <LayoutDashboard className="h-4 w-4 shrink-0" /> {t.navDashboard}
        </Link>

        {/* Collapsible Invoices Group (Matches Approved Design) */}
        <div>
          <button
            type="button"
            onClick={() => setInvoicesExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-navy-100 hover:bg-navy-800 hover:text-white"
          >
            <span className="flex items-center gap-3">
              <FileText className="h-4 w-4 shrink-0" /> {t.navInvoices}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${invoicesExpanded ? "rotate-180" : ""}`} />
          </button>
          {invoicesExpanded && (
            <div className="mt-0.5 space-y-0.5">
              <Link href="/invoices" className={subItemCls(pathname === "/invoices")}>
                {t.navAllInvoices}
              </Link>
              <Link href="/invoices/new" className={subItemCls(pathname === "/invoices/new")}>
                {t.navCreateInvoice}
              </Link>
              <Link href="/recurring" className={subItemCls(pathname.startsWith("/recurring"))}>
                <Repeat className="h-3.5 w-3.5" /> {t.navRecurring}
              </Link>
              <Link href="/inbox" className={subItemCls(pathname.startsWith("/inbox"))}>
                <Inbox className="h-3.5 w-3.5" /> {t.navInbox}
              </Link>
              <Link href="/batch" className={subItemCls(pathname.startsWith("/batch"))}>
                <UploadCloud className="h-3.5 w-3.5" /> {t.navBatch}
              </Link>
            </div>
          )}
        </div>

        <Link href="/customers" className={navItemCls(pathname.startsWith("/customers"))}>
          <Users className="h-4 w-4 shrink-0" /> {t.navCustomers}
        </Link>

        <Link href="/catalog" className={navItemCls(pathname.startsWith("/catalog"))}>
          <Package className="h-4 w-4 shrink-0" /> {t.navProducts}
        </Link>

        <Link href="/payments" className={navItemCls(pathname.startsWith("/payments"))}>
          <CreditCard className="h-4 w-4 shrink-0" /> {t.navPayments}
        </Link>

        {/* Collapsible Reports Group */}
        <div>
          <button
            type="button"
            onClick={() => setReportsExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-navy-100 hover:bg-navy-800 hover:text-white"
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 shrink-0" /> {t.navReports}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${reportsExpanded ? "rotate-180" : ""}`} />
          </button>
          {reportsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              <Link href="/reports" className={subItemCls(pathname.startsWith("/reports"))}>
                {t.navAnalytics}
              </Link>
              <Link href="/exports" className={subItemCls(pathname.startsWith("/exports"))}>
                <FileArchive className="h-3.5 w-3.5" /> {t.navExports}
              </Link>
            </div>
          )}
        </div>

        <Link href="/compliance" className={navItemCls(pathname.startsWith("/compliance"))}>
          <Globe2 className="h-4 w-4 shrink-0" /> {t.navCompliance}
        </Link>

        <Link href="/automations" className={navItemCls(pathname.startsWith("/automations"))}>
          <Zap className="h-4 w-4 shrink-0" /> {t.navAutomations}
        </Link>

        <Link href="/accountant" className={navItemCls(pathname.startsWith("/accountant"))}>
          <Briefcase className="h-4 w-4 shrink-0" /> {t.navAccountant}
        </Link>

        <Link href="/settings" className={navItemCls(pathname.startsWith("/settings"))}>
          <Settings className="h-4 w-4 shrink-0" /> {t.navSettings}
        </Link>

        {session.isSuperAdmin && (
          <Link href="/admin" className={navItemCls(pathname.startsWith("/admin"))}>
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" /> {t.navSuperAdmin}
          </Link>
        )}
      </nav>

      {/* Bottom Sidebar Plan / Upgrade Card (Matches Approved Design) */}
      <div className="space-y-3 border-t border-navy-800 px-3.5 py-4">
        {!isPaidTier ? (
          <div className="rounded-2xl border border-navy-700 bg-navy-800/90 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-white">
              <Crown className="h-4 w-4 text-accent-500" /> {t.upgradeTo} <span className="text-accent-400">Solo</span>
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-navy-200">
              {t.upgradeBullets.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <Link
              href="/settings?tab=billing"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-accent-600"
            >
              {t.upgradeNow} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <Link href="/settings?tab=billing" className="block rounded-2xl border border-navy-700 bg-navy-800/80 p-3.5 hover:bg-navy-800">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-navy-200">
              <span>{t.planName(q.tier)} {t.planSuffix}</span>
              <span className={q.exceeded ? "text-amber-400" : "text-accent-400"}>
                {q.usedThisMonth}/{q.monthlyLimit}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-700">
              <div className={`h-full rounded-full ${pct >= 90 ? "bg-amber-400" : "bg-accent-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[10.5px] text-navy-300">{t.finalizedThisMonth}</p>
          </Link>
        )}

        <p className="flex items-center gap-1.5 px-1 text-[10px] text-navy-300">
          <ShieldCheck className="h-3 w-3 text-emerald-400" /> {t.hashChained}
        </p>
      </div>
    </div>
  );

  return (
    <SessionCtx.Provider value={{ session, reload }}>
      <div className="min-h-screen bg-canvas">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-900 lg:block">{sidebar}</aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 bg-navy-900 shadow-2xl">{sidebar}</aside>
          </div>
        )}

        <div className="lg:pl-64">
          {/* Approved Desktop + Mobile Top Header Bar */}
          <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-slate-200 p-2 text-navy-900 hover:bg-slate-50 lg:hidden"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-navy-900 sm:text-base">
                    {t.welcomeBack(firstName)}
                  </p>
                  <p className="hidden truncate text-xs text-slate-500 sm:block">
                    {session.user.orgName} · {t.orgSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Real DB-Computed Trial Countdown Pill */}
                {sub.trialActive && (
                  <Link
                    href="/settings?tab=billing"
                    className="hidden items-center gap-1.5 rounded-xl border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-bold text-navy-900 hover:bg-accent-100 md:inline-flex"
                  >
                    <Gift className="h-3.5 w-3.5 text-accent-500" />
                    <span>{t.freeTrialActive}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-accent-700">
                      {t.daysLeftShort(sub.trialDaysRemaining ?? 0)}
                    </span>
                  </Link>
                )}

                {/* Upgrade CTA when on Free or Trial */}
                {!isPaidTier && (
                  <Link
                    href="/settings?tab=billing"
                    className="hidden items-center gap-1.5 rounded-xl border border-accent-400 bg-white px-3.5 py-1.5 text-xs font-extrabold text-accent-700 transition hover:bg-accent-50 sm:inline-flex"
                  >
                    <Crown className="h-3.5 w-3.5 text-accent-500" /> {t.upgradeToSolo}
                  </Link>
                )}

                {/* Live Notifications Popover */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => {
                      setNotifOpen((v) => !v);
                      setUserMenuOpen(false);
                    }}
                    className="relative rounded-xl border border-slate-200 p-2 text-navy-800 hover:bg-slate-50"
                  >
                    <Bell className="h-4 w-4" />
                    {notifications.some((n) => n.kind === "warning") && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
                    )}
                  </button>
                  {notifOpen && (
                    <div className="animate-scale-in absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-extrabold text-navy-900">{t.workspaceActivity}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{t.itemsCount(notifications.length)}</span>
                      </div>
                      <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="py-6 text-center text-xs text-slate-400">{t.allClear}</p>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              href={n.href}
                              onClick={() => setNotifOpen(false)}
                              className="block rounded-xl p-2.5 text-xs hover:bg-canvas"
                            >
                              <p className={`font-bold ${n.kind === "warning" ? "text-amber-800" : "text-navy-900"}`}>
                                {n.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500">{n.detail}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Help Link */}
                <Link
                  href="/help"
                  title={t.helpCenter}
                  aria-label={t.helpCenter}
                  className="hidden rounded-xl border border-slate-200 p-2 text-navy-800 hover:bg-slate-50 sm:inline-flex"
                >
                  <HelpCircle className="h-4 w-4" />
                </Link>

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((v) => !v);
                      setNotifOpen(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 pr-2.5 text-xs font-bold text-navy-900 hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-[11px] font-extrabold text-white">
                      {initials || "U"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="animate-scale-in absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-xs font-extrabold text-navy-900">{session.user.fullName}</p>
                        <p className="truncate text-[11px] text-slate-500">{session.user.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-navy-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-navy-800">
                          {session.user.role} · {sub.planTier}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5 text-xs font-semibold">
                        <Link href="/settings" className="block rounded-xl px-3 py-2 text-navy-800 hover:bg-canvas">
                          {t.menuWorkspaceSettings}
                        </Link>
                        <Link href="/settings?tab=billing" className="block rounded-xl px-3 py-2 text-navy-800 hover:bg-canvas">
                          {t.menuPlanBilling}
                        </Link>
                        {session.isSuperAdmin && (
                          <Link href="/admin" className="block rounded-xl px-3 py-2 text-amber-800 hover:bg-amber-50">
                            {t.menuSuperAdmin}
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-3.5 w-3.5" /> {t.signOut}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {sub.suspended ? (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-red-800">
                  Your workspace is paused — your trial ended or a payment is overdue. Your data is safe; choose a plan to restore access.
                </p>
                <Link href="/settings?tab=billing" className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
                  Choose a plan →
                </Link>
              </div>
            </div>
          ) : sub.trialActive && (sub.trialDaysRemaining ?? 99) <= 3 ? (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-amber-900">
                  Your trial ends in {sub.trialDaysRemaining} day{(sub.trialDaysRemaining ?? 0) === 1 ? "" : "s"}. Pick a plan to keep full access.
                </p>
                <Link href="/settings?tab=billing" className="shrink-0 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-600">
                  Choose your plan →
                </Link>
              </div>
            </div>
          ) : null}

          <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{children}</main>
        </div>

        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />
      </div>
    </SessionCtx.Provider>
  );
}
