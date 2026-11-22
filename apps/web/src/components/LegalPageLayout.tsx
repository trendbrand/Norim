import React from "react";
import Link from "next/link";
import { ArrowLeft, Info, Mail, Phone, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT, type LegalDocument } from "@/lib/website-content";

export function LegalPageLayout({ doc }: { doc: LegalDocument }) {
  return (
    <div className="bg-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-accent-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to NormInvoice
        </Link>

        <article className="animate-fade-in-up mt-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-card sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-900">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
              {doc.badge}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {doc.effectiveNote}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900">{doc.title}</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{doc.subtitle}</p>

          {doc.reviewNotice && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{doc.reviewNotice}</p>
            </div>
          )}

          {/* Quick section navigation */}
          {doc.sections.length > 2 && (
            <nav aria-label="Document sections" className="mt-6 rounded-xl border border-slate-200 bg-canvas p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On this page</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-navy-800">
                {doc.sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`} className="hover:text-accent-600 hover:underline">
                      {sec.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
            {doc.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-24">
                <h2 className="text-base font-extrabold text-navy-900">{sec.heading}</h2>
                {sec.paragraphs?.map((p, idx) => (
                  <p key={idx} className="mt-2.5">
                    {p}
                  </p>
                ))}
                {sec.bullets && (
                  <ul className="mt-3 space-y-2 pl-5 list-disc">
                    {sec.bullets.map((b, idx) => (
                      <li key={idx}>
                        {b.label && <strong className="text-navy-900">{b.label}: </strong>}
                        {b.text}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-navy-100 bg-navy-50/50 p-5 text-xs text-navy-800">
            <p className="font-bold text-navy-900">
              {BRAND_CONTACT.productName} — {BRAND_CONTACT.attribution}
            </p>
            <p className="mt-1 text-slate-600">
              Proposed contracting entity: {BRAND_CONTACT.proposedContractingEntity}. Related group entity:{" "}
              {BRAND_CONTACT.relatedEntity.name} ({BRAND_CONTACT.relatedEntity.jurisdiction}).
            </p>
            <div className="mt-3 flex flex-wrap gap-4 font-semibold">
              <a href={`mailto:${BRAND_CONTACT.email}`} className="inline-flex items-center gap-1.5 text-navy-900 hover:text-accent-600">
                <Mail className="h-3.5 w-3.5 text-accent-500" /> {BRAND_CONTACT.email}
              </a>
              <span className="inline-flex items-center gap-1.5 text-navy-900">
                <Phone className="h-3.5 w-3.5 text-accent-500" /> {BRAND_CONTACT.phone}
              </span>
              <Link href="/contact" className="text-accent-700 underline hover:text-accent-800">
                Contact Form →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
