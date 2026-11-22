import Link from "next/link";
import { CheckCircle2, Info, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/website-content";

export const metadata = {
  title: "Security & Trust | NormInvoice — Product of Trend&Brand",
  description:
    "How NormInvoice protects financial documents, tenant boundaries, credentials, and audit integrity — published with zero unverified certification claims.",
};

export default function SecurityPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Security &amp; Trust Transparency
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Financial Data Deserves Thoughtful Protection
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-100">
            NormInvoice is engineered around strict multi-tenant isolation, modern cryptography, tamper-evident audit
            logs, and defensive XML parsing — with honest reporting of implemented controls.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              icon: Lock,
              title: "Access Control & Tenant Isolation",
              points: [
                "Strict organization-level (`org_id`) scoping enforced on every database query and API handler.",
                "Per-user random-salt scrypt password hashing + HMAC-SHA256 HttpOnly session cookies + immediate session revocation on password change.",
                "Role-based access controls (Owner, Admin, Accountant, Member) and separated Super-Admin authentication.",
              ],
            },
            {
              icon: KeyRound,
              title: "Encryption & Secret Protection",
              points: [
                "AES-256-GCM encryption at rest for tenant Stripe and WooCommerce webhook secrets (masked in UI).",
                "SHA-256 hashed Bearer API keys — plaintext displayed once on creation and revocable immediately.",
                "HMAC-SHA256 webhook verification with 5-minute replay-attack protection.",
              ],
            },
            {
              icon: ShieldCheck,
              title: "Document Integrity & XML Safety",
              points: [
                "Append-only SHA-256 hash-chained GoBD audit log per organization with live verification.",
                "XXE, DOCTYPE, and ENTITY XML injection blocked before parsing; Content-Disposition filename sanitization.",
                "OWASP HTTP security headers (CSP, X-Frame-Options: DENY, nosniff, CSRF origin guard) and self-hosted fonts.",
              ],
            },
            {
              icon: Info,
              title: "Claims We Only Publish After Independent Verification",
              points: [
                "We do NOT display unverified ISO 27001, SOC 2 Type II, or government-accreditation badges.",
                "We do NOT publish fabricated numerical uptime percentages or SLA credits without a signed enterprise schedule.",
                "Full subprocessor and international-transfer transparency is maintained in our Privacy Policy and Subprocessor Register.",
              ],
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                  <card.icon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-extrabold text-navy-900">{card.title}</h2>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600">
                {card.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div className="text-xs text-slate-600">
            <p className="text-sm font-extrabold text-navy-900">Report a Security Vulnerability</p>
            <p className="mt-1">
              Email <strong className="text-navy-900">{BRAND_CONTACT.email}</strong> with a concise technical report.
              Please do not access other users&apos; data or run disruptive tests without written authorization.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/privacy" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-slate-50">
              Privacy Policy
            </Link>
            <a href={`mailto:${BRAND_CONTACT.email}`} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600">
              <Mail className="h-3.5 w-3.5" /> Report Issue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
