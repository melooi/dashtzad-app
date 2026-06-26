"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { convertTomanToRial } from "@/lib/admin/product-pricing";
import {
  recalcProductVariants,
  recalcVariantsUsingPackaging,
} from "@/lib/admin/product-service";
import {
  PRICE_MESSAGES,
  parseTomanRequired,
  parseTomanNullable,
  parsePackagingToman,
  parseStock,
} from "@/lib/admin/pricing-input";

const PRICING = "/admin/collections/pricing";
const PRODUCTS = "/admin/collections/products";
const PACKAGING = "/admin/collections/weights-packaging/packaging";

export type PricingActionResult =
  | { ok: true; rangeLabelRial?: { min: number | null; max: number | null } }
  | { ok: false; error: string };

const isUuid = (s: unknown): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// ------------------------------------------------------------
// Product base price → updates basePrice_rial (+ legacy price_rial in sync),
// then recalculates unlocked variants. Locked variants keep their manual price.
// ------------------------------------------------------------
export async function updateProductBasePriceAction(
  productId: string,
  amountToman: string,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(productId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const parsed = parseTomanRequired(amountToman);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { ok: false, error: PRICE_MESSAGES.notFound };

  const basePriceRial = convertTomanToRial(parsed.value);
  // Keep legacy price_rial in lock-step with base price (codebase invariant).
  await prisma.product.update({
    where: { id: productId },
    data: { basePrice_rial: basePriceRial, price_rial: basePriceRial },
  });

  const { minRial, maxRial } = await recalcProductVariants(productId);

  revalidatePath(PRICING);
  revalidatePath(`${PRODUCTS}/${productId}`);
  return { ok: true, rangeLabelRial: { min: minRial, max: maxRial } };
}

// ------------------------------------------------------------
// Variant final price → manual edit locks the variant by default
// (lockMode "keep-unlocked" sets the price without locking).
// calculatedPrice_rial (engine output) is left intact.
// ------------------------------------------------------------
export async function updateVariantPriceAction(
  variantId: string,
  amountToman: string,
  lockMode: "lock" | "keep-unlocked" = "lock",
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(variantId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const parsed = parseTomanRequired(amountToman);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, offPrice_rial: true },
  });
  if (!variant) return { ok: false, error: PRICE_MESSAGES.notFound };

  const priceRial = convertTomanToRial(parsed.value);
  // Guard the invariant offPrice < price after the price drops.
  if (variant.offPrice_rial != null && variant.offPrice_rial >= priceRial) {
    return { ok: false, error: PRICE_MESSAGES.offTooHigh };
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { price_rial: priceRial, isPriceLocked: lockMode === "lock" },
  });

  revalidatePath(PRICING);
  return { ok: true };
}

// ------------------------------------------------------------
// Variant discount (off) price. Empty → clears it. Must be < final price.
// ------------------------------------------------------------
export async function updateVariantOffPriceAction(
  variantId: string,
  amountToman: string,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(variantId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const parsed = parseTomanNullable(amountToman);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, price_rial: true },
  });
  if (!variant) return { ok: false, error: PRICE_MESSAGES.notFound };

  const offRial = parsed.value == null ? null : convertTomanToRial(parsed.value);
  if (offRial != null && offRial >= variant.price_rial) {
    return { ok: false, error: PRICE_MESSAGES.offTooHigh };
  }

  await prisma.productVariant.update({ where: { id: variantId }, data: { offPrice_rial: offRial } });

  revalidatePath(PRICING);
  return { ok: true };
}

// ------------------------------------------------------------
// Variant stock (>= 0 integer, no Toman conversion).
// ------------------------------------------------------------
export async function updateVariantStockAction(
  variantId: string,
  stock: string,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(variantId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const parsed = parseStock(stock);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { id: true } });
  if (!variant) return { ok: false, error: PRICE_MESSAGES.notFound };

  await prisma.productVariant.update({ where: { id: variantId }, data: { stock: parsed.value } });

  revalidatePath(PRICING);
  return { ok: true };
}

// ------------------------------------------------------------
// Toggle manual price lock. Unlocking re-binds price to calculatedPrice_rial
// (variant follows the engine again).
// ------------------------------------------------------------
export async function toggleVariantPriceLockAction(
  variantId: string,
  isLocked: boolean,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(variantId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, calculatedPrice_rial: true },
  });
  if (!variant) return { ok: false, error: PRICE_MESSAGES.notFound };

  await prisma.productVariant.update({
    where: { id: variantId },
    data: isLocked
      ? { isPriceLocked: true }
      : { isPriceLocked: false, price_rial: variant.calculatedPrice_rial },
  });

  revalidatePath(PRICING);
  return { ok: true };
}

// ------------------------------------------------------------
// Variant active/inactive toggle.
// ------------------------------------------------------------
export async function toggleVariantActiveAction(
  variantId: string,
  isActive: boolean,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(variantId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { id: true } });
  if (!variant) return { ok: false, error: PRICE_MESSAGES.notFound };

  await prisma.productVariant.update({ where: { id: variantId }, data: { isActive } });

  revalidatePath(PRICING);
  return { ok: true };
}

// ------------------------------------------------------------
// Packaging cost (allows 0). Recalculates unlocked variants that use it.
// ------------------------------------------------------------
export async function updatePackagingCostAction(
  packagingId: string,
  amountToman: string,
): Promise<PricingActionResult> {
  await requireAdmin();
  if (!isUuid(packagingId)) return { ok: false, error: PRICE_MESSAGES.notFound };

  const parsed = parsePackagingToman(amountToman);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const packaging = await prisma.packagingOption.findUnique({ where: { id: packagingId }, select: { id: true } });
  if (!packaging) return { ok: false, error: PRICE_MESSAGES.notFound };

  await prisma.packagingOption.update({
    where: { id: packagingId },
    data: { cost_rial: convertTomanToRial(parsed.value) },
  });

  await recalcVariantsUsingPackaging(packagingId);

  revalidatePath(PRICING);
  revalidatePath(PACKAGING);
  return { ok: true };
}
