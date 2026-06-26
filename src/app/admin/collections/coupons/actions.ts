"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { couponFormSchema, type CouponFormInput } from "@/lib/admin/coupons";
import { assertCouponCodeUnique, couponDeleteBlockReason } from "@/lib/admin/coupon-service";

const LIST_PATH = "/admin/collections/coupons";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Map parsed form values → Prisma data. Admin enters TOMAN; FIXED amount,
 * minOrder and maxDiscount are converted to integer RIAL (× ۱۰). PERCENT
 * `amount` is the raw 1–100 percentage. `usageCount` is never written here
 * (defaults to 0 on create; left untouched on update).
 */
function toData(v: ReturnType<typeof couponFormSchema.parse>) {
  return {
    code: v.code,
    title: v.title,
    description: v.description,
    type: v.type,
    amount: v.type === "PERCENT" ? v.value : v.value * 10,
    // A percent cap only applies to PERCENT coupons.
    maxDiscount_rial: v.type === "PERCENT" && v.maxDiscount !== null ? v.maxDiscount * 10 : null,
    minOrder_rial: v.minOrder === null ? null : v.minOrder * 10,
    usageLimit: v.usageLimit,
    perUserLimit: v.perUserLimit,
    firstOrderOnly: v.firstOrderOnly,
    startsAt: v.startsAt ? new Date(v.startsAt) : null,
    expiresAt: new Date(v.expiresAt),
    isActive: v.isActive,
  };
}

export async function createCoupon(raw: CouponFormInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = couponFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌های فرم نامعتبر است." };
  }

  const dupe = await assertCouponCodeUnique(parsed.data.code);
  if (dupe) return { ok: false, error: dupe };

  const created = await prisma.coupon.create({ data: toData(parsed.data) });
  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}

export async function updateCoupon(id: string, raw: CouponFormInput): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "کوپن یافت نشد." };

  const parsed = couponFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌های فرم نامعتبر است." };
  }

  const dupe = await assertCouponCodeUnique(parsed.data.code, { excludeId: id });
  if (dupe) return { ok: false, error: dupe };

  await prisma.coupon.update({ where: { id }, data: toData(parsed.data) });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true, id };
}

/** Toggle isActive — the preferred soft alternative to deleting a used coupon. */
export async function setCouponActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "کوپن یافت نشد." };

  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true, id };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireAdmin();

  const blockReason = await couponDeleteBlockReason(id);
  if (blockReason) return { ok: false, error: blockReason };

  await prisma.coupon.delete({ where: { id } });
  revalidatePath(LIST_PATH);
  return { ok: true, id };
}
