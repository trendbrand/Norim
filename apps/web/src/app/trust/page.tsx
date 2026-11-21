import Link from "next/link";
import { CheckCircle2, Database, FileCheck2, Lock, Server, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "EU Trust, Security & GDPR Compliance Center — NormInvoice",
  description:
    "Live security architecture, 100% Germany EU data sovereignty, GDPR Art. 28 DPA/AVV, GoBD BEG IV immutability, OWASP controls, and EN 16931 standards coverage.",
};

export default function TrustCenterPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" /> EU Sovereign Infrastructure · Zero Tracking
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          NormInvoice Trust, Security &amp; EU Compliance Center
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Electronic invoices contain sensitive financial and tax records. NormInvoice is engineered from the ground up
          for German GoBD, French Factur-X, and EU GDPR audits — with transparent cryptography, zero third-party
          tracking, and 100% hosting inside Germany.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/legal/dpa"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
          >
            Read Art. 28 GDPR DPA (AVV)
          </Link>
          <Link
            href="/legal/privacy"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            GDPR &amp; TDDDG Privacy Policy
          </Link>
          <a
            href="/api/v1/exports/verfahrensdokumentation"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
          >
            Download GoBD Verfahrensdokumentation
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          {
            icon: Server,
            title: "100% Germany EU Data Residency",
            bullets: [
              "Compute, PostgreSQL 16 DB, and S3 WORM storage hosted exclusively in Falkenstein & Nuremberg, Germany (Hetzner Online GmbH).",
              "Zero cross-border invoice transfers outside the EEA and zero exposure to foreign extra-territorial data laws.",
              "100% locally self-hosted fonts (Inter & JetBrains Mono) — zero browser requests to Google Fonts CDN.",
            ],
          },
          {
            icon: Lock,
            title: "Application & Cryptographic Security",
            bullets: [
              "Strict Content-Security-Policy (CSP), HSTS Preload, X-Frame-Options: DENY, and Same-Origin CSRF protection.",
              "AES-256-GCM authenticated encryption for stored integration credentials; scrypt password hashing; SHA-256 hashed Bearer API keys.",
              "5-minute replay-attack window + constant-time HMAC verification on Stripe, WooCommerce, and Paddle webhooks.",
            ],
          },
          {
            icon: Database,
            title: "GoBD & French Tax Audit Immutability",
            bullets: [
              "PostgreSQL 16 Row-Level Security (RLS) isolates every tenant transactionally via app.current_org_id.",
              "Append-only audit table protected by database-level BEFORE UPDATE OR DELETE triggers with SHA-256 hash chaining.",
              "Configurable 8-year (Germany BEG IV) or 10-year (France) S3 Object Lock WORM archive retention.",
            ],
          },
          {
            icon: FileCheck2,
            title: "Sandboxed Zero-Retention Validation",
            bullets: [
              "Public validator runs strictly in volatile RAM (tmpfs) inside zero-internet-egress containers — files are wiped immediately.",
              "Strict XXE / DTD rejection, 10 MB upload cap, Ghostscript -dSAFER sandboxing, and Excel CSV formula-injection neutralization.",
              "Official EN 16931 / KoSIT XRechnung 3.0.2 & veraPDF ISO 19005-3 PDF/A-3b validation pipeline.",
            ],
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600">
              {card.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
