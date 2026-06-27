"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/admin/categories";
import {
  assertCategoryRules,
  nextAvailableCopySlug,
  categoryDeleteBlockReason,
} from "@/lib/admin/category-service";

const LIST_PATH = "/admin/collections/categories";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function createCategory(raw: CategoryFormInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌های فرم نامعتبر است." };
  }
  const values = parsed.data;

  const ruleError = await assertCategoryRules(values);
  if (ruleError) return { ok: false, error: ruleError };

  const created = await prisma.category.create({
    data: {
      title: values.title,
      slug: values.slug,
      type: values.type,
      parentId: values.parentId,
      englishTitle: values.englishTitle,
      description: values.description,
    },
  });

  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}

export async function updateCategory(id: string, raw: CategoryFormInput): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "دسته‌بندی یافت نشد." };

  const parsed = categoryFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌های فرم نامعتبر است." };
  }
  const values = parsed.data;

  const ruleError = await assertCategoryRules(values, { excludeId: id });
  if (ruleError) return { ok: false, error: ruleError };

  await prisma.category.update({
    where: { id },
    data: {
      title: values.title,
      slug: values.slug,
      type: values.type,
      parentId: values.parentId,
      englishTitle: values.englishTitle,
      description: values.description,
    },
  });

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  const blockReason = await categoryDeleteBlockReason(id);
  if (blockReason) return { ok: false, error: blockReason };

  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(LIST_PATH);
  return { ok: true, id };
}

export async function duplicateCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  const src = await prisma.category.findUnique({ where: { id } });
  if (!src) return { ok: false, error: "دسته‌بندی یافت نشد." };

  const slug = await nextAvailableCopySlug(src.slug);

  const created = await prisma.category.create({
    data: {
      title: `${src.title} (کپی)`,
      slug,
      type: src.type,
      parentId: src.parentId,
      englishTitle: src.englishTitle,
      description: src.description,
    },
  });

  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}
