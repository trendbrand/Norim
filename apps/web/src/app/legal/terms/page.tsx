export const metadata = {
  title: "Terms of Service & Compliance Disclaimer — NormInvoice",
  description: "B2B Terms of Service, technical EN 16931 compliance disclaimer, and Paddle Merchant of Record billing terms.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          B2B SaaS Terms of Service
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Terms of Service &amp; Compliance Notice</h1>

        <div className="mt-6 space-y-5 text-sm text-slate-700">
          <section>
            <h2 className="font-bold text-slate-900">1. Scope of Service</h2>
            <p className="mt-1">
              NormInvoice provides technical software automation for generating, converting, validating, and archiving electronic invoices conforming to EN 16931 (ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0) and DATEV EXTF exports.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-slate-900">2. No Tax or Legal Advice Disclaimer</h2>
            <p className="mt-1">
              NormInvoice assists with technical e-invoicing workflows and automated schema/Schematron checks, but{" "}
              <strong>does not constitute formal tax, accounting, or legal advice</strong>. Responsibility for accurate
              VAT categorization (including Reverse Charge, Kleinunternehmer § 19 UStG, and national e-invoicing
              obligations) remains with the issuing merchant and their certified tax advisor (<em>Steuerberater</em> /{" "}
              <em>Expert-comptable</em>).
            </p>
          </section>

          <section>
            <h2 className="font-bold text-slate-900">3. Billing, Quotas &amp; Cancellation</h2>
            <p className="mt-1">
              Paid subscriptions (€19 Solo / €49 Business / €129 Agency) are billed monthly or annually via Paddle.com as Merchant of Record. Subscriptions may be cancelled anytime before the next renewal period. GoBD archived files remain downloadable in standard XML/PDF/DATEV formats for 30 days following cancellation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
