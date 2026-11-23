"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { openCookieSettings } from "./CookieConsent";
import { useLocale } from "./LocaleProvider";
import { FOOTER_STRINGS } from "@/lib/i18n";

const PRODUCT_HREFS = [
  "/features",
  "/countries",
  "/integrations",
  "/pricing",
  "/security",
  "/tools/zugferd-vs-xrechnung",
  "/docs",
  "/errors",
];

const SOLUTIONS_HREFS = [
  "/solutions/small-business",
  "/solutions/finance-teams",
  "/solutions/accountants",
  "/about",
  "/partners",
  "/help",
  "/faq",
  "/contact",
];

const LEGAL_HREFS = [
  "/legal-notice",
  "/legal/impressum",
  "/terms",
  "/subscription-billing",
  "/cancellation-refunds",
  "/privacy",
  "/cookies",
  "/dpa",
  "/subprocessors",
  "/acceptable-use",
  "/service-availability",
  "/data-retention",
  "/ai-transparency",
  "/accessibility",
  "/third-party-services",
  "/complaints",
  "/intellectual-property",
  "/trust",
];

export function PublicFooter() {
  const { locale } = useLocale();
  const f = FOOTER_STRINGS[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden border-t border-navy-800 bg-navy-900 text-navy-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <BrandLogo variant="dark" />
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-navy-200">{f.tagline}</p>
            <div className="mt-4 space-y-1.5 text-xs text-navy-200">
              <a
                href="mailto:official@trendandbrands.com"
                className="flex items-center gap-2 hover:text-accent-400 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-accent-500" />
                official@trendandbrands.com
              </a>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent-500" />
                +92 325 5039135
              </p>
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-navy-300">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {f.disclaimer}
            </p>
          </div>

          {/* Product Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">{f.productHeading}</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-navy-200">
              {PRODUCT_HREFS.map((href, i) => (
                <li key={href}>
                  <Link href={href} className="hover:text-accent-400">
                    {f.productLinks[i] ?? href}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions & Company Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">{f.solutionsHeading}</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-navy-200">
              {SOLUTIONS_HREFS.map((href, i) => (
                <li key={href}>
                  <Link href={href} className="hover:text-accent-400">
                    {f.solutionsLinks[i] ?? href}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">{f.legalHeading}</h3>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-navy-200">
              {LEGAL_HREFS.map((href, i) => (
                <li key={href}>
                  <Link href={href} className="hover:text-accent-400">
                    {f.legalLinks[i] ?? href}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={openCookieSettings}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-xs font-semibold text-navy-100 hover:border-accent-500 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-accent-500" />
              {f.cookieSettings}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-navy-800 pt-6 text-[11px] text-navy-300 sm:flex-row sm:items-center">
          <p>{f.copyright.replace("%YEAR%", String(year))}</p>
          <p className="text-navy-400">{f.relatedEntity}</p>
        </div>
      </div>
    </footer>
  );
}
