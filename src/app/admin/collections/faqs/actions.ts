"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import {
  faqGroupSchema,
  faqItemSchema,
  type FaqGroupInput,
  type FaqItemInput,
} from "@/lib/admin/site-experience";

const LIST_PATH = "/admin/collections/faqs";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

// ---- Groups ----
export async function createFaqGroup(raw: FaqGroupInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = faqGroupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) =>
    Boolean(await prisma.fAQGroup.findUnique({ where: { slug: s } })),
  );
  const created = await prisma.fAQGroup.create({ data: { ...parsed.data, slug } });
  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}

export async function updateFaqGroup(id: string, raw: FaqGroupInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.fAQGroup.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "گروه یافت نشد." };

  const parsed = faqGroupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) => {
    const hit = await prisma.fAQGroup.findUnique({ where: { slug: s } });
    return Boolean(hit && hit.id !== id);
  });
  await prisma.fAQGroup.update({ where: { id }, data: { ...parsed.data, slug } });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true, id };
}

export async function deleteFaqGroup(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.fAQGroup.delete({ where: { id } }); // items cascade
  revalidatePath(LIST_PATH);
  return { ok: true, id };
}

// ---- Items ----
export async function saveFaqItem(
  groupId: string,
  itemId: string | null,
  raw: FaqItemInput,
): Promise<ActionResult> {
  await requireAdmin();
  const group = await prisma.fAQGroup.findUnique({ where: { id: groupId } });
  if (!group) return { ok: false, error: "گروه یافت نشد." };

  const parsed = faqItemSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  let id = itemId ?? "";
  if (itemId) {
    await prisma.fAQItem.update({ where: { id: itemId }, data: parsed.data });
  } else {
    const count = await prisma.fAQItem.count({ where: { groupId } });
    const created = await prisma.fAQItem.create({
      data: { ...parsed.data, groupId, sortOrder: parsed.data.sortOrder || count },
    });
    id = created.id;
  }
  revalidatePath(`${LIST_PATH}/${groupId}`);
  return { ok: true, id };
}

export async function deleteFaqItem(itemId: string): Promise<ActionResult> {
  await requireAdmin();
  const item = await prisma.fAQItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };
  await prisma.fAQItem.delete({ where: { id: itemId } });
  revalidatePath(`${LIST_PATH}/${item.groupId}`);
  return { ok: true, id: itemId };
}

/** Swap a FAQ item with its neighbour in sort order. */
export async function moveFaqItem(itemId: string, dir: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const item = await prisma.fAQItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false, error: "مورد یافت نشد." };

  const items = await prisma.fAQItem.findMany({
    where: { groupId: item.groupId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const i = items.findIndex((x) => x.id === itemId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= items.length) return { ok: true, id: itemId };

  await prisma.$transaction([
    prisma.fAQItem.update({ where: { id: items[i].id }, data: { sortOrder: j } }),
    prisma.fAQItem.update({ where: { id: items[j].id }, data: { sortOrder: i } }),
  ]);
  revalidatePath(`${LIST_PATH}/${item.groupId}`);
  return { ok: true, id: itemId };
}
