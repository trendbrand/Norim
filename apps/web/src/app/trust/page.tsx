import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, Database, FileCheck2, Lock, Server, ShieldCheck } from "lucide-react";
import { TRUST_STRINGS } from "@/lib/i18n";
import { resolveLocale } from "@/lib/website-content";

export const metadata = {
  title: "EU Trust, Security & GDPR Compliance Center — NormInvoice",
  description:
    "Live security architecture, 100% Germany EU data sovereignty, GDPR Art. 28 DPA/AVV, GoBD BEG IV immutability, OWASP controls, and EN 16931 standards coverage.",
};

const CARD_ICONS = [Server, Lock, Database, FileCheck2];

export default async function TrustCenterPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = TRUST_STRINGS[locale];
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" /> {t.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          {t.intro}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dpa"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
          >
            {t.btnDpa}
          </Link>
          <Link
            href="/privacy"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            {t.btnPrivacy}
          </Link>
          <a
            href="/api/v1/exports/verfahrensdokumentation"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
          >
            {t.btnVerfahren}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {t.cards.map((card, i) => {
          const Icon = CARD_ICONS[i] ?? ShieldCheck;
          return (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
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
          );
        })}
      </div>
    </div>
  );
}
