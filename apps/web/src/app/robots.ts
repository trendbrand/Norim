import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/features", "/pricing", "/countries/", "/solutions/", "/integrations", "/errors/"],
      disallow: [
        "/api/",
        "/dashboard",
        "/invoices",
        "/inbox",
        "/payments",
        "/compliance",
        "/recurring",
        "/reports",
        "/automations",
        "/customers",
        "/catalog",
        "/accountant",
        "/batch",
        "/exports",
        "/settings",
        "/onboarding",
        "/admin",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
