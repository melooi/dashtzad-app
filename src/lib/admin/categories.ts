import { z } from "zod";
import { isValidSlug, normalizeDigits } from "@/lib/admin/slug";
import { optionalRichHtml } from "@/lib/richtext/fields";

// ============================================================
// Category — labels, options, and the shared Zod schema used by
// BOTH the client form (resolver) and the server actions (defense in depth).
// ============================================================

export const CATEGORY_TYPE_LABELS: Record<string, string> = {
  PRODUCT: "محصول",
  POST: "نوشته",
};

export const CATEGORY_TYPE_OPTIONS = [
  { value: "PRODUCT", label: "محصول" },
  { value: "POST", label: "نوشته" },
];

/** Optional free text: trims, and normalizes empty string → null. */
const optionalText = (max: number, tooLong: string) =>
  z
    .string()
    .max(max, tooLong)
    .transform((v) => v.trim())
    .transform((v) => (v === "" ? null : v));

export const categoryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "عنوان دسته‌بندی را وارد کنید (حداقل ۲ نویسه).")
    .max(120, "عنوان نباید بیش از ۱۲۰ نویسه باشد."),
  // Global slug policy (ADMIN-CP2.6): Persian/Arabic digits are normalized to
  // English automatically; non-Latin letters are rejected. Stored value is
  // always lowercase Latin kebab-case.
  slug: z
    .string()
    .trim()
    .min(1, "نامک (slug) را وارد کنید.")
    .transform((s) => normalizeDigits(s).toLowerCase())
    .refine((s) => s.length <= 140, "نامک نباید بیش از ۱۴۰ نویسه باشد.")
    .refine(
      isValidSlug,
      "نامک باید لاتین باشد و فقط شامل حروف انگلیسی، عدد انگلیسی و خط تیره باشد.",
    ),
  type: z.enum(["PRODUCT", "POST"], { message: "نوع دسته را انتخاب کنید." }),
  parentId: z
    .union([z.literal(""), z.string().uuid("دسته‌ی والد نامعتبر است.")])
    .transform((v) => (v === "" ? null : v)),
  englishTitle: optionalText(120, "عنوان انگلیسی نباید بیش از ۱۲۰ نویسه باشد."),
  // Rich text (HTML). Sanitized in the transform → safe on both client + server.
  // Limit is generous because HTML markup inflates length (was 1000 plain chars).
  description: optionalRichHtml({ max: 12000 }),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;

export const emptyCategoryForm: CategoryFormInput = {
  title: "",
  slug: "",
  type: "PRODUCT",
  parentId: "",
  englishTitle: "",
  description: "",
};

/** Front-of-site URL preview for a category slug, by type. */
export function categoryPreviewBase(type: string): string {
  return type === "POST" ? "/blog?category=" : "/products?category=";
}
