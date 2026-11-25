import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen, CreditCard, FileCheck2, Globe2, Inbox, Mail, ShieldCheck, Wrench } from "lucide-react";
import { BRAND_CONTACT, resolveLocale } from "@/lib/website-content";
import { HELP_STRINGS } from "@/lib/i18n";

export const metadata = {
  title: "Help Center | NormInvoice — Guides & Documentation",
  description:
    "Find step-by-step guidance for creating EN 16931 invoices, fixing validation errors, configuring webhooks, and managing subscriptions.",
};

const TOPIC_META = [
  { icon: Wrench, href: "/login?mode=register" },
  { icon: FileCheck2, href: "/errors" },
  { icon: Globe2, href: "/countries" },
  { icon: Inbox, href: "/tools/zugferd-vs-xrechnung" },
  { icon: BookOpen, href: "/docs" },
  { icon: CreditCard, href: "/subscription-billing" },
  { icon: ShieldCheck, href: "/security" },
];

export default async function HelpCenterPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("ni_locale")?.value);
  const t = HELP_STRINGS[locale];
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">{t.badge}</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">{t.desc}</p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.topics.map((topic, i) => {
            const meta = TOPIC_META[i] ?? TOPIC_META[0];
            const Icon = meta.icon;
            return (
              <Link
                key={topic.title}
                href={meta.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:border-accent-400 hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-extrabold text-navy-900 group-hover:text-accent-600">{topic.title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{topic.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-accent-700">
                  {t.openGuide} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div className="text-xs text-slate-600">
            <h2 className="text-base font-extrabold text-navy-900">{t.supportTitle}</h2>
            <p className="mt-1">
              {t.supportPre}
              <strong className="text-navy-900">{BRAND_CONTACT.email}</strong>
              {t.supportPost}
            </p>
          </div>
          <Link
            href="/contact?topic=support"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            <Mail className="h-3.5 w-3.5" /> {t.contactSupport}
          </Link>
        </div>
      </div>
    </div>
  );
}
