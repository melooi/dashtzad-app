import { z } from "zod";
import { isValidSlug, normalizeDigits } from "@/lib/admin/slug";
import { MARKETING_BADGE_LABELS, type MarketingBadgeKey } from "@/lib/admin/product-variant";
import { optionalRichHtml, richHtmlString } from "@/lib/richtext/fields";

// ============================================================
// Zod schemas + option lists for Products, Weight presets, Packaging.
// Shared by client forms (resolver) and server actions (defense in depth).
// ============================================================

const SLUG_MESSAGE =
  "نامک باید لاتین باشد و فقط شامل حروف انگلیسی، عدد انگلیسی و خط تیره باشد.";

/** Latin kebab slug field with automatic Persian/Arabic digit normalization. */
export const latinSlugField = z
  .string()
  .trim()
  .min(1, "نامک (slug) را وارد کنید.")
  .transform((s) => normalizeDigits(s).toLowerCase())
  .refine((s) => s.length <= 180, "نامک نباید بیش از ۱۸۰ نویسه باشد.")
  .refine(isValidSlug, SLUG_MESSAGE);

/** "۱۲۳۴" (fa/ar/en, with separators) → integer. Empty fails with `msg`. */
const intFromText = (msg: string) =>
  z
    .string()
    .transform((s) => normalizeDigits(String(s ?? "")).replace(/[^\d]/g, ""))
    .refine((s) => s.length > 0, msg)
    .transform((s) => parseInt(s, 10));

/** Optional integer (empty → null). */
const optionalIntFromText = z
  .string()
  .transform((s) => normalizeDigits(String(s ?? "")).replace(/[^\d]/g, ""))
  .transform((s) => (s === "" ? null : parseInt(s, 10)));

/** Decimal grams (allows 0.5). */
const floatFromText = (msg: string) =>
  z
    .string()
    .transform((s) => normalizeDigits(String(s ?? "")).replace(/[^\d.]/g, ""))
    .refine((s) => s !== "" && parseFloat(s) > 0, msg)
    .transform((s) => parseFloat(s));

const tagsFromText = z
  .string()
  .transform((s) => s.split(/[,،]/).map((t) => t.trim()).filter(Boolean));

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `حداکثر ${max} نویسه`)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? null : s));

export const BASE_UNIT_OPTIONS = [
  { value: "GRAM", label: "گرم" },
  { value: "KILOGRAM", label: "کیلوگرم" },
  { value: "UNIT", label: "عددی" },
];
export const BASE_UNIT_LABELS: Record<string, string> = {
  GRAM: "گرم",
  KILOGRAM: "کیلوگرم",
  UNIT: "عددی",
};

export const PACKAGING_TYPE_OPTIONS = [
  { value: "POUCH", label: "پاکت" },
  { value: "TIN", label: "قوطی حلبی" },
  { value: "VACUUM", label: "وکیوم" },
  { value: "BOX", label: "جعبه" },
  { value: "BAG", label: "کیسه" },
  { value: "SACK", label: "گونی" },
];
export const PACKAGING_TYPE_LABELS: Record<string, string> = {
  POUCH: "پاکت",
  TIN: "قوطی حلبی",
  VACUUM: "وکیوم",
  BOX: "جعبه",
  BAG: "کیسه",
  SACK: "گونی",
};

export const MARKETING_BADGE_OPTIONS = (
  Object.keys(MARKETING_BADGE_LABELS) as MarketingBadgeKey[]
).map((k) => ({ value: k, label: MARKETING_BADGE_LABELS[k] }));

// Sale-mode options (PRODUCT-CARD-CP1) — controls card state override in admin.
export const SALE_MODE_OPTIONS = [
  { value: "AUTO", label: "خودکار (بر اساس موجودی و قیمت)" },
  { value: "CONTACT", label: "تماس بگیرید (قیمت استعلامی)" },
  { value: "DISCONTINUED", label: "متوقف‌شده (ناموجود دائمی، بدون اطلاع‌رسانی)" },
];
export const SALE_MODE_LABELS: Record<string, string> = {
  AUTO: "خودکار",
  CONTACT: "تماس بگیرید",
  DISCONTINUED: "متوقف‌شده",
};

// ---- Product ----
export const productFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "عنوان محصول را وارد کنید (حداقل ۲ نویسه).")
    .max(160, "عنوان نباید بیش از ۱۶۰ نویسه باشد."),
  slug: latinSlugField,
  categoryId: z.string().uuid("دسته‌بندی محصول را انتخاب کنید."),
  brand: optionalText(80),
  isActive: z.boolean(),
  tags: tagsFromText,
  basePriceToman: intFromText("قیمت پایه را وارد کنید."),
  basePriceUnit: z.enum(["GRAM", "KILOGRAM", "UNIT"], { message: "واحد قیمت را انتخاب کنید." }),
  // Rich text (HTML), sanitized in-schema. description is a non-null column that
  // may be empty (""); story is nullable.
  description: richHtmlString({ max: 50000 }),
  story: optionalRichHtml({ max: 20000 }),
  // PRODUCT-CARD-CP1: card state overrides
  saleMode: z.enum(["AUTO", "CONTACT", "DISCONTINUED"]).default("AUTO"),
  contactPhone: z
    .string()
    .transform((s) => s.replace(/\D/g, "").slice(0, 11))
    .transform((s) => (s === "" ? null : s))
    .nullable()
    .optional(),
  installmentEnabled: z.boolean().default(false),
});
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const emptyProductForm: ProductFormInput = {
  title: "",
  slug: "",
  categoryId: "",
  brand: "",
  isActive: true,
  tags: "",
  basePriceToman: "",
  basePriceUnit: "GRAM",
  description: "",
  story: "",
  saleMode: "AUTO",
  contactPhone: "",
  installmentEnabled: false,
};

export function productPreviewBase(): string {
  return "/products/";
}

// ---- Weight preset ----
// compatibility now stores PRODUCT category IDs (selected via chips, never typed).
const compatibilityField = z.array(z.string()).default([]);

export const weightPresetSchema = z.object({
  title: z.string().trim().min(1, "عنوان وزن را وارد کنید.").max(60, "حداکثر ۶۰ نویسه"),
  gramValue: floatFromText("وزن (گرم) باید بزرگ‌تر از صفر باشد."),
  compatibility: compatibilityField,
  sortOrder: optionalIntFromText,
  isActive: z.boolean(),
});
export type WeightPresetInput = z.input<typeof weightPresetSchema>;
export type WeightPresetValues = z.output<typeof weightPresetSchema>;

export const emptyWeightPreset: WeightPresetInput = {
  title: "",
  gramValue: "",
  compatibility: [],
  sortOrder: "0",
  isActive: true,
};

// ---- Packaging option ----
export const packagingSchema = z.object({
  title: z.string().trim().min(1, "عنوان بسته‌بندی را وارد کنید.").max(60, "حداکثر ۶۰ نویسه"),
  type: z.enum(["POUCH", "TIN", "VACUUM", "BOX", "BAG", "SACK"], { message: "نوع بسته‌بندی را انتخاب کنید." }),
  capacityGram: floatFromText("ظرفیت (گرم) باید بزرگ‌تر از صفر باشد."),
  costToman: intFromText("هزینه‌ی بسته‌بندی را وارد کنید."),
  compatibility: compatibilityField,
  sortOrder: optionalIntFromText,
  isActive: z.boolean(),
});
export type PackagingInput = z.input<typeof packagingSchema>;
export type PackagingValues = z.output<typeof packagingSchema>;

export const emptyPackaging: PackagingInput = {
  title: "",
  type: "POUCH",
  capacityGram: "",
  costToman: "",
  compatibility: [],
  sortOrder: "0",
  isActive: true,
};

/**
 * Filter weight/packaging options by product category compatibility.
 * Empty compatibility = globally available. showAll bypasses the filter.
 */
export function filterByCompatibility<T extends { compatibility: string[] }>(
  items: T[],
  categoryId: string | null,
  showAll = false,
): T[] {
  if (showAll || !categoryId) return items;
  return items.filter((i) => i.compatibility.length === 0 || i.compatibility.includes(categoryId));
}

// ---- Variant row (from the matrix UI → server) ----
export const variantRowSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  weightPresetId: z.string().uuid(),
  packagingOptionId: z.string().uuid().nullable().optional(),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  isPriceLocked: z.boolean(),
  manualPriceToman: z.coerce.number().int().min(0).nullable().optional(),
  offPriceToman: z.coerce.number().int().min(0).nullable().optional(),
  marketingBadge: z
    .enum(["BESTSELLER", "DASHTZAD_PICK", "ECONOMICAL", "GIFT", "DAILY", "HOSTING", "LIMITED", "NEW"])
    .nullable()
    .optional(),
  sortOrder: z.coerce.number().int().default(0),
});
export type VariantRowInput = z.infer<typeof variantRowSchema>;
