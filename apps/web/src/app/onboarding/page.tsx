"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, ShoppingCart, Webhook, FilePlus2 } from "lucide-react";
import { Alert, apiJson, btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/ui";
import { useAppSession } from "@/components/AppShell";
import { validateIbanClient } from "@/lib/iban";

interface OnboardingForm {
  legalName: string;
  tradingName: string;
  managingDirector: string;
  registrationId: string;
  countryCode: string;
  street: string;
  postalCode: string;
  city: string;
  vatId: string;
  taxNumber: string;
  isKleinunternehmer: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  electronicAddress: string;
  iban: string;
  bic: string;
  accountHolder: string;
  invoicePrefix: string;
  creditNotePrefix: string;
  nextInvoiceSeq: number;
  defaultFormat: string;
  defaultDueDays: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { session, reload } = useAppSession();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viesState, setViesState] = useState<{ loading: boolean; status?: string; name?: string }>({ loading: false });
  const year = new Date().getFullYear();
  const [f, setF] = useState<OnboardingForm>({
    legalName: "",
    tradingName: "",
    managingDirector: "",
    registrationId: "",
    countryCode: "DE",
    street: "",
    postalCode: "",
    city: "",
    vatId: "",
    taxNumber: "",
    isKleinunternehmer: false,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    electronicAddress: "",
    iban: "",
    bic: "",
    accountHolder: "",
    invoicePrefix: `RE-${year}-`,
    creditNotePrefix: `GS-${year}-`,
    nextInvoiceSeq: 1,
    defaultFormat: "ZUGFERD_EN16931",
    defaultDueDays: 14,
  });

  useEffect(() => {
    void apiJson<{ settings: any }>("/api/v1/settings").then(({ settings }) => {
      if (!settings) return;
      setF((prev) => ({
        ...prev,
        legalName: settings.legalName || "",
        countryCode: settings.countryCode || "DE",
        contactName: settings.contactName || "",
        contactEmail: settings.contactEmail || "",
        electronicAddress: settings.electronicAddress || "",
        accountHolder: settings.accountHolder || settings.legalName || "",
        defaultFormat: settings.defaultFormat || prev.defaultFormat,
        invoicePrefix: settings.countryCode === "FR" ? `FA-${year}-` : prev.invoicePrefix,
        creditNotePrefix: settings.countryCode === "FR" ? `AV-${year}-` : prev.creditNotePrefix,
      }));
    });
  }, [year]);

  const set = <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => setF((p) => ({ ...p, [k]: v }));

  async function checkVies() {
    if (!f.vatId.trim()) return;
    setViesState({ loading: true });
    try {
      const r = await apiJson<{ status: string; traderName?: string }>("/api/v1/vat/verify", {
        method: "POST",
        body: JSON.stringify({ vatId: f.vatId, liveLookup: true }),
      });
      setViesState({ loading: false, status: r.status, name: r.traderName });
    } catch (e) {
      setViesState({ loading: false, status: "ERROR", name: e instanceof Error ? e.message : undefined });
    }
  }

  function validateStep1(): string | null {
    if (!f.legalName.trim()) return "Company legal name is required.";
    if (!f.street.trim() || !f.postalCode.trim() || !f.city.trim()) return "Full business address is required (EN 16931 BG-5).";
    if (!f.vatId.trim() && !f.taxNumber.trim()) return "Provide a VAT ID or a national tax number (BT-31 / BT-32).";
    if (!f.contactEmail.trim()) return "Contact email is required.";
    return null;
  }

  function validateStep2(): string | null {
    if (f.iban && !validateIbanClient(f.iban)) return "This IBAN fails the ISO 13616 checksum. Please check for typos.";
    if (!f.invoicePrefix.trim()) return "Invoice number prefix is required.";
    return null;
  }

  async function finish() {
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiJson("/api/v1/account/onboarding", {
        method: "POST",
        body: JSON.stringify({
          ...f,
          electronicAddress: f.electronicAddress || f.contactEmail,
          accountHolder: f.accountHolder || f.legalName,
          defaultLocale: f.countryCode === "FR" ? "fr" : f.countryCode === "DE" || f.countryCode === "AT" ? "de" : "en",
          retentionYears: f.countryCode === "FR" ? 10 : 8,
        }),
      });
      await reload();
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const steps = ["Company & tax", "Banking & numbering", "Connect & start"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Welcome{session ? `, ${session.user.fullName.split(" ")[0]}` : ""}</p>
      <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Set up your e-invoicing workspace</h1>
      <p className="mt-1 text-sm text-slate-600">
        These details appear on every invoice and are required by EN 16931. You can change them later in Settings.
      </p>

      <ol className="mt-6 grid grid-cols-3 gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${active ? "border-brand-300 bg-brand-50 text-brand-800" : done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500"}`}>
              <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold shadow-sm">
                {done ? "✓" : n}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-4"><Alert kind="error">{error}</Alert></div>}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              Company legal name (BT-27) *
              <input className={inputCls} value={f.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="Schmidt Consulting GmbH" />
            </label>
            <label className={labelCls}>
              Managing director (Geschäftsführer)
              <input className={inputCls} value={f.managingDirector} onChange={(e) => set("managingDirector", e.target.value)} />
            </label>
            <label className={labelCls}>
              Commercial register (e.g. HRB 12345 B)
              <input className={inputCls} value={f.registrationId} onChange={(e) => set("registrationId", e.target.value)} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Street & number *
              <input className={inputCls} value={f.street} onChange={(e) => set("street", e.target.value)} />
            </label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label className={labelCls}>
                Postal code *
                <input className={inputCls} value={f.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              </label>
              <label className={labelCls}>
                City *
                <input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} />
              </label>
              <label className={labelCls}>
                Country *
                <select className={inputCls} value={f.countryCode} onChange={(e) => set("countryCode", e.target.value)}>
                  {["DE", "AT", "FR", "BE", "NL", "LU", "IT", "ES"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label className={labelCls}>
              EU VAT ID (BT-31)
              <div className="flex gap-2">
                <input className={`${inputCls} font-mono uppercase`} value={f.vatId} onChange={(e) => set("vatId", e.target.value)} placeholder="DE123456789" />
                <button type="button" onClick={() => void checkVies()} className="mt-1 whitespace-nowrap rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  {viesState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check VIES"}
                </button>
              </div>
              {viesState.status && (
                <span className={`mt-1 block text-[11px] font-semibold ${viesState.status === "VERIFIED" ? "text-emerald-700" : viesState.status === "PROVISIONAL" ? "text-amber-700" : "text-red-700"}`}>
                  {viesState.status}{viesState.name ? ` · ${viesState.name}` : ""}
                </span>
              )}
            </label>
            <label className={labelCls}>
              Tax number / Steuernummer (BT-32)
              <input className={`${inputCls} font-mono`} value={f.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} placeholder="143/123/45678" />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={f.isKleinunternehmer} onChange={(e) => set("isKleinunternehmer", e.target.checked)} />
              Small business exemption (Kleinunternehmer § 19 UStG) — invoices without VAT
            </label>
            <label className={labelCls}>
              Billing contact name (BG-6)
              <input className={inputCls} value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </label>
            <label className={labelCls}>
              Contact phone
              <input className={inputCls} value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+49 30 1234567" />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Contact email *
              <input type="email" className={inputCls} value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
            </label>
            <div className="flex justify-end sm:col-span-2">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  const err = validateStep1();
                  setError(err);
                  if (!err) setStep(2);
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              IBAN (BT-84)
              <input className={`${inputCls} font-mono uppercase`} value={f.iban} onChange={(e) => set("iban", e.target.value)} placeholder="DE89 3704 0044 0532 0130 00" />
              {f.iban && (
                <span className={`mt-1 block text-[11px] font-semibold ${validateIbanClient(f.iban) ? "text-emerald-700" : "text-red-700"}`}>
                  {validateIbanClient(f.iban) ? "✓ Valid IBAN checksum (ISO 13616)" : "✗ Invalid IBAN checksum"}
                </span>
              )}
            </label>
            <label className={labelCls}>
              BIC (BT-86)
              <input className={`${inputCls} font-mono uppercase`} value={f.bic} onChange={(e) => set("bic", e.target.value)} />
            </label>
            <label className={labelCls}>
              Account holder
              <input className={inputCls} value={f.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} placeholder={f.legalName} />
            </label>
            <label className={labelCls}>
              Invoice number prefix
              <input className={`${inputCls} font-mono`} value={f.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />
            </label>
            <label className={labelCls}>
              Credit note prefix
              <input className={`${inputCls} font-mono`} value={f.creditNotePrefix} onChange={(e) => set("creditNotePrefix", e.target.value)} />
            </label>
            <label className={labelCls}>
              Next sequence number
              <input type="number" min={1} className={`${inputCls} font-mono`} value={f.nextInvoiceSeq} onChange={(e) => set("nextInvoiceSeq", Math.max(1, Number(e.target.value) || 1))} />
              <span className="mt-1 block text-[11px] text-slate-500">
                First invoice: <span className="font-mono font-bold">{f.invoicePrefix}{String(f.nextInvoiceSeq).padStart(4, "0")}</span>
              </span>
            </label>
            <label className={labelCls}>
              Payment terms (days)
              <input type="number" min={0} className={inputCls} value={f.defaultDueDays} onChange={(e) => set("defaultDueDays", Number(e.target.value) || 0)} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Default e-invoice format
              <select className={inputCls} value={f.defaultFormat} onChange={(e) => set("defaultFormat", e.target.value)}>
                <option value="ZUGFERD_EN16931">ZUGFeRD 2.3 — PDF + XML (Germany B2B)</option>
                <option value="FACTURX_EN16931">Factur-X 1.07 — PDF + XML (France)</option>
                <option value="XRECHNUNG_CII">XRechnung 3.0.2 CII (German public sector)</option>
                <option value="XRECHNUNG_UBL">XRechnung 3.0.2 UBL (German public sector)</option>
                <option value="PEPPOL_BIS_3">Peppol BIS 3.0 (Belgium / EU network)</option>
              </select>
            </label>
            <div className="flex justify-between sm:col-span-2">
              <button type="button" className={btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button type="button" className={btnPrimary} disabled={saving} onClick={() => void finish()}>
                {saving ? "Saving…" : "Save & finish setup"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
              <h2 className="text-lg font-bold">Your workspace is ready</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">Choose how you want to create your first compliant e-invoice:</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { href: "/invoices/new", icon: FilePlus2, title: "Create an invoice", text: "Manual invoice builder with live validation." },
                { href: "/settings?tab=integrations", icon: Webhook, title: "Connect Stripe", text: "Auto-convert Stripe invoices via webhook." },
                { href: "/settings?tab=integrations", icon: ShoppingCart, title: "Connect WooCommerce", text: "Install our plugin & paste your secret." },
              ].map((c) => (
                <button key={c.title} type="button" onClick={() => router.push(c.href)} className="rounded-xl border border-slate-200 p-4 text-left hover:border-brand-300 hover:bg-brand-50/40">
                  <c.icon className="h-5 w-5 text-brand-600" />
                  <p className="mt-2 text-sm font-bold text-slate-900">{c.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{c.text}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Setup recorded in your GoBD audit trail.</p>
              <button type="button" className={btnSecondary} onClick={() => router.push("/dashboard")}>Go to dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
