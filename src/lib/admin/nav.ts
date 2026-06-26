import {
  LayoutDashboard,
  Package,
  FolderTree,
  Scale,
  Coins,
  Ticket,
  ShoppingCart,
  Users,
  Star,
  FileText,
  ChefHat,
  Lightbulb,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle,
  Home,
  PanelTop,
  PanelBottom,
  Menu,
  GalleryHorizontal,
  Search,
  ArrowLeftRight,
  Library,
  Settings,
  Building2,
  Phone,
  Palette,
  Share2,
  Activity,
  SlidersHorizontal,
  Store,
  Monitor,
  Map,
  Bot,
  Braces,
  Headset,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; section?: string };
/** Optional labelled sub-sections inside a group; `columns: 2` renders compactly. */
export type NavSection = { key: string; title: string; columns?: 1 | 2 };
export type NavGroup = {
  title: string;
  icon?: LucideIcon;
  items: NavItem[];
  sections?: NavSection[];
};

// Single source of truth for the admin sidebar, grouped into clear parent
// sections (ADMIN-CP2.5). Not-yet-built links resolve to the generic
// collection/global placeholder pages until their checkpoint lands.
export const ADMIN_NAV: NavGroup[] = [
  {
    // Single-item group → rendered as a standalone link (no duplicate label).
    title: "داشبورد",
    items: [{ label: "داشبورد", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "فروشگاه",
    icon: Store,
    items: [
      { label: "محصولات", href: "/admin/collections/products", icon: Package },
      { label: "دسته‌بندی محصولات", href: "/admin/collections/categories", icon: FolderTree },
      { label: "وزن‌ها و بسته‌بندی‌ها", href: "/admin/collections/weights-packaging", icon: Scale },
      { label: "قیمت‌گذاری", href: "/admin/collections/pricing", icon: Coins },
      { label: "کوپن‌ها", href: "/admin/collections/coupons", icon: Ticket },
    ],
  },
  {
    title: "سفارش‌ها و مشتریان",
    icon: ShoppingCart,
    items: [
      { label: "سفارش‌ها", href: "/admin/collections/orders", icon: ShoppingCart },
      { label: "مشتریان", href: "/admin/customers", icon: Users },
      { label: "دیدگاه‌ها و پرسش‌ها", href: "/admin/collections/reviews", icon: Star },
      { label: "پیام‌های فرم تماس", href: "/admin/collections/contact-messages", icon: MessageSquare },
      { label: "چت و پشتیبانی", href: "/admin/chat", icon: Headset },
    ],
  },
  {
    title: "محتوا",
    icon: FileText,
    items: [
      { label: "مقاله‌های مجله", href: "/admin/content/articles", icon: FileText },
      { label: "پرونده‌ها", href: "/admin/content/case-files", icon: Library },
      { label: "دستور پخت‌ها", href: "/admin/content/articles?type=RECIPE", icon: ChefHat },
      { label: "امتیازهای دستور پخت", href: "/admin/content/recipe-ratings", icon: Star },
      { label: "پیشنهادهای دستور پخت", href: "/admin/content/recipe-suggestions", icon: Lightbulb },
      { label: "دیدگاه‌های نوشته‌ها", href: "/admin/collections/comments", icon: MessageSquare },
      { label: "رسانه", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    title: "تجربه‌ی سایت",
    icon: Monitor,
    sections: [
      { key: "layout", title: "چیدمان و بلوک‌ها" },
      { key: "pages", title: "صفحه‌های ثابت", columns: 2 },
    ],
    items: [
      { label: "صفحه خانه", href: "/admin/globals/homepage", icon: Home, section: "layout" },
      { label: "هدر", href: "/admin/globals/header", icon: PanelTop, section: "layout" },
      { label: "فوتر", href: "/admin/globals/footer", icon: PanelBottom, section: "layout" },
      { label: "منوها", href: "/admin/collections/menus", icon: Menu, section: "layout" },
      { label: "بنرها", href: "/admin/collections/banners", icon: GalleryHorizontal, section: "layout" },
      { label: "سوالات متداول", href: "/admin/collections/faqs", icon: HelpCircle, section: "pages" },
      { label: "متن صفحهٔ سوالات", href: "/admin/globals/faq", icon: FileText, section: "pages" },
      { label: "قوانین", href: "/admin/globals/terms", icon: Scale, section: "pages" },
      { label: "تماس", href: "/admin/globals/contact-page", icon: Phone, section: "pages" },
    ],
  },
  {
    title: "سئو",
    icon: Search,
    items: [
      { label: "بررسی سئو", href: "/admin/seo/overview", icon: Activity },
      { label: "صف خطاهای سئو", href: "/admin/seo/issues", icon: AlertTriangle },
      { label: "پیش‌فرض‌های سئو", href: "/admin/seo/settings", icon: SlidersHorizontal },
      { label: "داده‌های ساختاریافته", href: "/admin/seo/structured-data", icon: Braces },
      { label: "سایت‌مپ", href: "/admin/seo/sitemap", icon: Map },
      { label: "robots.txt", href: "/admin/seo/robots", icon: Bot },
      { label: "فید محصولات گوگل", href: "/admin/seo/merchant", icon: Store },
      { label: "ریدایرکت‌ها", href: "/admin/collections/redirects", icon: ArrowLeftRight },
    ],
  },
  {
    title: "تنظیمات کسب‌وکار",
    icon: Building2,
    items: [
      { label: "تنظیمات سایت", href: "/admin/globals/site", icon: Settings },
      { label: "اطلاعات کسب‌وکار", href: "/admin/globals/business", icon: Building2 },
      { label: "اطلاعات تماس", href: "/admin/globals/contact", icon: Phone },
      { label: "تنظیمات برند", href: "/admin/globals/brand", icon: Palette },
      { label: "شبکه‌های اجتماعی", href: "/admin/globals/social", icon: Share2 },
    ],
  },
  {
    title: "سیستم",
    icon: SlidersHorizontal,
    items: [
      { label: "فعالیت‌ها", href: "/admin/activity", icon: Activity },
      { label: "تنظیمات سیستم", href: "/admin/settings", icon: SlidersHorizontal },
    ],
  },
];

// Valid [collection] segments → Persian label (used by the placeholder page).
// `media` has its own route (/admin/media), so it is intentionally excluded.
// `categories` has its own real CRUD route (ADMIN-CP2); kept here only as a
// fallback label. weights-packaging / pricing are CP3 placeholders.
export const COLLECTION_LABELS: Record<string, string> = {
  products: "محصولات",
  categories: "دسته‌بندی محصولات",
  "weights-packaging": "وزن‌ها و بسته‌بندی‌ها",
  pricing: "قیمت‌گذاری",
  coupons: "کوپن‌ها",
  orders: "سفارش‌ها",
  users: "کاربران",
  reviews: "نقدهای محصول",
  posts: "نوشته‌ها",
  comments: "دیدگاه‌های نوشته‌ها",
  faqs: "سوالات متداول",
  menus: "منوها",
  banners: "بنرها",
  redirects: "ریدایرکت‌ها",
};

// Valid [global] segments → Persian label.
export const GLOBAL_LABELS: Record<string, string> = {
  site: "تنظیمات سایت",
  business: "اطلاعات کسب‌وکار",
  contact: "اطلاعات تماس",
  brand: "تنظیمات برند",
  header: "هدر",
  footer: "فوتر",
  homepage: "صفحه خانه",
  social: "شبکه‌های اجتماعی",
  seo: "پیش‌فرض‌های سئو",
  terms: "قوانین و مقررات",
  faq: "صفحهٔ پرسش‌های متداول",
  "contact-page": "صفحهٔ تماس با ما",
};
