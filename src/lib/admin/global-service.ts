import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  GLOBAL_CONFIGS,
  siteSettingsSchema,
  businessInfoSchema,
  contactInfoSchema,
  brandSettingsSchema,
  headerSchema,
  footerSchema,
  homepageSchema,
  socialLinksSchema,
  seoDefaultsSchema,
  chatSettingsSchema,
  termsContentSchema,
  faqPageSchema,
  contactPageSchema,
  type SiteSettings,
  type BusinessInfo,
  type ContactInfo,
  type BrandSettings,
  type HeaderConfig,
  type FooterConfig,
  type Homepage,
  type SocialLinks,
  type SeoDefaults,
  type ChatSettings,
  type TermsContent,
  type FaqPage,
  type ContactPage,
} from "@/lib/admin/globals";

// ============================================================
// GlobalSetting read/write service (ADMIN-CP4).
// Reads ALWAYS return safe, fully-populated objects (defaults merged in) so a
// missing or partial row can never crash a public page. Writes upsert by key.
// ============================================================

/** Load a global, merging stored JSON over schema defaults. Never throws. */
async function load<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  defaults: z.infer<S>,
): Promise<z.infer<S>> {
  try {
    const row = await prisma.globalSetting.findUnique({ where: { key } });
    if (!row) return defaults;
    const merged = { ...(defaults as object), ...(row.data as object) };
    const parsed = schema.safeParse(merged);
    return parsed.success ? (parsed.data as z.infer<S>) : defaults;
  } catch {
    return defaults;
  }
}

/** Upsert a validated global by key. Returns the stored row id. */
export async function writeGlobal(key: string, data: unknown): Promise<string> {
  const row = await prisma.globalSetting.upsert({
    where: { key },
    update: { data: data as object },
    create: { key, data: data as object },
  });
  return row.id;
}

/** Generic read for the admin form (returns parsed data for a known key). */
export async function readGlobalRaw(key: string): Promise<Record<string, unknown>> {
  const cfg = GLOBAL_CONFIGS[key];
  if (!cfg) return {};
  return (await load(key, cfg.schema, cfg.defaults)) as Record<string, unknown>;
}

// ---- typed accessors for public integration ----

const d = <K extends keyof typeof GLOBAL_CONFIGS>(k: K) => GLOBAL_CONFIGS[k].defaults;

export const getSiteSettings = (): Promise<SiteSettings> =>
  load("siteSettings", siteSettingsSchema, d("siteSettings") as SiteSettings);
export const getBusinessInfo = (): Promise<BusinessInfo> =>
  load("businessInfo", businessInfoSchema, d("businessInfo") as BusinessInfo);
export const getContactInfo = (): Promise<ContactInfo> =>
  load("contactInfo", contactInfoSchema, d("contactInfo") as ContactInfo);
export const getBrandSettings = (): Promise<BrandSettings> =>
  load("brandSettings", brandSettingsSchema, d("brandSettings") as BrandSettings);
export const getHeaderConfig = (): Promise<HeaderConfig> =>
  load("header", headerSchema, d("header") as HeaderConfig);
export const getFooterConfig = (): Promise<FooterConfig> =>
  load("footer", footerSchema, d("footer") as FooterConfig);
export const getHomepage = (): Promise<Homepage> =>
  load("homepage", homepageSchema, d("homepage") as Homepage);
export const getSocialLinks = (): Promise<SocialLinks> =>
  load("socialLinks", socialLinksSchema, d("socialLinks") as SocialLinks);
export const getSeoDefaults = (): Promise<SeoDefaults> =>
  load("seoDefaults", seoDefaultsSchema, d("seoDefaults") as SeoDefaults);
export const getChatSettings = (): Promise<ChatSettings> =>
  load("chatSettings", chatSettingsSchema, d("chatSettings") as ChatSettings);
export const getTermsContent = (): Promise<TermsContent> =>
  load("termsContent", termsContentSchema, d("termsContent") as TermsContent);
export const getFaqPage = (): Promise<FaqPage> =>
  load("faqPage", faqPageSchema, d("faqPage") as FaqPage);
export const getContactPage = (): Promise<ContactPage> =>
  load("contactPage", contactPageSchema, d("contactPage") as ContactPage);

// ---- relation option context for the admin forms ----

export type GlobalFieldContext = {
  menuOptions: { value: string; label: string }[];
  productOptions: { id: string; title: string }[];
  categoryOptions: { id: string; title: string }[];
  faqGroupOptions: { id: string; title: string }[];
};

/** Fetch only the relation lists a given global form needs. */
export async function loadFieldContext(flags: {
  menus?: boolean;
  products?: boolean;
  categories?: boolean;
  faqGroups?: boolean;
}): Promise<GlobalFieldContext> {
  const [menus, products, categories, faqGroups] = await Promise.all([
    flags.menus
      ? prisma.menu.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } })
      : Promise.resolve([] as { id: string; title: string }[]),
    flags.products
      ? prisma.product.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } })
      : Promise.resolve([] as { id: string; title: string }[]),
    flags.categories
      ? prisma.category.findMany({
          where: { type: "PRODUCT" },
          orderBy: { title: "asc" },
          select: { id: true, title: true },
        })
      : Promise.resolve([] as { id: string; title: string }[]),
    flags.faqGroups
      ? prisma.fAQGroup.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } })
      : Promise.resolve([] as { id: string; title: string }[]),
  ]);
  return {
    menuOptions: menus.map((m) => ({ value: m.id, label: m.title })),
    productOptions: products,
    categoryOptions: categories,
    faqGroupOptions: faqGroups,
  };
}

/** Which relation lists a global's fields require. */
export function ctxFlagsForGlobal(key: string): {
  menus?: boolean;
  products?: boolean;
  categories?: boolean;
  faqGroups?: boolean;
} {
  const cfg = GLOBAL_CONFIGS[key];
  if (!cfg) return {};
  const types = new Set(cfg.fields.map((f) => f.type));
  return {
    menus: types.has("menu"),
    products: types.has("product") || types.has("products"),
    categories: types.has("category") || types.has("categories"),
    faqGroups: types.has("faqGroup"),
  };
}
