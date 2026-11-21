import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/create", "/errors", "/errors/"],
      disallow: ["/api/", "/dashboard", "/settings"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
