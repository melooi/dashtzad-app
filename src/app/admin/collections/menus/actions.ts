"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { getHeaderConfig, getFooterConfig } from "@/lib/admin/global-service";
import {
  menuFormSchema,
  menuItemSchema,
  type MenuFormInput,
  type MenuItemInput,
} from "@/lib/admin/site-experience";

const LIST_PATH = "/admin/collections/menus";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

// ---- Menus ----
export async function createMenu(raw: MenuFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = menuFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) =>
    Boolean(await prisma.menu.findUnique({ where: { slug: s } })),
  );
  const created = await prisma.menu.create({ data: { ...parsed.data, slug } });
  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}

export async function updateMenu(id: string, raw: MenuFormInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.menu.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "منو یافت نشد." };

  const parsed = menuFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) => {
    const hit = await prisma.menu.findUnique({ where: { slug: s } });
    return Boolean(hit && hit.id !== id);
  });
  await prisma.menu.update({ where: { id }, data: { ...parsed.data, slug } });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath("/");
  return { ok: true, id };
}

/** Which header/footer global slots reference this menu (blocks deletion). */
async function menuUsage(id: string): Promise<string[]> {
  const [header, footer] = await Promise.all([getHeaderConfig(), getFooterConfig()]);
  const used: string[] = [];
  if (header.mainMenuId === id) used.push("هدر (منوی اصلی)");
  if (header.secondaryMenuId === id) used.push("هدر (منوی فرعی)");
  if (header.megaMenuId === id) used.push("هدر (مگامنو)");
  if (header.bottomNavMenuId === id) used.push("ناوبری پایین موبایل");
  if (footer.footerMenuPrimaryId === id) used.push("فوتر (ستون اول)");
  if (footer.footerMenuSecondaryId === id) used.push("فوتر (ستون دوم)");
  if (footer.footerMenuTertiaryId === id) used.push("فوتر (ستون سوم)");
  if (footer.footerMenuQuaternaryId === id) used.push("فوتر (ستون چهارم)");
  return used;
}

export async function deleteMenu(id: string): Promise<ActionResult> {
  await requireAdmin();
  const used = await menuUsage(id);
  if (used.length > 0) {
    return {
      ok: false,
      error: `این منو در ${used.join("، ")} استفاده شده است. ابتدا آن را از تنظیمات مربوطه بردارید.`,
    };
  }
  await prisma.menu.delete({ where: { id } }); // items cascade
  revalidatePath(LIST_PATH);
  return { ok: true, id };
}

// ---- Menu items ----
export async function saveMenuItem(
  menuId: string,
  itemId: string | null,
  raw: MenuItemInput,
): Promise<ActionResult> {
  await requireAdmin();
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu) return { ok: false, error: "منو یافت نشد." };

  const parsed = menuItemSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  // Guard: parent must belong to the same menu and not be the item itself.
  if (parsed.data.parentId) {
    if (parsed.data.parentId === itemId) return { ok: false, error: "یک مورد نمی‌تواند والد خودش باشد." };
    const parent = await prisma.menuItem.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent || parent.menuId !== menuId) return { ok: false, error: "والد انتخاب‌شده نامعتبر است." };
  }

  let id = itemId ?? "";
  if (itemId) {
    await prisma.menuItem.update({ where: { id: itemId }, data: parsed.data });
  } else {
    const count = await prisma.menuItem.count({ where: { menuId, parentId: parsed.data.parentId } });
    const created = await prisma.menuItem.create({
      data: { ...parsed.data, menuId, sortOrder: parsed.data.sortOrder || count },
    });
    id = created.id;
  }
  revalidatePath(`${LIST_PATH}/${menuId}`);
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  await requireAdmin();
  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };
  await prisma.menuItem.delete({ where: { id: itemId } }); // children cascade
  revalidatePath(`${LIST_PATH}/${item.menuId}`);
  revalidatePath("/");
  return { ok: true, id: itemId };
}

/** Swap a menu item with its sibling (same parent) in sort order. */
export async function moveMenuItem(itemId: string, dir: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };

  const siblings = await prisma.menuItem.findMany({
    where: { menuId: item.menuId, parentId: item.parentId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const i = siblings.findIndex((x) => x.id === itemId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= siblings.length) return { ok: true, id: itemId };

  await prisma.$transaction([
    prisma.menuItem.update({ where: { id: siblings[i].id }, data: { sortOrder: j } }),
    prisma.menuItem.update({ where: { id: siblings[j].id }, data: { sortOrder: i } }),
  ]);
  revalidatePath(`${LIST_PATH}/${item.menuId}`);
  revalidatePath("/");
  return { ok: true, id: itemId };
}
