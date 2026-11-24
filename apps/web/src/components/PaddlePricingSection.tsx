"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, Crown, Gift, ShieldCheck } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import type { AppLocale } from "@/lib/i18n";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: string) => void };
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: { items: Array<{ priceId: string; quantity: number }>; customData?: Record<string, string> }) => void;
      };
    };
  }
}

// Non-translatable plan facts (prices are the same in every language).
const PLAN_BASE = [
  { tier: "free", price: "€0", annualPrice: "€0", highlighted: false },
  { tier: "starter", price: "€12", annualPrice: "€120", highlighted: false },
  { tier: "solo", price: "€29", annualPrice: "€290", highlighted: true },
  { tier: "business", price: "€49", annualPrice: "€490", highlighted: false },
  { tier: "agency", price: "€129", annualPrice: "€1,290", highlighted: false },
] as const;

type PlanText = {
  name: string;
  period: string;
  annualMonthly: string;
  annualSave: string;
  badge: string;
  desc: string;
  features: string[];
  cta: string;
};

const PLAN_TEXT: Record<AppLocale, Record<string, PlanText>> = {
  en: {
    free: {
      name: "Free", period: "/ forever", annualMonthly: "", annualSave: "", badge: "Always Free",
      desc: "Ideal for testing EN 16931 validation, inspecting supplier invoices, and occasional invoicing.",
      features: ["Unlimited zero-retention dual validator & viewer", "Up to 5 finalized e-invoices / month", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML", "Plain-language EN, DE & FR rule explanations", "Instant EPC SEPA GiroCode QR preview"],
      cta: "Sign Up Free",
    },
    starter: {
      name: "Starter", period: "/ month", annualMonthly: "≈ €10/mo, billed yearly", annualSave: "Save €24", badge: "For Freelancers",
      desc: "For freelancers and Kleinunternehmer sending a handful of compliant invoices each month.",
      features: ["15-day free trial — no credit card required", "Up to 40 finalized e-invoices / month", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML", "Incoming supplier inbox & SEPA pay links", "VIES VAT verification & GoBD audit chain"],
      cta: "Start 15-Day Free Trial",
    },
    solo: {
      name: "Solo", period: "/ month", annualMonthly: "≈ €24.17/mo, billed yearly", annualSave: "Save €58", badge: "Most Popular",
      desc: "Main plan for solo founders, consultants, and growing businesses automating European e-invoicing.",
      features: ["15-day free trial — no credit card required", "Up to 150 finalized e-invoices / month", "Recurring schedules, incoming inbox & automations", "VIES VAT verification, reports & DATEV / FEC exports", "Tamper-evident GoBD SHA-256 audit hash-chain"],
      cta: "Start 15-Day Free Trial",
    },
    business: {
      name: "Business", period: "/ month", annualMonthly: "≈ €40.83/mo, billed yearly", annualSave: "Save €98", badge: "Teams & Bridges",
      desc: "Complete Stripe & WooCommerce automation with multi-user approvals and EU archival.",
      features: ["Up to 500 finalized e-invoices / month", "Stripe & WooCommerce signed webhook bridges", "Action-Required queue + 1-click Leitweg-ID repair", "Multi-member RBAC & delegated accountant portal", "8-yr (DE BEG IV) / 10-yr (FR) archive exports"],
      cta: "Choose Business",
    },
    agency: {
      name: "Agency & API", period: "/ month", annualMonthly: "≈ €107.50/mo, billed yearly", annualSave: "Save €258", badge: "High Volume",
      desc: "Built for accounting firms, high-volume merchants, and ERP / SaaS developer teams.",
      features: ["Up to 2,500 finalized e-invoices / month", "Tenant-scoped Bearer API keys & TypeScript SDK", "Batch CSV to PDF/A-3 + XML ZIP converter", "Multi-client accountant review dashboard", "Custom DPA redlining & priority email support"],
      cta: "Choose Agency",
    },
  },
  de: {
    free: {
      name: "Free", period: "/ immer", annualMonthly: "", annualSave: "", badge: "Immer kostenlos",
      desc: "Ideal zum Testen der EN-16931-Prüfung, zur Einsicht von Lieferantenrechnungen und für gelegentliche Rechnungen.",
      features: ["Unbegrenzter Dual-Validator & Viewer ohne Datenspeicherung", "Bis zu 5 finalisierte E-Rechnungen / Monat", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung-XML", "Verständliche Regelerklärungen auf EN, DE & FR", "Sofortige EPC-SEPA-GiroCode-QR-Vorschau"],
      cta: "Kostenlos registrieren",
    },
    starter: {
      name: "Starter", period: "/ Monat", annualMonthly: "≈ 10 €/Mon., jährlich abgerechnet", annualSave: "24 € sparen", badge: "Für Freiberufler",
      desc: "Für Freiberufler und Kleinunternehmer, die monatlich einige wenige rechtskonforme Rechnungen senden.",
      features: ["15 Tage gratis testen — keine Kreditkarte nötig", "Bis zu 40 finalisierte E-Rechnungen / Monat", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung-XML", "Lieferanten-Posteingang & SEPA-Zahllinks", "VIES-USt-Prüfung & GoBD-Audit-Kette"],
      cta: "15 Tage gratis testen",
    },
    solo: {
      name: "Solo", period: "/ Monat", annualMonthly: "≈ 24,17 €/Mon., jährlich abgerechnet", annualSave: "58 € sparen", badge: "Am beliebtesten",
      desc: "Haupttarif für Einzelgründer, Berater und wachsende Unternehmen, die die europäische E-Rechnung automatisieren.",
      features: ["15 Tage gratis testen — keine Kreditkarte nötig", "Bis zu 150 finalisierte E-Rechnungen / Monat", "Wiederkehrende Zeitpläne, Posteingang & Automatisierung", "VIES-USt-Prüfung, Berichte & DATEV-/FEC-Exporte", "Manipulationssichere GoBD-SHA-256-Audit-Kette"],
      cta: "15 Tage gratis testen",
    },
    business: {
      name: "Business", period: "/ Monat", annualMonthly: "≈ 40,83 €/Mon., jährlich abgerechnet", annualSave: "98 € sparen", badge: "Teams & Bridges",
      desc: "Vollständige Stripe- & WooCommerce-Automatisierung mit Mehrbenutzer-Freigaben und EU-Archivierung.",
      features: ["Bis zu 500 finalisierte E-Rechnungen / Monat", "Signierte Stripe- & WooCommerce-Webhook-Bridges", "Aufgaben-Warteschlange + 1-Klick-Leitweg-ID-Reparatur", "Mehrbenutzer-RBAC & delegiertes Steuerberater-Portal", "8 Jahre (DE BEG IV) / 10 Jahre (FR) Archiv-Exporte"],
      cta: "Business wählen",
    },
    agency: {
      name: "Agentur & API", period: "/ Monat", annualMonthly: "≈ 107,50 €/Mon., jährlich abgerechnet", annualSave: "258 € sparen", badge: "Hohes Volumen",
      desc: "Für Steuerkanzleien, umsatzstarke Händler und ERP-/SaaS-Entwicklerteams.",
      features: ["Bis zu 2.500 finalisierte E-Rechnungen / Monat", "Mandantenbezogene Bearer-API-Schlüssel & TypeScript-SDK", "Batch-CSV zu PDF/A-3 + XML-ZIP-Konverter", "Mehrmandanten-Prüf-Dashboard für Steuerberater", "Individuelle AVV-Anpassung & bevorzugter E-Mail-Support"],
      cta: "Agentur wählen",
    },
  },
  fr: {
    free: {
      name: "Free", period: "/ à vie", annualMonthly: "", annualSave: "", badge: "Toujours gratuit",
      desc: "Idéal pour tester la validation EN 16931, inspecter les factures fournisseurs et facturer occasionnellement.",
      features: ["Validateur & visionneuse illimités sans conservation", "Jusqu'à 5 factures électroniques finalisées / mois", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML", "Explications claires des règles en EN, DE & FR", "Aperçu instantané du QR-code EPC SEPA GiroCode"],
      cta: "Inscription gratuite",
    },
    starter: {
      name: "Starter", period: "/ mois", annualMonthly: "≈ 10 €/mois, facturé annuellement", annualSave: "Économisez 24 €", badge: "Pour indépendants",
      desc: "Pour les indépendants et micro-entreprises qui envoient quelques factures conformes chaque mois.",
      features: ["Essai gratuit de 15 jours — sans carte bancaire", "Jusqu'à 40 factures électroniques finalisées / mois", "ZUGFeRD 2.3, Factur-X 1.07 & XRechnung XML", "Boîte de réception fournisseurs & liens de paiement SEPA", "Vérification TVA VIES & chaîne d'audit GoBD"],
      cta: "Essai gratuit de 15 jours",
    },
    solo: {
      name: "Solo", period: "/ mois", annualMonthly: "≈ 24,17 €/mois, facturé annuellement", annualSave: "Économisez 58 €", badge: "Le plus populaire",
      desc: "Offre principale pour fondateurs solo, consultants et entreprises en croissance automatisant la facturation européenne.",
      features: ["Essai gratuit de 15 jours — sans carte bancaire", "Jusqu'à 150 factures électroniques finalisées / mois", "Échéanciers récurrents, boîte de réception & automatisations", "Vérification TVA VIES, rapports & exports DATEV / FEC", "Chaîne d'audit GoBD SHA-256 inviolable"],
      cta: "Essai gratuit de 15 jours",
    },
    business: {
      name: "Business", period: "/ mois", annualMonthly: "≈ 40,83 €/mois, facturé annuellement", annualSave: "Économisez 98 €", badge: "Équipes & passerelles",
      desc: "Automatisation complète Stripe & WooCommerce avec approbations multi-utilisateurs et archivage UE.",
      features: ["Jusqu'à 500 factures électroniques finalisées / mois", "Passerelles webhook signées Stripe & WooCommerce", "File d'actions requises + réparation Leitweg-ID en 1 clic", "RBAC multi-membres & portail comptable délégué", "Exports d'archives 8 ans (DE BEG IV) / 10 ans (FR)"],
      cta: "Choisir Business",
    },
    agency: {
      name: "Agence & API", period: "/ mois", annualMonthly: "≈ 107,50 €/mois, facturé annuellement", annualSave: "Économisez 258 €", badge: "Volume élevé",
      desc: "Conçu pour les cabinets comptables, les marchands à fort volume et les équipes de développement ERP / SaaS.",
      features: ["Jusqu'à 2 500 factures électroniques finalisées / mois", "Clés API Bearer par locataire & SDK TypeScript", "Convertisseur CSV par lots vers PDF/A-3 + ZIP XML", "Tableau de bord de révision comptable multi-clients", "Personnalisation du DPA & support e-mail prioritaire"],
      cta: "Choisir Agence",
    },
  },
};

type SectionText = {
  badge: string; title: string; desc: string; vatNote: string;
  monthly: string; annual: string; twoMonthsFree: string;
  perYear: string; processing: string; openDashboard: string;
  enterpriseTag: string; enterpriseTitle: string; enterpriseDesc: string; contactSales: string;
  trialNote: string; billingPolicy: string; cancelPolicy: string;
};

const SECTION_TEXT: Record<AppLocale, SectionText> = {
  en: {
    badge: "Free plan available · 15-day free trial · No credit card required",
    title: "Transparent Plans for Every Stage of E-Invoicing",
    desc: "Start free or evaluate full automation with a real 15-day free trial. Pay monthly, or save ~17% with annual billing (2 months free) — cancel renewal anytime.",
    vatNote: "All prices exclude applicable VAT (zzgl. MwSt. / HT). Strictly for B2B commercial use (§ 14 BGB).",
    monthly: "Monthly", annual: "Annual", twoMonthsFree: "2 months free",
    perYear: "/ year", processing: "Processing…", openDashboard: "Open Dashboard →",
    enterpriseTag: "Enterprise & Custom Volume",
    enterpriseTitle: "Need dedicated onboarding, custom SLA, or ERP integration?",
    enterpriseDesc: "Custom document volumes, multi-entity architecture, DPA execution, and tailored compliance routing.",
    contactSales: "Contact Sales",
    trialNote: "15-day trials never silently charge without authorization",
    billingPolicy: "Subscription & Billing Policy",
    cancelPolicy: "Cancellation & Refund Policy",
  },
  de: {
    badge: "Kostenloser Tarif · 15 Tage gratis testen · Keine Kreditkarte nötig",
    title: "Transparente Tarife für jede Phase der E-Rechnung",
    desc: "Kostenlos starten oder die volle Automatisierung mit einem echten 15-Tage-Test prüfen. Monatlich zahlen oder mit jährlicher Abrechnung ~17 % sparen (2 Monate gratis) — Verlängerung jederzeit kündbar.",
    vatNote: "Alle Preise verstehen sich zzgl. gesetzlicher MwSt. Ausschließlich für den unternehmerischen B2B-Gebrauch (§ 14 BGB).",
    monthly: "Monatlich", annual: "Jährlich", twoMonthsFree: "2 Monate gratis",
    perYear: "/ Jahr", processing: "Wird verarbeitet…", openDashboard: "Dashboard öffnen →",
    enterpriseTag: "Enterprise & individuelles Volumen",
    enterpriseTitle: "Dediziertes Onboarding, individuelles SLA oder ERP-Integration nötig?",
    enterpriseDesc: "Individuelle Belegvolumen, Multi-Entity-Architektur, AV-Vertragsabschluss und maßgeschneidertes Compliance-Routing.",
    contactSales: "Vertrieb kontaktieren",
    trialNote: "15-Tage-Tests berechnen niemals still ohne Autorisierung",
    billingPolicy: "Abonnement- & Abrechnungsrichtlinie",
    cancelPolicy: "Kündigungs- & Erstattungsrichtlinie",
  },
  fr: {
    badge: "Offre gratuite · Essai gratuit de 15 jours · Sans carte bancaire",
    title: "Des offres transparentes pour chaque étape de la facturation électronique",
    desc: "Commencez gratuitement ou évaluez l'automatisation complète avec un vrai essai de 15 jours. Payez au mois, ou économisez ~17 % avec la facturation annuelle (2 mois offerts) — annulez le renouvellement à tout moment.",
    vatNote: "Tous les prix s'entendent hors TVA applicable (HT). Strictement pour un usage commercial B2B.",
    monthly: "Mensuel", annual: "Annuel", twoMonthsFree: "2 mois offerts",
    perYear: "/ an", processing: "Traitement…", openDashboard: "Ouvrir le tableau de bord →",
    enterpriseTag: "Entreprise & volume personnalisé",
    enterpriseTitle: "Besoin d'un onboarding dédié, d'un SLA personnalisé ou d'une intégration ERP ?",
    enterpriseDesc: "Volumes de documents personnalisés, architecture multi-entités, signature du DPA et routage de conformité sur mesure.",
    contactSales: "Contacter le commercial",
    trialNote: "Les essais de 15 jours ne facturent jamais en silence sans autorisation",
    billingPolicy: "Politique d'abonnement & de facturation",
    cancelPolicy: "Politique d'annulation & de remboursement",
  },
};

// Backward-compatible English export (used by any legacy import).
export const PRICING_PLANS = PLAN_BASE.map((b) => ({ ...b, ...PLAN_TEXT.en[b.tier] }));

export function PaddlePricingSection() {
  const router = useRouter();
  const { locale } = useLocale();
  const s = SECTION_TEXT[locale] ?? SECTION_TEXT.en;
  const planText = PLAN_TEXT[locale] ?? PLAN_TEXT.en;
  const plans = PLAN_BASE.map((b) => ({ ...b, ...planText[b.tier] }));
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");

  async function launchCheckout(tier: string) {
    setBusyTier(tier);
    setBanner(null);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier, billingCycle: cycle }),
      });

      if (res.status === 401) {
        router.push(`/login?mode=register&plan=${encodeURIComponent(tier)}&cycle=${cycle}`);
        return;
      }

      const data = await res.json();

      if (data.mode === "paddle_overlay" && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
        if (!window.Paddle) {
          await new Promise<void>((resolve, reject) => {
            const sc = document.createElement("script");
            sc.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
            sc.onload = () => resolve();
            sc.onerror = () => reject(new Error("Failed to load Paddle.js"));
            document.head.appendChild(sc);
          });
        }
        if (window.Paddle) {
          if (data.environment === "sandbox") window.Paddle.Environment?.set("sandbox");
          window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
          window.Paddle.Checkout.open({
            items: [{ priceId: data.priceId, quantity: 1 }],
            customData: data.customData,
          });
        }
      } else {
        setBanner(data.message || `Activated ${tier.toUpperCase()} plan.`);
      }
    } finally {
      setBusyTier(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1 text-xs font-bold text-accent-700">
            <Gift className="h-3.5 w-3.5" /> {s.badge}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900">{s.title}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">{s.desc}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-400">{s.vatNote}</p>
        </div>

        {/* Monthly / Annual billing toggle */}
        <div className="mt-7 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-lg px-4 py-1.5 transition ${cycle === "monthly" ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-800"}`}
            >
              {s.monthly}
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 transition ${cycle === "annual" ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-800"}`}
            >
              {s.annual}
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{s.twoMonthsFree}</span>
            </button>
          </div>
        </div>

        {banner && (
          <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{banner}</span>
            <Link href="/dashboard" className="font-bold underline">{s.openDashboard}</Link>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                plan.highlighted
                  ? "border-accent-500 bg-gradient-to-b from-accent-50/50 to-white ring-2 ring-accent-500/20 shadow-card-hover"
                  : "border-slate-200 bg-white shadow-card hover:border-navy-200 hover:shadow-card-hover"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-navy-900">{plan.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                      plan.highlighted ? "bg-accent-500 text-white" : "bg-navy-50 text-navy-800"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="tabular-money text-3xl font-extrabold tracking-tight text-navy-900">
                    {cycle === "annual" ? plan.annualPrice : plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {plan.tier === "free" ? plan.period : cycle === "annual" ? s.perYear : plan.period}
                  </span>
                  {cycle === "annual" && plan.annualSave && (
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {plan.annualSave}
                    </span>
                  )}
                </p>
                {cycle === "annual" && plan.annualMonthly && (
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">{plan.annualMonthly}</p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{plan.desc}</p>
                <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-slate-700">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.tier === "free" ? (
                <Link
                  href="/login?mode=register"
                  className="mt-6 block rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-navy-900 transition hover:bg-navy-50"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={busyTier === plan.tier}
                  onClick={() => void launchCheckout(plan.tier)}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    plan.highlighted
                      ? "bg-accent-500 text-white shadow-sm hover:bg-accent-600"
                      : "bg-navy-900 text-white hover:bg-navy-800"
                  }`}
                >
                  {plan.highlighted && <Crown className="h-3.5 w-3.5" />}
                  {busyTier === plan.tier ? s.processing : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Enterprise Strip + Pre-Checkout Transparency */}
        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">{s.enterpriseTag}</p>
            <h3 className="mt-1 text-lg font-extrabold">{s.enterpriseTitle}</h3>
            <p className="mt-1 text-xs text-navy-200">{s.enterpriseDesc}</p>
          </div>
          <Link
            href="/contact?topic=sales"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-accent-600"
          >
            {s.contactSales} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {s.trialNote}
          </span>
          <span>·</span>
          <Link href="/subscription-billing" className="underline hover:text-navy-900">{s.billingPolicy}</Link>
          <span>·</span>
          <Link href="/cancellation-refunds" className="underline hover:text-navy-900">{s.cancelPolicy}</Link>
        </p>
      </div>
    </section>
  );
}
