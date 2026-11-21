import Link from "next/link";

export const metadata = {
  title: "Privacy Policy / Datenschutzerklärung (GDPR / DSGVO & TDDDG) — NormInvoice",
  description:
    "Full EU GDPR (Art. 13/14 DSGVO) & German TDDDG § 25 Privacy Policy for NormInvoice: Zero-Retention Validator, 100% Germany Hosting (Hetzner), Self-Hosted Fonts, Sub-Processors & Data Subject Rights.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            EU GDPR (Art. 13/14 DSGVO)
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            § 25 TDDDG Compliant · Zero Tracking Cookies
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Last Updated: November 2026
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Privacy Policy / Datenschutzerklärung (GDPR &amp; TDDDG)
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This notice informs business users in accordance with Articles 13 and 14 of Regulation (EU) 2016/679 (GDPR /
          DSGVO) and Section 25 of the German Telecommunications Digital Services Data Protection Act (TDDDG).
        </p>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900">1. Data Controller (Verantwortlicher — Art. 13(1)(a) GDPR)</h2>
            <p className="mt-1.5">
              Responsible controller for data processing on this website is the entity listed in our{" "}
              <Link href="/legal/impressum" className="font-semibold text-brand-600 underline">
                Impressum / Legal Notice
              </Link>
              . Privacy inquiries &amp; GDPR requests: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">privacy@norminvoice.eu</code>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              2. Zero-Retention Public Validator &amp; Viewer (Art. 5(1)(c) Data Minimization)
            </h2>
            <p className="mt-1.5">
              Invoices uploaded to our free public Validator &amp; Viewer (
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">/api/v1/public/inspect</code>) are
              processed exclusively in volatile RAM (
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">tmpfs</code>) inside an isolated,
              zero-internet-egress container. Immediately after returning your validation report, the file buffer is
              wiped. No names, VAT numbers, line items, or IBANs are written to disk or application logs.
            </p>
            <p className="mt-1.5 text-xs text-slate-600">
              <strong>DE:</strong> Dateien im kostenlosen Online-Prüfer werden ausschließlich im flüchtigen Arbeitsspeicher (RAM) verarbeitet und nach der Prüfung sofort verworfen. Es findet keine Speicherung oder Protokollierung von Rechnungsdaten statt.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              3. Cookies, Local Fonts &amp; Zero Tracking (§ 25 TDDDG &amp; LG München Ruling)
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Zero Tracking / Zero Marketing Cookies:</strong> NormInvoice does <strong>not</strong> use Google
                Analytics, Meta Pixel, advertising trackers, or third-party cookies.
              </li>
              <li>
                <strong>Strictly Necessary Session Cookie Only:</strong> When you sign in, we set a single{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">HttpOnly; SameSite=Lax; Secure</code>{" "}
                cookie (<code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">norminvoice_session</code>)
                exempt from consent under <strong>§ 25 Abs. 2 Nr. 2 TDDDG</strong>.
              </li>
              <li>
                <strong>100% Self-Hosted Web Fonts:</strong> Typography (Inter &amp; JetBrains Mono) is bundled locally
                at build time via Next.js font optimization. Zero browser requests are ever sent to Google Fonts servers
                (full compliance with LG München I, 20.01.2022, Az. 3 O 17493/20).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">4. Purposes, Legal Bases &amp; Retention Periods</h2>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Processing Activity</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Legal Basis (GDPR)</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">Free Public Validator</td>
                    <td className="px-4 py-2.5">Art. 6(1)(b) / Art. 6(1)(f)</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">0 seconds (RAM-only)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">Paid Workspace &amp; API Bridge</td>
                    <td className="px-4 py-2.5">Art. 6(1)(b) Contract + Art. 28 DPA</td>
                    <td className="px-4 py-2.5">Duration of contract + 30-day export window</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">GoBD / Tax Invoice Archive</td>
                    <td className="px-4 py-2.5">Art. 6(1)(c) (§ 147 AO / BEG IV / LPF)</td>
                    <td className="px-4 py-2.5">8 years (DE BEG IV) or 10 years (FR) WORM lock</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">Security &amp; Rate-Limit Logs</td>
                    <td className="px-4 py-2.5">Art. 6(1)(f) Legitimate Interest</td>
                    <td className="px-4 py-2.5">14 days rolling purge (no invoice PII logged)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">5. Sub-Processors &amp; Data Sovereignty (100% EU Hosting)</h2>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Sub-Processor</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Purpose &amp; Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">Hetzner Online GmbH</td>
                    <td className="px-4 py-2.5">Germany (EU)</td>
                    <td className="px-4 py-2.5">Compute, PostgreSQL 16 DB &amp; WORM Object Storage (GDPR Art. 28 AVV)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">Paddle.com Market Ltd</td>
                    <td className="px-4 py-2.5">UK / EU</td>
                    <td className="px-4 py-2.5">Merchant of Record billing &amp; VAT (EU Adequacy Decision for UK)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">European Commission VIES</td>
                    <td className="px-4 py-2.5">EU (Brussels)</td>
                    <td className="px-4 py-2.5">Official EU VAT ID verification (only VAT number transmitted)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">EU Transactional Email (Resend EU / Postmark)</td>
                    <td className="px-4 py-2.5">EU Region</td>
                    <td className="px-4 py-2.5">Dispatching generated e-invoices &amp; accountant CC emails (TLS enforced)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Need an executed GDPR Art. 28 Data Processing Agreement (AVV)? View and print our{" "}
              <Link href="/legal/dpa" className="font-semibold text-brand-600 underline">
                Art. 28 GDPR Data Processing Agreement (AVV / DPA) →
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">6. Your GDPR Rights (Betroffenenrechte — Art. 15–21 &amp; 77 GDPR)</h2>
            <p className="mt-1.5">
              You have the statutory right to request <strong>Access (Art. 15)</strong>, <strong>Rectification (Art. 16)</strong>,{" "}
              <strong>Erasure (Art. 17)</strong> (subject to mandatory tax archiving under § 147 AO / Art. 17(3)(b) GDPR),{" "}
              <strong>Restriction of Processing (Art. 18)</strong>, <strong>Data Portability (Art. 20)</strong> (instant
              XML/PDF/DATEV/FEC export), and to <strong>Object (Art. 21)</strong> by emailing{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">privacy@norminvoice.eu</code>.
            </p>
            <p className="mt-2">
              <strong>Right to Lodge a Complaint (Art. 77 GDPR):</strong> You also have the right to lodge a complaint
              with a competent EU data protection supervisory authority — such as the German Federal Commissioner (<em>BfDI</em>), your state <em>Landesdatenschutzbeauftragter</em>, or the French <em>CNIL</em>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
