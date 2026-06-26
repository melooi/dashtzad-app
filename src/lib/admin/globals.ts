import { z } from "zod";

// ============================================================
// Global singletons (ADMIN-CP4) — Zod schemas, safe defaults, and the
// declarative field config that drives the shared GlobalForm. Each global is
// stored as a single GlobalSetting row (key → JSON data). Schemas are used by
// BOTH the client form and the server action (defense in depth) and always
// provide safe defaults so a missing/partial global never crashes a page.
// ============================================================

// ---- shared field validators ----

/** Empty, an internal path ("/..."), or an absolute http(s) URL. */
export function isUrlOrPath(v: string): boolean {
  const s = (v ?? "").trim();
  if (s === "") return true;
  if (s.startsWith("/")) return true;
  return /^https?:\/\/[^\s]+$/i.test(s);
}

const isEmailOrEmpty = (v: string) =>
  v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const text = (def = "") => z.string().trim().default(def);
const bool = (def = false) => z.boolean().default(def);
const url = () =>
  z.string().trim().default("").refine(isUrlOrPath, "نشانی نامعتبر است (باید با / یا http شروع شود).");
const email = () =>
  z.string().trim().default("").refine(isEmailOrEmpty, "ایمیل نامعتبر است.");
const num = (def: number, min = 0, max = 1_000_000) =>
  z.coerce.number().int().min(min).max(max).default(def);

// ============================================================
// Field config (drives the generic GlobalForm + HomepageBuilder)
// ============================================================

export type GlobalFieldType =
  | "text"
  | "textarea"
  | "url"
  | "image" // URL field backed by the Media Library picker (MEDIA-CP1)
  | "number"
  | "color"
  | "checkbox"
  | "select"
  | "menu"
  | "icon"
  | "stringList"
  | "objectList"
  // homepage relation pickers (options supplied at render time):
  | "product"
  | "products"
  | "category"
  | "categories"
  | "faqGroup";

export type GlobalFieldDef = {
  name: string;
  label: string;
  type: GlobalFieldType;
  hint?: string;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  rows?: number;
  options?: { value: string; label: string }[];
  itemFields?: GlobalFieldDef[]; // objectList
  itemLabel?: string; // objectList add-button label
  locked?: boolean; // read-only (e.g. defaultLanguage = fa)
  section: string;
};

export type GlobalSectionDef = { key: string; title: string; description?: string };

export type GlobalConfig<T extends z.ZodTypeAny = z.ZodTypeAny> = {
  key: string;
  label: string;
  description: string;
  route: string;
  schema: T;
  defaults: z.infer<T>;
  sections: GlobalSectionDef[];
  fields: GlobalFieldDef[];
  /** revalidate these public paths after save */
  revalidate: string[];
  /** custom UI instead of the generic form */
  custom?: "homepage";
};

// ============================================================
// 1) siteSettings
// ============================================================

export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "popular", label: "پرفروش‌ترین" },
];

export const siteSettingsSchema = z.object({
  siteName: text("دشت‌زاد"),
  siteShortName: text("دشت‌زاد"),
  tagline: text(""),
  defaultLanguage: text("fa"),
  currency: text("toman"),
  siteUrl: url(),
  maintenanceMode: bool(false),
  maintenanceMessage: text("سایت در حال به‌روزرسانی است. به‌زودی برمی‌گردیم."),
  announcementText: text(""),
  announcementHref: url(),
  announcementActive: bool(false),
  defaultProductSort: z.enum(["newest", "cheapest", "expensive", "popular"]).default("newest"),
  productsPerPage: num(12, 1, 100),
  supportHoursShortText: text(""),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// ============================================================
// 2) businessInfo
// ============================================================

export const businessInfoSchema = z.object({
  brandName: text("دشت‌زاد"),
  legalName: text(""),
  registrationNumber: text(""),
  nationalId: text(""),
  economicCode: text(""),
  address: text(""),
  province: text("تهران"),
  city: text("تهران"),
  postalCode: text(""),
  mapUrl: url(),
  foundedYear: text("۱۳۱۳"),
  businessDescription: text(""),
  aboutShortText: text(""),
});
export type BusinessInfo = z.infer<typeof businessInfoSchema>;

// ============================================================
// 3) contactInfo
// ============================================================

export const contactInfoSchema = z.object({
  primaryPhone: text(""),
  supportPhone: text(""),
  salesPhone: text(""),
  whatsapp: text(""),
  email: email(),
  supportEmail: email(),
  salesEmail: email(),
  addressText: text(""),
  workingHours: text(""),
  responseTimeText: text(""),
  contactPageIntro: text(""),
  showContactInHeader: bool(false),
  showContactInFooter: bool(true),
});
export type ContactInfo = z.infer<typeof contactInfoSchema>;

// ============================================================
// 4) brandSettings
// ============================================================

export const brandSettingsSchema = z.object({
  logoUrl: url(),
  logoDarkUrl: url(),
  logoLightUrl: url(),
  iconUrl: url(),
  faviconUrl: url(),
  ogImageUrl: url(),
  primaryColor: text("#4a6340"),
  secondaryColor: text(""),
  brandSlogan: text(""),
  brandStampText: text("۱۳۱۳"),
  footerBrandText: text(""),
  packageTagline: text(""),
  trustStatement: text(""),
});
export type BrandSettings = z.infer<typeof brandSettingsSchema>;

// ============================================================
// 5) header
// ============================================================

export const LOGO_VARIANT_OPTIONS = [
  { value: "full", label: "کامل (نشان + متن)" },
  { value: "mark", label: "فقط نشان" },
  { value: "1313", label: "نشان قدمت ۱۳۱۳" },
];
export const MOBILE_MENU_STYLE_OPTIONS = [
  { value: "drawer", label: "کشویی (Drawer)" },
  { value: "accordion", label: "آکاردئونی" },
];

export const headerSchema = z.object({
  logoVariant: z.enum(["full", "mark", "1313"]).default("full"),
  mainMenuId: text(""),
  secondaryMenuId: text(""),
  // FRONT-HF-LOCK-CP1 — mega menu (categories come from a menu's parent/children tree).
  showMegaMenu: bool(true),
  megaMenuId: text(""),
  megaTriggerLabel: text("دسته‌بندی محصولات"),
  // FRONT-HF-LOCK-CP1 — mobile bottom nav + chat placeholder entry.
  showBottomNav: bool(true),
  bottomNavMenuId: text(""),
  showSearch: bool(true),
  showCart: bool(true),
  showAccount: bool(true),
  showAnnouncement: bool(false),
  stickyHeader: bool(true),
  mobileMenuStyle: z.enum(["drawer", "accordion"]).default("drawer"),
  ctaLabel: text(""),
  ctaHref: url(),
  phoneLabel: text(""),
  phoneHref: text(""),
});
export type HeaderConfig = z.infer<typeof headerSchema>;

// ============================================================
// 6) footer
// ============================================================

export const footerSchema = z.object({
  footerMenuPrimaryId: text(""),
  footerMenuSecondaryId: text(""),
  // FRONT-HF-LOCK-CP1 — up to 4 admin-assignable footer link columns.
  footerMenuTertiaryId: text(""),
  footerMenuQuaternaryId: text(""),
  showBusinessInfo: bool(true),
  showContactInfo: bool(true),
  showSocialLinks: bool(true),
  newsletterTitle: text(""),
  newsletterDescription: text(""),
  trustBadges: z
    .array(
      z.object({
        title: text(""),
        description: text(""),
        icon: text(""),
      }),
    )
    .default([]),
  copyrightText: text("© دشت‌زاد — تمام حقوق محفوظ است."),
  bottomNote: text(""),
  enamadHtml: text(""),
  samandehiHtml: text(""),
});
export type FooterConfig = z.infer<typeof footerSchema>;

// ============================================================
// 7) homepage (block builder — stored as { blocks: [...] })
// ============================================================

export const HOMEPAGE_BLOCK_TYPES = [
  "Hero",
  "FeaturedProducts",
  "FeaturedCategories",
  "RichText",
  "ImageGallery",
  "CTABanner",
  "FAQGroup",
  "TrustIcons",
  "BlogPreview",
  "ProductStory",
  "ProductFeatures",
  "ProductTasteProfile",
] as const;
export type HomepageBlockType = (typeof HOMEPAGE_BLOCK_TYPES)[number];

// Each block keeps id/type/isActive plus block-specific fields (passthrough so
// the builder controls the exact shape per type).
const homepageBlockSchema = z
  .object({
    id: z.string(),
    type: z.enum(HOMEPAGE_BLOCK_TYPES),
    isActive: z.boolean().default(true),
  })
  .passthrough();

export const homepageSchema = z.object({
  blocks: z.array(homepageBlockSchema).default([]),
});
export type Homepage = z.infer<typeof homepageSchema>;
export type HomepageBlock = z.infer<typeof homepageBlockSchema> & Record<string, unknown>;

export const HOMEPAGE_BLOCK_LABELS: Record<HomepageBlockType, string> = {
  Hero: "هیرو (بنر اصلی)",
  FeaturedProducts: "محصولات منتخب",
  FeaturedCategories: "دسته‌های منتخب",
  RichText: "متن غنی",
  ImageGallery: "گالری تصاویر",
  CTABanner: "بنر دعوت به اقدام",
  FAQGroup: "سوالات متداول",
  TrustIcons: "نمادهای اعتماد",
  BlogPreview: "پیش‌نمایش بلاگ",
  ProductStory: "داستان محصول",
  ProductFeatures: "ویژگی‌های محصول",
  ProductTasteProfile: "پروفایل طعم",
};

// Field definitions per block type (drive the builder editor + labels).
export const HOMEPAGE_BLOCK_FIELDS: Record<HomepageBlockType, GlobalFieldDef[]> = {
  Hero: [
    { name: "eyebrow", label: "خط بالایی", type: "text", section: "b" },
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "subtitle", label: "زیرعنوان", type: "textarea", rows: 2, section: "b" },
    { name: "imageUrl", label: "تصویر دسکتاپ", type: "image", dir: "ltr", section: "b" },
    { name: "mobileImageUrl", label: "تصویر موبایل", type: "image", dir: "ltr", section: "b" },
    { name: "primaryCtaLabel", label: "متن دکمه‌ی اصلی", type: "text", section: "b" },
    { name: "primaryCtaHref", label: "لینک دکمه‌ی اصلی", type: "url", dir: "ltr", section: "b" },
    { name: "secondaryCtaLabel", label: "متن دکمه‌ی دوم", type: "text", section: "b" },
    { name: "secondaryCtaHref", label: "لینک دکمه‌ی دوم", type: "url", dir: "ltr", section: "b" },
  ],
  FeaturedProducts: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "subtitle", label: "زیرعنوان", type: "text", section: "b" },
    {
      name: "mode",
      label: "حالت انتخاب",
      type: "select",
      section: "b",
      options: [
        { value: "MANUAL", label: "دستی" },
        { value: "LATEST", label: "جدیدترین‌ها" },
        { value: "CATEGORY", label: "بر اساس دسته" },
      ],
    },
    { name: "productIds", label: "محصولات (حالت دستی)", type: "products", section: "b" },
    { name: "categoryId", label: "دسته (حالت دسته)", type: "category", section: "b" },
    { name: "limit", label: "تعداد نمایش", type: "number", dir: "ltr", section: "b" },
  ],
  FeaturedCategories: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "subtitle", label: "زیرعنوان", type: "text", section: "b" },
    { name: "categoryIds", label: "دسته‌ها", type: "categories", section: "b" },
  ],
  RichText: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "body", label: "متن", type: "textarea", rows: 5, section: "b" },
  ],
  ImageGallery: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    {
      name: "images",
      label: "تصاویر",
      type: "objectList",
      itemLabel: "افزودن تصویر",
      section: "b",
      itemFields: [
        { name: "url", label: "نشانی تصویر", type: "image", dir: "ltr", section: "x" },
        { name: "alt", label: "متن جایگزین", type: "text", section: "x" },
      ],
    },
  ],
  CTABanner: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "text", label: "متن", type: "textarea", rows: 2, section: "b" },
    { name: "imageUrl", label: "تصویر", type: "image", dir: "ltr", section: "b" },
    { name: "buttonLabel", label: "متن دکمه", type: "text", section: "b" },
    { name: "buttonHref", label: "لینک دکمه", type: "url", dir: "ltr", section: "b" },
  ],
  FAQGroup: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "faqGroupId", label: "گروه سوالات متداول", type: "faqGroup", section: "b" },
  ],
  TrustIcons: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    {
      name: "items",
      label: "آیتم‌ها",
      type: "objectList",
      itemLabel: "افزودن آیتم",
      section: "b",
      itemFields: [
        { name: "icon", label: "آیکن", type: "icon", section: "x" },
        { name: "title", label: "عنوان", type: "text", section: "x" },
        { name: "text", label: "متن", type: "text", section: "x" },
      ],
    },
  ],
  BlogPreview: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    {
      name: "mode",
      label: "حالت",
      type: "select",
      section: "b",
      options: [
        { value: "LATEST", label: "جدیدترین‌ها" },
        { value: "CATEGORY", label: "بر اساس دسته" },
      ],
    },
    { name: "categoryId", label: "دسته (حالت دسته)", type: "category", section: "b" },
    { name: "limit", label: "تعداد نمایش", type: "number", dir: "ltr", section: "b" },
  ],
  ProductStory: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    { name: "text", label: "متن", type: "textarea", rows: 4, section: "b" },
    { name: "productId", label: "محصول مرتبط", type: "product", section: "b" },
    { name: "imageUrl", label: "تصویر", type: "image", dir: "ltr", section: "b" },
  ],
  ProductFeatures: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    {
      name: "items",
      label: "ویژگی‌ها",
      type: "objectList",
      itemLabel: "افزودن ویژگی",
      section: "b",
      itemFields: [
        { name: "icon", label: "آیکن", type: "icon", section: "x" },
        { name: "title", label: "عنوان", type: "text", section: "x" },
        { name: "text", label: "متن", type: "text", section: "x" },
      ],
    },
  ],
  ProductTasteProfile: [
    { name: "title", label: "عنوان", type: "text", section: "b" },
    {
      name: "items",
      label: "موارد طعم",
      type: "objectList",
      itemLabel: "افزودن مورد",
      section: "b",
      itemFields: [
        { name: "label", label: "برچسب", type: "text", section: "x" },
        { name: "value", label: "مقدار", type: "text", section: "x" },
      ],
    },
  ],
};

/** A fresh block of the given type with sensible empty defaults. */
export function emptyHomepageBlock(type: HomepageBlockType, id: string): HomepageBlock {
  const block: HomepageBlock = { id, type, isActive: true };
  for (const f of HOMEPAGE_BLOCK_FIELDS[type]) {
    if (f.type === "products" || f.type === "categories" || f.type === "stringList" || f.type === "objectList") {
      block[f.name] = [];
    } else if (f.type === "number") {
      block[f.name] = f.name === "limit" ? 4 : 0;
    } else if (f.type === "select") {
      block[f.name] = f.options?.[0]?.value ?? "";
    } else {
      block[f.name] = "";
    }
  }
  return block;
}

// ============================================================
// 8) socialLinks (list)
// ============================================================

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "instagram", label: "اینستاگرام" },
  { value: "telegram", label: "تلگرام" },
  { value: "whatsapp", label: "واتساپ" },
  { value: "linkedin", label: "لینکدین" },
  { value: "aparat", label: "آپارات" },
  { value: "x", label: "ایکس (توییتر)" },
  { value: "youtube", label: "یوتیوب" },
  { value: "custom", label: "سفارشی" },
];

export const socialLinksSchema = z.object({
  links: z
    .array(
      z.object({
        platform: z
          .enum(["instagram", "telegram", "whatsapp", "linkedin", "aparat", "x", "youtube", "custom"])
          .default("instagram"),
        label: text(""),
        url: url(),
        icon: text(""),
        isActive: bool(true),
        sortOrder: z.coerce.number().int().default(0),
      }),
    )
    .default([]),
});
export type SocialLinks = z.infer<typeof socialLinksSchema>;

// ============================================================
// 9) seoDefaults
// ============================================================

export const TWITTER_CARD_OPTIONS = [
  { value: "summary", label: "خلاصه (Summary)" },
  { value: "summary_large_image", label: "تصویر بزرگ" },
];

export const seoDefaultsSchema = z.object({
  defaultTitle: text("دشت‌زاد — مواد غذایی پرمیوم ایرانی"),
  titleTemplate: text("%s | دشت‌زاد"),
  defaultDescription: text(
    "زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم ایرانی — مستقیم از دشت تا سفره‌ی شما. از سال ۱۳۱۳.",
  ),
  defaultOgImageUrl: url(),
  twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  canonicalBase: url(),
  robotsIndexDefault: bool(true),
  robotsFollowDefault: bool(true),
  organizationName: text("دشت‌زاد"),
  organizationLogoUrl: url(),
  organizationSameAs: z.array(z.string().trim()).default([]),
  productTitleTemplate: text("%s | فروشگاه دشت‌زاد"),
  categoryTitleTemplate: text("%s | دسته‌بندی دشت‌زاد"),
  postTitleTemplate: text("%s | بلاگ دشت‌زاد"),
  recipeTitleTemplate: text("%s | دستور پخت دشت‌زاد"),
});
export type SeoDefaults = z.infer<typeof seoDefaultsSchema>;

// ============================================================
// 10) chatSettings (CHAT-CP1) — drives BOTH storefront widget + admin inbox
// ============================================================

export const chatSettingsSchema = z.object({
  // Master + per-surface visibility.
  enabled: bool(true),
  showStorefrontMobileNav: bool(true),
  showStorefrontDesktopLauncher: bool(true),
  showAdminLauncher: bool(true),
  // Launcher labels.
  mobileCtaLabel: text("گفت‌وگو"),
  desktopCtaLabel: text("گفت‌وگو با ما"),
  // Identity.
  botName: text("دستیار دشت‌زاد"),
  operatorName: text("پشتیبانی دشت‌زاد"),
  // Welcome + composer.
  welcomeTitle: text("سلام 👋 چطور می‌توانیم کمک‌تان کنیم؟"),
  welcomeBody: text(
    "تیم دشت‌زاد آماده‌ی پاسخ‌گویی است. پیام‌تان را بنویسید یا یکی از گزینه‌های زیر را انتخاب کنید.",
  ),
  composerPlaceholder: text("پیام‌تان را بنویسید…"),
  responseTimeLabel: text("معمولاً در کمتر از یک ساعت پاسخ می‌دهیم"),
  // Availability.
  operatorsOnline: bool(true),
  workingHoursLabel: text("شنبه تا پنجشنبه، ۹ تا ۱۸"),
  offlineTitle: text("الان آفلاین هستیم"),
  offlineBody: text("پیام‌تان را بگذارید؛ در اولین فرصت کاری پاسخ‌گو خواهیم بود."),
  // Repeatable quick-action chips.
  quickActions: z
    .array(
      z.object({
        label: text(""),
        icon: text(""),
      }),
    )
    .default([
      { label: "پیگیری سفارش", icon: "track-order" },
      { label: "سوال درباره محصول", icon: "package" },
      { label: "راهنمای خرید", icon: "article" },
      { label: "صحبت با پشتیبانی", icon: "support" },
    ]),
  // Optional contact fallback links (phone / WhatsApp / support page).
  fallbackLinks: z
    .array(
      z.object({
        label: text(""),
        href: text(""),
        icon: text(""),
      }),
    )
    .default([]),
  // CHAT-CP2 — self-service: show an existing FAQ group inside the widget.
  faqGroupId: text(""),
  // CHAT-CP2 — proactive auto-greeting after N seconds on a page.
  proactiveEnabled: bool(false),
  proactiveDelaySeconds: num(20, 3, 600),
  proactiveMessage: text("سلام! اگر سوالی دارید همین‌جا بپرسید 🙂"),
  // CHAT-CP2 — pre-chat identity form for guests.
  preChatMode: z.enum(["off", "optional", "required"]).default("optional"),
  // CHAT-CP2 — visitor sound on new operator message.
  soundEnabled: bool(true),
  // CHAT-CP2 — operator canned/saved replies (repeatable).
  cannedReplies: z
    .array(
      z.object({
        title: text(""),
        shortcut: text(""),
        body: text(""),
      }),
    )
    .default([
      { title: "سلام و خوش‌آمد", shortcut: "/hi", body: "سلام، به دشت‌زاد خوش آمدید! چطور می‌توانم کمک‌تان کنم؟" },
      { title: "پیگیری سفارش", shortcut: "/order", body: "لطفاً شماره‌ی سفارش‌تان را بفرمایید تا همین حالا بررسی کنم." },
      { title: "تشکر و بستن", shortcut: "/bye", body: "خواهش می‌کنم! اگر سوال دیگری داشتید در خدمتم. روز خوبی داشته باشید 🌿" },
    ]),
  // CHAT-CP2 — AI copilot (operator-side suggested replies).
  // Provider is derived from the model id (Claude / GPT / Gemini), so the
  // matching API key (ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY) must
  // be set for the chosen model. See providerForModel() in lib/chat/ai.ts.
  aiCopilotEnabled: bool(false),
  aiModel: z
    .enum([
      // Anthropic
      "claude-opus-4-8",
      "claude-sonnet-4-6",
      "claude-haiku-4-5-20251001",
      // keep old haiku ID for backward compat
      "claude-haiku-4-5",
      // OpenAI
      "gpt-4o",
      "gpt-4o-mini",
      "o3",
      "o4-mini",
      // Google
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      // keep old gemini for backward compat
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ])
    .default("gpt-4o"),
  aiContext: text(""),

  // AI-CP-B — customer-facing AI chatbot (distinct from the operator copilot
  // above). Powered by the central AI service (OpenAI Responses API). When no
  // OPENAI_API_KEY is set, the chatbot serves a graceful AI_UNAVAILABLE message
  // and offers human handoff — the human live-chat keeps working regardless.
  aiChatbotEnabled: bool(false),
  aiChatbotPersona: z.enum(["support", "shopping", "recipe"]).default("support"),
  aiChatbotWelcome: text(
    "سلام! من دستیار هوشمند دشت‌زاد هستم؛ درباره‌ی محصولات، سفارش‌ها یا دستور پخت‌ها بپرسید.",
  ),
  aiHandoffEnabled: bool(true),
  aiUnavailableMessage: text(
    "دستیار هوشمند همین حالا در دسترس نیست؛ می‌توانم گفت‌وگو را به پشتیبانیِ انسانی منتقل کنم.",
  ),
  aiRateLimitPerMinute: num(20, 1, 120),
  aiToolsProduct: bool(true),
  aiToolsOrder: bool(true),
  aiToolsKnowledge: bool(true),
  aiToolsCustomer: bool(true),
  aiToolsSupport: bool(true),
});
export type ChatSettings = z.infer<typeof chatSettingsSchema>;

export const PRE_CHAT_OPTIONS = [
  { value: "off", label: "غیرفعال" },
  { value: "optional", label: "اختیاری" },
  { value: "required", label: "اجباری (نام و شماره الزامی)" },
];

export const AI_MODEL_OPTIONS = [
  // Anthropic
  { value: "claude-opus-4-8", label: "Claude Opus 4.8 — دقیق‌ترین (Anthropic)", group: "anthropic" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — متعادل (Anthropic)", group: "anthropic" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — سریع‌ترین (Anthropic)", group: "anthropic" },
  // OpenAI
  { value: "gpt-4o", label: "GPT-4o — دقیق (OpenAI)", group: "openai" },
  { value: "gpt-4o-mini", label: "GPT-4o mini — سریع و اقتصادی (OpenAI)", group: "openai" },
  { value: "o3", label: "o3 — استدلال پیشرفته (OpenAI)", group: "openai" },
  { value: "o4-mini", label: "o4-mini — استدلال سریع (OpenAI)", group: "openai" },
  // Google
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro — دقیق‌ترین (Google)", group: "google" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash — سریع (Google)", group: "google" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash — اقتصادی (Google)", group: "google" },
];

export const AI_CHATBOT_PERSONA_OPTIONS = [
  { value: "support", label: "پشتیبانی عمومی" },
  { value: "shopping", label: "مشاور خرید" },
  { value: "recipe", label: "دستیار آشپزی" },
];

// ============================================================
// faqPage — متن‌های ثابتِ صفحهٔ پرسش‌های متداول (هیرو + بخشِ تماس)
// گروه‌ها و سوال‌ها از مدلِ FAQGroup/FAQItem می‌آیند؛ این فقط chrome صفحه است.
// ============================================================

export const faqPageSchema = z.object({
  heroKicker: text("همراه شما، پیش و پس از خرید"),
  heroUpdated: text("آخرین به‌روزرسانی: ۱۲ خرداد ۱۴۰۵"),
  heroTitle: text("پرسش‌های متداول"),
  heroSub: text(
    "از اصالت و نگهداری محصول تا ارسال، پرداخت و بازگشت کالا؛ پاسخِ روشن و بی‌حاشیه‌ی پرتکرارترین پرسش‌ها این‌جاست. اگر باز هم سوالی ماند، تیم پشتیبانی دشت‌زاد با دل‌گرمی کنار شماست.",
  ),
  searchPlaceholder: text("سوالتان را بنویسید… مثلاً «ارسال» یا «مرجوعی»"),
  contactKicker: text("هنوز جواب نگرفتید؟"),
  contactTitle: text("تیم پشتیبانی دشت‌زاد کنار شماست"),
  contactSub: text(
    "هر روز از ساعت ۹ تا ۲۱، از طریق راه‌های زیر پاسخگوی پرسش‌ها و سفارش‌های شما هستیم. هرچه باشد، تنهایتان نمی‌گذاریم.",
  ),
});
export type FaqPage = z.infer<typeof faqPageSchema>;

// ============================================================
// contactPage — متن‌های ثابتِ صفحهٔ تماس با ما (هیرو، فرم، CTAها)
// شماره/ایمیل/آدرس/شبکه‌ها از contactInfo/businessInfo/socialLinks می‌آیند.
// ============================================================

export const contactPageSchema = z.object({
  heroKicker: text("همیشه کنار شما"),
  heroTitle: text("تماس با دشت‌زاد"),
  heroSub: text(
    "برای پیگیری سفارش، مشاوره خرید، خرید عمده یا همکاری با دشت‌زاد، از راه‌های زیر با ما در ارتباط باشید.",
  ),
  formTitle: text("فرم تماس با ما"),
  formSub: text("فرم زیر را کامل کنید — پاسخ در سریع‌ترین زمان ممکن."),
  formNote: text("اطلاعات شما نزد ما محفوظ است و تنها برای پاسخ‌گویی استفاده می‌شود."),
  websiteLabel: text("dashtzad.com"),
  websiteUrl: url().default("https://dashtzad.com"),
  cta1Title: text("پیگیری سریع سفارش"),
  cta1Desc: text("وضعیت سفارش خود را با شماره سفارش یا موبایل دنبال کنید."),
  cta1Href: url().default("/orders/track"),
  cta2Title: text("خرید عمده و همکاری"),
  cta2Desc: text("قیمت ویژه، فاکتور رسمی و هدایای سازمانی برای کسب‌وکارها."),
  cta2Href: url().default("/contact?type=bulk"),
});
export type ContactPage = z.infer<typeof contactPageSchema>;

// ============================================================
// Registry — key → config (single source of truth)
// ============================================================

export const GLOBAL_CONFIGS: Record<string, GlobalConfig> = {
  siteSettings: {
    key: "siteSettings",
    label: "تنظیمات سایت",
    description: "نام سایت، واحد پول، نوار اعلان و حالت تعمیر.",
    route: "/admin/globals/site",
    schema: siteSettingsSchema,
    defaults: siteSettingsSchema.parse({}),
    revalidate: ["/", "/products", "/blog"],
    sections: [
      { key: "identity", title: "هویت سایت" },
      { key: "behavior", title: "رفتار فروشگاه" },
      { key: "announcement", title: "نوار اعلان" },
      { key: "maintenance", title: "حالت تعمیر" },
    ],
    fields: [
      { name: "siteName", label: "نام سایت", type: "text", section: "identity" },
      { name: "siteShortName", label: "نام کوتاه", type: "text", section: "identity" },
      { name: "tagline", label: "شعار/توضیح کوتاه", type: "text", section: "identity" },
      { name: "siteUrl", label: "نشانی سایت", type: "url", dir: "ltr", section: "identity", placeholder: "https://dashtzad.com" },
      { name: "defaultLanguage", label: "زبان پیش‌فرض", type: "text", section: "identity", locked: true, hint: "ثابت: فارسی (fa)." },
      { name: "currency", label: "واحد پول", type: "text", section: "identity", locked: true, hint: "ثابت: تومان." },
      { name: "defaultProductSort", label: "مرتب‌سازی پیش‌فرض محصولات", type: "select", section: "behavior", options: PRODUCT_SORT_OPTIONS },
      { name: "productsPerPage", label: "تعداد محصول در هر صفحه", type: "number", dir: "ltr", section: "behavior" },
      { name: "supportHoursShortText", label: "ساعات پشتیبانی (کوتاه)", type: "text", section: "behavior", placeholder: "شنبه تا پنجشنبه، ۹ تا ۱۷" },
      { name: "announcementActive", label: "نمایش نوار اعلان", type: "checkbox", section: "announcement" },
      { name: "announcementText", label: "متن اعلان", type: "text", section: "announcement" },
      { name: "announcementHref", label: "لینک اعلان", type: "url", dir: "ltr", section: "announcement" },
      { name: "maintenanceMode", label: "فعال‌سازی حالت تعمیر", type: "checkbox", section: "maintenance", hint: "فعلاً فقط ذخیره می‌شود (اعمال در فرانت‌اند بعدی)." },
      { name: "maintenanceMessage", label: "پیام حالت تعمیر", type: "textarea", rows: 2, section: "maintenance" },
    ],
  },
  businessInfo: {
    key: "businessInfo",
    label: "اطلاعات کسب‌وکار",
    description: "مشخصات حقوقی، نشانی و معرفی برند.",
    route: "/admin/globals/business",
    schema: businessInfoSchema,
    defaults: businessInfoSchema.parse({}),
    revalidate: ["/", "/about", "/contact"],
    sections: [
      { key: "identity", title: "هویت برند" },
      { key: "legal", title: "اطلاعات حقوقی", description: "اختیاری — در صورت ثبت رسمی." },
      { key: "address", title: "نشانی" },
      { key: "about", title: "معرفی" },
    ],
    fields: [
      { name: "brandName", label: "نام برند", type: "text", section: "identity" },
      { name: "foundedYear", label: "سال تأسیس", type: "text", section: "identity", hint: "۱۳۱۳" },
      { name: "legalName", label: "نام حقوقی", type: "text", section: "legal" },
      { name: "registrationNumber", label: "شماره ثبت", type: "text", dir: "ltr", section: "legal" },
      { name: "nationalId", label: "شناسه ملی", type: "text", dir: "ltr", section: "legal" },
      { name: "economicCode", label: "کد اقتصادی", type: "text", dir: "ltr", section: "legal" },
      { name: "province", label: "استان", type: "text", section: "address" },
      { name: "city", label: "شهر", type: "text", section: "address" },
      { name: "address", label: "نشانی کامل", type: "textarea", rows: 2, section: "address" },
      { name: "postalCode", label: "کد پستی", type: "text", dir: "ltr", section: "address" },
      { name: "mapUrl", label: "لینک نقشه", type: "url", dir: "ltr", section: "address" },
      { name: "businessDescription", label: "توضیح کسب‌وکار", type: "textarea", rows: 3, section: "about" },
      { name: "aboutShortText", label: "متن کوتاه «درباره ما»", type: "textarea", rows: 3, section: "about" },
    ],
  },
  contactInfo: {
    key: "contactInfo",
    label: "اطلاعات تماس",
    description: "تلفن‌ها، ایمیل‌ها و ساعات پاسخ‌گویی.",
    route: "/admin/globals/contact",
    schema: contactInfoSchema,
    defaults: contactInfoSchema.parse({}),
    revalidate: ["/", "/contact"],
    sections: [
      { key: "phones", title: "تلفن‌ها و پیام‌رسان" },
      { key: "emails", title: "ایمیل‌ها" },
      { key: "extra", title: "نشانی و پاسخ‌گویی" },
      { key: "display", title: "نمایش" },
    ],
    fields: [
      { name: "primaryPhone", label: "تلفن اصلی", type: "text", dir: "ltr", section: "phones" },
      { name: "supportPhone", label: "تلفن پشتیبانی", type: "text", dir: "ltr", section: "phones" },
      { name: "salesPhone", label: "تلفن فروش", type: "text", dir: "ltr", section: "phones" },
      { name: "whatsapp", label: "واتساپ", type: "text", dir: "ltr", section: "phones" },
      { name: "email", label: "ایمیل", type: "text", dir: "ltr", section: "emails" },
      { name: "supportEmail", label: "ایمیل پشتیبانی", type: "text", dir: "ltr", section: "emails" },
      { name: "salesEmail", label: "ایمیل فروش", type: "text", dir: "ltr", section: "emails" },
      { name: "addressText", label: "نشانی نمایشی", type: "textarea", rows: 2, section: "extra" },
      { name: "workingHours", label: "ساعات کاری", type: "text", section: "extra" },
      { name: "responseTimeText", label: "زمان پاسخ‌گویی", type: "text", section: "extra" },
      { name: "contactPageIntro", label: "متن معرفی صفحه‌ی تماس", type: "textarea", rows: 3, section: "extra" },
      { name: "showContactInHeader", label: "نمایش تماس در هدر", type: "checkbox", section: "display" },
      { name: "showContactInFooter", label: "نمایش تماس در فوتر", type: "checkbox", section: "display" },
    ],
  },
  brandSettings: {
    key: "brandSettings",
    label: "تنظیمات برند",
    description: "لوگوها، رنگ‌ها و متن‌های برند.",
    route: "/admin/globals/brand",
    schema: brandSettingsSchema,
    defaults: brandSettingsSchema.parse({}),
    revalidate: ["/"],
    sections: [
      { key: "logos", title: "لوگوها و آیکن‌ها", description: "فعلاً فقط نشانی (URL). کتابخانه‌ی رسانه بعداً اضافه می‌شود." },
      { key: "colors", title: "رنگ‌ها", description: "پایه‌ی برند: سبز زیتونی dz." },
      { key: "texts", title: "متن‌های برند" },
    ],
    fields: [
      { name: "logoUrl", label: "لوگوی اصلی", type: "image", dir: "ltr", section: "logos" },
      { name: "logoLightUrl", label: "لوگوی روشن", type: "image", dir: "ltr", section: "logos" },
      { name: "logoDarkUrl", label: "لوگوی تیره", type: "image", dir: "ltr", section: "logos" },
      { name: "iconUrl", label: "آیکن", type: "image", dir: "ltr", section: "logos" },
      { name: "faviconUrl", label: "فاوآیکن", type: "image", dir: "ltr", section: "logos" },
      { name: "ogImageUrl", label: "تصویر OG", type: "image", dir: "ltr", section: "logos" },
      { name: "primaryColor", label: "رنگ اصلی", type: "color", section: "colors", hint: "پیشنهاد: #4a6340" },
      { name: "secondaryColor", label: "رنگ ثانویه", type: "color", section: "colors" },
      { name: "brandSlogan", label: "شعار برند", type: "text", section: "texts" },
      { name: "brandStampText", label: "متن مُهر قدمت", type: "text", section: "texts", hint: "۱۳۱۳" },
      { name: "footerBrandText", label: "متن برند در فوتر", type: "textarea", rows: 2, section: "texts" },
      { name: "packageTagline", label: "شعار بسته‌بندی", type: "text", section: "texts" },
      { name: "trustStatement", label: "بیانیه‌ی اعتماد", type: "textarea", rows: 2, section: "texts" },
    ],
  },
  header: {
    key: "header",
    label: "هدر",
    description: "منوها، دکمه‌ها و رفتار هدر سایت.",
    route: "/admin/globals/header",
    schema: headerSchema,
    defaults: headerSchema.parse({}),
    revalidate: ["/"],
    sections: [
      { key: "menus", title: "منوها" },
      { key: "elements", title: "عناصر هدر" },
      { key: "cta", title: "دکمه و تماس" },
    ],
    fields: [
      { name: "logoVariant", label: "حالت لوگو", type: "select", section: "menus", options: LOGO_VARIANT_OPTIONS },
      { name: "mainMenuId", label: "منوی اصلی (فروشگاه)", type: "menu", section: "menus" },
      { name: "secondaryMenuId", label: "منوی فرعی (مجله/بلاگ)", type: "menu", section: "menus" },
      { name: "megaMenuId", label: "منوی مگامنو (دسته‌بندی‌ها)", type: "menu", section: "menus", hint: "موارد سطح‌اول = دسته‌ها؛ زیرموارد = زیردسته‌ها." },
      { name: "megaTriggerLabel", label: "برچسب دکمه‌ی مگامنو", type: "text", section: "menus" },
      { name: "bottomNavMenuId", label: "منوی ناوبری پایین موبایل", type: "menu", section: "menus", hint: "اختیاری؛ خالی بماند تا تب‌های پیش‌فرض نمایش داده شوند." },
      { name: "mobileMenuStyle", label: "حالت منوی موبایل", type: "select", section: "menus", options: MOBILE_MENU_STYLE_OPTIONS },
      { name: "showSearch", label: "نمایش جستجو", type: "checkbox", section: "elements" },
      { name: "showCart", label: "نمایش سبد خرید", type: "checkbox", section: "elements" },
      { name: "showAccount", label: "نمایش حساب کاربری", type: "checkbox", section: "elements" },
      { name: "showMegaMenu", label: "نمایش مگامنو", type: "checkbox", section: "elements" },
      { name: "showBottomNav", label: "نمایش ناوبری پایین موبایل", type: "checkbox", section: "elements" },
      { name: "showAnnouncement", label: "نمایش نوار اعلان", type: "checkbox", section: "elements" },
      { name: "stickyHeader", label: "هدر چسبان", type: "checkbox", section: "elements" },
      { name: "ctaLabel", label: "متن دکمه‌ی اقدام", type: "text", section: "cta" },
      { name: "ctaHref", label: "لینک دکمه‌ی اقدام", type: "url", dir: "ltr", section: "cta" },
      { name: "phoneLabel", label: "متن تلفن", type: "text", section: "cta" },
      { name: "phoneHref", label: "لینک تلفن", type: "text", dir: "ltr", section: "cta", placeholder: "tel:+98..." },
    ],
  },
  footer: {
    key: "footer",
    label: "فوتر",
    description: "منوها، نمادها و متن‌های فوتر.",
    route: "/admin/globals/footer",
    schema: footerSchema,
    defaults: footerSchema.parse({}),
    revalidate: ["/"],
    sections: [
      { key: "menus", title: "منوها" },
      { key: "display", title: "بخش‌های نمایشی" },
      { key: "newsletter", title: "خبرنامه" },
      { key: "trust", title: "نشان‌های اعتماد" },
      { key: "legal", title: "نمادها و کپی‌رایت" },
    ],
    fields: [
      { name: "footerMenuPrimaryId", label: "ستون اول فوتر", type: "menu", section: "menus" },
      { name: "footerMenuSecondaryId", label: "ستون دوم فوتر", type: "menu", section: "menus" },
      { name: "footerMenuTertiaryId", label: "ستون سوم فوتر", type: "menu", section: "menus" },
      { name: "footerMenuQuaternaryId", label: "ستون چهارم فوتر", type: "menu", section: "menus" },
      { name: "showBusinessInfo", label: "نمایش اطلاعات کسب‌وکار", type: "checkbox", section: "display" },
      { name: "showContactInfo", label: "نمایش اطلاعات تماس", type: "checkbox", section: "display" },
      { name: "showSocialLinks", label: "نمایش شبکه‌های اجتماعی", type: "checkbox", section: "display" },
      { name: "newsletterTitle", label: "عنوان خبرنامه", type: "text", section: "newsletter" },
      { name: "newsletterDescription", label: "توضیح خبرنامه", type: "textarea", rows: 2, section: "newsletter" },
      {
        name: "trustBadges",
        label: "نشان‌های اعتماد",
        type: "objectList",
        itemLabel: "افزودن نشان",
        section: "trust",
        itemFields: [
          { name: "icon", label: "آیکن", type: "icon", section: "x" },
          { name: "title", label: "عنوان", type: "text", section: "x" },
          { name: "description", label: "توضیح", type: "text", section: "x" },
        ],
      },
      { name: "copyrightText", label: "متن کپی‌رایت", type: "text", section: "legal" },
      { name: "bottomNote", label: "یادداشت پایین", type: "text", section: "legal" },
      { name: "enamadHtml", label: "کد نماد اعتماد (eNamad)", type: "textarea", rows: 2, dir: "ltr", section: "legal", hint: "فعلاً به‌صورت متن ذخیره می‌شود." },
      { name: "samandehiHtml", label: "کد ساماندهی", type: "textarea", rows: 2, dir: "ltr", section: "legal" },
    ],
  },
  homepage: {
    key: "homepage",
    label: "صفحه خانه",
    description: "بلوک‌های صفحه‌ی اصلی را بسازید و مرتب کنید.",
    route: "/admin/globals/homepage",
    schema: homepageSchema,
    defaults: homepageSchema.parse({}),
    revalidate: ["/"],
    sections: [],
    fields: [],
    custom: "homepage",
  },
  socialLinks: {
    key: "socialLinks",
    label: "شبکه‌های اجتماعی",
    description: "لینک‌های شبکه‌های اجتماعی برند.",
    route: "/admin/globals/social",
    schema: socialLinksSchema,
    defaults: socialLinksSchema.parse({}),
    revalidate: ["/"],
    sections: [{ key: "links", title: "لینک‌ها" }],
    fields: [
      {
        name: "links",
        label: "شبکه‌های اجتماعی",
        type: "objectList",
        itemLabel: "افزودن شبکه",
        section: "links",
        itemFields: [
          { name: "platform", label: "پلتفرم", type: "select", section: "x", options: SOCIAL_PLATFORM_OPTIONS },
          { name: "label", label: "برچسب", type: "text", section: "x" },
          { name: "url", label: "نشانی", type: "url", dir: "ltr", section: "x" },
          { name: "icon", label: "آیکن", type: "icon", section: "x" },
          { name: "sortOrder", label: "ترتیب", type: "number", dir: "ltr", section: "x" },
          { name: "isActive", label: "فعال", type: "checkbox", section: "x" },
        ],
      },
    ],
  },
  seoDefaults: {
    key: "seoDefaults",
    label: "پیش‌فرض‌های سئو",
    description: "عنوان، توضیحات و الگوهای پیش‌فرض متادیتا.",
    route: "/admin/globals/seo",
    schema: seoDefaultsSchema,
    defaults: seoDefaultsSchema.parse({}),
    revalidate: ["/"],
    sections: [
      { key: "defaults", title: "پیش‌فرض‌ها" },
      { key: "social", title: "اشتراک‌گذاری" },
      { key: "robots", title: "ربات‌ها و کانونیکال" },
      { key: "org", title: "سازمان (Organization)" },
      { key: "templates", title: "الگوهای عنوان" },
    ],
    fields: [
      { name: "defaultTitle", label: "عنوان پیش‌فرض", type: "text", section: "defaults" },
      { name: "titleTemplate", label: "الگوی عنوان", type: "text", dir: "ltr", section: "defaults", hint: "از %s برای عنوان صفحه استفاده کنید." },
      { name: "defaultDescription", label: "توضیح پیش‌فرض", type: "textarea", rows: 3, section: "defaults" },
      { name: "defaultOgImageUrl", label: "تصویر OG پیش‌فرض", type: "image", dir: "ltr", section: "social" },
      { name: "twitterCard", label: "نوع کارت توییتر", type: "select", section: "social", options: TWITTER_CARD_OPTIONS },
      { name: "canonicalBase", label: "پایه‌ی Canonical", type: "url", dir: "ltr", section: "robots", placeholder: "https://dashtzad.com" },
      { name: "robotsIndexDefault", label: "ایندکس پیش‌فرض (index)", type: "checkbox", section: "robots" },
      { name: "robotsFollowDefault", label: "دنبال‌کردن پیش‌فرض (follow)", type: "checkbox", section: "robots" },
      { name: "organizationName", label: "نام سازمان", type: "text", section: "org" },
      { name: "organizationLogoUrl", label: "لوگوی سازمان", type: "image", dir: "ltr", section: "org" },
      { name: "organizationSameAs", label: "پروفایل‌های رسمی (sameAs)", type: "stringList", dir: "ltr", section: "org" },
      { name: "productTitleTemplate", label: "الگوی عنوان محصول", type: "text", dir: "ltr", section: "templates" },
      { name: "categoryTitleTemplate", label: "الگوی عنوان دسته", type: "text", dir: "ltr", section: "templates" },
      { name: "postTitleTemplate", label: "الگوی عنوان نوشته", type: "text", dir: "ltr", section: "templates" },
      { name: "recipeTitleTemplate", label: "الگوی عنوان دستور پخت", type: "text", dir: "ltr", section: "templates" },
    ],
  },
  chatSettings: {
    key: "chatSettings",
    label: "تنظیمات چت و پشتیبانی",
    description: "ورودی‌های چت، نام‌ها، پیام خوش‌آمد، گزینه‌های سریع و وضعیت پاسخ‌گویی.",
    route: "/admin/chat/settings",
    schema: chatSettingsSchema,
    defaults: chatSettingsSchema.parse({}),
    revalidate: ["/"],
    sections: [
      { key: "surfaces", title: "نمایش و ورودی‌ها", description: "کنترل اینکه چت کجا به مشتری و اپراتور نشان داده شود." },
      { key: "identity", title: "هویت گفت‌وگو" },
      { key: "welcome", title: "خوش‌آمد و کادر پیام" },
      { key: "availability", title: "وضعیت پاسخ‌گویی" },
      { key: "quick", title: "گزینه‌های سریع", description: "دکمه‌های آماده‌ای که بالای پنجره‌ی چت نمایش داده می‌شوند." },
      { key: "fallback", title: "راه‌های ارتباطی جایگزین", description: "اگر گفت‌وگو در دسترس نبود، مشتری به این‌ها هدایت می‌شود." },
      { key: "selfservice", title: "سلف‌سرویس و پیام پراکتیو", description: "سوالات متداول داخل ویجت، پیام خودکار و فرم پیش‌از‌چت." },
      { key: "canned", title: "پیام‌های آماده‌ی اپراتور", description: "پاسخ‌های آماده‌ای که اپراتور با یک کلیک در کادر پاسخ درج می‌کند." },
      { key: "ai", title: "دستیار هوش مصنوعی (اپراتور)", description: "پیشنهاد پاسخ برای اپراتور با Claude، GPT یا Gemini. برای هر مدل باید کلید همان سرویس تنظیم شده باشد: ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY." },
      { key: "aichatbot", title: "چت‌بات هوش مصنوعی (مشتری)", description: "دستیار هوشمندِ پاسخ‌گو به مشتری روی OpenAI Responses API. بدون OPENAI_API_KEY به‌صورت ایمن غیرفعال می‌ماند و گفت‌وگو به پشتیبانی انسانی منتقل می‌شود." },
    ],
    fields: [
      { name: "enabled", label: "فعال‌بودن چت", type: "checkbox", section: "surfaces", hint: "کلید اصلی؛ خاموش شود همه‌ی ورودی‌های چت پنهان می‌شوند." },
      { name: "showStorefrontMobileNav", label: "نمایش در ناوبری پایین موبایل (فروشگاه)", type: "checkbox", section: "surfaces" },
      { name: "showStorefrontDesktopLauncher", label: "نمایش لانچر شناور دسکتاپ (فروشگاه)", type: "checkbox", section: "surfaces" },
      { name: "showAdminLauncher", label: "نمایش لانچر شناور در پنل مدیریت", type: "checkbox", section: "surfaces" },
      { name: "mobileCtaLabel", label: "برچسب دکمه‌ی موبایل", type: "text", section: "surfaces" },
      { name: "desktopCtaLabel", label: "برچسب لانچر دسکتاپ", type: "text", section: "surfaces" },
      { name: "botName", label: "نام دستیار", type: "text", section: "identity" },
      { name: "operatorName", label: "نام پشتیبان/اپراتور", type: "text", section: "identity" },
      { name: "welcomeTitle", label: "عنوان خوش‌آمد", type: "text", section: "welcome" },
      { name: "welcomeBody", label: "متن خوش‌آمد", type: "textarea", rows: 3, section: "welcome" },
      { name: "composerPlaceholder", label: "متن پیش‌فرض کادر پیام", type: "text", section: "welcome" },
      { name: "responseTimeLabel", label: "برچسب زمان پاسخ", type: "text", section: "welcome" },
      { name: "operatorsOnline", label: "پشتیبانی آنلاین است", type: "checkbox", section: "availability", hint: "خاموش شود، حالت آفلاین به مشتری نمایش داده می‌شود." },
      { name: "workingHoursLabel", label: "برچسب ساعات کاری", type: "text", section: "availability" },
      { name: "offlineTitle", label: "عنوان حالت آفلاین", type: "text", section: "availability" },
      { name: "offlineBody", label: "متن حالت آفلاین", type: "textarea", rows: 2, section: "availability" },
      {
        name: "quickActions",
        label: "گزینه‌های سریع",
        type: "objectList",
        itemLabel: "افزودن گزینه",
        section: "quick",
        itemFields: [
          { name: "label", label: "متن", type: "text", section: "x" },
          { name: "icon", label: "آیکن", type: "icon", section: "x" },
        ],
      },
      {
        name: "fallbackLinks",
        label: "راه‌های ارتباطی",
        type: "objectList",
        itemLabel: "افزودن راه ارتباطی",
        section: "fallback",
        itemFields: [
          { name: "label", label: "متن", type: "text", section: "x" },
          { name: "href", label: "نشانی یا شماره", type: "text", dir: "ltr", section: "x" },
          { name: "icon", label: "آیکن", type: "icon", section: "x" },
        ],
      },
      { name: "faqGroupId", label: "گروه سوالات متداول داخل ویجت", type: "faqGroup", section: "selfservice", hint: "خالی بماند تا نمایش داده نشود." },
      { name: "preChatMode", label: "فرم پیش‌از‌چت (مهمان)", type: "select", section: "selfservice", options: PRE_CHAT_OPTIONS },
      { name: "proactiveEnabled", label: "نمایش پیام خودکار پراکتیو", type: "checkbox", section: "selfservice" },
      { name: "proactiveDelaySeconds", label: "تأخیر پیام خودکار (ثانیه)", type: "number", dir: "ltr", section: "selfservice" },
      { name: "proactiveMessage", label: "متن پیام خودکار", type: "text", section: "selfservice" },
      { name: "soundEnabled", label: "اعلان صوتی پیام جدید", type: "checkbox", section: "selfservice" },
      {
        name: "cannedReplies",
        label: "پیام‌های آماده",
        type: "objectList",
        itemLabel: "افزودن پیام آماده",
        section: "canned",
        itemFields: [
          { name: "title", label: "عنوان", type: "text", section: "x" },
          { name: "shortcut", label: "میان‌بر", type: "text", dir: "ltr", section: "x", placeholder: "/hi" },
          { name: "body", label: "متن پاسخ", type: "textarea", rows: 3, section: "x" },
        ],
      },
      { name: "aiCopilotEnabled", label: "فعال‌سازی پاسخ پیشنهادی هوش مصنوعی", type: "checkbox", section: "ai", hint: "بدون کلید سرویسِ مدلِ انتخاب‌شده غیرفعال می‌ماند." },
      { name: "aiModel", label: "مدل هوش مصنوعی", type: "select", section: "ai", options: AI_MODEL_OPTIONS, hint: "سرویس به‌صورت خودکار از روی مدل تشخیص داده می‌شود (Claude / GPT / Gemini)." },
      { name: "aiContext", label: "زمینه/لحن برند برای دستیار", type: "textarea", rows: 4, section: "ai", hint: "اطلاعات یا لحنی که می‌خواهید دستیار در پاسخ‌ها رعایت کند." },
      { name: "aiChatbotEnabled", label: "فعال‌سازی چت‌بات هوش مصنوعیِ مشتری", type: "checkbox", section: "aichatbot", hint: "بدون OPENAI_API_KEY روی سرور، چت‌بات ایمن غیرفعال می‌ماند." },
      { name: "aiChatbotPersona", label: "نقشِ دستیار", type: "select", section: "aichatbot", options: AI_CHATBOT_PERSONA_OPTIONS },
      { name: "aiChatbotWelcome", label: "پیام خوش‌آمد چت‌بات", type: "textarea", rows: 2, section: "aichatbot" },
      { name: "aiHandoffEnabled", label: "اجازه‌ی انتقال به پشتیبان انسانی", type: "checkbox", section: "aichatbot" },
      { name: "aiUnavailableMessage", label: "پیام حالت «در دسترس نبودن هوش مصنوعی»", type: "textarea", rows: 2, section: "aichatbot" },
      { name: "aiRateLimitPerMinute", label: "سقف پیام در دقیقه (هر کاربر)", type: "number", dir: "ltr", section: "aichatbot" },
      { name: "aiToolsProduct", label: "ابزارهای محصول", type: "checkbox", section: "aichatbot" },
      { name: "aiToolsOrder", label: "ابزارهای سفارش", type: "checkbox", section: "aichatbot" },
      { name: "aiToolsKnowledge", label: "ابزارهای دانش (سوالات متداول/قوانین/مقالات/دستور پخت)", type: "checkbox", section: "aichatbot" },
      { name: "aiToolsCustomer", label: "ابزارهای حساب مشتری", type: "checkbox", section: "aichatbot" },
      { name: "aiToolsSupport", label: "ابزارهای پشتیبانی و انتقال", type: "checkbox", section: "aichatbot" },
    ],
  },
};

// ============================================================
// 11) termsContent — قوانین و مقررات (FRONT-FAQ-TERMS)
// Each field holds the inner HTML of one accordion section.
// ============================================================

export const termsContentSchema = z.object({
  general: text(
    `<p class="dz-legal-sec__intro">استفاده از وب‌سایتِ دشت‌زاد و خدماتِ آن، برای تمامِ افرادی که بر اساسِ قوانینِ جمهوری اسلامی ایران اهلیتِ قانونی دارند، به‌شرطِ رعایتِ این قوانین مجاز است. ورود به حسابِ کاربری یا ثبتِ هر سفارش، به‌منزلهٔ آگاهی و پذیرشِ کاملِ این مقررات و جایگزینِ توافق‌های پیشین است.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>کاربر:</strong> شخصی که با ثبتِ اطلاعاتِ خود در سایت ثبت‌نام و از خدمات استفاده می‌کند. حداقل سنِ قانونی برای خرید <strong>۱۸ سال</strong> یا تحتِ نظارتِ ولیّ/سرپرستِ قانونی است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>فروشنده:</strong> فروشگاه دشت‌زاد و هر شخصِ حقیقی یا حقوقی که کالای خود را در این سایت عرضه می‌کند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>خرید از دشت‌زاد بر مبنای <strong>قوانینِ تجارتِ الکترونیکی</strong> و با رعایتِ کاملِ قوانینِ جاریِ کشور انجام می‌شود.</span></li></ul>`,
  ),
  account: text(
    `<p class="dz-legal-sec__intro">برای استفاده از خدمات و ثبتِ سفارش، داشتنِ حسابِ کاربری لازم است. ثبت‌نام با شمارهٔ موبایل و کدِ فعال‌سازیِ پیامکی انجام می‌شود.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کاربر می‌پذیرد که اطلاعات را <strong>صحیح، کامل و به‌روز</strong> وارد کند و تنها با شماره و ایمیلِ متعلق به خود ثبت‌نام نماید.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>مسئولیتِ حفظِ محرمانگیِ نام کاربری و رمزِ عبور با کاربر است؛ در صورتِ سرقت یا مفقودی، باید در سریع‌ترین زمانِ ممکن به دشت‌زاد اطلاع داده شود.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>حسابِ کاربری <strong>قائم به شخص و غیرقابل‌انتقال</strong> است و مسئولیتِ همهٔ فعالیت‌های انجام‌شده از طریقِ آن، بر عهدهٔ دارندهٔ حساب است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کاربرِ حقوقی باید نمایندهٔ حقیقی و اطلاعاتِ حقوقی (نامِ شرکت، شناسهٔ ملی و کدِ اقتصادی) را معرفی کند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در صورتِ ارائهٔ اطلاعاتِ نادرست، دشت‌زاد می‌تواند حسابِ کاربری را مسدود یا از ارائهٔ خدمات خودداری کند.</span></li></ul>`,
  ),
  buy: text(
    `<p class="dz-legal-sec__intro">ثبتِ سفارش در دشت‌زاد به‌منزلهٔ انعقادِ قراردادِ الکترونیکی است. لطفاً پیش از نهایی‌کردنِ خرید به نکاتِ زیر توجه کنید:</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تمامِ قیمت‌ها به <strong>تومان</strong> و شاملِ مالیات بر ارزشِ افزوده است. قیمت‌ها ممکن است بدونِ اطلاعِ قبلی تغییر کند، اما سفارشِ ثبت‌شده با <strong>قیمتِ همان لحظه</strong> نهایی می‌شود.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>موجودیِ کالاها لحظه‌ای است و افزودن به سبدِ خرید به‌معنای رزروِ قطعی نیست. اگر کالایی پس از پرداخت ناموجود شود، دشت‌زاد حقِ <strong>لغو و استردادِ وجه</strong> (حداکثر ظرف ۷۲ ساعتِ کاری) یا پیشنهادِ جایگزین را دارد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در صورتِ بروزِ <strong>خطای آشکار در قیمت</strong>، دشت‌زاد حقِ بررسی، اصلاح یا ابطالِ سفارش و بازگرداندنِ وجهِ دریافتی را دارد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>روزِ کاری به‌معنای شنبه تا پنج‌شنبه به‌جز تعطیلاتِ رسمی است. امکانِ ثبتِ سفارش به‌صورتِ <strong>۲۴ ساعته و ۷ روزِ هفته</strong> فراهم است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تحویل در اماکنِ عمومی (کافه، رستوران، هتل و مانندِ آن) ممکن نیست؛ آدرس باید دقیق و قابلِ استناد باشد.</span></li></ul>`,
  ),
  pay: text(
    `<p class="dz-legal-sec__intro">انجامِ تسویه‌حساب برای ثبتِ نهاییِ سفارش الزامی است. در پایانِ مراحلِ ثبتِ سفارش، درگاهِ پرداختِ اینترنتیِ امن باز می‌شود.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>پرداخت از طریقِ <strong>درگاهِ بانکیِ موردِ تأییدِ شاپرک</strong> انجام می‌شود و مسئولیتِ ورودِ اطلاعاتِ بانکی در صفحهٔ بانک با کاربر است؛ این اطلاعات نزدِ دشت‌زاد ذخیره نمی‌شود.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در صورتِ بروزِ اختلال در پرداختِ اینترنتی، با هماهنگیِ پشتیبانی امکانِ پرداختِ <strong>کارت‌به‌کارت</strong> و سپس ثبتِ نهایی وجود دارد. کارت‌به‌کارت تنها در صورتِ اعلامِ رسمیِ دشت‌زاد معتبر است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>سفارش تنها <strong>پس از تأییدِ پرداخت</strong> واردِ مرحلهٔ پردازش می‌شود و سفارش‌های پرداخت‌نشده پس از مدتِ مشخصی لغو می‌شوند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>سبدِ خریدِ بالای <strong>۳ میلیون تومان</strong> امکانِ پرداخت در محل ندارد و باید پیش از ارسال به‌صورتِ اینترنتی تسویه شود.</span></li></ul>`,
  ),
  ship: text(
    `<p class="dz-legal-sec__intro">ارسالِ سفارش‌ها در محدودهٔ تهران از طریقِ پیک و در سایرِ شهرها به‌واسطهٔ پست انجام می‌شود. هر سفارش حداکثر ظرف ۲۴ ساعتِ کاری پردازش و تحویلِ پست/پیک می‌شود.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>هزینهٔ ارسال بر اساسِ <strong>وزن و مقصد</strong> محاسبه و در صفحهٔ پرداخت نمایش داده می‌شود؛ خریدهای بالای ۷۰۰٬۰۰۰ تومان از ارسالِ رایگان بهره‌مند می‌شوند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>پس از تحویلِ مرسوله به شرکتِ پست/پیک، کدِ رهگیری برای شما ارسال می‌شود. زمانِ رسیدنِ مرسوله تابعِ همان شرکت است. دشت‌زاد در قبالِ تأخیرهای خارج از کنترلِ خود (شرایطِ جوی، تعطیلات، اختلالِ پستی) مسئولیتی ندارد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>مکانِ تحویل، نشانیِ ثبت‌شده توسطِ کاربر است و پس از تحویل به پست/پیک، تغییرِ آن ممکن نیست.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کاربر موظف است هنگامِ تحویل و <strong>پیش از امضایِ رسید</strong>، سلامتِ بسته‌بندی و ظاهرِ کالا را بررسی کند؛ در صورتِ آسیبِ آشکار، از تحویل خودداری و بلافاصله موضوع را به دشت‌زاد اطلاع دهد. امضای رسید بدونِ بررسی، به‌منزلهٔ دریافتِ سالمِ کالاست.</span></li></ul><a class="dz-legal-link" href="/faq#g-ship"><i class="dz-icon ri-information-line"></i><span>جزئیاتِ زمان و هزینهٔ ارسال در پرسش‌های متداول</span></a>`,
  ),
  return: text(
    `<p class="dz-legal-sec__intro">رضایتِ شما برای ما در اولویت است. شرایطِ مرجوع‌کردن و استرداد به این شرح است:</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>پیش از ارسال:</strong> در صورتِ انصراف پس از تسویه و پیش از ارسال، کلِ وجهِ دریافتی حداکثر ظرف <strong>۷۲ ساعتِ کاری</strong> بازمی‌گردد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>پس از ارسال:</strong> کالای سالم تا <strong>۷ روز</strong> پس از دریافت و به‌شرطِ باز نشدنِ بسته‌بندی و نبودِ خسارت، قابلِ استرداد است؛ هزینهٔ بازگشتِ کالایِ سالم بر عهدهٔ خریدار است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>به دلیلِ مسائلِ بهداشتی، اقلامِ خوراکیِ <strong>باز یا مصرف‌شده</strong> قابلِ مرجوع‌کردن نیستند، مگر در صورتِ وجودِ ایرادِ کیفی یا مغایرت.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کالایِ مرجوعی باید همراهِ <strong>فاکتور</strong> و در بسته‌بندیِ اصلی و سالم بازگردانده شود. بازگشتِ وجه، پس از دریافت و بازبینیِ کالا و طیِ ۳ تا ۵ روزِ کاری انجام می‌شود.</span></li></ul><a class="dz-legal-link" href="/faq#g-return"><i class="dz-icon ri-shield-check-line"></i><span>ضمانتِ کیفیت و بازگشتِ کالای معیوب در پرسش‌های متداول</span></a>`,
  ),
  address: text(
    `<p class="dz-legal-sec__intro">درست‌بودنِ نشانی و شمارهٔ تماس، نقشِ کلیدی در رسیدنِ به‌موقعِ سفارش دارد و مسئولیتِ آن بر عهدهٔ خریدار است.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>آدرس را با ذکرِ <strong>کدِ پستی، واحد و نشانه‌های دقیق</strong> و یک شمارهٔ تماسِ همراهِ در دسترس وارد کنید.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>اگر مرسوله به‌دلیلِ <strong>آدرسِ ناقص یا اشتباه</strong>، عدم پاسخ‌گویی یا غیبتِ گیرنده به انبار بازگردد، ارسالِ مجدد با هزینهٔ خریدار انجام می‌شود.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تا پیش از مرحلهٔ ارسال، می‌توانید آدرس را از بخشِ «سفارش‌های من» ویرایش کنید یا با پشتیبانی تماس بگیرید.</span></li></ul>`,
  ),
  coupon: text(
    `<p class="dz-legal-sec__intro">کدهای تخفیف هدیه‌ای از سویِ دشت‌زاد هستند و استفاده از آن‌ها تابعِ شرایطِ زیر است:</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>هر کد ممکن است شرایطِ مخصوصِ خود را داشته باشد: <strong>حداقلِ مبلغِ خرید، تاریخِ انقضا، سقفِ تخفیف</strong> یا اختصاص به دسته‌ای خاص از محصولات.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>جز در مواردی که صراحتاً ذکر شود، کدها <strong>یک‌بار مصرف</strong> بوده و با یکدیگر یا با تخفیف‌های فعالِ سایت <strong>جمع‌پذیر نیستند</strong>.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کدِ تخفیف <strong>قابلِ تبدیل به وجهِ نقد</strong> نیست و معمولاً تنها روی مبلغِ کالاها (نه هزینهٔ ارسال) اعمال می‌شود.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>کد باید پیش از نهایی‌شدنِ پرداخت در صفحهٔ سبدِ خرید وارد شود؛ اعمالِ کد پس از ثبتِ سفارش ممکن نیست.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>دشت‌زاد حقِ ابطالِ کدها را در صورتِ مشاهدهٔ <strong>سوءاستفاده یا تخلف</strong> برای خود محفوظ می‌دارد.</span></li></ul>`,
  ),
  ip: text(
    `<p class="dz-legal-sec__intro">محتوای این سایت برای استفادهٔ شخصی و غیرتجاریِ کاربران عرضه شده است.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>مالکیتِ معنویِ اطلاعات، تصاویر و علائمِ تجاری موجود در سایت متعلق به <strong>دشت‌زاد</strong> است و هرگونه سوءاستفاده پیگردِ قانونی دارد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>استفادهٔ تجاری از محتوا، تصاویر و اطلاعاتِ سایت نیازمندِ <strong>اجازهٔ کتبی</strong> از دشت‌زاد است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>اطلاعاتِ محصولات از منابعِ معتبر یا تولیدکننده تهیه شده است. ممکن است در مواردی خطای جزئی داشته باشد؛ این اطلاعات را به‌طورِ مداوم بازبینی و به‌روز می‌کنیم.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>دشت‌زاد مسئولیتی در قبالِ اختلالاتِ خارج از حوزهٔ مدیریتِ خود (نقصِ اینترنت، مسائلِ مخابراتی یا سخت‌افزاری) ندارد.</span></li></ul>`,
  ),
  privacy: text(
    `<p class="dz-legal-sec__intro">حفظِ حریمِ خصوصی و امنیتِ اطلاعاتِ شما یکی از اصولِ بنیادینِ دشت‌زاد است. در این بخش به‌روشنی توضیح می‌دهیم که <strong>چه اطلاعاتی</strong>، <strong>چرا</strong> و <strong>چگونه</strong> گردآوری می‌شود و شما چه اختیاراتی نسبت به آن دارید.</p><h3 class="dz-legal-subh"><i class="dz-icon ri-folder-open-line"></i><span>چه اطلاعاتی جمع‌آوری می‌کنیم؟</span></h3><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>اطلاعاتِ هویتی و تماس:</strong> نام و نام خانوادگی، شمارهٔ موبایل و در صورتِ تمایل، ایمیلِ شما.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>اطلاعاتِ سفارش و تحویل:</strong> نشانیِ پستی، کدِ پستی و تاریخچهٔ سفارش‌ها برای پردازش و ارسال.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>اطلاعاتِ پرداخت:</strong> تنها وضعیت و مبلغِ تراکنش نزدِ ما ثبت می‌شود؛ شمارهٔ کارت و رمزِ بانکیِ شما <strong>هرگز</strong> ذخیره نمی‌گردد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>اطلاعاتِ فنی:</strong> نوعِ دستگاه، مرورگر و نشانیِ IP، صرفاً برای امنیت، رفعِ خطا و بهبودِ سایت.</span></li></ul><h3 class="dz-legal-subh"><i class="dz-icon ri-list-check"></i><span>از اطلاعاتِ شما چطور استفاده می‌کنیم؟</span></h3><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>پردازش، ارسال و پیگیریِ سفارش و اطلاع‌رسانیِ وضعیتِ آن از طریقِ پیامک.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>پشتیبانی، پاسخ به پرسش‌ها و رسیدگی به درخواست‌های مرجوعی.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>بهبودِ تجربهٔ خرید و (<strong>تنها با رضایتِ شما</strong>) ارسالِ پیشنهادها، تخفیف‌ها و خبرنامه.</span></li></ul><h3 class="dz-legal-subh"><i class="dz-icon ri-share-line"></i><span>اطلاعات با چه کسانی به اشتراک گذاشته می‌شود؟</span></h3><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>شرکتِ پست یا پیک:</strong> تنها نشانی و شمارهٔ تماسِ لازم برای تحویلِ مرسوله.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>درگاهِ پرداختِ بانکی:</strong> برای انجامِ امنِ تراکنش، تحتِ نظارتِ شاپرک و بانکِ مرکزی.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>مراجعِ قانونی:</strong> تنها در صورتِ الزامِ قانونی و بر اساسِ درخواستِ رسمیِ مرجعِ ذی‌صلاح.</span></li></ul><div class="dz-legal-note"><i class="dz-icon ri-forbid-2-line"></i><span>اطلاعاتِ شخصیِ شما <strong>هرگز</strong> به اشخاص یا شرکت‌های ثالث برای مقاصدِ تبلیغاتی فروخته یا اجاره داده نمی‌شود.</span></div><h3 class="dz-legal-subh"><i class="dz-icon ri-shield-line"></i><span>امنیت و مدتِ نگه‌داریِ اطلاعات</span></h3><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تمامِ ارتباطِ شما با سایت با پروتکلِ امنِ <strong>SSL</strong> رمزنگاری می‌شود و دسترسی به اطلاعات تنها برای کارکنانِ مجاز و در حدِ وظیفه ممکن است.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>اطلاعاتِ شما تنها <strong>تا زمانی</strong> نگه‌داری می‌شود که برای ارائهٔ خدمات یا رعایتِ الزاماتِ قانونی (مانندِ نگه‌داریِ سوابقِ مالی) لازم باشد.</span></li></ul><h3 class="dz-legal-subh"><i class="dz-icon ri-user-settings-line"></i><span>حقوقِ شما نسبت به اطلاعاتتان</span></h3><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>درخواستِ <strong>دسترسی، اصلاح یا حذفِ</strong> اطلاعاتِ حسابِ خود را در هر زمان از طریقِ پشتیبانی ثبت کنید.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span><strong>لغوِ اشتراکِ</strong> پیامک‌ها و ایمیل‌های تبلیغاتی در هر زمان و بدونِ نیاز به دلیل امکان‌پذیر است.</span></li></ul><div class="dz-legal-note dz-legal-note--gold"><i class="dz-icon ri-emotion-happy-line"></i><span><strong>حریمِ خصوصیِ کودکان:</strong> خدماتِ دشت‌زاد برای بزرگسالان طراحی شده است و ما آگاهانه اطلاعاتِ افرادِ زیرِ ۱۸ سال را جمع‌آوری نمی‌کنیم.</span></div>`,
  ),
  comments: text(
    `<p class="dz-legal-sec__intro">هدف از بخشِ نظرات، اشتراک‌گذاریِ تجربهٔ خرید و استفاده از محصولات است. هر نظر پس از بررسیِ کارشناسان و در صورتِ رعایتِ قوانین، منتشر می‌شود.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>نقدِ مناسب، نقدی واقع‌بینانه است که <strong>مزایا و معایبِ</strong> محصول را بر پایهٔ تجربهٔ شخصی و متناسب با قیمتِ آن بررسی کند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>استفاده از <strong>ادبیاتِ محترمانه</strong> الزامی است؛ توهین، کلماتِ نامناسب یا مطالبِ مغایر با عرفِ جامعه تأیید نمی‌شوند.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تنها نظراتِ <strong>مرتبط با همان محصول</strong> و با نگارشِ صحیح تأیید می‌شوند؛ نقد دربارهٔ سایت یا خدمات را از طریقِ پشتیبانی مطرح کنید.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>دشت‌زاد در قبالِ درستی یا نادرستیِ نظراتِ کاربران مسئولیتی ندارد و نمایشِ نظر به‌معنای تأییدِ محتوای آن نیست.</span></li></ul>`,
  ),
  force: text(
    `<p class="dz-legal-sec__intro">چنانچه بر اثرِ وقوعِ حوادثِ غیرمترقبه، امکانِ فعالیتِ دشت‌زاد کلاً یا بخشی از آن به‌طورِ موقت ناممکن شود، ثبتِ سفارشِ جدید و ارسالِ سفارش‌های ثبت‌شده به حالتِ تعلیق درمی‌آید.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در مدتی که به‌دلیلِ وقوعِ حادثه امکانِ پردازشِ سفارش وجود ندارد، کاربر حقِ درخواستِ ارسالِ فوری یا استردادِ وجه را نخواهد داشت.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>پس از رفعِ حادثه، در صورتِ امکانِ ادامهٔ فعالیت، دشت‌زاد پردازشِ سفارش‌ها را از سر می‌گیرد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در صورتِ ناممکن‌شدنِ کاملِ پردازش، با توافقِ طرفین سفارش تعدیل یا لغو و وجهِ پرداخت‌شده مسترد می‌شود.</span></li></ul>`,
  ),
  change: text(
    `<p class="dz-legal-sec__intro">این مقررات برای حفظِ حقوقِ شما و شفافیتِ همکاری تنظیم شده و ممکن است در طولِ زمان بهبود یابد.</p><ul class="dz-legal-list"><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>دشت‌زاد می‌تواند این مقررات را هر زمان <strong>به‌روزرسانی</strong> کند؛ نسخهٔ معتبر همان است که در لحظهٔ ثبتِ سفارش روی این صفحه قرار دارد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>تغییراتِ مهم از طریقِ سایت و در صورتِ لزوم پیامک به اطلاعِ کاربران می‌رسد.</span></li><li><i class="dz-icon ri-checkbox-circle-fill"></i><span>در صورتِ بروزِ هرگونه اختلاف، نخست از راهِ <strong>گفت‌وگوی مستقیم با پشتیبانی</strong> حل‌وفصل می‌شود و در غیرِ این صورت، تابعِ <strong>قانونِ تجارتِ الکترونیکی</strong> و قوانینِ جاریِ جمهوری اسلامی ایران خواهد بود.</span></li></ul><a class="dz-legal-link" href="/contact"><i class="dz-icon ri-customer-service-2-line"></i><span>تماس با پشتیبانیِ دشت‌زاد</span></a>`,
  ),

  // ---- page chrome (hero / intro / contact) ----
  heroUpdated: text("آخرین به‌روزرسانی: ۱۲ خرداد ۱۴۰۵"),
  heroKicker: text("اعتماد، پایهٔ هر خرید است"),
  heroTitle: text("قوانین و مقررات"),
  heroSub: text(
    "شرایط خرید، حساب کاربری، ارسال، مرجوعی، پرداخت و حریم خصوصی شما را این‌جا روشن و بی‌ابهام نوشته‌ایم. ثبت هر سفارش به‌منزلهٔ مطالعه و پذیرش این مقررات است.",
  ),
  searchPlaceholder: text("جستجو در قوانین… مثلاً «مرجوعی» یا «حریم خصوصی»"),
  intro: text(
    `<p>فروشگاه دشت‌زاد (با نام حقوقی <strong>شرکت دشت‌زاد کشت و تجارت ایرانیان</strong>) متعهد است محصولاتی طبیعی و باکیفیت را با شفاف‌ترین شرایط ممکن به دست شما برساند. مقرراتی که در ادامه می‌خوانید، چارچوب همکاری ما با شماست و برای حفظِ حقوقِ هر دو طرف تنظیم شده است.</p><p>این مقررات ممکن است هر از چندی به‌روزرسانی شود؛ نسخهٔ معتبر همان است که در زمانِ ثبت سفارش روی این صفحه قرار دارد.</p>`,
  ),
  legalFoot: text(
    `<b>توضیح:</b> این سند به‌منظورِ شفافیت و راهنماییِ شما تنظیم شده و مواردِ درج‌نشده یا مبهم در آن، تابعِ قوانین، آیین‌نامه‌ها و مصوباتِ مراجعِ قانونیِ کشور است. این صفحه متعلق به شرکت <b>دشت‌زاد کشت و تجارت ایرانیان</b> است و در صورتِ وجودِ هرگونه ابهام، تیمِ پشتیبانی آمادهٔ پاسخ‌گویی و حل‌وفصلِ دوستانه است.`,
  ),
  contactKicker: text("هنوز جواب نگرفتید؟"),
  contactTitle: text("تیم پشتیبانیِ دشت‌زاد کنارِ شماست"),
  contactSub: text(
    "هر روز از ساعتِ ۹ تا ۲۱، از طریقِ راه‌های زیر پاسخگوی پرسش‌ها و سفارش‌های شما هستیم. هرچه باشد، تنهایتان نمی‌گذاریم.",
  ),
});
export type TermsContent = z.infer<typeof termsContentSchema>;

GLOBAL_CONFIGS.termsContent = {
  key: "termsContent",
  label: "قوانین و مقررات",
  description: "محتوای ۱۳ بخشِ صفحهٔ قوانین و مقررات (HTML). هر فیلد را با HTML ویرایش کنید.",
  route: "/admin/globals/terms",
  schema: termsContentSchema,
  defaults: termsContentSchema.parse({}),
  sections: [
    { key: "hero", title: "هیرو و مقدمه", description: "بالای صفحه و متنِ مقدمه" },
    { key: "sections", title: "بخش‌های قوانین" },
    { key: "contact", title: "بخشِ تماس و پانوشت" },
  ],
  fields: [
    { name: "heroKicker", label: "برچسبِ بالای تیتر", type: "text", section: "hero" },
    { name: "heroUpdated", label: "متنِ آخرین به‌روزرسانی", type: "text", section: "hero" },
    { name: "heroTitle", label: "تیتر", type: "text", section: "hero" },
    { name: "heroSub", label: "توضیحِ زیرِ تیتر", type: "textarea", rows: 3, section: "hero" },
    { name: "searchPlaceholder", label: "متنِ راهنمای جستجو", type: "text", section: "hero" },
    { name: "intro", label: "متنِ مقدمه (HTML)", type: "textarea", rows: 5, section: "hero" },
    { name: "general", label: "۱ — کلیات و تعاریف", type: "textarea", rows: 8, section: "sections" },
    { name: "account", label: "۲ — حسابِ کاربری و ثبت‌نام", type: "textarea", rows: 8, section: "sections" },
    { name: "buy", label: "۳ — شرایطِ خرید و ثبتِ سفارش", type: "textarea", rows: 8, section: "sections" },
    { name: "pay", label: "۴ — تسویه‌حساب", type: "textarea", rows: 8, section: "sections" },
    { name: "ship", label: "۵ — حمل، تحویل و دریافت", type: "textarea", rows: 8, section: "sections" },
    { name: "return", label: "۶ — مرجوعی و استرداد", type: "textarea", rows: 8, section: "sections" },
    { name: "address", label: "۷ — مسئولیتِ ثبتِ آدرس", type: "textarea", rows: 6, section: "sections" },
    { name: "coupon", label: "۸ — شرایطِ کدِ تخفیف", type: "textarea", rows: 8, section: "sections" },
    { name: "ip", label: "۹ — مالکیتِ معنوی", type: "textarea", rows: 6, section: "sections" },
    { name: "privacy", label: "۱۰ — قوانینِ حریمِ خصوصی", type: "textarea", rows: 16, section: "sections" },
    { name: "comments", label: "۱۱ — قوانینِ ارسالِ نظر", type: "textarea", rows: 6, section: "sections" },
    { name: "force", label: "۱۲ — قوهٔ قهریه (فورس ماژور)", type: "textarea", rows: 6, section: "sections" },
    { name: "change", label: "۱۳ — تغییرِ قوانین و حلِ اختلاف", type: "textarea", rows: 6, section: "sections" },
    { name: "legalFoot", label: "پانوشتِ حقوقی (HTML)", type: "textarea", rows: 4, section: "contact" },
    { name: "contactKicker", label: "برچسبِ بخشِ تماس", type: "text", section: "contact" },
    { name: "contactTitle", label: "تیترِ بخشِ تماس", type: "text", section: "contact" },
    { name: "contactSub", label: "توضیحِ بخشِ تماس", type: "textarea", rows: 3, section: "contact" },
  ],
  revalidate: ["/terms"],
};

GLOBAL_CONFIGS.faqPage = {
  key: "faqPage",
  label: "صفحهٔ پرسش‌های متداول",
  description: "متن‌های ثابتِ صفحهٔ پرسش‌های متداول (هیرو و بخشِ تماس). گروه‌ها و سوال‌ها از «سوالات متداول» مدیریت می‌شوند.",
  route: "/admin/globals/faq",
  schema: faqPageSchema,
  defaults: faqPageSchema.parse({}),
  sections: [
    { key: "hero", title: "هیرو", description: "بالای صفحه" },
    { key: "contact", title: "بخشِ تماس", description: "کارتِ پایانیِ صفحه" },
  ],
  fields: [
    { name: "heroKicker", label: "برچسبِ بالای تیتر", type: "text", section: "hero" },
    { name: "heroUpdated", label: "متنِ آخرین به‌روزرسانی", type: "text", section: "hero" },
    { name: "heroTitle", label: "تیتر", type: "text", section: "hero" },
    { name: "heroSub", label: "توضیحِ زیرِ تیتر", type: "textarea", rows: 3, section: "hero" },
    { name: "searchPlaceholder", label: "متنِ راهنمای جستجو", type: "text", section: "hero" },
    { name: "contactKicker", label: "برچسبِ بخشِ تماس", type: "text", section: "contact" },
    { name: "contactTitle", label: "تیترِ بخشِ تماس", type: "text", section: "contact" },
    { name: "contactSub", label: "توضیحِ بخشِ تماس", type: "textarea", rows: 3, section: "contact" },
  ],
  revalidate: ["/faq"],
};

GLOBAL_CONFIGS.contactPage = {
  key: "contactPage",
  label: "صفحهٔ تماس با ما",
  description: "متن‌های ثابتِ صفحهٔ تماس (هیرو، فرم و دکمه‌های اقدام). شماره/ایمیل/آدرس/شبکه‌ها از «اطلاعات تماس» و «شبکه‌های اجتماعی» می‌آیند.",
  route: "/admin/globals/contact-page",
  schema: contactPageSchema,
  defaults: contactPageSchema.parse({}),
  sections: [
    { key: "hero", title: "هیرو" },
    { key: "form", title: "فرمِ تماس" },
    { key: "ctas", title: "دکمه‌های اقدام" },
  ],
  fields: [
    { name: "heroKicker", label: "برچسبِ بالای تیتر", type: "text", section: "hero" },
    { name: "heroTitle", label: "تیتر", type: "text", section: "hero" },
    { name: "heroSub", label: "توضیحِ زیرِ تیتر", type: "textarea", rows: 3, section: "hero" },
    { name: "formTitle", label: "تیترِ فرم", type: "text", section: "form" },
    { name: "formSub", label: "توضیحِ فرم", type: "text", section: "form" },
    { name: "formNote", label: "یادداشتِ حریمِ خصوصی", type: "textarea", rows: 2, section: "form" },
    { name: "websiteLabel", label: "نمایشِ وب‌سایت", type: "text", dir: "ltr", section: "form" },
    { name: "websiteUrl", label: "نشانیِ وب‌سایت", type: "url", dir: "ltr", section: "form" },
    { name: "cta1Title", label: "اقدام ۱ — تیتر", type: "text", section: "ctas" },
    { name: "cta1Desc", label: "اقدام ۱ — توضیح", type: "text", section: "ctas" },
    { name: "cta1Href", label: "اقدام ۱ — لینک", type: "url", dir: "ltr", section: "ctas" },
    { name: "cta2Title", label: "اقدام ۲ — تیتر", type: "text", section: "ctas" },
    { name: "cta2Desc", label: "اقدام ۲ — توضیح", type: "text", section: "ctas" },
    { name: "cta2Href", label: "اقدام ۲ — لینک", type: "url", dir: "ltr", section: "ctas" },
  ],
  revalidate: ["/contact"],
};

export function getGlobalConfig(key: string): GlobalConfig | null {
  return GLOBAL_CONFIGS[key] ?? null;
}

// Route segment (nav) → global key.
export const GLOBAL_ROUTE_KEYS: Record<string, string> = {
  site: "siteSettings",
  business: "businessInfo",
  contact: "contactInfo",
  brand: "brandSettings",
  header: "header",
  footer: "footer",
  homepage: "homepage",
  social: "socialLinks",
  seo: "seoDefaults",
  terms: "termsContent",
  faq: "faqPage",
  "contact-page": "contactPage",
};
