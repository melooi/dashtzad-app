// ============================================================
// Entity metadata resolution (SEO-CP1).
// Layering: SeoMeta override  >  entity-derived fallback  >  seoDefaults global.
// Missing SeoMeta rows are fine — callers always pass a safe fallback.
// ============================================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { buildCanonical, buildAbsoluteUrl, isSafeAbsoluteUrl } from "@/lib/seo/urls";
import { stripHtmlForMeta, truncateMetaText } from "@/lib/seo/text";

export type SeoEntityType =
  | "PRODUCT"
  | "CATEGORY"
  | "POST"
  | "RECIPE"
  | "PAGE"
  | "FAQ_GROUP"
  | "HOMEPAGE"
  | "SERIES";

export type SeoMetaRecord = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  noindex: boolean;
  nofollow: boolean;
  schemaOverride: unknown;
};

/** Fetch the SeoMeta override row for an entity (null when none authored). */
export async function resolveSeoMeta(
  entityType: SeoEntityType,
  entityId: string,
): Promise<SeoMetaRecord | null> {
  try {
    const row = await prisma.seoMeta.findUnique({
      where: { entityType_entityId: { entityType, entityId } },
    });
    return (row as SeoMetaRecord | null) ?? null;
  } catch {
    // Never let SEO lookups crash a page render.
    return null;
  }
}

/** Apply the title template ("%s | دشت‌زاد") unless the title already has the brand. */
export function buildTitle(template: string, title: string): string {
  const t = title.trim();
  if (!t) return template.replace("%s", "").replace(/^[\s|–-]+/, "").trim() || SITE_NAME;
  if (t.includes(SITE_NAME)) return t;
  if (template.includes("%s")) return template.replace("%s", t);
  return `${t} | ${SITE_NAME}`;
}

export type EntityMetaFallback = {
  title: string;
  description: string;
  path: string; // e.g. "/products/zaferan-negin"
  image?: string | null;
  type?: "website" | "article" | "product";
  /** force noindex regardless of SeoMeta (e.g. private routes) */
  forceNoindex?: boolean;
};

/**
 * Build a full Next.js Metadata object for an entity, merging an optional
 * SeoMeta override on top of the entity-derived fallback and global defaults.
 */
export async function buildEntityMetadata(
  entityType: SeoEntityType | null,
  entityId: string | null,
  fallback: EntityMetaFallback,
): Promise<Metadata> {
  const [defaults, override] = await Promise.all([
    getSeoDefaults(),
    entityType && entityId ? resolveSeoMeta(entityType, entityId) : Promise.resolve(null),
  ]);

  const canonicalBase = defaults.canonicalBase || undefined;
  const template = defaults.titleTemplate || `%s | ${SITE_NAME}`;

  const rawTitle = override?.title?.trim() || fallback.title || defaults.defaultTitle;
  const title = buildTitle(template, rawTitle);

  const description = truncateMetaText(
    override?.description || stripHtmlForMeta(fallback.description) || defaults.defaultDescription,
    160,
  );

  const canonical = buildCanonical(fallback.path, override?.canonicalUrl, canonicalBase);

  const ogTitle = override?.ogTitle?.trim() || title;
  const ogDescription = truncateMetaText(override?.ogDescription || description, 200);
  const ogImageRaw =
    override?.ogImageUrl || fallback.image || defaults.defaultOgImageUrl || "/opengraph-image";
  const ogImage = isSafeAbsoluteUrl(ogImageRaw) ? ogImageRaw : buildAbsoluteUrl(ogImageRaw, canonicalBase);

  const twTitle = override?.twitterTitle?.trim() || ogTitle;
  const twDescription = truncateMetaText(override?.twitterDescription || ogDescription, 200);
  const twImageRaw = override?.twitterImageUrl || ogImage;
  const twImage = isSafeAbsoluteUrl(twImageRaw) ? twImageRaw : buildAbsoluteUrl(twImageRaw, canonicalBase);

  const noindex = Boolean(fallback.forceNoindex || override?.noindex);
  const nofollow = Boolean(override?.nofollow);

  return {
    title,
    description,
    alternates: { canonical },
    robots:
      noindex || nofollow
        ? { index: !noindex, follow: !nofollow }
        : { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: "fa_IR",
      type: fallback.type === "product" ? "website" : fallback.type ?? "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: twTitle,
      description: twDescription,
      images: [twImage],
    },
  };
}

/** Convenience for private/utility routes that must never be indexed. */
export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
