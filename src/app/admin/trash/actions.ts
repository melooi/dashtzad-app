"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { removeStoredFile } from "@/lib/media/service";

export type TrashActionResult = { ok: true } | { ok: false; error: string };

const TRASH_PATH = "/admin/trash";

// ---- Restore ----

export async function restoreProduct(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/products");
  return { ok: true };
}

export async function restorePost(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.post.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/content/articles");
  return { ok: true };
}

export async function restoreCategory(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/categories");
  return { ok: true };
}

export async function restoreBanner(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/banners");
  return { ok: true };
}

export async function restoreCoupon(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/coupons");
  return { ok: true };
}

export async function restoreContentSeries(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.contentSeries.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/content/case-files");
  return { ok: true };
}

export async function restoreMenu(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.menu.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/menus");
  return { ok: true };
}

export async function restoreMenuItem(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };
  await prisma.menuItem.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath(`/admin/collections/menus/${item.menuId}`);
  return { ok: true };
}

export async function restoreFaqGroup(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.fAQGroup.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/collections/faqs");
  return { ok: true };
}

export async function restoreFaqItem(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  const item = await prisma.fAQItem.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };
  await prisma.fAQItem.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath(`/admin/collections/faqs/${item.groupId}`);
  return { ok: true };
}

export async function restoreMediaAsset(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.mediaAsset.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath(TRASH_PATH);
  revalidatePath("/admin/media");
  return { ok: true };
}

// ---- Permanent delete ----

export async function permanentDeleteProduct(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeletePost(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteCategory(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteBanner(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteCoupon(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteContentSeries(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.contentSeries.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteMenu(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.menu.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteMenuItem(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteFaqGroup(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.fAQGroup.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteFaqItem(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  await prisma.fAQItem.delete({ where: { id } });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

export async function permanentDeleteMediaAsset(id: string): Promise<TrashActionResult> {
  await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false, error: "فایل یافت نشد." };

  await prisma.mediaAsset.delete({ where: { id } });
  await removeStoredFile({ storage: asset.storage, path: asset.path, publicId: asset.publicId });
  revalidatePath(TRASH_PATH);
  return { ok: true };
}

// ---- Empty all trash ----

export async function emptyTrash(): Promise<TrashActionResult> {
  await requireAdmin();

  const [products, posts, categories, banners, coupons, series, menus, menuItems, faqGroups, faqItems, mediaAssets] =
    await Promise.all([
      prisma.product.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.post.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.category.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.banner.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.coupon.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.contentSeries.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.menu.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.menuItem.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.fAQGroup.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.fAQItem.findMany({ where: { deletedAt: { not: null } }, select: { id: true } }),
      prisma.mediaAsset.findMany({ where: { deletedAt: { not: null } }, select: { id: true, storage: true, path: true, publicId: true } }),
    ]);

  await Promise.all([
    ...products.map((r) => prisma.product.delete({ where: { id: r.id } })),
    ...posts.map((r) => prisma.post.delete({ where: { id: r.id } })),
    ...categories.map((r) => prisma.category.delete({ where: { id: r.id } })),
    ...banners.map((r) => prisma.banner.delete({ where: { id: r.id } })),
    ...coupons.map((r) => prisma.coupon.delete({ where: { id: r.id } })),
    ...series.map((r) => prisma.contentSeries.delete({ where: { id: r.id } })),
    ...menus.map((r) => prisma.menu.delete({ where: { id: r.id } })),
    ...menuItems.map((r) => prisma.menuItem.delete({ where: { id: r.id } })),
    ...faqGroups.map((r) => prisma.fAQGroup.delete({ where: { id: r.id } })),
    ...faqItems.map((r) => prisma.fAQItem.delete({ where: { id: r.id } })),
    ...mediaAssets.map((r) => prisma.mediaAsset.delete({ where: { id: r.id } })),
  ]);

  // Remove physical media files after DB rows are gone.
  await Promise.allSettled(
    mediaAssets.map((a) => removeStoredFile({ storage: a.storage, path: a.path, publicId: a.publicId })),
  );

  revalidatePath(TRASH_PATH);
  return { ok: true };
}
