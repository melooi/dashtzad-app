// ============================================================
// Product variant service (ADMIN-CP3A): SKU generation + variant matrix draft.
// Pure/foundation logic; persistence (CRUD UI, DB writes) is ADMIN-CP3B.
// ============================================================

import { normalizeDigits, ensureUniqueSlug } from "@/lib/admin/slug";
import {
  calculateVariantPrice,
  normalizeWeightToGram,
  type BaseUnit,
} from "@/lib/admin/product-pricing";

export type PackagingTypeKey = "POUCH" | "TIN" | "VACUUM" | "BOX" | "BAG" | "SACK";

export type MarketingBadgeKey =
  | "BESTSELLER"
  | "DASHTZAD_PICK"
  | "ECONOMICAL"
  | "GIFT"
  | "DAILY"
  | "HOSTING"
  | "LIMITED"
  | "NEW";

/** Persian labels for marketing badges (UI is added in later checkpoints). */
export const MARKETING_BADGE_LABELS: Record<MarketingBadgeKey, string> = {
  BESTSELLER: "پرفروش",
  DASHTZAD_PICK: "پیشنهاد دشت‌زاد",
  ECONOMICAL: "اقتصادی‌تر",
  GIFT: "مناسب هدیه",
  DAILY: "مناسب مصرف روزانه",
  HOSTING: "مناسب پذیرایی",
  LIMITED: "محدود",
  NEW: "جدید",
};

/** Compact Latin weight token: 5g→"5G", 10000g→"10KG", 0.5g→"500MG". */
function gramToken(gramValue: number): string {
  if (Number.isInteger(gramValue)) {
    if (gramValue >= 1000 && gramValue % 1000 === 0) return `${gramValue / 1000}KG`;
    return `${gramValue}G`;
  }
  return `${Math.round(gramValue * 1000)}MG`;
}

/**
 * Latin-only, uppercase SKU from product slug + weight + packaging type. The
 * full packaging type name is used (POUCH/TIN/…). Persian/Arabic digits are
 * normalized; anything outside [A-Z0-9-] is stripped.
 */
export function generateVariantSku(
  productSlug: string,
  gramValue: number,
  packagingType?: PackagingTypeKey | null,
): string {
  const parts = [productSlug, gramToken(gramValue)];
  if (packagingType) parts.push(packagingType);
  return normalizeDigits(parts.join("-"))
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Make a SKU unique against an async existence check (SKU, SKU-2, SKU-3, …). */
export async function ensureUniqueSku(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  return ensureUniqueSlug(base, exists);
}

export type WeightChoice = {
  weightPresetId?: string;
  weightValue: number;
  weightUnit: BaseUnit;
};

export type PackagingChoice = {
  packagingOptionId?: string;
  type: PackagingTypeKey;
  cost_rial: number;
} | null;

export type VariantDraft = {
  weightPresetId?: string;
  packagingOptionId?: string;
  weightValue: number;
  weightUnit: BaseUnit;
  gramValue: number;
  sku: string;
  calculatedPrice_rial: number;
  price_rial: number;
  offPrice_rial: number | null;
  stock: number;
  isActive: boolean;
  isPriceLocked: boolean;
  marketingBadge: MarketingBadgeKey | null;
  sortOrder: number;
};

/**
 * Build a draft variant matrix (weights × packaging) with calculated prices and
 * unique-within-set SKUs. Pure: the admin reviews/edits these before they are
 * persisted in ADMIN-CP3B. Pass packagings=[null] for weight-only variants.
 */
export function generateVariantMatrix({
  productSlug,
  basePriceRial,
  basePriceUnit,
  weights,
  packagings,
}: {
  productSlug: string;
  basePriceRial: number;
  basePriceUnit: BaseUnit;
  weights: WeightChoice[];
  packagings: PackagingChoice[];
}): VariantDraft[] {
  const pkgs = packagings.length ? packagings : [null];
  const usedSkus = new Set<string>();
  const drafts: VariantDraft[] = [];
  let sortOrder = 0;

  for (const w of weights) {
    const gramValue = normalizeWeightToGram(w.weightValue, w.weightUnit);
    for (const pkg of pkgs) {
      const calculated = calculateVariantPrice({
        basePriceRial,
        basePriceUnit,
        gramValue,
        packagingCostRial: pkg?.cost_rial ?? 0,
      });

      let sku = generateVariantSku(productSlug, gramValue, pkg?.type ?? null);
      let n = 1;
      while (usedSkus.has(sku)) {
        n += 1;
        sku = `${generateVariantSku(productSlug, gramValue, pkg?.type ?? null)}-${n}`;
      }
      usedSkus.add(sku);

      drafts.push({
        weightPresetId: w.weightPresetId,
        packagingOptionId: pkg?.packagingOptionId,
        weightValue: w.weightValue,
        weightUnit: w.weightUnit,
        gramValue,
        sku,
        calculatedPrice_rial: calculated,
        price_rial: calculated,
        offPrice_rial: null,
        stock: 0,
        isActive: true,
        isPriceLocked: false,
        marketingBadge: null,
        sortOrder: sortOrder++,
      });
    }
  }

  return drafts;
}
