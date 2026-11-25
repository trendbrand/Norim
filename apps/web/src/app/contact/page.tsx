"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Phone, Send, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";
import { CONTACT_STRINGS } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { Alert, btnPrimary, inputCls, labelCls } from "@/components/ui";

function ContactFormInner() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const t = CONTACT_STRINGS[locale];
  const initialTopic = params.get("topic") || "sales";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState(t.phCountry);
  const [topic, setTopic] = useState(
    ["sales", "support", "billing", "privacy", "partners", "general"].includes(initialTopic) ? initialTopic : "sales"
  );
  const [message, setMessage] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ inquiryId: string; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setConfirmation(null);
    try {
      const res = await fetch("/api/v1/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          country,
          topic,
          message,
          marketingOptIn,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.couldNotSubmit);
      setConfirmation({ inquiryId: data.inquiryId, message: data.message });
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setMarketingOptIn(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.submissionFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Info Column */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl bg-navy-900 p-7 text-white">
              <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
                NormInvoice — Product of Trend&amp;Brand
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{t.heroTitle}</h1>
              <p className="mt-2.5 text-sm leading-relaxed text-navy-200">{t.heroDesc}</p>

              <div className="mt-6 space-y-3 text-sm">
                <a
                  href={`mailto:${BRAND_CONTACT.email}`}
                  className="flex items-center gap-3 rounded-xl bg-navy-800/80 px-4 py-3 font-semibold text-white hover:bg-navy-800"
                >
                  <Mail className="h-4 w-4 text-accent-500" /> {BRAND_CONTACT.email}
                </a>
                <div className="flex items-center gap-3 rounded-xl bg-navy-800/80 px-4 py-3 font-semibold text-white">
                  <Phone className="h-4 w-4 text-accent-500" /> {BRAND_CONTACT.phone}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card text-xs space-y-3">
              <h2 className="text-sm font-extrabold text-navy-900">{t.topicHelpTitle}</h2>
              <ul className="space-y-2 text-slate-600">
                {t.topicHelp.map((item) => (
                  <li key={item.label}>
                    <strong className="text-navy-900">{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                {t.securityWarn}
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
              <h2 className="text-lg font-extrabold text-navy-900">{t.formTitle}</h2>
              <p className="mt-1 text-xs text-slate-500">{t.formDesc}</p>

              {confirmation && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <p className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t.inquiryReceived} ({confirmation.inquiryId})
                  </p>
                  <p className="mt-1">{confirmation.message}</p>
                </div>
              )}

              {error && (
                <div className="mt-5">
                  <Alert kind="error">{error}</Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Hidden anti-spam honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className={labelCls}>
                    {t.labelName}
                    <input
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.phName}
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    {t.labelEmail}
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.phEmail}
                      className={inputCls}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className={labelCls}>
                    {t.labelCompany}
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t.phCompany}
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    {t.labelCountry}
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={t.phCountry}
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    {t.labelTopic}
                    <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls}>
                      <option value="sales">{t.optSales}</option>
                      <option value="support">{t.optSupport}</option>
                      <option value="billing">{t.optBilling}</option>
                      <option value="privacy">{t.optPrivacy}</option>
                      <option value="partners">{t.optPartners}</option>
                      <option value="general">{t.optGeneral}</option>
                    </select>
                  </label>
                </div>

                <label className={labelCls}>
                  {t.labelMessage}
                  <textarea
                    required
                    minLength={10}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.phMessage}
                    className={inputCls}
                  />
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-accent-500"
                  />
                  <span>{t.marketingOptIn}</span>
                </label>

                <p className="text-[11px] leading-relaxed text-slate-500">
                  {t.privacyPre}
                  <Link href="/privacy" className="font-semibold text-navy-900 underline hover:text-accent-600">
                    {t.privacyLink}
                  </Link>
                  {t.privacyPost}
                </p>

                <button type="submit" disabled={submitting} className={`${btnPrimary} px-6 py-3 text-sm`}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? t.sending : t.send}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading contact form…</div>}>
      <ContactFormInner />
    </Suspense>
  );
}
