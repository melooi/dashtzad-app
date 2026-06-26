import crypto from "node:crypto";
import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

/** Order number: jalali date (YYYYMMDD) + short random suffix, e.g. DZ-14050324-9F3A1B. */
export function generateOrderNumber(): string {
  const d = dayjs().calendar("jalali");
  const ymd = `${d.year()}${String(d.month() + 1).padStart(2, "0")}${String(d.date()).padStart(2, "0")}`;
  const nano = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DZ-${ymd}-${nano}`;
}

export type TotalsInput = {
  unitPriceRial: number; // effective unit price (offPrice if any)
  basePriceRial: number; // original unit price
  quantity: number;
}[];

/** Compute order money totals in Rial. */
export function calculateTotals(items: TotalsInput) {
  const subtotalRial = items.reduce((s, i) => s + i.basePriceRial * i.quantity, 0);
  const totalRial = items.reduce((s, i) => s + i.unitPriceRial * i.quantity, 0);
  const discountRial = subtotalRial - totalRial;
  return { subtotalRial, discountRial, totalRial };
}
