"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { computeCanonicalTotals, type CanonicalInvoice } from "@norminvoice/einvoice-core";
import { Alert, Card, PageHeader, apiJson, btnPrimary, btnSecondary, formatMoney, inputCls, labelCls } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { INVOICE_FORM_STRINGS } from "@/lib/i18n";

interface SellerSettings {
  legalName: string;
  vatId: string;
  taxNumber: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  isKleinunternehmer: boolean;
  invoicePrefix: string;
  creditNotePrefix: string;
  nextInvoiceSeq: number;
  defaultFormat: CanonicalInvoice["profile"];
  defaultLocale: "de" | "fr" | "en";
  defaultDueDays: number;
  defaultPaymentTerms: string;
  defaultNotes: string;
  iban: string;
  bic: string;
  accountHolder: string;
}

interface Customer {
  id: string;
  legalName: string;
  vatId: string;
  leitwegId: string;
  electronicAddress: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  defaultFormat: CanonicalInvoice["profile"];
}

type Line = CanonicalInvoice["lines"][number];

interface BuilderState {
  profile: CanonicalInvoice["profile"];
  typeCode: 380 | 381;
  issueDate: string;
  dueDate: string;
  currency: string;
  buyerReference: string;
  purchaseOrderReference: string;
  precedingInvoiceReference: string;
  customerId: string;
  buyer: {
    name: string;
    vatId: string;
    electronicAddress: string;
    street: string;
    postalCode: string;
    city: string;
    countryCode: string;
  };
  lines: Line[];
  notes: string;
  paymentTerms: string;
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const UNIT_OPTIONS = [
  { code: "H87", label: "Piece" },
  { code: "HUR", label: "Hour" },
  { code: "DAY", label: "Day" },
  { code: "MON", label: "Month" },
  { code: "C62", label: "Unit" },
  { code: "KGM", label: "kg" },
];

function BuilderInner() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = INVOICE_FORM_STRINGS[locale];
  const params = useSearchParams();
  const draftId = params.get("draft");
  const presetCustomerId = params.get("customerId");
  const today = new Date().toISOString().slice(0, 10);

  const [settings, setSettings] = useState<SellerSettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<Array<{ id: string; sku: string; name: string; unitCode: string; unitPrice: number; vatCategory: Line["vatCategory"]; vatRate: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft" | "final" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveCustomer, setSaveCustomer] = useState(true);
  const [s, setS] = useState<BuilderState>({
    profile: "ZUGFERD_EN16931",
    typeCode: 380,
    issueDate: today,
    dueDate: addDays(today, 14),
    currency: "EUR",
    buyerReference: "",
    purchaseOrderReference: "",
    precedingInvoiceReference: "",
    customerId: "",
    buyer: { name: "", vatId: "", electronicAddress: "", street: "", postalCode: "", city: "", countryCode: "DE" },
    lines: [{ id: "1", name: "", quantity: 1, unitCode: "HUR", unitPrice: 0, lineAllowance: 0, lineCharge: 0, vatCategory: "S", vatRate: 19 }],
    notes: "",
    paymentTerms: "",
  });

  function applyCustomer(c: Customer, sellerCountry: string, kleinunternehmer: boolean) {
    const isCrossBorderB2B = Boolean(c.vatId) && c.countryCode !== sellerCountry;
    setS((prev) => ({
      ...prev,
      customerId: c.id,
      profile: c.defaultFormat || prev.profile,
      buyerReference: c.leitwegId || prev.buyerReference,
      buyer: {
        name: c.legalName,
        vatId: c.vatId,
        electronicAddress: c.electronicAddress,
        street: c.street,
        postalCode: c.postalCode,
        city: c.city,
        countryCode: c.countryCode,
      },
      lines: prev.lines.map((l) => ({
        ...l,
        vatCategory: kleinunternehmer ? "E" : isCrossBorderB2B ? "AE" : "S",
        vatRate: kleinunternehmer || isCrossBorderB2B ? 0 : l.vatRate || (sellerCountry === "FR" ? 20 : 19),
      })),
    }));
  }

  useEffect(() => {
    void (async () => {
      try {
        const [st, cu, cat] = await Promise.all([
          apiJson<{ settings: SellerSettings }>("/api/v1/settings"),
          apiJson<{ customers: Customer[] }>("/api/v1/customers"),
          apiJson<{ products: Array<any> }>("/api/v1/catalog"),
        ]);
        setSettings(st.settings);
        setCustomers(cu.customers);
        setCatalog(cat.products);
        const ss = st.settings;
        const defaultRate = ss.isKleinunternehmer ? 0 : ss.countryCode === "FR" ? 20 : 19;
        setS((prev) => ({
          ...prev,
          profile: ss.defaultFormat,
          dueDate: addDays(prev.issueDate, ss.defaultDueDays ?? 14),
          paymentTerms: ss.defaultPaymentTerms,
          notes: ss.defaultNotes,
          lines: prev.lines.map((l) => ({ ...l, vatCategory: ss.isKleinunternehmer ? "E" : "S", vatRate: defaultRate })),
        }));

        if (draftId) {
          const d = await apiJson<{ invoice: { status: string; customerId: string | null; canonical: CanonicalInvoice } }>(`/api/v1/invoices/${draftId}`);
          if (d.invoice.status !== "DRAFT") {
            router.replace(`/invoices/${draftId}`);
            return;
          }
          const c = d.invoice.canonical;
          setS({
            profile: c.profile,
            typeCode: c.typeCode,
            issueDate: c.issueDate,
            dueDate: c.payment.dueDate ?? "",
            currency: c.currency,
            buyerReference: c.buyerReference ?? "",
            purchaseOrderReference: c.purchaseOrderReference ?? "",
            precedingInvoiceReference: c.precedingInvoiceReference ?? "",
            customerId: d.invoice.customerId ?? "",
            buyer: {
              name: c.buyer.name,
              vatId: c.buyer.vatId ?? "",
              electronicAddress: c.buyer.electronicAddress ?? "",
              street: c.buyer.address.street,
              postalCode: c.buyer.address.postalCode,
              city: c.buyer.address.city,
              countryCode: c.buyer.address.countryCode,
            },
            lines: c.lines,
            notes: (c.notes ?? []).join("\n"),
            paymentTerms: c.payment.paymentTerms ?? "",
          });
          setSaveCustomer(false);
        } else if (presetCustomerId) {
          const c = cu.customers.find((x) => x.id === presetCustomerId);
          if (c) {
            applyCustomer(c, ss.countryCode, ss.isKleinunternehmer);
            setSaveCustomer(false);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t.errLoad);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, presetCustomerId]);

  function buildCanonical(): Record<string, unknown> {
    const ss = settings!;
    const notes = s.notes.split("\n").map((n) => n.trim()).filter(Boolean);
    return {
      invoiceNumber: "AUTO",
      issueDate: s.issueDate,
      typeCode: s.typeCode,
      currency: s.currency,
      buyerReference: s.buyerReference || undefined,
      purchaseOrderReference: s.purchaseOrderReference || undefined,
      precedingInvoiceReference: s.precedingInvoiceReference || undefined,
      notes,
      locale: ss.defaultLocale,
      profile: s.profile,
      buyer: {
        name: s.buyer.name,
        vatId: s.buyer.vatId || undefined,
        electronicAddress: s.buyer.electronicAddress || undefined,
        electronicAddressScheme: "EM",
        address: {
          street: s.buyer.street,
          postalCode: s.buyer.postalCode,
          city: s.buyer.city,
          countryCode: s.buyer.countryCode.toUpperCase(),
        },
      },
      payment: {
        meansCode: "58",
        paymentTerms: s.paymentTerms || undefined,
        dueDate: s.dueDate || undefined,
        iban: ss.iban || undefined,
        bic: ss.bic || undefined,
        accountName: ss.accountHolder || ss.legalName,
      },
      lines: s.lines.map((l, i) => ({ ...l, id: String(i + 1) })),
    };
  }

  const preview = useMemo(() => {
    if (!settings) return null;
    try {
      const fake = {
        ...(buildCanonical() as object),
        seller: { name: settings.legalName, address: { street: "x", city: "x", postalCode: "x", countryCode: settings.countryCode }, isKleinunternehmer: settings.isKleinunternehmer, electronicAddressScheme: "EM" },
        allowancesTotal: 0,
        chargesTotal: 0,
        prepaidAmount: 0,
        roundingAmount: 0,
      } as unknown as CanonicalInvoice;
      return computeCanonicalTotals(fake).totals;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, settings]);

  async function submit(mode: "draft" | "final") {
    setError(null);
    if (!s.buyer.name.trim() || !s.buyer.street.trim() || !s.buyer.postalCode.trim() || !s.buyer.city.trim()) {
      setError(t.errAddress);
      return;
    }
    if (s.lines.some((l) => !l.name.trim())) {
      setError(t.errLineDesc);
      return;
    }
    if (s.typeCode === 381 && !s.precedingInvoiceReference.trim()) {
      setError(t.errCreditRef);
      return;
    }
    setSaving(mode);
    try {
      let customerId = s.customerId || null;
      if (!customerId && saveCustomer) {
        const created = await apiJson<{ customer: Customer }>("/api/v1/customers", {
          method: "POST",
          body: JSON.stringify({
            legalName: s.buyer.name,
            vatId: s.buyer.vatId,
            leitwegId: s.buyerReference,
            electronicAddress: s.buyer.electronicAddress,
            street: s.buyer.street,
            postalCode: s.buyer.postalCode,
            city: s.buyer.city,
            countryCode: s.buyer.countryCode,
            defaultFormat: s.profile,
          }),
        });
        customerId = created.customer.id;
      }

      const res = await apiJson<{ invoice: { id: string } }>("/api/v1/invoices", {
        method: "POST",
        body: JSON.stringify({ ...buildCanonical(), _draft: mode === "draft", _customerId: customerId, _id: draftId || undefined }),
      });

      if (mode === "final" && draftId) {
        // Draft was updated in place; now finalize to assign gapless number
        await apiJson(`/api/v1/invoices/${res.invoice.id}/finalize`, { method: "POST" });
      }
      router.push(`/invoices/${res.invoice.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errSave);
    } finally {
      setSaving(null);
    }
  }

  const setBuyer = (k: keyof BuilderState["buyer"], v: string) => setS((p) => ({ ...p, buyer: { ...p.buyer, [k]: v } }));
  const setLine = (idx: number, patch: Partial<Line>) =>
    setS((p) => ({ ...p, lines: p.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));

  if (loading || !settings) {
    return <div className="flex items-center gap-2 py-20 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> {t.loadingBuilder}</div>;
  }

  const nextNumber = `${s.typeCode === 381 ? settings.creditNotePrefix : settings.invoicePrefix}${String(settings.nextInvoiceSeq).padStart(4, "0")}`;
  const missingSellerBasics = !settings.street || !settings.city || (!settings.vatId && !settings.taxNumber);

  return (
    <div className="space-y-6">
      <PageHeader
        title={draftId ? t.titleEditDraft : s.typeCode === 381 ? t.titleNewCreditNote : t.titleNewInvoice}
        subtitle={t.subtitle}
        actions={<Link href="/invoices" className={btnSecondary}>{t.cancel}</Link>}
      />

      {missingSellerBasics && (
        <Alert kind="warning">
          {t.warnSellerIncomplete} <Link href="/settings?tab=company" className="underline">{t.completeSettings}</Link>
        </Alert>
      )}
      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title={t.docCard}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className={labelCls}>
                {t.fFormat}
                <select className={inputCls} value={s.profile} onChange={(e) => setS({ ...s, profile: e.target.value as BuilderState["profile"] })}>
                  <option value="ZUGFERD_EN16931">ZUGFeRD 2.3 (PDF + XML)</option>
                  <option value="FACTURX_EN16931">Factur-X 1.07 (PDF + XML)</option>
                  <option value="XRECHNUNG_CII">XRechnung 3.0.2 CII</option>
                  <option value="XRECHNUNG_UBL">XRechnung 3.0.2 UBL</option>
                  <option value="PEPPOL_BIS_3">Peppol BIS 3.0</option>
                </select>
              </label>
              <label className={labelCls}>
                {t.fType}
                <select className={inputCls} value={s.typeCode} onChange={(e) => setS({ ...s, typeCode: Number(e.target.value) as 380 | 381 })}>
                  <option value={380}>{t.typeInvoice}</option>
                  <option value={381}>{t.typeCreditNote}</option>
                </select>
              </label>
              <label className={labelCls}>
                {t.fNumber}
                <input className={`${inputCls} font-mono`} disabled value={t.numberOnFinalize(nextNumber)} />
              </label>
              <label className={labelCls}>
                {t.fIssueDate}
                <input type="date" className={inputCls} value={s.issueDate} onChange={(e) => setS({ ...s, issueDate: e.target.value, dueDate: addDays(e.target.value, settings.defaultDueDays ?? 14) })} />
              </label>
              <label className={labelCls}>
                {t.fDueDate}
                <input type="date" className={inputCls} value={s.dueDate} onChange={(e) => setS({ ...s, dueDate: e.target.value })} />
              </label>
              <label className={labelCls}>
                {t.fCurrency}
                <select className={inputCls} value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })}>
                  {["EUR", "CHF", "GBP", "USD", "PLN", "SEK", "DKK"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className={labelCls}>
                {t.fBuyerRef}
                <input className={`${inputCls} font-mono`} value={s.buyerReference} onChange={(e) => setS({ ...s, buyerReference: e.target.value })} placeholder={s.profile.startsWith("XRECHNUNG") ? t.buyerRefRequired : t.buyerRefOptional} />
              </label>
              <label className={labelCls}>
                {t.fPoNumber}
                <input className={inputCls} value={s.purchaseOrderReference} onChange={(e) => setS({ ...s, purchaseOrderReference: e.target.value })} />
              </label>
              {s.typeCode === 381 && (
                <label className={labelCls}>
                  {t.fOrigInvoice}
                  <input className={`${inputCls} font-mono`} value={s.precedingInvoiceReference} onChange={(e) => setS({ ...s, precedingInvoiceReference: e.target.value })} />
                </label>
              )}
            </div>
          </Card>

          <Card
            title={t.custCard}
            actions={
              <select
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                value={s.customerId}
                onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value);
                  if (c) applyCustomer(c, settings.countryCode, settings.isKleinunternehmer);
                  else setS({ ...s, customerId: "" });
                }}
              >
                <option value="">{customers.length ? t.selectSaved : t.noSaved}</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
              </select>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={`${labelCls} sm:col-span-2`}>
                {t.fCompanyName}
                <input className={inputCls} value={s.buyer.name} onChange={(e) => { setBuyer("name", e.target.value); setS((p) => ({ ...p, customerId: "" })); }} />
              </label>
              <label className={labelCls}>
                {t.fVatId}
                <input className={`${inputCls} font-mono uppercase`} value={s.buyer.vatId} onChange={(e) => setBuyer("vatId", e.target.value)} />
              </label>
              <label className={labelCls}>
                {t.fInvoiceEmail}
                <input type="email" className={inputCls} value={s.buyer.electronicAddress} onChange={(e) => setBuyer("electronicAddress", e.target.value)} />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                {t.fStreet}
                <input className={inputCls} value={s.buyer.street} onChange={(e) => setBuyer("street", e.target.value)} />
              </label>
              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <label className={labelCls}>{t.fPostalCode}<input className={inputCls} value={s.buyer.postalCode} onChange={(e) => setBuyer("postalCode", e.target.value)} /></label>
                <label className={labelCls}>{t.fCity}<input className={inputCls} value={s.buyer.city} onChange={(e) => setBuyer("city", e.target.value)} /></label>
                <label className={labelCls}>{t.fCountry}<input maxLength={2} className={`${inputCls} font-mono uppercase`} value={s.buyer.countryCode} onChange={(e) => setBuyer("countryCode", e.target.value.toUpperCase())} /></label>
              </div>
              {!s.customerId && !draftId && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                  <input type="checkbox" checked={saveCustomer} onChange={(e) => setSaveCustomer(e.target.checked)} />
                  {t.saveCustomer}
                </label>
              )}
            </div>
          </Card>

          <Card
            title={t.lineCard}
            actions={
              <div className="flex flex-wrap gap-2">
                {catalog.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const prod = catalog.find((p) => p.id === e.target.value);
                      if (!prod) return;
                      setS((prev) => {
                        const isEmptyFirst = prev.lines.length === 1 && !prev.lines[0]!.name.trim() && prev.lines[0]!.unitPrice === 0;
                        const newLine: Line = {
                          id: String(isEmptyFirst ? 1 : prev.lines.length + 1),
                          name: prod.name,
                          quantity: 1,
                          unitCode: prod.unitCode,
                          unitPrice: prod.unitPrice,
                          lineAllowance: 0,
                          lineCharge: 0,
                          vatCategory: prod.vatCategory,
                          vatRate: prod.vatRate,
                        };
                        return { ...prev, lines: isEmptyFirst ? [newLine] : [...prev.lines, newLine] };
                      });
                      e.target.value = "";
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <option value="">{t.insertCatalog}</option>
                    {catalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku ? `[${p.sku}] ` : ""}{p.name} ({formatMoney(p.unitPrice)})
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() =>
                    setS((p) => ({
                      ...p,
                      lines: [...p.lines, { ...p.lines[p.lines.length - 1]!, id: String(p.lines.length + 1), name: "", quantity: 1, unitPrice: 0 }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> {t.addLine}
                </button>
              </div>
            }
          >
            <div className="space-y-3">
              {s.lines.map((l, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-12 sm:items-end">
                  <label className={`${labelCls} col-span-2 sm:col-span-4`}>
                    {t.fDescription}
                    <input className={inputCls} value={l.name} onChange={(e) => setLine(idx, { name: e.target.value })} />
                  </label>
                  <label className={`${labelCls} sm:col-span-1`}>
                    {t.fQty}
                    <input type="number" step="0.01" className={`${inputCls} font-mono`} value={l.quantity} onChange={(e) => setLine(idx, { quantity: Number(e.target.value) || 0 })} />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    {t.fUnit}
                    <select className={inputCls} value={l.unitCode} onChange={(e) => setLine(idx, { unitCode: e.target.value })}>
                      {UNIT_OPTIONS.map((u) => <option key={u.code} value={u.code}>{t.units[u.code] ?? u.label}</option>)}
                    </select>
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    {t.fUnitPrice}
                    <input type="number" step="0.01" className={`${inputCls} font-mono`} value={l.unitPrice} onChange={(e) => setLine(idx, { unitPrice: Number(e.target.value) || 0 })} />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    {t.fVat}
                    <select
                      className={inputCls}
                      value={`${l.vatCategory}:${l.vatRate}`}
                      onChange={(e) => {
                        const [cat, rate] = e.target.value.split(":");
                        setLine(idx, { vatCategory: cat as Line["vatCategory"], vatRate: Number(rate) });
                      }}
                    >
                      <option value="S:19">19 % (DE)</option>
                      <option value="S:7">7 % (DE)</option>
                      <option value="S:20">20 % (FR/AT)</option>
                      <option value="S:10">10 % (FR/AT)</option>
                      <option value="S:21">21 % (BE/NL)</option>
                      <option value="S:5.5">5.5 % (FR)</option>
                      <option value="AE:0">Reverse charge (AE)</option>
                      <option value="E:0">Exempt § 19 UStG (E)</option>
                      <option value="G:0">Export non-EU (G)</option>
                      <option value="K:0">Intra-EU goods (K)</option>
                      <option value="O:0">Out of scope (O)</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-end gap-2 sm:col-span-1">
                    <button type="button" title={t.removeLine} disabled={s.lines.length <= 1} onClick={() => setS((p) => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                {t.fPaymentTerms}
                <input className={inputCls} value={s.paymentTerms} onChange={(e) => setS({ ...s, paymentTerms: e.target.value })} />
              </label>
              <label className={labelCls}>
                {t.fNotes}
                <textarea rows={2} className={inputCls} value={s.notes} onChange={(e) => setS({ ...s, notes: e.target.value })} />
              </label>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <Card title={t.summary}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">{t.sNet}</dt><dd className="font-mono tabular-money">{formatMoney(preview?.taxExclusiveTotal ?? 0, s.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">{t.sVat}</dt><dd className="font-mono tabular-money">{formatMoney(preview?.taxTotal ?? 0, s.currency)}</dd></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold"><dt>{t.sTotal}</dt><dd className="font-mono tabular-money text-brand-700">{formatMoney(preview?.payableAmount ?? 0, s.currency)}</dd></div>
              </dl>
              <div className="mt-5 space-y-2">
                <button type="button" disabled={saving !== null} onClick={() => void submit("final")} className={`${btnPrimary} w-full`}>
                  {saving === "final" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {t.validateFinalize}
                </button>
                <button type="button" disabled={saving !== null} onClick={() => void submit("draft")} className={`${btnSecondary} w-full`}>
                  {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.saveDraft}
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                {t.finalizeHint(nextNumber)}
              </p>
            </Card>

            <Card title={t.fromCompany} actions={<Link href="/settings?tab=company" className="text-xs font-bold text-brand-700 hover:underline">{t.edit}</Link>}>
              <div className="space-y-1 text-xs text-slate-700">
                <p className="font-bold text-slate-900">{settings.legalName}</p>
                <p>{settings.street || <span className="text-amber-700">{t.streetMissing}</span>}</p>
                <p>{settings.postalCode} {settings.city} · {settings.countryCode}</p>
                <p className="font-mono">{settings.vatId || settings.taxNumber || <span className="text-amber-700">{t.taxIdMissing}</span>}</p>
                <p className="flex items-center gap-1 font-mono">
                  {settings.iban ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {settings.iban}</> : <><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> {t.noIban}</>}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="py-20 text-sm text-slate-500">Loading…</div>}>
      <BuilderInner />
    </Suspense>
  );
}
