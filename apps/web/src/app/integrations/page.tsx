import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Code2, FileSpreadsheet, Globe2, ShoppingCart, Webhook } from "lucide-react";
import { INTEGRATIONS_STRINGS } from "@/lib/i18n";
import { resolveLocale } from "@/lib/website-content";

export const metadata = {
  title: "Integrations | NormInvoice — Stripe, WooCommerce, DATEV, FEC & API",
  description:
    "Connect NormInvoice to Stripe, WooCommerce, DATEV EXTF, French FEC, REST APIs, and configured European e-invoicing exchange networks.",
};

const ITEM_META = [
  { icon: Webhook, href: "/integrations/stripe" },
  { icon: ShoppingCart, href: "/integrations/woocommerce" },
  { icon: FileSpreadsheet, href: "/features" },
  { icon: Code2, href: "/docs" },
  { icon: Globe2, href: "/countries" },
];

export default async function IntegrationsPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = INTEGRATIONS_STRINGS[locale];
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">{t.badge}</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">{t.desc}</p>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {t.items.map((item, i) => {
            const meta = ITEM_META[i] ?? ITEM_META[0];
            const Icon = meta.icon;
            const live = !item.partner;
            return (
              <div key={item.name} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                        live ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {live ? t.statusAvailable : t.statusPartner}
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-accent-600">{item.category}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-navy-900">{item.name}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                  <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[11px] text-slate-600">
                    <strong className="text-navy-900">{t.authLabel}</strong> {item.auth}
                  </p>
                </div>
                <Link
                  href={meta.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-accent-700 hover:underline"
                >
                  {t.inspect} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-extrabold text-navy-900">{t.ctaTitle}</h2>
            <p className="mt-1 text-xs text-slate-600">{t.ctaDesc}</p>
          </div>
          <Link
            href="/contact?topic=partners"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            {t.ctaBtn} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
