import { z } from "zod";
import { isValidSlug, normalizeDigits } from "@/lib/admin/slug";
import { requiredRichHtml } from "@/lib/richtext/fields";

// ============================================================
// Site-experience collections (ADMIN-CP4): Menu, MenuItem, Banner, FAQ,
// Redirect. Zod schemas shared by client forms + server actions, plus enum
// option lists (Persian labels) and link/redirect validators.
// ============================================================

// ---- enum option lists ----

export const MENU_LOCATION_OPTIONS = [
  { value: "HEADER_MAIN", label: "هدر — منوی اصلی" },
  { value: "HEADER_SECONDARY", label: "هدر — منوی فرعی" },
  { value: "FOOTER_PRIMARY", label: "فوتر — ستون اول" },
  { value: "FOOTER_SECONDARY", label: "فوتر — ستون دوم" },
  { value: "MOBILE", label: "موبایل" },
  { value: "CUSTOM", label: "سفارشی" },
];
export const MENU_LOCATION_LABELS = Object.fromEntries(
  MENU_LOCATION_OPTIONS.map((o) => [o.value, o.label]),
);

export const MENU_LINK_TYPE_OPTIONS = [
  { value: "INTERNAL", label: "داخلی" },
  { value: "EXTERNAL", label: "خارجی" },
  { value: "CATEGORY", label: "دسته" },
  { value: "PRODUCT", label: "محصول" },
  { value: "POST", label: "نوشته" },
  { value: "RECIPE", label: "دستور پخت" },
  { value: "PAGE", label: "برگه" },
  { value: "CUSTOM", label: "سفارشی" },
];

export const LINK_TARGET_OPTIONS = [
  { value: "SELF", label: "همین پنجره" },
  { value: "BLANK", label: "پنجره‌ی جدید" },
];

export const BANNER_PLACEMENT_OPTIONS = [
  { value: "HOME_HERO", label: "خانه — هیرو" },
  { value: "HOME_TOP", label: "خانه — بالا" },
  { value: "CATEGORY_TOP", label: "دسته — بالا" },
  { value: "PRODUCT_TOP", label: "محصول — بالا" },
  { value: "BLOG_TOP", label: "بلاگ — بالا" },
  { value: "SITE_WIDE", label: "سراسری" },
  { value: "CUSTOM", label: "سفارشی" },
];
export const BANNER_PLACEMENT_LABELS = Object.fromEntries(
  BANNER_PLACEMENT_OPTIONS.map((o) => [o.value, o.label]),
);

export const FAQ_PLACEMENT_OPTIONS = [
  { value: "GENERAL", label: "عمومی" },
  { value: "HOME", label: "خانه" },
  { value: "PRODUCT", label: "محصول" },
  { value: "CATEGORY", label: "دسته" },
  { value: "CHECKOUT", label: "تسویه" },
  { value: "CONTACT", label: "تماس" },
  { value: "CUSTOM", label: "سفارشی" },
];
export const FAQ_PLACEMENT_LABELS = Object.fromEntries(
  FAQ_PLACEMENT_OPTIONS.map((o) => [o.value, o.label]),
);

export const REDIRECT_STATUS_OPTIONS = [
  { value: "301", label: "۳۰۱ — دائمی" },
  { value: "302", label: "۳۰۲ — موقت" },
];

// ---- shared helpers ----

const optText = (max: number) =>
  z
    .string()
    .max(max, `حداکثر ${max} نویسه مجاز است.`)
    .transform((v) => v.trim())
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null);

const slugField = z
  .string()
  .trim()
  .min(1, "نامک (slug) را وارد کنید.")
  .transform((s) => normalizeDigits(s).toLowerCase())
  .refine((s) => s.length <= 140, "نامک نباید بیش از ۱۴۰ نویسه باشد.")
  .refine(isValidSlug, "نامک باید لاتین باشد (حروف انگلیسی، عدد و خط تیره).");

const sortField = z.coerce.number().int().min(0).max(100000).default(0);

/** A usable href: internal path, absolute URL, tel:, mailto:, or #anchor. */
export function isValidHref(v: string): boolean {
  const s = (v ?? "").trim();
  if (s === "") return false;
  if (s.startsWith("/") || s.startsWith("#")) return true;
  if (/^https?:\/\/[^\s]+$/i.test(s)) return true;
  if (/^(tel|mailto):[^\s]+$/i.test(s)) return true;
  return false;
}

const hrefField = z
  .string()
  .trim()
  .min(1, "نشانی (href) را وارد کنید.")
  .refine(isValidHref, "نشانی نامعتبر است (مسیر داخلی، URL کامل، tel: یا mailto:).");

/** Optional datetime from a datetime-local input. "" → null. */
const optDate = z
  .union([z.literal(""), z.string()])
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .default(null)
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "تاریخ نامعتبر است.");

// ============================================================
// Menu
// ============================================================

export const menuFormSchema = z.object({
  title: z.string().trim().min(2, "عنوان منو را وارد کنید.").max(120, "عنوان طولانی است."),
  slug: slugField,
  location: z.enum([
    "HEADER_MAIN",
    "HEADER_SECONDARY",
    "FOOTER_PRIMARY",
    "FOOTER_SECONDARY",
    "MOBILE",
    "CUSTOM",
  ]),
  isActive: z.boolean().default(true),
  sortOrder: sortField,
});
export type MenuFormInput = z.input<typeof menuFormSchema>;
export type MenuFormValues = z.output<typeof menuFormSchema>;

export const emptyMenuForm: MenuFormInput = {
  title: "",
  slug: "",
  location: "CUSTOM",
  isActive: true,
  sortOrder: 0,
};

export const menuItemSchema = z.object({
  label: z.string().trim().min(1, "برچسب را وارد کنید.").max(120, "برچسب طولانی است."),
  href: hrefField,
  linkType: z.enum([
    "INTERNAL",
    "EXTERNAL",
    "CATEGORY",
    "PRODUCT",
    "POST",
    "RECIPE",
    "PAGE",
    "CUSTOM",
  ]),
  target: z.enum(["SELF", "BLANK"]).default("SELF"),
  parentId: z
    .union([z.literal(""), z.string().uuid()])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
  icon: optText(60),
  // FRONT-HF-LOCK-CP1 — additive honest metadata (render only if a real value).
  badge: optText(40),
  description: optText(200),
  desktopVisible: z.boolean().default(true),
  mobileVisible: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: sortField,
});
export type MenuItemInput = z.input<typeof menuItemSchema>;

export const emptyMenuItem: MenuItemInput = {
  label: "",
  href: "",
  linkType: "INTERNAL",
  target: "SELF",
  parentId: "",
  icon: "",
  badge: "",
  description: "",
  desktopVisible: true,
  mobileVisible: true,
  isActive: true,
  sortOrder: 0,
};

// ============================================================
// Banner
// ============================================================

export const bannerFormSchema = z
  .object({
    title: z.string().trim().min(2, "عنوان بنر را وارد کنید.").max(160, "عنوان طولانی است."),
    slug: slugField,
    subtitle: optText(200),
    description: optText(600),
    imageUrl: optText(500),
    mobileImageUrl: optText(500),
    linkLabel: optText(120),
    linkHref: z
      .string()
      .trim()
      .transform((v) => v.trim())
      .refine((v) => v === "" || isValidHref(v), "لینک بنر نامعتبر است.")
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .default(null),
    placement: z.enum([
      "HOME_HERO",
      "HOME_TOP",
      "CATEGORY_TOP",
      "PRODUCT_TOP",
      "BLOG_TOP",
      "SITE_WIDE",
      "CUSTOM",
    ]),
    startsAt: optDate,
    endsAt: optDate,
    isActive: z.boolean().default(true),
    sortOrder: sortField,
  })
  .refine(
    (v) => !v.startsAt || !v.endsAt || Date.parse(v.startsAt) <= Date.parse(v.endsAt),
    { message: "تاریخ پایان باید بعد از تاریخ شروع باشد.", path: ["endsAt"] },
  );
export type BannerFormInput = z.input<typeof bannerFormSchema>;
export type BannerFormValues = z.output<typeof bannerFormSchema>;

export const emptyBannerForm: BannerFormInput = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkLabel: "",
  linkHref: "",
  placement: "HOME_HERO",
  startsAt: "",
  endsAt: "",
  isActive: true,
  sortOrder: 0,
};

// ============================================================
// FAQ
// ============================================================

export const faqGroupSchema = z.object({
  title: z.string().trim().min(2, "عنوان گروه را وارد کنید.").max(160, "عنوان طولانی است."),
  slug: slugField,
  description: optText(600),
  placement: z.enum(["GENERAL", "HOME", "PRODUCT", "CATEGORY", "CHECKOUT", "CONTACT", "CUSTOM"]),
  isActive: z.boolean().default(true),
  sortOrder: sortField,
});
export type FaqGroupInput = z.input<typeof faqGroupSchema>;
export type FaqGroupValues = z.output<typeof faqGroupSchema>;

export const emptyFaqGroup: FaqGroupInput = {
  title: "",
  slug: "",
  description: "",
  placement: "GENERAL",
  isActive: true,
  sortOrder: 0,
};

export const faqItemSchema = z.object({
  question: z.string().trim().min(2, "پرسش را وارد کنید.").max(300, "پرسش طولانی است."),
  // Rich text (HTML), sanitized in-schema (was plain text ≤3000 chars).
  answer: requiredRichHtml({ max: 20000, requiredMessage: "پاسخ را وارد کنید." }),
  isActive: z.boolean().default(true),
  sortOrder: sortField,
});
export type FaqItemInput = z.input<typeof faqItemSchema>;

export const emptyFaqItem: FaqItemInput = {
  question: "",
  answer: "",
  isActive: true,
  sortOrder: 0,
};

// ============================================================
// Redirect
// ============================================================

/** Destination: internal path or absolute http(s) URL. */
export function isValidRedirectDestination(v: string): boolean {
  const s = (v ?? "").trim();
  if (s.startsWith("/")) return true;
  return /^https?:\/\/[^\s]+$/i.test(s);
}

export const redirectSchema = z
  .object({
    source: z
      .string()
      .trim()
      .min(1, "مسیر مبدأ را وارد کنید.")
      .refine((s) => s.startsWith("/"), "مسیر مبدأ باید با / شروع شود.")
      .refine((s) => !/\s/.test(s), "مسیر مبدأ نباید فاصله داشته باشد."),
    destination: z
      .string()
      .trim()
      .min(1, "مقصد را وارد کنید.")
      .refine(isValidRedirectDestination, "مقصد باید مسیر داخلی یا URL کامل باشد."),
    statusCode: z.coerce.number().int().refine((n) => n === 301 || n === 302, "کد وضعیت باید ۳۰۱ یا ۳۰۲ باشد.").default(301),
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.source !== v.destination, {
    message: "مبدأ و مقصد نباید یکسان باشند.",
    path: ["destination"],
  });
export type RedirectInput = z.input<typeof redirectSchema>;
export type RedirectValues = z.output<typeof redirectSchema>;

export const emptyRedirect: RedirectInput = {
  source: "",
  destination: "",
  statusCode: 301,
  isActive: true,
};
