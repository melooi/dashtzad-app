// Server-backed wishlist for logged-in users. Toggled by product slug (the
// storefront FavButton already knows the slug). Ownership-enforced.
import { prisma } from "@/lib/prisma";
import { PRODUCT_CARD_SELECT, toAccountCard } from "./cards";
import type { AccountProductCard } from "./types";

export async function listWishlist(userId: string): Promise<AccountProductCard[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: PRODUCT_CARD_SELECT } },
  });
  return rows.map((r) => toAccountCard(r.product));
}

export async function countWishlist(userId: string): Promise<number> {
  // Mirror listWishlist's `isActive` filter so the dashboard/badge count can
  // never disagree with the visible list (no "3 favorites" but 2 cards shown).
  return prisma.wishlistItem.count({ where: { userId, product: { isActive: true } } });
}

/**
 * Bulk-add favorites by slug (idempotent). Used to migrate guest/offline
 * localStorage favorites up to the server on login — never loses a like.
 * Returns how many valid products were matched.
 */
export async function addWishlistSlugs(userId: string, slugs: string[]): Promise<number> {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) return 0;
  const products = await prisma.product.findMany({
    where: { slug: { in: unique }, deletedAt: null },
    select: { id: true },
  });
  if (products.length === 0) return 0;
  await prisma.wishlistItem.createMany({
    data: products.map((p) => ({ userId, productId: p.id })),
    skipDuplicates: true,
  });
  return products.length;
}

/** Returns the resolved productId, or null if the slug doesn't match a product. */
export async function addWishlistBySlug(userId: string, slug: string): Promise<string | null> {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return null;
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: { userId, productId: product.id },
    update: {},
  });
  return product.id;
}

export async function removeWishlistBySlug(userId: string, slug: string): Promise<boolean> {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return false;
  await prisma.wishlistItem
    .delete({ where: { userId_productId: { userId, productId: product.id } } })
    .catch(() => {});
  return true;
}

/** All wishlisted slugs (for syncing the storefront FavButton localStorage). */
export async function listWishlistSlugs(userId: string): Promise<string[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId, product: { isActive: true } },
    select: { product: { select: { slug: true } } },
  });
  return rows.map((r) => r.product.slug);
}
