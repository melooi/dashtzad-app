import { prisma } from "@/lib/prisma";
import { normalizeCouponCode } from "@/lib/admin/coupons";

// Coupon business logic that talks to the DB (no auth, no revalidation) so it
// can be integration-tested directly and reused by the server actions.

/**
 * Ensure a coupon code is unique. Returns a Persian error message, or null if
 * the (normalized) code is free. `excludeId` skips the row being edited.
 */
export async function assertCouponCodeUnique(
  code: string,
  opts: { excludeId?: string } = {},
): Promise<string | null> {
  const normalized = normalizeCouponCode(code);
  const owner = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (owner && owner.id !== opts.excludeId) {
    return "این کد قبلاً برای کوپن دیگری ثبت شده است.";
  }
  return null;
}

/**
 * PURE guard: given a coupon's relation/usage counts, return the Persian reason
 * it cannot be hard-deleted (and should be deactivated instead), or null if it
 * is safe to delete. A coupon is considered "used" if it is referenced by any
 * order or cart, or its usageCount is above zero.
 */
export function canDeleteCoupon(counts: {
  orders: number;
  carts: number;
  usageCount: number;
}): string | null {
  if (counts.orders > 0) {
    return "این کوپن در سفارش‌ها استفاده شده است و قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید.";
  }
  if (counts.carts > 0) {
    return "این کوپن در سبد خرید کاربران به‌کار رفته است؛ به‌جای حذف، آن را غیرفعال کنید.";
  }
  if (counts.usageCount > 0) {
    return "این کوپن قبلاً استفاده شده است؛ به‌جای حذف، آن را غیرفعال کنید.";
  }
  return null;
}

/**
 * DB wrapper around canDeleteCoupon: loads the coupon's order/cart counts and
 * usageCount, then returns the block reason (or null if safe to delete).
 */
export async function couponDeleteBlockReason(id: string): Promise<string | null> {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: {
      usageCount: true,
      _count: { select: { orders: true, carts: true } },
    },
  });
  if (!coupon) return "کوپن یافت نشد.";
  return canDeleteCoupon({
    orders: coupon._count.orders,
    carts: coupon._count.carts,
    usageCount: coupon.usageCount,
  });
}
