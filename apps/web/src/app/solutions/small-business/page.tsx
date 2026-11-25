import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Building2, CheckCircle2, FileText, Repeat, ShieldCheck } from "lucide-react";
import { SOLUTIONS_STRINGS } from "@/lib/i18n";
import { resolveLocale } from "@/lib/website-content";

export const metadata = {
  title: "E-Invoicing for Small Businesses | NormInvoice",
  description:
    "Spend less time managing invoices. Create compliant EN 16931 invoices, track paid vs. overdue bills, and export ready-to-file records.",
};

const CARD_ICONS = [FileText, Repeat, ShieldCheck];

export default async function SmallBusinessSolutionPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = SOLUTIONS_STRINGS[locale].smallBusiness;
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <Building2 className="h-3.5 w-3.5" /> {t.badge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">{t.desc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login?mode=register" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-xs font-bold text-white hover:bg-accent-600">
              {t.cta1} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="rounded-xl border border-navy-600 bg-navy-800 px-5 py-3 text-xs font-bold text-white hover:border-navy-400">
              {t.cta2}
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.cards.map((c, i) => {
            const Icon = CARD_ICONS[i] ?? FileText;
            return (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-extrabold text-navy-900">{c.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{c.text}</p>
              </div>
            );
          })}
        </div>

        {t.note && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-card">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{t.note}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
