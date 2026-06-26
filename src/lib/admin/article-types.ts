// ============================================================
// Article-type identities (CONTENT-CP1) — single source of truth shared by the
// admin article form (per-type fields, badge, accent, safety hints) AND the
// public magazine templates (badge, accent, template family, disclaimers).
//
// Pure data + types — safe to import from server components and client forms.
// Recipe / دستور پخت is intentionally absent (deferred to RECIPE-CP1).
// ============================================================

export const ARTICLE_TYPE_KEYS = [
  "CASE_FILE",
  "TASTE_STORY",
  "FOOD_CULTURE",
  "DID_YOU_KNOW",
  "BRAND_UPDATE",
  "TRICKS",
  "ENCYCLOPEDIA",
  "DIET_LIFESTYLE",
  "HEALTH_MEDICAL",
  "RECIPE",
] as const;

export type ArticleTypeKey = (typeof ARTICLE_TYPE_KEYS)[number];

/** Per-type admin field. Stored inside Post.typeMeta as a flat string map. */
export type TypeMetaField = {
  key: string;
  label: string;
  input: "text" | "textarea" | "select" | "tags";
  options?: { value: string; label: string }[];
  hint?: string;
  /** default value pre-filled in the new-article form (e.g. disclaimer text). */
  default?: string;
};

export type ArticleTypeIdentity = {
  key: ArticleTypeKey;
  /** Persian label / magazine section name. */
  label: string;
  /** short badge shown on cards + article hero. */
  badge: string;
  /** accent color (hex) used by the public template (badge, rules, headings). */
  accent: string;
  /** admin description shown in the type picker. */
  description: string;
  /** structural template family used by the public detail page. */
  template: "case-file" | "editorial" | "recipe";
  /** per-type admin fields (graphical inputs; stored in typeMeta). */
  metaFields: TypeMetaField[];
  /** health/diet — a fixed disclaimer block is always rendered. */
  requiresDisclaimer?: boolean;
  /** health — sources are required; draft until a real source exists. */
  requiresSources?: boolean;
};

const DIET_DISCLAIMER =
  "این مطلب جنبه‌ی آموزشی و عمومی دارد و جایگزین توصیه‌ی متخصص تغذیه نیست. برای برنامه‌ی غذایی شخصی با کارشناس مشورت کنید.";
const HEALTH_DISCLAIMER =
  "این مطلب صرفاً آگاهی‌بخش است و جایگزین تشخیص یا توصیه‌ی پزشک نیست. در صورت بیماری یا شرایط خاص، پیش از تغییر رژیم غذایی با پزشک مشورت کنید.";

export const ARTICLE_TYPES: Record<ArticleTypeKey, ArticleTypeIdentity> = {
  CASE_FILE: {
    key: "CASE_FILE",
    label: "پرونده‌ها",
    badge: "پرونده",
    accent: "#7a5538",
    description: "پرونده‌ی ویژه و عمیق پیرامون یک موضوع؛ هاب چند مقاله‌ی مرتبط.",
    template: "case-file",
    metaFields: [
      { key: "lead", label: "درآمد پرونده", input: "textarea", hint: "یک بند کوتاه برای آغاز پرونده." },
      { key: "keyTopics", label: "محورهای کلیدی", input: "tags", hint: "با کاما جدا کنید." },
    ],
  },
  TASTE_STORY: {
    key: "TASTE_STORY",
    label: "قصه طعم‌ها",
    badge: "قصه طعم‌ها",
    accent: "#c2410c",
    description: "روایت احساسی و تصویری؛ قصه‌ی محصول، خاطره و خاستگاه.",
    template: "editorial",
    metaFields: [
      { key: "mood", label: "حال‌وهوا", input: "text", hint: "مثلاً «نوستالژیک»، «گرم و خانگی»." },
      { key: "origin", label: "خاستگاه / مکان", input: "text", hint: "منطقه یا مکان قصه." },
    ],
  },
  FOOD_CULTURE: {
    key: "FOOD_CULTURE",
    label: "فرهنگ غذایی",
    badge: "فرهنگ غذایی",
    accent: "#3f6478",
    description: "تاریخ، جامعه و سنت‌های غذایی؛ آرشیوی و مستند.",
    template: "editorial",
    metaFields: [
      { key: "period", label: "دوره‌ی تاریخی", input: "text", hint: "اگر مشخص است؛ در نبود منبع با احتیاط بنویسید." },
      { key: "region", label: "منطقه", input: "text" },
    ],
  },
  DID_YOU_KNOW: {
    key: "DID_YOU_KNOW",
    label: "شاید ندانید",
    badge: "شاید ندانید",
    accent: "#2f7d6b",
    description: "دانستنی‌های کنجکاوی‌برانگیز و کاربردی؛ خواندنِ سریع.",
    template: "editorial",
    metaFields: [{ key: "keyFact", label: "حقیقت کلیدی", input: "textarea", hint: "نکته‌ی محوری مطلب در یک جمله." }],
  },
  BRAND_UPDATE: {
    key: "BRAND_UPDATE",
    label: "تازه‌های دشت‌زاد",
    badge: "تازه‌های دشت‌زاد",
    accent: "#15803d",
    description: "اخبار برند، کمپین‌ها، بسته‌های تازه و پشت‌صحنه.",
    template: "editorial",
    metaFields: [
      {
        key: "updateType",
        label: "نوع به‌روزرسانی",
        input: "select",
        options: [
          { value: "news", label: "خبر" },
          { value: "campaign", label: "کمپین" },
          { value: "launch", label: "معرفی محصول" },
          { value: "bts", label: "پشت‌صحنه" },
        ],
      },
      { key: "campaignLink", label: "لینک کمپین (اختیاری)", input: "text", hint: "نشانی داخلی یا خارجی واقعی." },
    ],
  },
  TRICKS: {
    key: "TRICKS",
    label: "ترفندها",
    badge: "ترفند",
    accent: "#b45309",
    description: "ترفندها و راهنماهای عملی و گام‌به‌گام.",
    template: "editorial",
    metaFields: [
      { key: "problemSolved", label: "چه مشکلی را حل می‌کند؟", input: "text" },
      { key: "timeRequired", label: "زمان لازم", input: "text", hint: "مثلاً «۱۰ دقیقه»." },
      {
        key: "difficulty",
        label: "سختی",
        input: "select",
        options: [
          { value: "easy", label: "آسان" },
          { value: "medium", label: "متوسط" },
          { value: "hard", label: "پیشرفته" },
        ],
      },
    ],
  },
  ENCYCLOPEDIA: {
    key: "ENCYCLOPEDIA",
    label: "دانشنامه",
    badge: "دانشنامه",
    accent: "#5b6470",
    description: "مقاله‌ی مرجع و توضیحی؛ ساختار‌مند و تعریف‌محور.",
    template: "editorial",
    metaFields: [
      { key: "definition", label: "تعریف کوتاه", input: "textarea", hint: "تعریف یک‌خطی موضوع." },
      { key: "synonyms", label: "اصطلاحات مرتبط", input: "tags", hint: "با کاما جدا کنید." },
    ],
  },
  DIET_LIFESTYLE: {
    key: "DIET_LIFESTYLE",
    label: "رژیم و لاغری",
    badge: "رژیم و لاغری",
    accent: "#4a7c59",
    description: "تغذیه و سبک زندگی؛ محتاطانه و کاربردی، بدون ادعای درمانی.",
    template: "editorial",
    requiresDisclaimer: true,
    metaFields: [
      { key: "disclaimer", label: "سلب مسئولیت", input: "textarea", default: DIET_DISCLAIMER },
      { key: "suitableFor", label: "مناسب برای", input: "tags", hint: "با کاما جدا کنید." },
      { key: "notSuitableFor", label: "نامناسب برای", input: "tags", hint: "با کاما جدا کنید." },
    ],
  },
  HEALTH_MEDICAL: {
    key: "HEALTH_MEDICAL",
    label: "سلامتی و پزشکی",
    badge: "سلامتی و پزشکی",
    accent: "#2f5d72",
    description: "محتوای حساسِ سلامت؛ آرام، منبع‌محور و محتاط. بدون پزشک یا منبع جعلی.",
    template: "editorial",
    requiresDisclaimer: true,
    requiresSources: true,
    metaFields: [
      { key: "disclaimer", label: "سلب مسئولیت پزشکی", input: "textarea", default: HEALTH_DISCLAIMER },
      { key: "riskGroups", label: "گروه‌های در معرض خطر", input: "tags", hint: "با کاما جدا کنید." },
      {
        key: "reviewedBy",
        label: "بازبینی‌شده توسط (اختیاری)",
        input: "text",
        hint: "فقط در صورت بازبینی واقعی پر شود؛ نام جعلی ننویسید.",
      },
    ],
  },
  RECIPE: {
    key: "RECIPE",
    label: "دستور پخت",
    badge: "دستور پخت",
    accent: "#b45309",
    description: "دستور غذای ساختاریافته؛ زمان و نفرات، مواد، مراحل پخت و ارزش غذایی.",
    template: "recipe",
    // Structured recipe data (times, ingredients, steps…) lives in Post.recipeMeta
    // and is edited by RecipeMetaFields — not these flat typeMeta fields.
    metaFields: [],
  },
};

export const ARTICLE_TYPE_OPTIONS = ARTICLE_TYPE_KEYS.map((k) => ({
  value: k,
  label: ARTICLE_TYPES[k].label,
}));

export function articleTypeLabel(key: string | null | undefined): string {
  return key && key in ARTICLE_TYPES ? ARTICLE_TYPES[key as ArticleTypeKey].label : "مقاله";
}

/** Fixed disclaimer text shown on the public template for diet/health types. */
export const ARTICLE_DISCLAIMERS: Partial<Record<ArticleTypeKey, string>> = {
  DIET_LIFESTYLE: DIET_DISCLAIMER,
  HEALTH_MEDICAL: HEALTH_DISCLAIMER,
};
