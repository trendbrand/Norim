"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Phone, Send, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";
import { Alert, btnPrimary, inputCls, labelCls } from "@/components/ui";

function ContactFormInner() {
  const params = useSearchParams();
  const initialTopic = params.get("topic") || "sales";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("Germany");
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
      if (!res.ok) throw new Error(data.error || "Could not submit your inquiry.");
      setConfirmation({ inquiryId: data.inquiryId, message: data.message });
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setMarketingOptIn(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
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
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Contact Our Team</h1>
              <p className="mt-2.5 text-sm leading-relaxed text-navy-200">
                Questions about subscription plans, European country support, integrations, billing, or privacy? Send us
                a message and we will review it directly.
              </p>

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
              <h2 className="text-sm font-extrabold text-navy-900">Choose the Right Topic</h2>
              <ul className="space-y-2 text-slate-600">
                <li><strong className="text-navy-900">Sales &amp; Plans:</strong> Solo ($39/mo), Business, Enterprise &amp; country readiness.</li>
                <li><strong className="text-navy-900">Technical Support:</strong> Validation codes, imports, webhooks, and workspace setup.</li>
                <li><strong className="text-navy-900">Billing:</strong> Subscription invoices, plan changes, renewals, and refunds.</li>
                <li><strong className="text-navy-900">Privacy &amp; Security:</strong> GDPR data requests, DPA execution, and security reports.</li>
                <li><strong className="text-navy-900">Partners:</strong> Accountants, ERPs, Peppol Access Points &amp; developers.</li>
              </ul>
              <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Never send passwords, API keys, or complete payment card numbers in this form.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
              <h2 className="text-lg font-extrabold text-navy-900">Send a Message</h2>
              <p className="mt-1 text-xs text-slate-500">
                Submissions are stored securely in our inquiry queue with a real tracking reference ID.
              </p>

              {confirmation && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <p className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Inquiry Received ({confirmation.inquiryId})
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
                    Full Name *
                    <input
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Anna Schmidt"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    Work Email *
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="finance@company.eu"
                      className={inputCls}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className={labelCls}>
                    Company / Firm
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Schmidt GmbH"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    Country
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Germany"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    Topic *
                    <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls}>
                      <option value="sales">Sales &amp; Plans</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing &amp; Subscriptions</option>
                      <option value="privacy">Privacy &amp; Security</option>
                      <option value="partners">Partners &amp; Developers</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </label>
                </div>

                <label className={labelCls}>
                  Message *
                  <textarea
                    required
                    minLength={10}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your invoicing workflow, target EU countries, or question..."
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
                  <span>
                    Optional: I would also like to receive occasional product updates and European compliance release
                    notes by email.
                  </span>
                </label>

                <p className="text-[11px] leading-relaxed text-slate-500">
                  We use the details you submit to respond to your inquiry in line with our{" "}
                  <Link href="/privacy" className="font-semibold text-navy-900 underline hover:text-accent-600">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <button type="submit" disabled={submitting} className={`${btnPrimary} px-6 py-3 text-sm`}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Sending Inquiry…" : "Send Message"}
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
