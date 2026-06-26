"use server";

// ============================================================
// Admin SEO server actions (SEO-CP1). Guarded upsert/delete of SeoMeta.
// Imported by the client SeoPanel. Reader lives in seo-service.ts.
// ============================================================

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { seoMetaSchema, type SeoEntityType, type SeoMetaInput } from "@/lib/admin/seo";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Upsert SeoMeta for an entity (guarded). */
export async function saveSeoMeta(
  entityType: SeoEntityType,
  entityId: string,
  raw: SeoMetaInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "دسترسی غیرمجاز." };
  }
  if (!entityId) return { ok: false, error: "شناسه‌ی موجودیت نامعتبر است." };

  const parsed = seoMetaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ی نامعتبر." };
  }
  const v = parsed.data;
  const schemaOverride = v.schemaOverride ? JSON.parse(v.schemaOverride) : null;

  const data = {
    title: v.title,
    description: v.description,
    canonicalUrl: v.canonicalUrl,
    ogTitle: v.ogTitle,
    ogDescription: v.ogDescription,
    ogImageUrl: v.ogImageUrl,
    twitterTitle: v.twitterTitle,
    twitterDescription: v.twitterDescription,
    twitterImageUrl: v.twitterImageUrl,
    noindex: v.noindex,
    nofollow: v.nofollow,
    schemaOverride: schemaOverride ?? undefined,
  };

  try {
    await prisma.seoMeta.upsert({
      where: { entityType_entityId: { entityType, entityId } },
      create: { entityType, entityId, ...data },
      update: data,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "ذخیره‌ی تنظیمات سئو ممکن نشد." };
  }
}

/** Remove the SeoMeta override for an entity (revert to computed defaults). */
export async function deleteSeoMeta(
  entityType: SeoEntityType,
  entityId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "دسترسی غیرمجاز." };
  }
  await prisma.seoMeta
    .delete({ where: { entityType_entityId: { entityType, entityId } } })
    .catch(() => null);
  return { ok: true };
}
