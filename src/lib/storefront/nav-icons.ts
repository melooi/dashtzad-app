import {
  Home,
  Store,
  Nut,
  Grape,
  Leaf,
  Apple,
  Citrus,
  Coffee,
  CupSoda,
  Wheat,
  Sprout,
  Sparkles,
  Flame,
  Gift,
  PackageCheck,
  Package,
  Boxes,
  BadgePercent,
  Tag,
  Newspaper,
  BookOpen,
  Headset,
  Phone,
  User,
  ShoppingCart,
  Search,
  MessageCircle,
  LayoutGrid,
  Info,
  Truck,
  PackageSearch,
  ScrollText,
  CircleHelp,
  Circle,
  type LucideIcon,
} from "lucide-react";

// ============================================================
// FRONT-HF-LOCK-CP1 — curated, MEANINGFUL nav-icon allow-list + resolver.
// The storefront never renders a broken/blank icon: an admin-set icon name is
// used when it is in the allow-list, otherwise we infer a sensible icon from
// the item's Persian label / href, falling back to a neutral Circle.
// No "random nice-looking" icons — every entry maps to a real food-commerce
// meaning. Shared by Header / MegaMenu / MobileDrawer / BottomNav / Footer and
// the admin icon picker (AutoIconField).
// ============================================================

/** Allow-listed icons (lucide name → component). */
export const NAV_ICONS: Record<string, LucideIcon> = {
  home: Home,
  store: Store,
  nut: Nut,
  grape: Grape,
  leaf: Leaf,
  apple: Apple,
  citrus: Citrus,
  coffee: Coffee,
  tea: CupSoda,
  wheat: Wheat,
  legume: Sprout,
  spice: Sparkles,
  saffron: Flame,
  gift: Gift,
  "ready-pack": PackageCheck,
  package: Package,
  bulk: Boxes,
  sale: BadgePercent,
  tag: Tag,
  magazine: Newspaper,
  article: BookOpen,
  support: Headset,
  phone: Phone,
  account: User,
  cart: ShoppingCart,
  search: Search,
  chat: MessageCircle,
  categories: LayoutGrid,
  about: Info,
  "track-order": Truck,
  "order-search": PackageSearch,
  terms: ScrollText,
  faq: CircleHelp,
};

/** Options for the admin icon picker (value = allow-list key, fa label). */
export const NAV_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "home", label: "خانه" },
  { value: "store", label: "فروشگاه" },
  { value: "categories", label: "دسته‌بندی" },
  { value: "nut", label: "آجیل و مغزها" },
  { value: "grape", label: "خشکبار" },
  { value: "apple", label: "میوه خشک" },
  { value: "citrus", label: "مرکبات" },
  { value: "coffee", label: "قهوه" },
  { value: "tea", label: "چای و دمنوش" },
  { value: "wheat", label: "برنج / غلات" },
  { value: "legume", label: "حبوبات" },
  { value: "spice", label: "ادویه" },
  { value: "saffron", label: "زعفران" },
  { value: "leaf", label: "گیاهی" },
  { value: "gift", label: "هدایا" },
  { value: "ready-pack", label: "بسته‌ی آماده" },
  { value: "bulk", label: "خرید عمده" },
  { value: "sale", label: "فروش ویژه" },
  { value: "magazine", label: "مجله / بلاگ" },
  { value: "article", label: "مقاله" },
  { value: "support", label: "پشتیبانی" },
  { value: "phone", label: "تلفن" },
  { value: "account", label: "حساب کاربری" },
  { value: "cart", label: "سبد خرید" },
  { value: "search", label: "جستجو" },
  { value: "chat", label: "گفت‌وگو" },
  { value: "track-order", label: "پیگیری سفارش" },
  { value: "about", label: "درباره ما" },
  { value: "faq", label: "پرسش‌های متداول" },
  { value: "terms", label: "قوانین" },
  { value: "package", label: "بسته (عمومی)" },
  { value: "tag", label: "برچسب" },
];

// Keyword → allow-list key (checked against the item's Persian label).
const LABEL_KEYWORDS: [RegExp, string][] = [
  [/خانه|صفحه اصلی/, "home"],
  [/آجیل|مغز|پسته|بادام|فندق|گردو|تخمه/, "nut"],
  [/خشکبار|کشمش|انجیر|توت/, "grape"],
  [/میوه ?خشک|برگه/, "apple"],
  [/مرکبات|لیمو|پرتقال/, "citrus"],
  [/قهوه/, "coffee"],
  [/چای|دمنوش|دم ?نوش/, "tea"],
  [/برنج|غلات|گندم|جو/, "wheat"],
  [/حبوبات|عدس|لوبیا|نخود|لپه/, "legume"],
  [/زعفران/, "saffron"],
  [/ادویه|دارچین|زردچوبه|فلفل/, "spice"],
  [/هدیه|هدایا|سازمانی|مناسبت/, "gift"],
  [/بسته.*آماده|پک |باکس/, "ready-pack"],
  [/عمده|بنکدار|کلی/, "bulk"],
  [/ویژه|تخفیف|حراج|شگفت/, "sale"],
  [/مجله|بلاگ|مقاله|مطلب|محتوا|خبر/, "magazine"],
  [/پشتیبانی|تماس با ما|تماس/, "support"],
  [/پیگیری|رهگیری/, "track-order"],
  [/درباره|داستان|ما /, "about"],
  [/قوانین|مقررات|حریم/, "terms"],
  [/پرسش|سوال|متداول|راهنما/, "faq"],
  [/حساب|ورود|ثبت ?نام|پروفایل/, "account"],
  [/سبد/, "cart"],
  [/جستجو/, "search"],
  [/گفت|چت|پیام/, "chat"],
  [/همه ?محصولات|فروشگاه|محصولات/, "store"],
  [/دسته/, "categories"],
];

// Keyword → allow-list key (checked against the item's href).
const HREF_KEYWORDS: [RegExp, string][] = [
  [/^\/?$/, "home"],
  [/\/cart/, "cart"],
  [/\/products?($|\?|\/)/, "store"],
  [/\/categor/, "categories"],
  [/\/blog|\/magazine|\/recipe/, "magazine"],
  [/\/about/, "about"],
  [/\/contact|^tel:/, "support"],
  [/\/(account|auth|login|profile)/, "account"],
  [/\/faq/, "faq"],
  [/\/terms|\/privacy/, "terms"],
  [/\/orders?\b/, "track-order"],
  [/\/search/, "search"],
];

/**
 * Resolve a MEANINGFUL icon for a nav item. Order:
 * 1) explicit admin icon that is in the allow-list,
 * 2) keyword match on the label, then the href,
 * 3) neutral `Circle` fallback (never blank).
 */
export function resolveNavIcon(
  icon: string | null | undefined,
  label = "",
  href = "",
): LucideIcon {
  if (icon) {
    const key = icon.trim().toLowerCase();
    if (NAV_ICONS[key]) return NAV_ICONS[key];
  }
  for (const [re, key] of LABEL_KEYWORDS) if (re.test(label)) return NAV_ICONS[key];
  for (const [re, key] of HREF_KEYWORDS) if (re.test(href)) return NAV_ICONS[key];
  return Circle;
}

// ---- per-category toned chip (mega menu / drawer category grid) ----

export type CategoryTone =
  | "rice"
  | "legume"
  | "nuts"
  | "tea"
  | "spice"
  | "ajil"
  | "gift"
  | "neutral";

/** Soft chip classes per tone (store-* tokens only). */
export const TONE_CHIP: Record<CategoryTone, string> = {
  rice: "bg-store-amber-soft text-store-gold-deep",
  legume: "bg-store-primary-soft text-store-primary-hover",
  nuts: "bg-store-clay-soft text-store-clay-deep",
  tea: "bg-emerald-50 text-store-success",
  spice: "bg-store-amber-soft text-store-gold",
  ajil: "bg-store-secondary-soft text-store-secondary",
  gift: "bg-fuchsia-50 text-fuchsia-700",
  neutral: "bg-store-surface-soft text-store-text-muted",
};

/** Infer a chip tone from a category label (falls back to neutral). */
export function categoryTone(label = ""): CategoryTone {
  if (/برنج|غلات|گندم/.test(label)) return "rice";
  if (/حبوبات|عدس|لوبیا|نخود|لپه/.test(label)) return "legume";
  if (/خشکبار|آجیل|مغز|پسته|بادام|فندق|گردو|تخمه/.test(label)) return "nuts";
  if (/چای|دمنوش|قهوه/.test(label)) return "tea";
  if (/ادویه|زعفران|دارچین|فلفل/.test(label)) return "spice";
  if (/هدیه|هدایا|مناسبت|سازمانی/.test(label)) return "gift";
  if (/میوه|مرکبات/.test(label)) return "ajil";
  return "neutral";
}
