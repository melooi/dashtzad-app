// ============================================================
// Google Merchant product feed (SEO-CP1) — RSS 2.0 + g: namespace.
// Real data only: real Rial prices (IRR), real stock-based availability.
// NEVER emits fake GTIN/MPN/rating. Variable products emit one item per active
// variant grouped by g:item_group_id.
// ============================================================

import { escapeXml } from "@/lib/seo/text";
import { buildAbsoluteUrl } from "@/lib/seo/urls";

export type MerchantVariant = {
  sku: string;
  priceRial: number;
  offPriceRial?: number | null;
  stock: number;
  isActive: boolean;
  title?: string | null;
};

export type MerchantProduct = {
  id: string;
  title: string;
  description: string;
  slug: string;
  brand?: string | null;
  categoryTitle?: string | null;
  priceRial: number;
  offPriceRial?: number | null;
  countInStock: number;
  images: string[];
  variants: MerchantVariant[];
};

const availability = (stock: number) => (stock > 0 ? "in_stock" : "out_of_stock");
// Merchant Center expects "<number> <ISO currency>". DB stores Rial == IRR.
const priceTag = (rial: number) => `${Math.max(0, Math.round(rial))} IRR`;

function itemXml(opts: {
  id: string;
  groupId?: string;
  title: string;
  description: string;
  link: string;
  images: string[];
  priceRial: number;
  stock: number;
  brand: string;
  productType?: string | null;
}): string {
  const [mainImage, ...rest] = opts.images;
  const extra = rest
    .slice(0, 10)
    .map((u) => `    <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>`)
    .join("\n");
  return [
    "  <item>",
    `    <g:id>${escapeXml(opts.id)}</g:id>`,
    opts.groupId ? `    <g:item_group_id>${escapeXml(opts.groupId)}</g:item_group_id>` : "",
    `    <title>${escapeXml(opts.title)}</title>`,
    `    <description>${escapeXml(opts.description)}</description>`,
    `    <link>${escapeXml(opts.link)}</link>`,
    mainImage ? `    <g:image_link>${escapeXml(mainImage)}</g:image_link>` : "",
    extra,
    `    <g:availability>${availability(opts.stock)}</g:availability>`,
    `    <g:price>${priceTag(opts.priceRial)}</g:price>`,
    `    <g:brand>${escapeXml(opts.brand)}</g:brand>`,
    "    <g:condition>new</g:condition>",
    // No real GTIN/MPN exists in the schema — declare absence per Google rules
    // rather than fabricate an identifier.
    "    <g:identifier_exists>no</g:identifier_exists>",
    opts.productType ? `    <g:product_type>${escapeXml(opts.productType)}</g:product_type>` : "",
    "  </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Build a complete Merchant RSS 2.0 feed XML string. */
export function buildMerchantFeed(products: MerchantProduct[], siteName: string): string {
  const items: string[] = [];

  for (const p of products) {
    const link = buildAbsoluteUrl(`/products/${p.slug}`);
    const brand = p.brand || siteName;
    const images = p.images.map((u) => buildAbsoluteUrl(u));
    const active = p.variants.filter((v) => v.isActive);

    if (active.length > 0) {
      for (const v of active) {
        items.push(
          itemXml({
            id: v.sku,
            groupId: p.id,
            title: v.title ? `${p.title} — ${v.title}` : p.title,
            description: p.description,
            link,
            images,
            priceRial: v.offPriceRial ?? v.priceRial,
            stock: v.stock,
            brand,
            productType: p.categoryTitle,
          }),
        );
      }
    } else {
      items.push(
        itemXml({
          id: p.id,
          title: p.title,
          description: p.description,
          link,
          images,
          priceRial: p.offPriceRial ?? p.priceRial,
          stock: p.countInStock,
          brand,
          productType: p.categoryTitle,
        }),
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteName)} — Product Feed</title>
    <link>${escapeXml(buildAbsoluteUrl("/"))}</link>
    <description>${escapeXml(siteName)} merchant product feed</description>
${items.join("\n")}
  </channel>
</rss>`;
}
