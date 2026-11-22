import Link from "next/link";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "Impressum (§ 5 DDG) / Legal Notice — NormInvoice — Product of Trend&Brand",
  description: "Statutory German provider identification pursuant to § 5 DDG and § 18 Abs. 2 MStV for NormInvoice.",
};

export default function ImpressumPage() {
  return (
    <div className="bg-canvas py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
          <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-900">
            Angaben gemäß § 5 DDG &amp; § 18 Abs. 2 MStV
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900">Impressum / Legal Notice</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="font-bold text-navy-900">Anbieter / Provider</h2>
              <p className="mt-1">
                <strong>NormInvoice — Product of Trend&amp;Brand</strong><br />
                Proposed Contracting Entity (pending formal launch confirmation): Trend&amp;Brand LLC, Wyoming, USA<br />
                Related Group Entity: {BRAND_CONTACT.relatedEntity.name} (Inc. {BRAND_CONTACT.relatedEntity.incorporationNo}, NTN {BRAND_CONTACT.relatedEntity.ntn}, CEO {BRAND_CONTACT.relatedEntity.ceo})<br />
                {BRAND_CONTACT.relatedEntity.address}
              </p>
            </section>

            <section>
              <h2 className="font-bold text-navy-900">Kontakt / Contact</h2>
              <p className="mt-1">
                E-Mail: <a href={`mailto:${BRAND_CONTACT.email}`} className="font-semibold text-navy-900 underline">{BRAND_CONTACT.email}</a><br />
                Telefon / Business Phone: {BRAND_CONTACT.phone}<br />
                Full English Legal Notice: <Link href="/legal-notice" className="font-semibold text-accent-700 underline">/legal-notice</Link>
              </p>
            </section>

            <section>
              <h2 className="font-bold text-navy-900">Umsatzsteuer &amp; Abrechnung / Billing</h2>
              <p className="mt-1">
                NormInvoice ist ein abonnementbasierter Software-Service (B2B SaaS). Kostenpflichtige Abonnements werden
                über das im Bestellvorgang und in der{" "}
                <Link href="/subscription-billing" className="font-semibold text-accent-700 underline">
                  Subscription &amp; Billing Policy
                </Link>{" "}
                ausgewiesene Unternehmen bzw. den autorisierten Zahlungsdienstleister abgerechnet.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-navy-900">Hinweis gemäß § 36 VSBG (B2B-Angebot)</h2>
              <p className="mt-1">
                NormInvoice richtet sich primär an Unternehmer im Sinne des § 14 BGB (B2B). Wir sind nicht verpflichtet
                und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die
                ehemalige EU-OS-Plattform (ODR) wurde am 20. Juli 2025 dauerhaft eingestellt.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
