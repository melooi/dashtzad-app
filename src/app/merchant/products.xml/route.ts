// Google Merchant product feed: /merchant/products.xml
// Real active products + active variants only. No fake GTIN/MPN/rating.
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo";
import { stripHtmlForMeta, truncateMetaText } from "@/lib/seo/text";
import { buildMerchantFeed, type MerchantProduct } from "@/lib/seo/merchant";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { title: true } },
      variants: {
        where: { isActive: true },
        select: {
          sku: true,
          price_rial: true,
          offPrice_rial: true,
          stock: true,
          isActive: true,
          weight: { select: { title: true } },
        },
      },
    },
  });

  const feed: MerchantProduct[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: truncateMetaText(stripHtmlForMeta(p.description), 5000),
    slug: p.slug,
    brand: p.brand,
    categoryTitle: p.category?.title ?? null,
    priceRial: p.price_rial,
    offPriceRial: p.offPrice_rial,
    countInStock: p.countInStock,
    images: p.images.map((i) => i.url),
    variants: p.variants.map((v) => ({
      sku: v.sku,
      priceRial: v.price_rial,
      offPriceRial: v.offPrice_rial,
      stock: v.stock,
      isActive: v.isActive,
      title: v.weight?.title ?? null,
    })),
  }));

  const xml = buildMerchantFeed(feed, SITE_NAME);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
