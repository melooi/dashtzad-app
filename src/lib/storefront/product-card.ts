// Projects a Prisma Product (+ optional variant summary) into the flat,
// serializable shape the storefront ProductCard consumes. Real data only —
// price is the product price, or the lowest active-variant price ("از …").

import type { Prisma } from "@/generated/prisma/client";
import type { MarketingBadgeKey } from "@/lib/admin/product-variant";
import type { StoreProductCardData, ProductCardState, CardVariantOption } from "@/components/storefront/product-card/types";

/**
 * Shared Prisma include for any page that renders a ProductCard. Keeps the
 * storefront grid (home + shop) projecting identical real data (image,
 * category, full variant matrix). Pair with toProductCardData().
 */
export const cardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: { select: { title: true } },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      gramValue: true,
      price_rial: true,
      offPrice_rial: true,
      stock: true,
      marketingBadge: true,
      weight: { select: { id: true, title: true, gramValue: true } },
      packaging: { select: { id: true, title: true } },
    },
  },
} satisfies Prisma.ProductInclude;

export type CardVariantLite = {
  id: string;
  gramValue: number;
  price_rial: number;
  offPrice_rial: number | null;
  stock: number;
  marketingBadge: MarketingBadgeKey | null;
  weight: { id: string; title: string; gramValue: number } | null;
  packaging: { id: string; title: string } | null;
};

export type CardProductLite = {
  id: string;
  slug: string;
  title: string;
  price_rial: number;
  offPrice_rial: number | null;
  countInStock: number;
  images: { url: string }[];
  category?: { title: string } | null;
  variants?: CardVariantLite[];
  rating?: number;
  numReviews?: number;
  // PRODUCT-CARD-CP1 (additive)
  saleMode?: string | null;          // SaleMode enum value
  contactPhone?: string | null;
  installmentEnabled?: boolean;
};

/** Below this many units, the card surfaces a real "n مانده" low-stock chip. */
const LOW_STOCK_THRESHOLD = 5;

const effective = (price: number, off: number | null) =>
  off != null && off < price ? off : price;

/**
 * Resolves the card state from product data.
 *
 * Priority (matches admin UX intention):
 *  1. saleMode CONTACT     → "contact"   (admin forced; overrides everything)
 *  2. saleMode DISCONTINUED → "discontinued" (no notify, OOS permanent)
 *  3. Out of stock          → "unavailable"  (OOS, customer can request notify)
 *  4. price_rial === 0      → "contact"      (implicit price-on-request)
 *  5. offPrice < price      → "discounted"
 *  6. badge BESTSELLER|LIMITED → "bestseller"
 *  7. any badge             → "special"
 *  8. default               → "available"
 */
function resolveCardState(
  saleMode: string | null | undefined,
  inStock: boolean,
  price_rial: number,
  offPrice_rial: number | null,
  badge: MarketingBadgeKey | null,
): ProductCardState {
  if (saleMode === "CONTACT") return "contact";
  if (saleMode === "DISCONTINUED") return "discontinued";
  if (!inStock) return "unavailable";
  if (price_rial === 0) return "contact";
  if (offPrice_rial != null && offPrice_rial < price_rial) return "discounted";
  if (badge === "BESTSELLER" || badge === "LIMITED") return "bestseller";
  if (badge != null) return "special";
  return "available";
}

export function toProductCardData(p: CardProductLite): StoreProductCardData {
  const variants = p.variants ?? [];
  const hasVariants = variants.length > 0;

  // Distinct weight titles (preserve order), packaging variety count.
  const weightLabels = [
    ...new Set(variants.map((v) => v.weight?.title).filter((t): t is string => !!t)),
  ];
  const packagingCount = new Set(
    variants.map((v) => v.packaging?.title).filter((t): t is string => !!t),
  ).size;

  // First real marketing badge among active variants.
  const badge = variants.find((v) => v.marketingBadge)?.marketingBadge ?? null;

  // Stock: product-level OR any in-stock variant.
  const variantStock = variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
  const totalStock = hasVariants ? variantStock : p.countInStock;
  const inStock = totalStock > 0;
  const stockCount =
    inStock && totalStock <= LOW_STOCK_THRESHOLD ? totalStock : null;

  // Price: lowest effective variant price for variable products ("از"),
  // else the product's own price (keeps strikethrough for real off prices).
  let price_rial = p.price_rial;
  let offPrice_rial = p.offPrice_rial;
  let priceFrom = false;
  if (hasVariants) {
    price_rial = Math.min(...variants.map((v) => effective(v.price_rial, v.offPrice_rial)));
    offPrice_rial = null;
    priceFrom = variants.length > 1;
  }

  const cardState = resolveCardState(p.saleMode, inStock, price_rial, offPrice_rial, badge);

  // Real (weight × packaging) options for the in-card add selector. Only rows
  // that have both a weight and a packaging are purchasable combinations.
  const variantOptions: CardVariantOption[] = variants
    .filter((v) => v.weight && v.packaging)
    .map((v) => ({
      id: v.id,
      weightId: v.weight!.id,
      weightTitle: v.weight!.title,
      gramValue: v.weight!.gramValue || v.gramValue,
      packagingId: v.packaging!.id,
      packagingTitle: v.packaging!.title,
      priceRial: effective(v.price_rial, v.offPrice_rial),
      basePriceRial: v.price_rial,
      stock: v.stock,
    }));

  return {
    slug: p.slug,
    title: p.title,
    productId: p.id,
    price_rial,
    offPrice_rial,
    image: p.images[0]?.url ?? null,
    variants: variantOptions.length > 0 ? variantOptions : undefined,
    cardState,
    categoryTitle: p.category?.title ?? null,
    badge,
    inStock,
    stockCount,
    priceFrom,
    isVariable: hasVariants,
    weightLabels,
    packagingCount,
    // Real approved-review aggregates only (rating renders when reviewCount>0).
    ratingValue: p.rating ?? null,
    reviewCount: p.numReviews ?? null,
    // PRODUCT-CARD-CP1
    installmentEnabled: p.installmentEnabled ?? false,
    contactPhone: p.contactPhone ?? null,
  };
}

/** A variable product (has active variants) — drives quick-add eligibility. */
export function isVariableProduct(p: CardProductLite): boolean {
  return (p.variants?.length ?? 0) > 0;
}
