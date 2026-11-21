"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from "lucide-react";

type Country = "DE" | "FR" | "BE" | "EU_OTHER";
type BuyerKind = "B2B_DOMESTIC" | "B2G_PUBLIC" | "B2B_INTRA_EU" | "NON_EU";
type BillingTool = "STRIPE" | "WOOCOMMERCE" | "MANUAL_CSV";

export default function MandateQuizPage() {
  const [sellerCountry, setSellerCountry] = useState<Country>("DE");
  const [buyerKind, setBuyerKind] = useState<BuyerKind>("B2B_DOMESTIC");
  const [tool, setTool] = useState<BillingTool>("STRIPE");

  const recommendation = useMemo(() => {
    if (sellerCountry === "DE" && buyerKind === "B2G_PUBLIC") {
      return {
        format: "XRechnung 3.0.2 (UBL 2.1 or CII XML)",
        profileCode: "XRECHNUNG_UBL",
        deadline: "Mandatory NOW for all German federal & state public authorities",
        vatRule: "Standard Domestic 19% / 7% (or § 19 UStG Exempt)",
        keyRequirement: "Leitweg-ID (BT-10), Seller Contact (BG-6), Electronic Addresses (BT-34 & BT-49), and IBAN (BT-84).",
      };
    }
    if (sellerCountry === "FR") {
      return {
        format: "Factur-X 1.07 (EN 16931 Hybrid PDF/A-3b + CII XML)",
        profileCode: "FACTURX_EN16931",
        deadline: "Receiving mandatory Sept 1, 2026 · SME Issuing mandatory Sept 1, 2027",
        vatRule: buyerKind === "B2B_INTRA_EU" ? "Reverse Charge (AE 0% + VIES VAT ID)" : "Standard French TVA (20% / 10%)",
        keyRequirement: "9-digit SIREN (BT-30), Art. L441-10 late-payment clauses, and FEC accounting archive.",
      };
    }
    if (sellerCountry === "BE") {
      return {
        format: "Peppol BIS Billing 3.0 (OASIS UBL 2.1 XML)",
        profileCode: "PEPPOL_BIS_3",
        deadline: "Mandatory LIVE since January 1, 2026 for all VAT-registered Belgian B2B",
        vatRule: buyerKind === "B2B_INTRA_EU" ? "Reverse Charge (AE 0%)" : "Belgian VAT (21%)",
        keyRequirement: "Buyer Peppol EndpointID (BT-49, scheme 0208 Belgian Enterprise Number).",
      };
    }
    if (buyerKind === "B2B_INTRA_EU") {
      return {
        format: "ZUGFeRD 2.3 / Factur-X 1.07 (EN 16931 Hybrid PDF/A-3b)",
        profileCode: "ZUGFERD_EN16931",
        deadline: "DE Receiving live Jan 2025 · DE Issuing rollout Jan 2027 · EU ViDA aligned",
        vatRule: "Intra-EU Reverse Charge (Category AE, 0%, VATEX-EU-AE) — VIES verified Buyer VAT ID required!",
        keyRequirement: "Valid Seller VAT ID (BT-31) + VIES-verified Buyer VAT ID (BT-48) with saved audit timestamp.",
      };
    }
    return {
      format: "ZUGFeRD 2.3 (EN 16931 Hybrid PDF/A-3b + CII XML)",
      profileCode: "ZUGFERD_EN16931",
      deadline: "Germany: Receiving mandatory since Jan 1, 2025 · Issuing starts Jan 1, 2027",
      vatRule: buyerKind === "NON_EU" ? "Export outside EU (Category G, 0%, VATEX-EU-G)" : "Standard Domestic VAT (19% / 7% or § 19 UStG)",
      keyRequirement: "Embedded EN 16931 XML inside ISO 19005-3 PDF/A-3b + 8-Year BEG IV GoBD Archive.",
    };
  }, [sellerCountry, buyerKind]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Compass className="h-3.5 w-3.5" /> Interactive EU Compliance Recommender
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          ZUGFeRD vs. Factur-X vs. XRechnung vs. Peppol — Which Format Do You Need?
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Answer 3 quick questions to get your exact 2026–2027 legal deadline, mandatory XML profile, and tax rules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <label className="text-xs font-bold text-slate-700">
          1. Your Company Country
          <select
            value={sellerCountry}
            onChange={(e) => setSellerCountry(e.target.value as Country)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-900"
          >
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="BE">Belgium (BE)</option>
            <option value="EU_OTHER">Other EU / Cross-Border</option>
          </select>
        </label>

        <label className="text-xs font-bold text-slate-700">
          2. Your Buyer Type
          <select
            value={buyerKind}
            onChange={(e) => setBuyerKind(e.target.value as BuyerKind)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-900"
          >
            <option value="B2B_DOMESTIC">Domestic B2B Company</option>
            <option value="B2G_PUBLIC">Public Authority (B2G / Behörde)</option>
            <option value="B2B_INTRA_EU">Cross-Border EU B2B</option>
            <option value="NON_EU">Outside EU (US / UK / CH)</option>
          </select>
        </label>

        <label className="text-xs font-bold text-slate-700">
          3. How You Bill Today
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value as BillingTool)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-900"
          >
            <option value="STRIPE">Stripe Billing / Checkout</option>
            <option value="WOOCOMMERCE">WooCommerce Store</option>
            <option value="MANUAL_CSV">Manual / Excel / CSV</option>
          </select>
        </label>
      </div>

      {/* Output Recommendation Card */}
      <div className="rounded-2xl border-2 border-brand-600 bg-white p-7 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700">
          <ShieldCheck className="h-4 w-4" /> Your Recommended EN 16931 Compliance Blueprint
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{recommendation.format}</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Legal Mandate Deadline</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{recommendation.deadline}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Tax &amp; VAT Category</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{recommendation.vatRule}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-950">
          <p className="inline-flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mandatory Fields Checklist:
          </p>
          <p className="mt-1 text-xs">{recommendation.keyRequirement}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tool === "STRIPE" && (
            <Link
              href="/integrations/stripe"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Automate Stripe → {recommendation.profileCode} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {tool === "WOOCOMMERCE" && (
            <Link
              href="/integrations/woocommerce"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Get WooCommerce Bridge Plugin <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {tool === "MANUAL_CSV" && (
            <Link
              href="/batch"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Open CSV Batch Converter <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Generate One Free Now
          </Link>
        </div>
      </div>
    </div>
  );
}
