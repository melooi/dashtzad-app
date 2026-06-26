"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { convertTomanToRial } from "@/lib/admin/product-pricing";
import {
  weightPresetSchema,
  packagingSchema,
  type WeightPresetInput,
  type PackagingInput,
} from "@/lib/admin/products";

const WEIGHTS = "/admin/collections/weights-packaging/weights";
const PACKAGING = "/admin/collections/weights-packaging/packaging";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

// ---- Weight presets ----
export async function saveWeightPreset(
  id: string | null,
  raw: WeightPresetInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = weightPresetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." };
  const v = parsed.data;
  const data = {
    title: v.title,
    gramValue: v.gramValue,
    compatibility: v.compatibility,
    sortOrder: v.sortOrder ?? 0,
    isActive: v.isActive,
  };

  const saved = id
    ? await prisma.weightPreset.update({ where: { id }, data })
    : await prisma.weightPreset.create({ data });
  revalidatePath(WEIGHTS);
  return { ok: true, id: saved.id };
}

export async function deleteWeightPreset(id: string): Promise<ActionResult> {
  await requireAdmin();
  const inUse = await prisma.productVariant.count({ where: { weightPresetId: id } });
  if (inUse > 0) {
    return { ok: false, error: "این وزن در مدل‌های فروش محصولات استفاده شده و قابل حذف نیست." };
  }
  await prisma.weightPreset.delete({ where: { id } });
  revalidatePath(WEIGHTS);
  return { ok: true, id };
}

// ---- Packaging options ----
export async function savePackaging(
  id: string | null,
  raw: PackagingInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = packagingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." };
  const v = parsed.data;
  const data = {
    title: v.title,
    type: v.type,
    capacityGram: v.capacityGram,
    cost_rial: convertTomanToRial(v.costToman),
    compatibility: v.compatibility,
    sortOrder: v.sortOrder ?? 0,
    isActive: v.isActive,
  };

  const saved = id
    ? await prisma.packagingOption.update({ where: { id }, data })
    : await prisma.packagingOption.create({ data });
  revalidatePath(PACKAGING);
  return { ok: true, id: saved.id };
}

export async function deletePackaging(id: string): Promise<ActionResult> {
  await requireAdmin();
  const inUse = await prisma.productVariant.count({ where: { packagingOptionId: id } });
  if (inUse > 0) {
    return { ok: false, error: "این بسته‌بندی در مدل‌های فروش محصولات استفاده شده و قابل حذف نیست." };
  }
  await prisma.packagingOption.delete({ where: { id } });
  revalidatePath(PACKAGING);
  return { ok: true, id };
}
