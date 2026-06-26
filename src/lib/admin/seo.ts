// ============================================================
// Admin SEO field config + validation (SEO-CP1). Shared by the SeoPanel.
// ============================================================

import { z } from "zod";

export type SeoEntityType =
  | "PRODUCT"
  | "CATEGORY"
  | "POST"
  | "RECIPE"
  | "PAGE"
  | "FAQ_GROUP"
  | "HOMEPAGE"
  | "SERIES";

export const SEO_ENTITY_LABELS: Record<SeoEntityType, string> = {
  PRODUCT: "محصول",
  CATEGORY: "دسته‌بندی",
  POST: "نوشته",
  RECIPE: "دستور پخت",
  PAGE: "صفحه",
  FAQ_GROUP: "گروه سوالات",
  HOMEPAGE: "صفحه‌ی خانه",
  SERIES: "پرونده",
};

const optionalText = z
  .string()
  .trim()
  .max(320)
  .optional()
  .transform((v) => (v ? v : null));

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), {
    message: "آدرس باید با http:// یا https:// شروع شود.",
  });

// schemaOverride: optional raw JSON object string; validated as parseable JSON.
const optionalJson = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine(
    (v) => {
      if (v === null) return true;
      try {
        const parsed = JSON.parse(v);
        return typeof parsed === "object" && parsed !== null;
      } catch {
        return false;
      }
    },
    { message: "JSON معتبر نیست (باید یک آبجکت باشد)." },
  );

export const seoMetaSchema = z.object({
  title: optionalText,
  description: optionalText,
  canonicalUrl: optionalUrl,
  ogTitle: optionalText,
  ogDescription: optionalText,
  ogImageUrl: optionalUrl,
  twitterTitle: optionalText,
  twitterDescription: optionalText,
  twitterImageUrl: optionalUrl,
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  schemaOverride: optionalJson,
});

export type SeoMetaInput = z.input<typeof seoMetaSchema>;
export type SeoMetaValues = z.output<typeof seoMetaSchema>;

/** Empty form values (used when no SeoMeta row exists yet). */
export const emptySeoMeta: SeoMetaInput = {
  title: "",
  description: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImageUrl: "",
  noindex: false,
  nofollow: false,
  schemaOverride: "",
};
