"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { NAV_STRINGS, type AppLocale } from "@/lib/i18n";
import { BrandLogo } from "./BrandLogo";

interface ActiveUser {
  email: string;
  fullName: string;
  orgName: string;
}

const PRODUCT_ITEMS = [
  { href: "/features", label: "Features Overview", desc: "End-to-end e-invoicing workspace" },
  { href: "/#validator", label: "Free Dual Validator", desc: "Zero-retention ZUGFeRD, Factur-X & XRechnung check" },
  { href: "/tools/zugferd-vs-xrechnung", label: "Format Finder", desc: "Find the right EU format for any customer" },
  { href: "/security", label: "Security & Trust", desc: "Encryption, audit chain & privacy controls" },
  { href: "/docs", label: "API Documentation", desc: "REST API, webhooks & TypeScript SDK" },
  { href: "/errors", label: "EN 16931 Error Reference", desc: "45+ plain-language validation rule guides" },
];

const SOLUTION_ITEMS = [
  { href: "/solutions/small-business", label: "Small Businesses", desc: "Simple daily invoicing & EU readiness" },
  { href: "/solutions/finance-teams", label: "Finance Teams", desc: "Approvals, AR/AP, and audit visibility" },
  { href: "/solutions/accountants", label: "Accountants & Advisors", desc: "Clean DATEV/FEC handoffs & delegated access" },
  { href: "/partners", label: "Partners & Developers", desc: "ERP, Peppol & compliance connectivity" },
];

const COUNTRY_ITEMS = [
  { href: "/countries/germany", label: "Germany", desc: "XRechnung 3.0.2 & ZUGFeRD 2.3" },
  { href: "/countries/belgium", label: "Belgium", desc: "Peppol BIS Billing 3.0 (B2B Live)" },
  { href: "/countries/france", label: "France", desc: "Factur-X 1.07 & Approved Platforms" },
  { href: "/countries/poland", label: "Poland", desc: "KSeF FA(3) & UPO Tracking" },
  { href: "/countries", label: "All 13 European Markets →", desc: "Full compliance scope & status matrix" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const nav = NAV_STRINGS[locale];
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"product" | "solutions" | "countries" | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
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

  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      {/* Top Navy Trust Strip */}
      <div className="bg-navy-900 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-navy-100">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
            NormInvoice — Product of Trend&amp;Brand
          </span>
          <span className="hidden text-navy-400 sm:inline">·</span>
          <span className="hidden text-navy-200 sm:inline">{nav.trust}</span>
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <BrandLogo variant="light" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
          {/* Product dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("product")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "product" ? null : "product"))}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 hover:text-navy-900"
            >
              {nav.product} <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {openMenu === "product" && (
              <div className="animate-scale-in absolute left-0 top-full w-80 pt-1.5">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {PRODUCT_ITEMS.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 hover:bg-accent-50/70"
                    >
                      <p className="text-xs font-bold text-navy-900">{nav.productItems[i]?.label ?? item.label}</p>
                      <p className="text-[11px] text-slate-500">{nav.productItems[i]?.desc ?? item.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Solutions dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("solutions")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "solutions" ? null : "solutions"))}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 hover:text-navy-900"
            >
              {nav.solutions} <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {openMenu === "solutions" && (
              <div className="animate-scale-in absolute left-0 top-full w-72 pt-1.5">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {SOLUTION_ITEMS.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 hover:bg-accent-50/70"
                    >
                      <p className="text-xs font-bold text-navy-900">{nav.solutionItems[i]?.label ?? item.label}</p>
                      <p className="text-[11px] text-slate-500">{nav.solutionItems[i]?.desc ?? item.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Countries dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("countries")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "countries" ? null : "countries"))}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 hover:text-navy-900"
            >
              {nav.countries} <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {openMenu === "countries" && (
              <div className="animate-scale-in absolute left-0 top-full w-72 pt-1.5">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {COUNTRY_ITEMS.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 hover:bg-accent-50/70"
                    >
                      <p className="text-xs font-bold text-navy-900">{nav.countryItems[i]?.label ?? item.label}</p>
                      <p className="text-[11px] text-slate-500">{nav.countryItems[i]?.desc ?? item.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {[
            { href: "/integrations", label: nav.integrations },
            { href: "/pricing", label: nav.pricing },
            { href: "/about", label: nav.about },
            { href: "/contact", label: nav.contact },
          ].map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-accent-50 text-accent-700" : "text-navy-800 hover:bg-navy-50 hover:text-navy-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-slate-200 bg-canvas p-0.5 text-[11px] font-bold sm:flex">
            {(["en", "de", "fr"] as AppLocale[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={`rounded-md px-2 py-1 uppercase transition-colors ${
                  locale === l ? "bg-navy-900 text-white shadow-sm" : "text-slate-500 hover:text-navy-900"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-600"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {nav.openDashboard} →
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
                title={nav.signOut}
                aria-label={nav.signOut}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-xs font-bold text-navy-900 hover:bg-navy-50"
              >
                {nav.login}
              </Link>
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-600"
              >
                {nav.signupFree}
              </Link>
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-navy-900 hover:bg-navy-50 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="animate-fade-in-up border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-xl lg:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { href: "/features", label: "Features" },
              { href: "/countries", label: "Countries (13)" },
              { href: "/integrations", label: "Integrations" },
              { href: "/pricing", label: "Pricing" },
              { href: "/solutions/small-business", label: "Small Business" },
              { href: "/solutions/finance-teams", label: "Finance Teams" },
              { href: "/solutions/accountants", label: "Accountants" },
              { href: "/security", label: "Security" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/help", label: "Help Center" },
              { href: "/faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${
                  pathname === link.href ? "bg-accent-50 text-accent-700" : "text-navy-800 hover:bg-navy-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-xl bg-accent-500 px-4 py-2.5 text-center text-xs font-bold text-white"
                >
                  {nav.openDashboard} →
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-700"
                >
                  <LogOut className="h-3.5 w-3.5" /> {nav.signOut}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-navy-900"
                >
                  {nav.login}
                </Link>
                <Link
                  href="/login?mode=register"
                  className="rounded-xl bg-accent-500 px-4 py-2.5 text-center text-xs font-bold text-white"
                >
                  {nav.signupFree}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
