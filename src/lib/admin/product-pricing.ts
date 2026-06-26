// ============================================================
// Product pricing engine (ADMIN-CP3A).
//
// Money rule (locked, SKILL §D): admin input is Toman, database stores Rial
// (Rial = Toman × 10). All amounts here are integer Rial.
//
// Variant price formula:
//   calculatedPrice_rial = (base price ÷ base unit, per gram) × variant grams
//                        + packaging cost
// For a UNIT-based product, weight is irrelevant: price = base + packaging.
// ============================================================

export type BaseUnit = "GRAM" | "KILOGRAM" | "UNIT";

/** Admin-facing Toman → stored Rial. */
export function convertTomanToRial(toman: number): number {
  return Math.round(toman) * 10;
}

/** Stored Rial → displayed Toman. */
export function convertRialToToman(rial: number): number {
  return Math.round(rial / 10);
}

/** Normalize a (value, unit) weight to grams. UNIT returns the value unchanged. */
export function normalizeWeightToGram(value: number, unit: BaseUnit): number {
  switch (unit) {
    case "KILOGRAM":
      return value * 1000;
    case "GRAM":
    case "UNIT":
    default:
      return value;
  }
}

/** Grams represented by one base-price unit (for per-gram conversion). */
function unitInGrams(unit: BaseUnit): number {
  return unit === "KILOGRAM" ? 1000 : 1;
}

export type VariantPriceInput = {
  basePriceRial: number;
  basePriceUnit: BaseUnit;
  /** normalized grams of the variant */
  gramValue: number;
  packagingCostRial?: number;
};

/** Engine: compute a variant's calculated price in integer Rial. */
export function calculateVariantPrice({
  basePriceRial,
  basePriceUnit,
  gramValue,
  packagingCostRial = 0,
}: VariantPriceInput): number {
  if (basePriceUnit === "UNIT") {
    return Math.round(basePriceRial) + Math.round(packagingCostRial);
  }
  const pricePerGram = basePriceRial / unitInGrams(basePriceUnit);
  return Math.round(pricePerGram * gramValue) + Math.round(packagingCostRial);
}

/**
 * Effective sale price: when a variant's price is locked the engine must NOT
 * overwrite the admin's manual price; otherwise it follows the calculated price.
 */
export function effectiveVariantPrice(variant: {
  calculatedPrice_rial: number;
  price_rial: number;
  isPriceLocked: boolean;
}): number {
  return variant.isPriceLocked ? variant.price_rial : variant.calculatedPrice_rial;
}
