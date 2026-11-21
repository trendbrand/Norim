"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, ShieldCheck, UserCircle2, X } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import type { AppLocale } from "@/lib/i18n";

interface ActiveUser {
  email: string;
  fullName: string;
  orgName: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.authenticated ? d.user : null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/", label: t.navValidator },
    { href: "/tools/zugferd-vs-xrechnung", label: "Format Finder" },
    { href: "/integrations/stripe", label: "Stripe" },
    { href: "/integrations/woocommerce", label: "WooCommerce" },
    { href: "/docs", label: t.navDocs },
    { href: "/errors", label: t.navErrors },
    { href: "/trust", label: "Trust" },
  ];

  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium tracking-wide text-slate-200">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          {t.badgeEu}
        </span>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold tracking-tight text-white shadow-sm">
            NI
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight text-slate-900">NormInvoice</span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              EN 16931 · ZUGFeRD · Factur-X · XRechnung
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {(["en", "de", "fr"] as AppLocale[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={`rounded-md px-2 py-1 uppercase transition-colors ${
                  locale === l ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Settings className="h-3.5 w-3.5" />
                Open Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 sm:inline-flex"
            >
              <UserCircle2 className="h-4 w-4" /> {t.navSignIn}
            </Link>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                    active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <Link href="/dashboard" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white">
                  Open Dashboard →
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                <UserCircle2 className="h-4 w-4" /> {t.navSignIn}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
