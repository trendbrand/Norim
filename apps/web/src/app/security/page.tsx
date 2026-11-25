import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, Info, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT, resolveLocale } from "@/lib/website-content";
import { SECURITY_STRINGS } from "@/lib/i18n";

export const metadata = {
  title: "Security & Trust | NormInvoice — Product of Trend&Brand",
  description:
    "How NormInvoice protects financial documents, tenant boundaries, credentials, and audit integrity — published with zero unverified certification claims.",
};

const CARD_ICONS = [Lock, KeyRound, ShieldCheck, Info];

export default async function SecurityPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = SECURITY_STRINGS[locale];
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <ShieldCheck className="h-3.5 w-3.5" /> {t.heroBadge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.heroTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-100">{t.heroDesc}</p>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {t.cards.map((card, i) => {
            const Icon = CARD_ICONS[i] ?? ShieldCheck;
            return (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                    <Icon className="h-4 w-4" />
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
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div className="text-xs text-slate-600">
            <p className="text-sm font-extrabold text-navy-900">{t.reportTitle}</p>
            <p className="mt-1">
              {t.reportPre}
              <strong className="text-navy-900">{BRAND_CONTACT.email}</strong>
              {t.reportPost}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/privacy" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-slate-50">
              {t.privacyPolicy}
            </Link>
            <a href={`mailto:${BRAND_CONTACT.email}`} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600">
              <Mail className="h-3.5 w-3.5" /> {t.reportIssue}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
