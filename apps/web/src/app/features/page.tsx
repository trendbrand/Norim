import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileText,
  Globe2,
  Inbox,
  Repeat,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";
import { FEATURES_STRINGS } from "@/lib/i18n";
import { resolveLocale } from "@/lib/website-content";

export const metadata = {
  title: "Features Overview | NormInvoice — Product of Trend&Brand",
  description:
    "Explore NormInvoice's production capabilities: EN 16931 creation & validation, incoming supplier inbox, recurring billing, payments, GoBD audit logs, and accounting exports.",
};

// Icon order matches FEATURES_STRINGS.modules order (translatable text lives in i18n).
const MODULE_ICONS = [
  FileText,
  FileCheck2,
  Inbox,
  Repeat,
  CreditCard,
  Zap,
  FileArchive,
  Briefcase,
  Webhook,
  BarChart3,
  Globe2,
  ShieldCheck,
];

export default async function FeaturesPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = FEATURES_STRINGS[locale];
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            {t.badge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-100 sm:text-base">{t.desc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600"
            >
              {t.ctaPrimary} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.modules.map((m, i) => {
            const Icon = MODULE_ICONS[i] ?? FileText;
            return (
              <div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800">
                    {m.phased ? t.statusPhased : t.statusAvailable}
                  </span>
                </div>
                <h2 className="mt-4 text-base font-extrabold text-navy-900">{m.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{m.text}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950">
          <strong>{t.noticeLabel}</strong>{t.noticeText}
        </div>
      </div>
    </div>
  );
}
