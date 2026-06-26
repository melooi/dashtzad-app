import dayjs from "dayjs";
import jalaliday from "jalaliday";
import { toPersianNumbers } from "@/lib/price";

dayjs.extend(jalaliday);

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

/** Format a date as a Jalali Persian date, e.g. "۲۴ خرداد ۱۴۰۵". */
export function formatJalali(date: Date | string): string {
  const d = dayjs(date).calendar("jalali");
  const day = d.date();
  const month = FA_MONTHS[d.month()];
  const year = d.year();
  return `${toPersianNumbers(day)} ${month} ${toPersianNumbers(year)}`;
}

/** Format a date as a numeric Jalali date in Persian digits, e.g. "۱۳۷۳/۸/۲۷". */
export function formatJalaliNumeric(date: Date | string): string {
  const d = dayjs(date).calendar("jalali");
  return `${toPersianNumbers(d.year())}/${toPersianNumbers(d.month() + 1)}/${toPersianNumbers(
    d.date(),
  )}`;
}

/** Time-of-day in Persian digits, e.g. "۱۴:۰۵". Deterministic (no "now"). */
export function formatTimeFa(date: Date | string): string {
  const d = dayjs(date);
  const hh = String(d.hour()).padStart(2, "0");
  const mm = String(d.minute()).padStart(2, "0");
  return `${toPersianNumbers(hh)}:${toPersianNumbers(mm)}`;
}

/**
 * Compact relative time in Persian: «هم‌اکنون» / «۵ دقیقه پیش» / «۳ ساعت پیش» /
 * «۲ روز پیش», falling back to a Jalali date for anything older than a week.
 * Reads the current time, so only call it client-side (e.g. via a mounted
 * guard) to avoid hydration mismatches.
 */
export function formatRelativeFa(date: Date | string): string {
  const then = dayjs(date);
  const diffSec = dayjs().diff(then, "second");
  if (diffSec < 45) return "هم‌اکنون";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${toPersianNumbers(diffMin)} دقیقه پیش`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${toPersianNumbers(diffHr)} ساعت پیش`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${toPersianNumbers(diffDay)} روز پیش`;
  return formatJalali(then.toDate());
}

/**
 * Parse a user-entered Jalali date ("۱۳۷۳/۸/۲۷" or "1373-8-27") into a Gregorian
 * Date. Returns null if the shape is invalid or the date doesn't exist. Persian
 * digits and both `/` and `-` separators are accepted.
 */
export function parseJalaliInput(input: string): Date | null {
  const en = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .trim();
  const m = en.match(/^(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!m) return null;
  const [, jy, jm, jd] = m;
  const d = dayjs(`${jy}/${jm}/${jd}`, { jalali: true } as never);
  if (!d.isValid()) return null;
  // Reject overflow (dayjs is lenient): round-trip must match the input parts.
  const back = dayjs(d.toDate()).calendar("jalali");
  if (back.year() !== +jy || back.month() + 1 !== +jm || back.date() !== +jd) return null;
  const date = d.toDate();
  return Number.isNaN(date.getTime()) ? null : date;
}
