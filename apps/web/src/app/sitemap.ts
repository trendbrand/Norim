import type { MetadataRoute } from "next";
import { listAllRuleEntries } from "@norminvoice/einvoice-core";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/create`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/batch`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tools/zugferd-vs-xrechnung`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/integrations/stripe`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/integrations/woocommerce`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/trust`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/errors`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/legal/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/legal/dpa`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const rulePages: MetadataRoute.Sitemap = listAllRuleEntries().map((r) => ({
    url: `${baseUrl}/errors/${r.ruleId}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...corePages, ...rulePages];
}
