"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { openCookieSettings } from "./CookieConsent";

export function PublicFooter() {
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
            <p className="mt-4 text-xs leading-relaxed text-navy-200">
              Subscription-based European e-invoicing and financial workflow software. Built for EN 16931, ZUGFeRD 2.3,
              Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0, and structured audit archiving.
            </p>
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
              NormInvoice is commercial software and does not replace advice from a qualified tax advisor or lawyer.
            </p>
          </div>

          {/* Product Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Product</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-navy-200">
              <li><Link href="/features" className="hover:text-accent-400">Features Overview</Link></li>
              <li><Link href="/countries" className="hover:text-accent-400">Countries &amp; Standards</Link></li>
              <li><Link href="/integrations" className="hover:text-accent-400">Integrations</Link></li>
              <li><Link href="/pricing" className="hover:text-accent-400">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-accent-400">Security &amp; Trust</Link></li>
              <li><Link href="/tools/zugferd-vs-xrechnung" className="hover:text-accent-400">Format Finder</Link></li>
              <li><Link href="/docs" className="hover:text-accent-400">API Docs</Link></li>
              <li><Link href="/errors" className="hover:text-accent-400">EN 16931 Error Guide</Link></li>
            </ul>
          </div>

          {/* Solutions & Company Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Solutions &amp; Company</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-navy-200">
              <li><Link href="/solutions/small-business" className="hover:text-accent-400">For Small Businesses</Link></li>
              <li><Link href="/solutions/finance-teams" className="hover:text-accent-400">For Finance Teams</Link></li>
              <li><Link href="/solutions/accountants" className="hover:text-accent-400">For Accountants</Link></li>
              <li><Link href="/about" className="hover:text-accent-400">About NormInvoice</Link></li>
              <li><Link href="/partners" className="hover:text-accent-400">Partners &amp; Developers</Link></li>
              <li><Link href="/help" className="hover:text-accent-400">Help Center</Link></li>
              <li><Link href="/faq" className="hover:text-accent-400">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-accent-400">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Legal &amp; Policies</h3>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-navy-200">
              <li><Link href="/legal-notice" className="hover:text-accent-400">Legal Notice</Link></li>
              <li><Link href="/legal/impressum" className="hover:text-accent-400">Impressum (DE)</Link></li>
              <li><Link href="/terms" className="hover:text-accent-400">Terms of Service</Link></li>
              <li><Link href="/subscription-billing" className="hover:text-accent-400">Billing Policy</Link></li>
              <li><Link href="/cancellation-refunds" className="hover:text-accent-400">Refund Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-accent-400">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-accent-400">Cookie Policy</Link></li>
              <li><Link href="/dpa" className="hover:text-accent-400">DPA (GDPR)</Link></li>
              <li><Link href="/subprocessors" className="hover:text-accent-400">Subprocessors</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-accent-400">Acceptable Use</Link></li>
              <li><Link href="/service-availability" className="hover:text-accent-400">Availability</Link></li>
              <li><Link href="/data-retention" className="hover:text-accent-400">Data Retention</Link></li>
              <li><Link href="/ai-transparency" className="hover:text-accent-400">AI Disclosure</Link></li>
              <li><Link href="/accessibility" className="hover:text-accent-400">Accessibility</Link></li>
              <li><Link href="/third-party-services" className="hover:text-accent-400">Third-Party Terms</Link></li>
              <li><Link href="/complaints" className="hover:text-accent-400">Complaints</Link></li>
              <li><Link href="/intellectual-property" className="hover:text-accent-400">IP &amp; Brand</Link></li>
              <li><Link href="/trust" className="hover:text-accent-400">Trust Center</Link></li>
            </ul>
            <button
              type="button"
              onClick={openCookieSettings}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-xs font-semibold text-navy-100 hover:border-accent-500 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-accent-500" />
              Cookie Settings
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-navy-800 pt-6 text-[11px] text-navy-300 sm:flex-row sm:items-center">
          <p>
            © {year} NormInvoice — Product of Trend&amp;Brand. All rights reserved. Proposed contracting entity:
            Trend&amp;Brand LLC (Wyoming, USA).
          </p>
          <p className="text-navy-400">
            Related group entity: TREND &amp; BRAND (PRIVATE) LIMITED (Pakistan).
          </p>
        </div>
      </div>
    </footer>
  );
}
