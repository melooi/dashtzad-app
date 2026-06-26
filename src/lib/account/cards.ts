// Shared product→card projection for the account wishlist & recent-views grids.
// Reuses the storefront `toProductCardData` so cards look identical everywhere.
import { toProductCardData, type CardVariantLite } from "@/lib/storefront/product-card";
import type { AccountProductCard } from "./types";

/** Prisma select for the fields a product card needs. */
export const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  price_rial: true,
  offPrice_rial: true,
  countInStock: true,
  rating: true,
  numReviews: true,
  isActive: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
  category: { select: { title: true } },
  variants: {
    where: { isActive: true },
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
} as const;

type CardProductRow = {
  id: string;
  slug: string;
  title: string;
  price_rial: number;
  offPrice_rial: number | null;
  countInStock: number;
  rating: number;
  numReviews: number;
  images: { url: string }[];
  category: { title: string } | null;
  variants: {
    id: string;
    gramValue: number;
    price_rial: number;
    offPrice_rial: number | null;
    stock: number;
    marketingBadge: string | null;
    weight: { id: string; title: string; gramValue: number } | null;
    packaging: { id: string; title: string } | null;
  }[];
};

export function toAccountCard(p: CardProductRow): AccountProductCard {
  const card = toProductCardData({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price_rial: p.price_rial,
    offPrice_rial: p.offPrice_rial,
    countInStock: p.countInStock,
    images: p.images,
    category: p.category,
    rating: p.rating,
    numReviews: p.numReviews,
    variants: p.variants.map(
      (v): CardVariantLite => ({
        id: v.id,
        gramValue: v.gramValue,
        price_rial: v.price_rial,
        offPrice_rial: v.offPrice_rial,
        stock: v.stock,
        marketingBadge: v.marketingBadge as CardVariantLite["marketingBadge"],
        weight: v.weight,
        packaging: v.packaging,
      }),
    ),
  });
  return { productId: p.id, ...card };
}
