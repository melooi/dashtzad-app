// ============================================================
// Admin case-file / content-series schema + helpers (CONTENT-CP1).
// A ContentSeries is a hub grouping related magazine articles.
// ============================================================

import { z } from "zod";
import { slugifyLatinOnly, isValidSlug } from "@/lib/admin/slug";
import { optionalRichHtml } from "@/lib/richtext/fields";
import { sanitizeRichHtml } from "@/lib/richtext/sanitize";

export const SERIES_STATUS_OPTIONS = [
  { value: "DRAFT", label: "پیش‌نویس" },
  { value: "PUBLISHED", label: "منتشرشده" },
] as const;

export const seriesFormSchema = z.object({
  title: z.string().trim().min(2, "عنوان لازم است.").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "نامک لازم است.")
    .transform((v) => slugifyLatinOnly(v))
    .refine((v) => isValidSlug(v), { message: "نامک باید لاتین (a-z, 0-9, -) باشد." }),
  subtitle: z.string().trim().max(240).optional().transform((v) => (v ? v : null)),
  summary: z.string().trim().max(800).optional().transform((v) => (v ? v : null)),
  coverImage: z.string().trim().max(2048).optional().transform((v) => v ?? ""),
  intro: optionalRichHtml({ max: 50000 }),
  keyTopics: z
    .string()
    .optional()
    .transform((s) =>
      Array.from(new Set(String(s ?? "").split(/[,،\n]/).map((t) => t.trim()).filter(Boolean))).slice(0, 16),
    ),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export type SeriesFormInput = z.input<typeof seriesFormSchema>;
export type SeriesFormValues = z.output<typeof seriesFormSchema>;

export const emptySeriesForm: SeriesFormInput = {
  title: "",
  slug: "",
  subtitle: "",
  summary: "",
  coverImage: "",
  intro: "",
  keyTopics: "",
  status: "DRAFT",
  sortOrder: 0,
};

export function toSeriesData(v: SeriesFormValues) {
  return {
    title: v.title,
    slug: v.slug,
    subtitle: v.subtitle,
    summary: v.summary,
    coverImage: v.coverImage || null,
    intro: v.intro,
    keyTopics: v.keyTopics,
    status: v.status,
    sortOrder: v.sortOrder,
  };
}

type SeriesLike = {
  title: string;
  slug: string;
  subtitle: string | null;
  summary: string | null;
  coverImage: string | null;
  intro: string | null;
  keyTopics: string[];
  status: string;
  sortOrder: number;
};

export function seriesToForm(s: SeriesLike): SeriesFormInput {
  return {
    title: s.title,
    slug: s.slug,
    subtitle: s.subtitle ?? "",
    summary: s.summary ?? "",
    coverImage: s.coverImage ?? "",
    intro: s.intro ? sanitizeRichHtml(s.intro) : "",
    keyTopics: s.keyTopics.join("، "),
    status: s.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    sortOrder: s.sortOrder,
  };
}
