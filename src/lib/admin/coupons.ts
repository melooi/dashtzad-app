import { z } from "zod";
import { normalizeDigits } from "@/lib/admin/slug";
import { formatToman, toPersianNumbers } from "@/lib/price";

// ============================================================
// Coupon — labels, options, the shared Zod schema (used by BOTH the client
// form resolver and the server actions), and the PURE business logic
// (normalize / validate / status / summary / preview). No DB, no auth here so
// every function below is unit-testable in isolation.
//
// Money rule (SKILL §D): admin enters TOMAN; values are stored as integer RIAL
// (× ۱۰). FIXED `amount`, `minOrder_rial`, `maxDiscount_rial` are all Rial.
// PERCENT `amount` is a 1–100 percentage (no conversion).
// ============================================================

export type CouponType = "PERCENT" | "FIXED";

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENT: "درصدی",
  FIXED: "مبلغ ثابت",
};

export const COUPON_TYPE_OPTIONS: { value: CouponType; label: string }[] = [
  { value: "PERCENT", label: "درصدی" },
  { value: "FIXED", label: "مبلغ ثابت" },
];

export type CouponStatusKey = "ACTIVE" | "INACTIVE" | "EXPIRED" | "SCHEDULED" | "EXHAUSTED";
export type StatusTone = "green" | "gray" | "red" | "blue" | "amber";

export const COUPON_STATUS_META: Record<CouponStatusKey, { label: string; tone: StatusTone }> = {
  ACTIVE: { label: "فعال", tone: "green" },
  INACTIVE: { label: "غیرفعال", tone: "gray" },
  EXPIRED: { label: "منقضی‌شده", tone: "red" },
  SCHEDULED: { label: "آینده", tone: "blue" },
  EXHAUSTED: { label: "سقف مصرف پر شده", tone: "amber" },
};

export const COUPON_STATUS_FILTER_OPTIONS = [
  { value: "", label: "همه‌ی وضعیت‌ها" },
  { value: "ACTIVE", label: "فعال" },
  { value: "INACTIVE", label: "غیرفعال" },
  { value: "EXPIRED", label: "منقضی‌شده" },
  { value: "SCHEDULED", label: "آینده" },
  { value: "EXHAUSTED", label: "سقف مصرف پر شده" },
];

// ============================================================
// Pure validation helpers (also reused by the Zod schema below)
// ============================================================

/** Allowed code characters: uppercase Latin letters, digits, hyphen, underscore. */
export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]+$/;
export const COUPON_CODE_MIN = 2;
export const COUPON_CODE_MAX = 40;

/**
 * Normalize a coupon code: Persian/Arabic digits → English, trim outer spaces,
 * uppercase. Does NOT strip internal spaces/invalid chars — those are rejected
 * by validateCouponCode so the admin sees a clear error.
 */
export function normalizeCouponCode(input: string): string {
  return normalizeDigits(input ?? "").trim().toUpperCase();
}

/** Returns a Persian error message for an invalid code, or null if valid. */
export function validateCouponCode(raw: string): string | null {
  const code = normalizeCouponCode(raw);
  if (code.length < COUPON_CODE_MIN) return "کد تخفیف باید حداقل ۲ نویسه باشد.";
  if (code.length > COUPON_CODE_MAX) return "کد تخفیف نباید بیش از ۴۰ نویسه باشد.";
  if (!COUPON_CODE_PATTERN.test(code)) {
    return "کد فقط می‌تواند شامل حروف بزرگ لاتین، عدد انگلیسی، خط‌تیره (-) و زیرخط (_) باشد.";
  }
  return null;
}

// ============================================================
// Zod schema — form input is all strings (native inputs); transforms produce
// the parsed/typed output used by the server actions.
// ============================================================

/** Required positive integer from a string input (digits normalized). */
const requiredIntString = (emptyMsg: string) =>
  z
    .string()
    .transform((v) => normalizeDigits(v ?? "").trim())
    .refine((v) => v !== "", emptyMsg)
    .refine((v) => /^\d+$/.test(v), "فقط عدد صحیح مثبت مجاز است.")
    .transform((v) => Number(v));

/** Optional positive integer from a string input. "" → null. */
const optionalIntString = z
  .string()
  .transform((v) => normalizeDigits(v ?? "").trim())
  .refine((v) => v === "" || /^\d+$/.test(v), "فقط عدد صحیح مثبت مجاز است.")
  .transform((v) => (v === "" ? null : Number(v)));

const requiredDate = z
  .string()
  .trim()
  .min(1, "تاریخ انقضا را وارد کنید.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "تاریخ نامعتبر است.");

const optionalDate = z
  .union([z.literal(""), z.string()])
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "تاریخ نامعتبر است.");

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .transform((v) => normalizeCouponCode(v))
      .refine((v) => v.length >= COUPON_CODE_MIN, "کد تخفیف باید حداقل ۲ نویسه باشد.")
      .refine((v) => v.length <= COUPON_CODE_MAX, "کد تخفیف نباید بیش از ۴۰ نویسه باشد.")
      .refine(
        (v) => COUPON_CODE_PATTERN.test(v),
        "کد فقط می‌تواند شامل حروف بزرگ لاتین، عدد انگلیسی، خط‌تیره (-) و زیرخط (_) باشد.",
      ),
    title: z
      .string()
      .max(120, "نام داخلی نباید بیش از ۱۲۰ نویسه باشد.")
      .transform((v) => v.trim())
      .transform((v) => (v === "" ? null : v)),
    description: z
      .string()
      .max(500, "توضیحات نباید بیش از ۵۰۰ نویسه باشد.")
      .transform((v) => v.trim())
      .transform((v) => (v === "" ? null : v)),
    type: z.enum(["PERCENT", "FIXED"], { message: "نوع تخفیف را انتخاب کنید." }),
    // PERCENT: 1–100. FIXED: amount in TOMAN (converted to Rial by the action).
    value: requiredIntString("مقدار تخفیف را وارد کنید."),
    // Percent cap, in TOMAN. Recommended for percent coupons.
    maxDiscount: optionalIntString,
    // Minimum order amount, in TOMAN.
    minOrder: optionalIntString,
    usageLimit: requiredIntString("سقف کل دفعات استفاده را وارد کنید."),
    perUserLimit: optionalIntString,
    firstOrderOnly: z.boolean().default(false),
    startsAt: optionalDate,
    expiresAt: requiredDate,
    isActive: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PERCENT") {
      if (v.value < 1 || v.value > 100) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد." });
      }
    } else if (v.value < 1) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "مبلغ تخفیف باید بزرگ‌تر از صفر باشد." });
    }
    if (v.minOrder !== null && v.minOrder < 1) {
      ctx.addIssue({ code: "custom", path: ["minOrder"], message: "حداقل مبلغ سفارش باید مثبت باشد." });
    }
    if (v.maxDiscount !== null && v.maxDiscount < 1) {
      ctx.addIssue({ code: "custom", path: ["maxDiscount"], message: "سقف تخفیف باید مثبت باشد." });
    }
    if (v.usageLimit < 1) {
      ctx.addIssue({ code: "custom", path: ["usageLimit"], message: "سقف دفعات استفاده باید حداقل ۱ باشد." });
    }
    if (v.perUserLimit !== null && v.perUserLimit < 1) {
      ctx.addIssue({ code: "custom", path: ["perUserLimit"], message: "سقف استفاده هر کاربر باید مثبت باشد." });
    }
    if (v.startsAt && Date.parse(v.startsAt) >= Date.parse(v.expiresAt)) {
      ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "تاریخ انقضا باید بعد از تاریخ شروع باشد." });
    }
  });

export type CouponFormInput = z.input<typeof couponFormSchema>;
export type CouponFormValues = z.output<typeof couponFormSchema>;

export const emptyCouponForm: CouponFormInput = {
  code: "",
  title: "",
  description: "",
  type: "PERCENT",
  value: "",
  maxDiscount: "",
  minOrder: "",
  usageLimit: "",
  perUserLimit: "",
  firstOrderOnly: false,
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

// ============================================================
// Pure status / summary / preview logic (Rial in, Persian out)
// ============================================================

/** Minimal coupon shape the pure functions operate on (amounts in Rial). */
export type CouponLike = {
  type: CouponType;
  amount: number; // PERCENT: percentage; FIXED: Rial
  maxDiscount_rial: number | null;
  minOrder_rial: number | null;
  isActive: boolean;
  startsAt: Date | string | null;
  expiresAt: Date | string | null;
  usageCount: number;
  usageLimit: number;
};

function toTime(d: Date | string | null): number | null {
  if (d === null) return null;
  const t = typeof d === "string" ? Date.parse(d) : d.getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Derive the display status of a coupon at a given moment. Precedence:
 * inactive → expired → scheduled (not started) → usage exhausted → active.
 */
export function getCouponStatus(
  c: Pick<CouponLike, "isActive" | "startsAt" | "expiresAt" | "usageCount" | "usageLimit">,
  now: Date = new Date(),
): { key: CouponStatusKey; label: string; tone: StatusTone } {
  const t = now.getTime();
  const starts = toTime(c.startsAt);
  const expires = toTime(c.expiresAt);

  let key: CouponStatusKey;
  if (!c.isActive) key = "INACTIVE";
  else if (expires !== null && expires <= t) key = "EXPIRED";
  else if (starts !== null && starts > t) key = "SCHEDULED";
  else if (c.usageLimit > 0 && c.usageCount >= c.usageLimit) key = "EXHAUSTED";
  else key = "ACTIVE";

  return { key, ...COUPON_STATUS_META[key] };
}

/**
 * Human-readable rule summary, e.g.
 * «۲۰٪ تخفیف تا سقف ۲۰۰٬۰۰۰ تومان» or
 * «۱۰۰٬۰۰۰ تومان تخفیف برای سفارش‌های بالای ۱٬۰۰۰٬۰۰۰ تومان».
 */
export function summarizeCouponRule(
  c: Pick<CouponLike, "type" | "amount" | "maxDiscount_rial" | "minOrder_rial">,
): string {
  const parts: string[] = [];
  if (c.type === "PERCENT") {
    parts.push(`${toPersianNumbers(c.amount)}٪ تخفیف`);
    if (c.maxDiscount_rial && c.maxDiscount_rial > 0) {
      parts.push(`تا سقف ${formatToman(c.maxDiscount_rial)} تومان`);
    }
  } else {
    parts.push(`${formatToman(c.amount)} تومان تخفیف`);
  }
  if (c.minOrder_rial && c.minOrder_rial > 0) {
    parts.push(`برای سفارش‌های بالای ${formatToman(c.minOrder_rial)} تومان`);
  }
  return parts.join(" ");
}

export type DiscountPreview = {
  valid: boolean;
  reason: string | null; // Persian explanation when invalid
  discount_rial: number;
  final_rial: number;
  capped: boolean; // percent discount hit its max cap
};

/**
 * Calculate the discount a coupon would apply to a given subtotal (all Rial).
 * Pure calculator — no DB, no per-user/first-order checks (those are pending
 * checkout enforcement and not part of this preview).
 */
export function calculateDiscountPreview(
  c: CouponLike,
  subtotal_rial: number,
  now: Date = new Date(),
): DiscountPreview {
  const none = (reason: string | null): DiscountPreview => ({
    valid: false,
    reason,
    discount_rial: 0,
    final_rial: subtotal_rial,
    capped: false,
  });

  const status = getCouponStatus(c, now);
  if (status.key === "INACTIVE") return none("این کد غیرفعال است.");
  if (status.key === "EXPIRED") return none("این کد منقضی شده است.");
  if (status.key === "SCHEDULED") return none("این کد هنوز فعال نشده است.");
  if (status.key === "EXHAUSTED") return none("ظرفیت استفاده از این کد پر شده است.");

  if (c.minOrder_rial && subtotal_rial < c.minOrder_rial) {
    return none("حداقل مبلغ سفارش رعایت نشده است.");
  }

  let discount: number;
  let capped = false;
  if (c.type === "PERCENT") {
    const raw = Math.floor((subtotal_rial * c.amount) / 100);
    if (c.maxDiscount_rial && raw > c.maxDiscount_rial) {
      discount = c.maxDiscount_rial;
      capped = true;
    } else {
      discount = raw;
    }
  } else {
    discount = c.amount;
  }
  discount = Math.max(0, Math.min(discount, subtotal_rial));

  return {
    valid: true,
    reason: null,
    discount_rial: discount,
    final_rial: subtotal_rial - discount,
    capped,
  };
}

/**
 * Build a draft CouponLike (Rial) from raw form-input strings, for the live
 * preview calculator. Best-effort: unparseable numbers become 0/null so the
 * preview can still render while the form is being filled.
 */
export function draftCouponFromForm(v: CouponFormInput): CouponLike {
  const num = (s: unknown): number => {
    const n = Number(normalizeDigits(String(s ?? "")).trim());
    return Number.isFinite(n) ? n : 0;
  };
  const optNum = (s: unknown): number | null => {
    const raw = normalizeDigits(String(s ?? "")).trim();
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };
  const type = v.type === "FIXED" ? "FIXED" : "PERCENT";
  const minOrder = optNum(v.minOrder);
  const maxDiscount = optNum(v.maxDiscount);

  return {
    type,
    amount: type === "PERCENT" ? num(v.value) : num(v.value) * 10, // Toman → Rial for fixed
    maxDiscount_rial: type === "PERCENT" && maxDiscount !== null ? maxDiscount * 10 : null,
    minOrder_rial: minOrder === null ? null : minOrder * 10,
    isActive: v.isActive ?? true,
    startsAt: v.startsAt ? String(v.startsAt) : null,
    expiresAt: v.expiresAt ? String(v.expiresAt) : null,
    usageCount: 0,
    usageLimit: Math.max(1, num(v.usageLimit) || 1),
  };
}
