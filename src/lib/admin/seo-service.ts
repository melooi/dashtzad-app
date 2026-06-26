// ============================================================
// Admin SEO read service (SEO-CP1): load SeoMeta into form values.
// Server-only. Write actions live in seo-actions.ts ("use server").
// ============================================================

import { prisma } from "@/lib/prisma";
import { emptySeoMeta, type SeoEntityType, type SeoMetaInput } from "@/lib/admin/seo";

const str = (v: string | null | undefined) => v ?? "";

/**
 * Load the SeoMeta row for an entity as form values (empty strings when none).
 * Plain server function — called from server components only.
 */
export async function getSeoMetaForForm(
  entityType: SeoEntityType,
  entityId: string,
): Promise<SeoMetaInput> {
  const row = await prisma.seoMeta
    .findUnique({ where: { entityType_entityId: { entityType, entityId } } })
    .catch(() => null);

  if (!row) return { ...emptySeoMeta };

  return {
    title: str(row.title),
    description: str(row.description),
    canonicalUrl: str(row.canonicalUrl),
    ogTitle: str(row.ogTitle),
    ogDescription: str(row.ogDescription),
    ogImageUrl: str(row.ogImageUrl),
    twitterTitle: str(row.twitterTitle),
    twitterDescription: str(row.twitterDescription),
    twitterImageUrl: str(row.twitterImageUrl),
    noindex: row.noindex,
    nofollow: row.nofollow,
    schemaOverride: row.schemaOverride ? JSON.stringify(row.schemaOverride, null, 2) : "",
  };
}
