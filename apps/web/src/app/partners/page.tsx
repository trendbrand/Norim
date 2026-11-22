import Link from "next/link";
import { ArrowRight, Code2, Globe2, Handshake, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "Partners & Developers | NormInvoice — Product of Trend&Brand",
  description:
    "Partner with NormInvoice on Peppol Access Point connectivity, national e-invoicing gateways, accounting firms, ERP integrations, and developer APIs.",
};

export default function PartnersPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Handshake className="h-3.5 w-3.5" /> Partner &amp; Developer Program
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Build Better European E-Invoicing Workflows Together
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            NormInvoice welcomes partnerships with accredited Peppol Access Points, approved French PDPs, Polish KSeF /
            Italian SdI gateway providers, accounting practices, and ERP engineering teams.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: Globe2,
              title: "Country & Network Connectivity",
              text: "Integrate accredited Peppol Access Points, French PDP platforms, KSeF, SdI, and ANAF RO e-Factura gateways cleanly.",
            },
            {
              icon: Code2,
              title: "ERP, Accounting & API Partners",
              text: "Use our REST API, signed webhook bridges, and zero-dependency @norminvoice/sdk to embed EN 16931 compliance.",
            },
            {
              icon: ShieldCheck,
              title: "Accounting & Tax Advisory Firms",
              text: "Onboard European SMB clients into a standardized DATEV / FEC / GoBD review workspace with consent-gated delegation.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                <c.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-extrabold text-navy-900">{c.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card text-xs leading-relaxed text-slate-600">
          <h2 className="text-base font-extrabold text-navy-900">What to Include in Your Partnership Inquiry</h2>
          <p className="mt-2">
            Share your company name, country, service offering, supported jurisdictions, API/technical documentation,
            commercial model, and data-processing framework via our partner contact form or email{" "}
            <strong className="text-navy-900">{BRAND_CONTACT.email}</strong>.
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Note: Submitting a partnership inquiry does not create an agency, reseller, or accreditation relationship
            until a written agreement is executed by both parties.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact?topic=partners"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
            >
              Submit Partner Inquiry <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/docs"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-navy-900 hover:bg-slate-50"
            >
              Read API Documentation
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
