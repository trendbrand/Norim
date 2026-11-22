import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Mail, Phone, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "About NormInvoice | A Trend&Brand Product",
  description:
    "Learn about NormInvoice — subscription-based European e-invoicing and financial workflow software developed under the Trend&Brand business group.",
};

export default function AboutPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            NormInvoice — Product of Trend&amp;Brand
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Making European E-Invoicing Clear, Structured, and Manageable
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-100 sm:text-base">
            European markets are transitioning toward structured electronic invoicing — yet every country applies
            different technical formats, tax fields, validation rules, and transmission networks. NormInvoice brings
            these workflows together in one coherent, multi-tenant software platform.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
            <h2 className="text-lg font-extrabold text-navy-900">Our Mission &amp; Product Focus</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              Make digital invoicing accessible, transparent, and audit-ready for growing businesses, finance teams,
              and accountants — without forcing teams to stitch together fragile PDF hacks and spreadsheets.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              {[
                "Deterministic EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2 engine",
                "Outgoing billing, incoming supplier inbox, recurring schedules & approvals",
                "Tamper-evident GoBD SHA-256 hash-chained audit trail & DATEV/FEC exports",
                "Transparent country status labels (Available, Partner-Operated, Planned)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
              <ShieldCheck className="h-4 w-4" /> Honest Software Boundaries
            </div>
            <h2 className="mt-2 text-lg font-extrabold text-navy-900">A Software Company, Not a Tax Authority</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              NormInvoice is a subscription-based software service. We are not a bank, payment institution, public tax
              authority, or government certification body. Where regulated network exchange (such as Peppol Access
              Points or national clearance platforms) is required, NormInvoice integrates with independent authorized
              providers rather than claiming unverified accreditation.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-700">
            <Building2 className="h-4 w-4 text-accent-500" /> Corporate Group Structure
          </div>
          <h2 className="mt-2 text-lg font-extrabold text-navy-900">The Trend&amp;Brand Business Group</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-canvas p-4">
              <p className="font-bold text-navy-900">Proposed Contracting Entity</p>
              <p className="mt-1">{BRAND_CONTACT.proposedContractingEntity}</p>
              <p className="mt-1.5 text-[11px] text-slate-500">
                The final merchant/contracting entity is confirmed in your order form, checkout summary, and Legal Notice.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-canvas p-4">
              <p className="font-bold text-navy-900">Related Group Entity</p>
              <p className="mt-1">
                <strong>{BRAND_CONTACT.relatedEntity.name}</strong> ({BRAND_CONTACT.relatedEntity.jurisdiction})
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Incorporation: {BRAND_CONTACT.relatedEntity.incorporationNo} · NTN: {BRAND_CONTACT.relatedEntity.ntn} ·
                CEO: {BRAND_CONTACT.relatedEntity.ceo}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{BRAND_CONTACT.relatedEntity.address}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap gap-5 text-xs font-bold text-navy-900">
              <a href={`mailto:${BRAND_CONTACT.email}`} className="inline-flex items-center gap-1.5 hover:text-accent-600">
                <Mail className="h-4 w-4 text-accent-500" /> {BRAND_CONTACT.email}
              </a>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-accent-500" /> {BRAND_CONTACT.phone}
              </span>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
            >
              Get in Touch <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
