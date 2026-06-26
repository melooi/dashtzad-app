import type { MetadataRoute } from "next";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { getBaseUrl } from "@/lib/seo/urls";

export const dynamic = "force-dynamic";

// SEO-CP1: allow public storefront; block private/admin/transactional routes.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoDefaults().catch(() => null);
  const base = getBaseUrl(seo?.canonicalBase);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/account",
        "/orders",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
