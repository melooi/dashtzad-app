// ============================================================
// Admin article (magazine post) schema + helpers (CONTENT-CP1).
//
// The form holds INPUT shape (mostly strings); the server action re-parses to
// OUTPUT (transformed) — same defense-in-depth pattern as the other
// collections. Rich body HTML is sanitized inside the schema transform.
// ============================================================

import { z } from "zod";
import { slugifyLatinOnly, isValidSlug } from "@/lib/admin/slug";
import { richHtmlString } from "@/lib/richtext/fields";
import { sanitizeRichHtml, isEmptyRichHtml } from "@/lib/richtext/sanitize";
import { ARTICLE_TYPE_KEYS, ARTICLE_TYPES, type ArticleTypeKey } from "@/lib/admin/article-types";
import { recipeFormSchema, emptyRecipeMeta, recipeMetaToForm } from "@/lib/admin/recipe";

export const ARTICLE_STATUS_OPTIONS = [
  { value: "DRAFT", label: "پیش‌نویس" },
  { value: "PUBLISHED", label: "منتشرشده" },
] as const;

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
};

export const ARTICLE_ACCESS_OPTIONS = [
  { value: "FREE", label: "رایگان" },
  { value: "PREMIUM", label: "ویژه" },
] as const;

/** One source / reference entry (stored in Post.sources Json). */
export const sourceSchema = z.object({
  label: z.string().trim().min(1, "عنوان منبع لازم است.").max(240),
  url: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .transform((v) => v ?? "")
    .refine((v) => v === "" || /^https?:\/\//i.test(v), { message: "نشانی منبع باید با http(s) شروع شود." }),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v ?? ""),
});

export type SourceInput = z.input<typeof sourceSchema>;

const toNullable = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const articleFormSchema = z
  .object({
    title: z.string().trim().min(2, "عنوان لازم است.").max(200),
    slug: z
      .string()
      .trim()
      .min(1, "نامک لازم است.")
      .transform((v) => slugifyLatinOnly(v))
      .refine((v) => isValidSlug(v), { message: "نامک باید لاتین (a-z, 0-9, -) باشد." }),
    articleType: z.enum(ARTICLE_TYPE_KEYS),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    accessType: z.enum(["FREE", "PREMIUM"]),
    categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید."),
    authorId: z.string().min(1, "نویسنده را انتخاب کنید."),
    tags: z
      .string()
      .optional()
      .transform((s) =>
        Array.from(new Set(String(s ?? "").split(/[,،\n]/).map((t) => t.trim()).filter(Boolean))).slice(0, 24),
      ),
    coverImage: z.string().trim().max(2048).optional().transform((v) => v ?? ""),
    subtitle: toNullable(240),
    briefText: z.string().trim().min(10, "خلاصه/لید لازم است (حداقل ۱۰ نویسه).").max(600),
    text: richHtmlString({ max: 200000 }),
    readingTime: z.coerce.number().int().min(0).max(180),
    sources: z.array(sourceSchema).max(30).optional().transform((v) => v ?? []),
    relatedProductIds: z.array(z.string()).max(12).optional().transform((v) => v ?? []),
    relatedPostIds: z.array(z.string()).max(12).optional().transform((v) => v ?? []),
    seriesId: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null)),
    seriesOrder: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? null : v),
      z.coerce.number().int().min(0).max(999).nullable(),
    ),
    adminNote: toNullable(1000),
    typeMeta: z.record(z.string(), z.string()).optional().transform((v) => v ?? {}),
    recipeMeta: recipeFormSchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status === "PUBLISHED") {
      if (!v.coverImage) ctx.addIssue({ path: ["coverImage"], code: "custom", message: "برای انتشار، تصویر شاخص لازم است." });
      if (v.text.trim() === "") ctx.addIssue({ path: ["text"], code: "custom", message: "برای انتشار، متن مقاله لازم است." });
      if (v.readingTime < 1) ctx.addIssue({ path: ["readingTime"], code: "custom", message: "زمان مطالعه باید حداقل ۱ دقیقه باشد." });
      if (v.articleType === "RECIPE") {
        if (!v.recipeMeta || v.recipeMeta.ingredients.length === 0)
          ctx.addIssue({ path: ["recipeMeta"], code: "custom", message: "برای انتشار دستور پخت، حداقل یک ماده لازم است." });
        if (!v.recipeMeta || v.recipeMeta.steps.length === 0)
          ctx.addIssue({ path: ["recipeMeta"], code: "custom", message: "برای انتشار دستور پخت، حداقل یک مرحله لازم است." });
      }
    }
  });

export type ArticleFormInput = z.input<typeof articleFormSchema>;
export type ArticleFormValues = z.output<typeof articleFormSchema>;

/** Build the default typeMeta map for a type (pre-fills disclaimers etc.). */
export function defaultTypeMeta(type: ArticleTypeKey): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of ARTICLE_TYPES[type].metaFields) out[f.key] = f.default ?? "";
  return out;
}

/** Keep only the typeMeta keys that belong to the chosen article type. */
export function filterTypeMeta(type: ArticleTypeKey, raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of ARTICLE_TYPES[type].metaFields) {
    const val = (raw?.[f.key] ?? "").toString().trim();
    if (val) out[f.key] = val;
  }
  return out;
}

export const emptyArticleForm: ArticleFormInput = {
  title: "",
  slug: "",
  articleType: "TASTE_STORY",
  status: "DRAFT",
  accessType: "FREE",
  categoryId: "",
  authorId: "",
  tags: "",
  coverImage: "",
  subtitle: "",
  briefText: "",
  text: "",
  readingTime: 3,
  sources: [],
  relatedProductIds: [],
  relatedPostIds: [],
  seriesId: "",
  seriesOrder: "",
  adminNote: "",
  typeMeta: defaultTypeMeta("TASTE_STORY"),
  recipeMeta: emptyRecipeMeta,
};

/** Map validated form output → Prisma Post data (publishedAt handled by action). */
export function toArticleData(v: ArticleFormValues) {
  return {
    title: v.title,
    slug: v.slug,
    type: v.accessType,
    status: v.status,
    briefText: v.briefText,
    text: v.text,
    coverImage: v.coverImage,
    readingTime: v.readingTime,
    tags: v.tags,
    authorId: v.authorId,
    categoryId: v.categoryId,
    articleType: v.articleType,
    subtitle: v.subtitle,
    typeMeta: filterTypeMeta(v.articleType, v.typeMeta),
    sources: v.sources,
    adminNote: v.adminNote,
    relatedProductIds: v.relatedProductIds,
    relatedPostIds: v.relatedPostIds,
    seriesId: v.seriesId,
    seriesOrder: v.seriesOrder,
    recipeMeta: v.articleType === "RECIPE" ? (v.recipeMeta ?? null) : null,
  };
}

type PostLike = {
  title: string;
  slug: string;
  type: string;
  status: string;
  briefText: string;
  text: string;
  coverImage: string;
  readingTime: number;
  tags: string[];
  authorId: string;
  categoryId: string;
  articleType: string | null;
  subtitle: string | null;
  typeMeta: unknown;
  sources: unknown;
  adminNote: string | null;
  relatedProductIds: string[];
  relatedPostIds: string[];
  seriesId: string | null;
  seriesOrder: number | null;
  recipeMeta: unknown;
};

/** Convert a stored Post into editor-ready form input values. */
export function postToArticleForm(p: PostLike): ArticleFormInput {
  const type = (p.articleType && (p.articleType in ARTICLE_TYPES) ? p.articleType : "TASTE_STORY") as ArticleTypeKey;
  const rawMeta = (p.typeMeta && typeof p.typeMeta === "object" ? (p.typeMeta as Record<string, unknown>) : {}) as Record<string, unknown>;
  const typeMeta: Record<string, string> = { ...defaultTypeMeta(type) };
  for (const f of ARTICLE_TYPES[type].metaFields) {
    if (rawMeta[f.key] != null) typeMeta[f.key] = String(rawMeta[f.key]);
  }
  const sources: SourceInput[] = Array.isArray(p.sources)
    ? (p.sources as Record<string, unknown>[]).map((s) => ({
        label: String(s.label ?? ""),
        url: String(s.url ?? ""),
        note: String(s.note ?? ""),
      }))
    : [];

  return {
    title: p.title,
    slug: p.slug,
    articleType: type,
    status: p.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    accessType: p.type === "PREMIUM" ? "PREMIUM" : "FREE",
    categoryId: p.categoryId,
    authorId: p.authorId,
    tags: p.tags.join("، "),
    coverImage: p.coverImage,
    subtitle: p.subtitle ?? "",
    briefText: p.briefText,
    text: sanitizeRichHtml(p.text),
    readingTime: p.readingTime,
    sources,
    relatedProductIds: p.relatedProductIds ?? [],
    relatedPostIds: p.relatedPostIds ?? [],
    seriesId: p.seriesId ?? "",
    seriesOrder: p.seriesOrder ?? "",
    adminNote: p.adminNote ?? "",
    typeMeta,
    recipeMeta: recipeMetaToForm(p.recipeMeta),
  };
}

/** Heuristic reading-time estimate from rich HTML (≈ 200 wpm). */
export function estimateReadingTime(html: string): number {
  const text = sanitizeRichHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 1;
  const words = text.split(" ").length;
  return Math.max(1, Math.round(words / 200));
}

export { isEmptyRichHtml };
