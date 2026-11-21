export const metadata = {
  title: "Impressum (§ 5 DDG) / Legal Notice — NormInvoice",
  description: "Statutory German provider identification pursuant to § 5 DDG and § 18 Abs. 2 MStV.",
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Angaben gemäß § 5 DDG &amp; § 18 Abs. 2 MStV
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Impressum / Legal Notice</h1>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="font-bold text-slate-900">Anbieter / Provider</h2>
            <p className="mt-1">
              NormInvoice Software Services<br />
              [Replace with Legal Owner / Company Name before Public Launch]<br />
              [Registered Street Address, Postal Code, City, Country]
            </p>
          </section>

          <section>
            <h2 className="font-bold text-slate-900">Kontakt / Contact</h2>
            <p className="mt-1">
              E-Mail: legal@norminvoice.eu<br />
              Support: support@norminvoice.eu<br />
              Datenschutz / Privacy: privacy@norminvoice.eu<br />
              Web: https://norminvoice.eu
            </p>
          </section>

          <section>
            <h2 className="font-bold text-slate-900">Umsatzsteuer &amp; Abrechnung / Billing</h2>
            <p className="mt-1">
              Alle kostenpflichtigen Abonnements werden über unseren autorisierten Merchant of Record (
              <strong>Paddle.com Market Ltd</strong>) inklusive korrekter EU-Umsatzsteuer-Ausweisung abgewickelt.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-slate-900">Hinweis gemäß § 36 VSBG (B2B-Angebot)</h2>
            <p className="mt-1">
              NormInvoice richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB (B2B). Wir sind nicht
              verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
