import Link from "next/link";
import { cookies } from "next/headers";
import { HelpCircle } from "lucide-react";
import { BRAND_CONTACT, resolveLocale } from "@/lib/website-content";
import { FAQ_STRINGS } from "@/lib/i18n";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | NormInvoice",
  description:
    "Clear answers about NormInvoice plans, 15-day free trials, European e-invoicing compliance boundaries, integrations, and privacy.",
};

export default async function FaqPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = FAQ_STRINGS[locale];
  const fill = (s: string) => s.replace("{email}", BRAND_CONTACT.email).replace("{phone}", BRAND_CONTACT.phone);
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            <HelpCircle className="h-3.5 w-3.5" /> {t.heroBadge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{t.heroTitle}</h1>
          <p className="mt-2.5 text-sm text-navy-100">{t.heroDesc}</p>
        </section>

        {t.groups.map((group) => (
          <section key={group.category} className="space-y-3">
            <h2 className="text-base font-extrabold text-navy-900">{group.category}</h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                  <h3 className="text-sm font-extrabold text-navy-900">{item.q}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{fill(item.a)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-sm font-bold text-navy-900">{t.ctaTitle}</p>
          <p className="mt-1 text-xs text-slate-600">{t.ctaDesc}</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            {t.ctaBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
