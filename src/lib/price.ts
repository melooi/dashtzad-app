// Price rules (locked, SKILL §D):
// - stored as integer Rial
// - displayed in Toman = Rial / 10
// - always show the toman.svg icon, never the word
// - numbers shown in Persian digits with thousands separators

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianNumbers(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Inverse of toPersianNumbers: convert Persian (and Arabic-Indic) digits to ASCII. */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function toPersianNumbersWithComma(input: string | number): string {
  const n = String(input).replace(/[^\d]/g, "");
  const withComma = n.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toPersianNumbers(withComma);
}

/** Convert stored Rial to displayed Toman. */
export function rialToToman(rial: number): number {
  return Math.round(rial / 10);
}

/** Format a Rial amount as a Persian Toman string (no icon). */
export function formatToman(rial: number): string {
  return toPersianNumbersWithComma(rialToToman(rial));
}

/** Discount percent from price + offPrice (Rial). 0 if no real discount. */
export function discountPercent(priceRial: number, offRial?: number | null): number {
  if (!offRial || offRial >= priceRial || priceRial <= 0) return 0;
  return Math.round(((priceRial - offRial) / priceRial) * 100);
}
