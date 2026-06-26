/**
 * Shared serializers for AI tool results. Tool outputs are stringified and fed
 * back to the model, so they must be compact, factual, and contain no secrets
 * or другой customer's data. Prices are returned in Toman (the display unit)
 * with a pre-formatted Persian label so the assistant presents them correctly.
 */

import { formatToman, rialToToman, discountPercent } from "@/lib/price";

export interface ProductCardLite {
  title: string;
  slug: string;
  url: string;
  priceToman: number | null;
  priceLabel: string | null;
  offPriceToman: number | null;
  offPriceLabel: string | null;
  discountPercent: number;
  inStock: boolean;
  saleMode: string;
  rating: number | null;
  numReviews: number;
  category: string | null;
  image: string | null;
}

type VariantLite = {
  price_rial: number;
  offPrice_rial: number | null;
  stock: number;
  isActive?: boolean;
};

type ProductLite = {
  title: string;
  slug: string;
  price_rial: number;
  offPrice_rial: number | null;
  countInStock: number;
  rating: number;
  numReviews: number;
  saleMode: string;
  category?: { title: string } | null;
  images?: { url: string }[];
  variants?: VariantLite[];
};

/**
 * Resolve effective display price + stock from a product and its active
 * variants (mirrors the storefront product-card logic: stored variant
 * price_rial / offPrice_rial are the display prices).
 */
export function productToCard(p: ProductLite, baseUrl = ""): ProductCardLite {
  const activeVariants = (p.variants ?? []).filter((v) => v.isActive !== false);
  let priceRial: number | null;
  let offRial: number | null;
  let stock: number;

  if (activeVariants.length > 0) {
    // Cheapest active variant drives the "from" price.
    const cheapest = activeVariants
      .map((v) => ({ price: v.offPrice_rial ?? v.price_rial, base: v.price_rial, off: v.offPrice_rial }))
      .sort((a, b) => a.price - b.price)[0];
    priceRial = cheapest.base;
    offRial = cheapest.off;
    stock = activeVariants.reduce((s, v) => s + (v.stock ?? 0), 0);
  } else {
    priceRial = p.price_rial || null;
    offRial = p.offPrice_rial;
    stock = p.countInStock;
  }

  const inStock = stock > 0 && p.saleMode !== "DISCONTINUED";
  return {
    title: p.title,
    slug: p.slug,
    url: `${baseUrl}/products/${p.slug}`,
    priceToman: priceRial != null ? rialToToman(priceRial) : null,
    priceLabel: priceRial != null ? formatToman(priceRial) : null,
    offPriceToman: offRial != null ? rialToToman(offRial) : null,
    offPriceLabel: offRial != null ? formatToman(offRial) : null,
    discountPercent: priceRial != null ? discountPercent(priceRial, offRial) : 0,
    inStock,
    saleMode: p.saleMode,
    rating: p.numReviews > 0 ? Number(p.rating.toFixed(1)) : null,
    numReviews: p.numReviews,
    category: p.category?.title ?? null,
    image: p.images?.[0]?.url ?? null,
  };
}

/** Standard Prisma include for product cards in tools. */
export const PRODUCT_CARD_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: { select: { title: true } },
  variants: {
    where: { isActive: true },
    select: { price_rial: true, offPrice_rial: true, stock: true, isActive: true },
  },
};
