import { CATEGORY_TYPE_OPTIONS } from "@/lib/admin/categories";
import { COUPON_TYPE_OPTIONS, COUPON_STATUS_FILTER_OPTIONS } from "@/lib/admin/coupons";

// ============================================================
// Config-driven admin foundation (Payload-style).
//
// A collection is described declaratively here: its labels, route, list
// columns, filters, form sections + fields, and allowed actions. The Categories
// list/form pages read this config to drive their UI. Products, Posts, FAQs,
// Banners and Menus will add their own CollectionConfig and reuse the SAME
// table/form components — without re-implementing pages from scratch.
//
// This is intentionally NOT a fully generic render-everything engine yet
// (CP2 proves the pattern with one real collection); it is the shared shape
// every future collection plugs into.
// ============================================================

export type AdminFieldType = "text" | "textarea" | "richtext" | "slug" | "select" | "relation";

export type AdminFieldConfig = {
  name: string;
  label: string;
  type: AdminFieldType;
  section: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** for type "select" */
  options?: { value: string; label: string }[];
  /** for type "slug": the field whose value seeds the auto-slug */
  slugSource?: string;
  /** for type "relation": which collection it points to */
  relationTo?: string;
  dir?: "rtl" | "ltr";
  rows?: number;
};

export type AdminColumnConfig = {
  key: string;
  header: string;
  align?: "start" | "center" | "end";
};

export type AdminFilterConfig = {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
};

export type AdminSortConfig = { value: string; label: string };

export type AdminFormSectionConfig = {
  key: string;
  title: string;
  description?: string;
};

export type AdminActionKey = "create" | "edit" | "delete" | "duplicate";

export type CollectionConfig = {
  name: string; // url segment, e.g. "categories"
  model: string; // prisma model, e.g. "category"
  label: string; // plural Persian label
  labelSingular: string;
  addLabel: string;
  route: string; // "/admin/collections/categories"
  searchableHint: string;
  defaultSort: string;
  sorts: AdminSortConfig[];
  filters: AdminFilterConfig[];
  columns: AdminColumnConfig[];
  sections: AdminFormSectionConfig[];
  fields: AdminFieldConfig[];
  actions: AdminActionKey[];
};

export const categoriesCollection: CollectionConfig = {
  name: "categories",
  model: "category",
  label: "دسته‌بندی‌ها",
  labelSingular: "دسته‌بندی",
  addLabel: "افزودن دسته‌بندی",
  route: "/admin/collections/categories",
  searchableHint: "جستجو بر اساس عنوان یا نامک…",
  defaultSort: "tree",
  sorts: [
    { value: "tree", label: "ساختار درختی" },
    { value: "title", label: "عنوان (الفبا)" },
    { value: "updated", label: "آخرین ویرایش" },
  ],
  filters: [
    {
      paramKey: "type",
      label: "نوع",
      options: [{ value: "", label: "همه‌ی انواع" }, ...CATEGORY_TYPE_OPTIONS],
    },
  ],
  columns: [
    { key: "title", header: "عنوان" },
    { key: "slug", header: "نامک" },
    { key: "type", header: "نوع" },
    { key: "parent", header: "والد" },
    { key: "children", header: "زیرمجموعه", align: "center" },
    { key: "usage", header: "استفاده", align: "center" },
    { key: "updatedAt", header: "آخرین ویرایش" },
    { key: "actions", header: "", align: "end" },
  ],
  sections: [
    { key: "main", title: "اطلاعات اصلی" },
    {
      key: "structure",
      title: "ساختار و نوع دسته",
      description: "نوع دسته و جایگاه آن در سلسله‌مراتب.",
    },
    {
      key: "seo",
      title: "سئو و نامک پایه",
      description: "نشانی یکتای دسته در سایت.",
    },
    { key: "optional", title: "تنظیمات اختیاری" },
  ],
  fields: [
    {
      name: "title",
      label: "عنوان",
      type: "text",
      section: "main",
      required: true,
      placeholder: "مثلاً: زعفران",
    },
    {
      name: "type",
      label: "نوع دسته",
      type: "select",
      section: "structure",
      required: true,
      options: CATEGORY_TYPE_OPTIONS,
      hint: "محصول برای فروشگاه، نوشته برای بلاگ و دستور پخت.",
    },
    {
      name: "parentId",
      label: "دسته‌ی والد",
      type: "relation",
      section: "structure",
      relationTo: "categories",
      hint: "برای دسته‌ی سطح اول خالی بگذارید. والد باید از همان نوع باشد.",
    },
    {
      name: "slug",
      label: "نامک (slug)",
      type: "slug",
      section: "seo",
      required: true,
      slugSource: "title",
      dir: "ltr",
    },
    {
      name: "englishTitle",
      label: "عنوان انگلیسی",
      type: "text",
      section: "optional",
      dir: "ltr",
      placeholder: "Saffron",
    },
    {
      name: "description",
      label: "توضیحات",
      type: "richtext",
      section: "optional",
      placeholder: "توضیح این دسته‌بندی… (پاراگراف، تیتر، فهرست، نقل‌قول و…)",
    },
  ],
  actions: ["create", "edit", "delete", "duplicate"],
};

export const productsCollection: CollectionConfig = {
  name: "products",
  model: "product",
  label: "محصولات",
  labelSingular: "محصول",
  addLabel: "افزودن محصول",
  route: "/admin/collections/products",
  searchableHint: "جستجو بر اساس عنوان یا نامک…",
  defaultSort: "updated",
  sorts: [
    { value: "updated", label: "آخرین ویرایش" },
    { value: "title", label: "عنوان (الفبا)" },
  ],
  filters: [
    {
      paramKey: "active",
      label: "وضعیت",
      options: [
        { value: "", label: "همه" },
        { value: "1", label: "فعال" },
        { value: "0", label: "غیرفعال" },
      ],
    },
  ],
  columns: [
    { key: "title", header: "عنوان" },
    { key: "category", header: "دسته" },
    { key: "basePrice", header: "قیمت پایه", align: "center" },
    { key: "variants", header: "تنوع", align: "center" },
    { key: "stock", header: "موجودی", align: "center" },
    { key: "priceRange", header: "بازه‌ی قیمت", align: "center" },
    { key: "active", header: "وضعیت", align: "center" },
    { key: "updatedAt", header: "ویرایش" },
    { key: "actions", header: "", align: "end" },
  ],
  // The product form is custom (variant matrix); sections kept for breadcrumbs/labels.
  sections: [
    { key: "main", title: "اطلاعات اصلی" },
    { key: "price", title: "قیمت پایه" },
    { key: "content", title: "توضیحات محصول" },
    { key: "image", title: "تصویر" },
    { key: "variants", title: "مدل‌های فروش" },
    { key: "seo", title: "سئو" },
  ],
  fields: [],
  actions: ["create", "edit", "delete", "duplicate"],
};

// Coupons use a CUSTOM form (CouponForm — type-conditional fields + live
// discount preview), so `fields: []`. The list/filters/sorts/columns below
// drive the shared table + toolbar; `sections` label the form's card groups.
export const couponsCollection: CollectionConfig = {
  name: "coupons",
  model: "coupon",
  label: "کوپن‌ها",
  labelSingular: "کوپن",
  addLabel: "افزودن کوپن",
  route: "/admin/collections/coupons",
  searchableHint: "جستجو بر اساس کد یا نام داخلی…",
  defaultSort: "newest",
  sorts: [
    { value: "newest", label: "جدیدترین" },
    { value: "code", label: "کد (الفبا)" },
    { value: "active", label: "فعال‌ها" },
    { value: "ending", label: "نزدیک به پایان" },
  ],
  filters: [
    {
      paramKey: "status",
      label: "وضعیت",
      options: COUPON_STATUS_FILTER_OPTIONS,
    },
    {
      paramKey: "type",
      label: "نوع",
      options: [{ value: "", label: "همه‌ی انواع" }, ...COUPON_TYPE_OPTIONS],
    },
  ],
  columns: [
    { key: "code", header: "کد" },
    { key: "title", header: "نام داخلی" },
    { key: "type", header: "نوع" },
    { key: "value", header: "مقدار", align: "center" },
    { key: "rule", header: "خلاصه‌ی قانون" },
    { key: "usage", header: "مصرف", align: "center" },
    { key: "status", header: "وضعیت", align: "center" },
    { key: "dates", header: "زمان‌بندی" },
    { key: "actions", header: "", align: "end" },
  ],
  sections: [
    { key: "main", title: "اطلاعات اصلی" },
    { key: "discount", title: "نوع و مقدار تخفیف" },
    { key: "rules", title: "قوانین استفاده" },
    { key: "schedule", title: "زمان‌بندی" },
    { key: "limits", title: "محدودیت‌ها" },
    { key: "preview", title: "پیش‌نمایش" },
  ],
  fields: [],
  actions: ["create", "edit", "delete"],
};

export const COLLECTIONS: Record<string, CollectionConfig> = {
  categories: categoriesCollection,
  products: productsCollection,
  coupons: couponsCollection,
};

export function getCollection(name: string): CollectionConfig | null {
  return COLLECTIONS[name] ?? null;
}
