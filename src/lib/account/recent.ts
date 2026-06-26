// Recently-viewed products for logged-in users. Recorded server-side on PDP
// render (fire-and-forget upsert); listed in the account panel.
import { prisma } from "@/lib/prisma";
import { PRODUCT_CARD_SELECT, toAccountCard } from "./cards";
import type { AccountProductCard } from "./types";

const MAX_RECENT = 24;

/**
 * Record (or refresh) a product view for a user. Safe to await-less; swallows
 * errors so it never breaks a page render. No-op for guests (userId null).
 */
export async function recordProductView(
  userId: string | null | undefined,
  productId: string,
): Promise<void> {
  if (!userId) return;
  try {
    await prisma.recentProductView.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: { viewedAt: new Date() },
    });
  } catch {
    /* never block a render on view tracking */
  }
}

/** Record a view by product slug (used by the PDP client beacon). */
export async function recordProductViewBySlug(userId: string, slug: string): Promise<void> {
  const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (p) await recordProductView(userId, p.id);
}

export async function listRecent(userId: string): Promise<AccountProductCard[]> {
  const rows = await prisma.recentProductView.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { viewedAt: "desc" },
    take: MAX_RECENT,
    select: { product: { select: PRODUCT_CARD_SELECT } },
  });
  return rows.map((r) => toAccountCard(r.product));
}

export async function countRecent(userId: string): Promise<number> {
  return prisma.recentProductView.count({ where: { userId, product: { isActive: true } } });
}
