import type { MetadataRoute } from "next";
import { listAllRuleEntries } from "@norminvoice/einvoice-core";
import { COUNTRY_SLUG_MAP } from "@/lib/website-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  const now = new Date();

  const publicStaticRoutes: Array<{ path: string; freq: "weekly" | "monthly" | "yearly"; priority: number }> = [
    { path: "/", freq: "weekly", priority: 1.0 },
    { path: "/features", freq: "weekly", priority: 0.9 },
    { path: "/pricing", freq: "weekly", priority: 0.9 },
    { path: "/countries", freq: "weekly", priority: 0.9 },
    { path: "/integrations", freq: "monthly", priority: 0.85 },
    { path: "/integrations/stripe", freq: "monthly", priority: 0.85 },
    { path: "/integrations/woocommerce", freq: "monthly", priority: 0.85 },
    { path: "/tools/zugferd-vs-xrechnung", freq: "monthly", priority: 0.85 },
    { path: "/solutions/small-business", freq: "monthly", priority: 0.8 },
    { path: "/solutions/finance-teams", freq: "monthly", priority: 0.8 },
    { path: "/solutions/accountants", freq: "monthly", priority: 0.8 },
    { path: "/about", freq: "monthly", priority: 0.75 },
    { path: "/contact", freq: "monthly", priority: 0.75 },
    { path: "/security", freq: "monthly", priority: 0.8 },
    { path: "/trust", freq: "monthly", priority: 0.8 },
    { path: "/partners", freq: "monthly", priority: 0.75 },
    { path: "/help", freq: "monthly", priority: 0.75 },
    { path: "/faq", freq: "monthly", priority: 0.75 },
    { path: "/docs", freq: "weekly", priority: 0.85 },
    { path: "/errors", freq: "weekly", priority: 0.85 },
    { path: "/legal-notice", freq: "yearly", priority: 0.3 },
    { path: "/terms", freq: "yearly", priority: 0.4 },
    { path: "/subscription-billing", freq: "yearly", priority: 0.4 },
    { path: "/cancellation-refunds", freq: "yearly", priority: 0.4 },
    { path: "/privacy", freq: "yearly", priority: 0.4 },
    { path: "/cookies", freq: "yearly", priority: 0.3 },
    { path: "/dpa", freq: "yearly", priority: 0.4 },
    { path: "/subprocessors", freq: "monthly", priority: 0.4 },
    { path: "/acceptable-use", freq: "yearly", priority: 0.3 },
    { path: "/service-availability", freq: "yearly", priority: 0.3 },
    { path: "/data-retention", freq: "yearly", priority: 0.3 },
    { path: "/ai-transparency", freq: "yearly", priority: 0.3 },
    { path: "/accessibility", freq: "yearly", priority: 0.3 },
    { path: "/third-party-services", freq: "yearly", priority: 0.3 },
    { path: "/complaints", freq: "yearly", priority: 0.3 },
    { path: "/intellectual-property", freq: "yearly", priority: 0.3 },
    { path: "/legal/impressum", freq: "yearly", priority: 0.3 },
    { path: "/legal/privacy", freq: "yearly", priority: 0.4 },
    { path: "/legal/dpa", freq: "yearly", priority: 0.4 },
    { path: "/legal/terms", freq: "yearly", priority: 0.4 },
  ];

  const corePages: MetadataRoute.Sitemap = publicStaticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const countryPages: MetadataRoute.Sitemap = Object.keys(COUNTRY_SLUG_MAP).map((slug) => ({
    url: `${baseUrl}/countries/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const rulePages: MetadataRoute.Sitemap = listAllRuleEntries().map((r) => ({
    url: `${baseUrl}/errors/${r.ruleId}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...corePages, ...countryPages, ...rulePages];
}
