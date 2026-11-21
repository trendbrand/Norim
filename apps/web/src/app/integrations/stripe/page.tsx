import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Webhook, Zap } from "lucide-react";

export const metadata = {
  title: "Stripe EU E-Invoicing Bridge (ZUGFeRD 2.3, Factur-X 1.07 & XRechnung) — NormInvoice",
  description:
    "Automatically convert every Stripe invoice & credit note into EN 16931 compliant ZUGFeRD, Factur-X, and XRechnung files with VIES VAT verification, GoBD archive & DATEV/FEC export.",
};

export default function StripeIntegrationPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do default Stripe PDF invoices comply with Germany's 2025-2027 E-Invoicing mandate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Standard Stripe PDFs do not embed structured EN 16931 XML data (ZUGFeRD / Factur-X / XRechnung). NormInvoice listens to Stripe webhooks and automatically generates dual-validated PDF/A-3b + XML e-invoices.",
        },
      },
      {
        "@type": "Question",
        name: "How does NormInvoice handle Stripe €0.01 rounding differences?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NormInvoice computes cent-exact VAT buckets (BG-23) and reconciles any €0.01 rounding delta via EN 16931 BT-114 so KoSIT validators never reject invoices on BR-CO-15.",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Webhook className="h-3.5 w-3.5" /> Stripe Official Webhook Bridge
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Turn Every Stripe Invoice Into a Compliant ZUGFeRD, Factur-X &amp; XRechnung File Automatically
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Stripe generates plain PDFs that fail German (2025–2027) and French (2026–2027) B2B e-invoicing laws. Connect 1 webhook in 2 minutes and let NormInvoice handle EN 16931 XML, PDF/A-3b, VIES Reverse Charge, GoBD archiving, and DATEV/FEC export.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            Test Live Stripe Simulator <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Read 2-Minute Webhook Docs
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Automatic Country & Format Routing",
            desc: "German buyers get ZUGFeRD 2.3 (or XRechnung when metadata.leitweg_id is present), French buyers get Factur-X 1.07, Belgian B2B gets Peppol BIS 3.0.",
          },
          {
            icon: ShieldCheck,
            title: "Credit Notes (TypeCode 381) + Rounding Fix",
            desc: "Listens to both invoice.finalized and credit_note.created. Automatically reconciles €0.01 Stripe tax rounding via BT-114 so KoSIT passes 100%.",
          },
          {
            icon: CheckCircle2,
            title: "Zero Broken Invoices Sent",
            desc: "If a Stripe customer forgot their postal code or Leitweg-ID, NormInvoice pauses delivery and alerts you to 1-click patch & release.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <item.icon className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-base font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
