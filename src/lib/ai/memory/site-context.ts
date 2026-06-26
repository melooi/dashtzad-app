import "server-only";
import { prisma } from "@/lib/prisma";

interface FaqItem {
  q: string;
  a: string;
}

interface ChatSettings {
  faqItems?: FaqItem[];
  [key: string]: unknown;
}

interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  [key: string]: unknown;
}

interface BusinessInfo {
  brandName?: string;
  phone?: string;
  address?: string;
  email?: string;
  [key: string]: unknown;
}

/** Reads public site info from GlobalSetting + top products. Never reads admin/pricing/users. */
export async function buildSiteContext(): Promise<string> {
  try {
    const [siteSettingsRow, businessInfoRow, chatSettingsRow, products] = await Promise.all([
      prisma.globalSetting.findUnique({ where: { key: "siteSettings" }, select: { data: true } }),
      prisma.globalSetting.findUnique({ where: { key: "businessInfo" }, select: { data: true } }),
      prisma.globalSetting.findUnique({ where: { key: "chatSettings" }, select: { data: true } }),
      prisma.product
        .findMany({
          where: { isActive: true },
          select: {
            title: true,
            category: {
              select: { title: true },
            },
          },
          take: 30,
        })
        .catch(() => []),
    ]);

    const siteSettings = (siteSettingsRow?.data ?? {}) as SiteSettings;
    const businessInfo = (businessInfoRow?.data ?? {}) as BusinessInfo;
    const chatSettings = (chatSettingsRow?.data ?? {}) as ChatSettings;

    const sections: string[] = [];

    // Site info section
    const siteParts: string[] = ["# اطلاعات سایت"];
    if (siteSettings.siteName) siteParts.push(`نام: ${siteSettings.siteName}`);
    if (siteSettings.siteDescription) siteParts.push(`توضیحات: ${siteSettings.siteDescription}`);
    if (siteParts.length > 1) sections.push(siteParts.join("\n"));

    // Business info section
    const bizParts: string[] = ["# اطلاعات کسب‌وکار"];
    if (businessInfo.brandName) bizParts.push(`نام برند: ${businessInfo.brandName}`);
    if (businessInfo.phone) bizParts.push(`تلفن: ${businessInfo.phone}`);
    if (businessInfo.address) bizParts.push(`آدرس: ${businessInfo.address}`);
    if (businessInfo.email) bizParts.push(`ایمیل: ${businessInfo.email}`);
    if (bizParts.length > 1) sections.push(bizParts.join("\n"));

    // FAQs section
    const faqs = Array.isArray(chatSettings.faqItems) ? (chatSettings.faqItems as FaqItem[]) : [];
    if (faqs.length > 0) {
      const faqParts = ["# سوالات متداول"];
      for (const faq of faqs.slice(0, 10)) {
        if (faq.q && faq.a) {
          faqParts.push(`س: ${faq.q} / ج: ${faq.a}`);
        }
      }
      if (faqParts.length > 1) sections.push(faqParts.join("\n"));
    }

    // Products section
    if (products.length > 0) {
      const productParts = ["# محصولات موجود"];
      for (const p of products) {
        const catName = p.category?.title ?? "متفرقه";
        productParts.push(`- ${p.title} (${catName})`);
      }
      sections.push(productParts.join("\n"));
    }

    const result = sections.join("\n\n");

    // Max 3000 chars
    if (result.length > 3000) {
      return result.slice(0, 3000);
    }

    return result;
  } catch {
    return "";
  }
}
