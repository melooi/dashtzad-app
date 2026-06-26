// ============================================================
// Recipe domain (RECIPE-CP1) — single source of truth for the structured
// recipe payload stored in Post.recipeMeta. Pure data + helpers, safe to import
// from server components, server actions, AND client components.
//
// Ingredient quantities are stored PER PERSON; the public card multiplies by the
// chosen serving count. Cost is stored for `baseServings` and scales linearly.
// ============================================================

import { z } from "zod";
import { toPersianNumbers } from "@/lib/price";

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

/** Fixed dietary-tag vocabulary (matches the design's chips). variant → color. */
export const RECIPE_DIET_TAGS = [
  { key: "vegetarian", label: "گیاهی", variant: "green" as const },
  { key: "gluten_free", label: "بدون گلوتن", variant: "gold" as const },
  { key: "party", label: "مناسب مهمانی", variant: "clay" as const },
  { key: "low_calorie", label: "کم‌کالری", variant: "green" as const },
  { key: "high_protein", label: "پرپروتئین", variant: "gold" as const },
] as const;

export type RecipeDietTagKey = (typeof RECIPE_DIET_TAGS)[number]["key"];
export const RECIPE_DIET_TAG_KEYS = RECIPE_DIET_TAGS.map((t) => t.key) as RecipeDietTagKey[];

export function dietTag(key: string) {
  return RECIPE_DIET_TAGS.find((t) => t.key === key) ?? null;
}

/** Semantic step-icon vocabulary (mapped to lucide icons in the public card). */
export const RECIPE_STEP_ICONS = [
  { key: "prep", label: "آماده‌سازی" },
  { key: "soak", label: "خیساندن" },
  { key: "chop", label: "خرد کردن" },
  { key: "fry", label: "سرخ کردن / تفت" },
  { key: "boil", label: "جوشاندن" },
  { key: "simmer", label: "پخت ملایم / دم" },
  { key: "drain", label: "آبکش" },
  { key: "layer", label: "چیدن لایه" },
  { key: "season", label: "چاشنی و نمک" },
  { key: "rest", label: "استراحت / دم‌کشیدن" },
  { key: "serve", label: "سرو" },
] as const;

export type RecipeStepIconKey = (typeof RECIPE_STEP_ICONS)[number]["key"];

// ---- rating moderation (RECIPE-CP1) ----
/** Ratings strictly below this are "low" → the feedback form is shown. */
export const LOW_RATING_THRESHOLD = 4;

/** Selectable reasons shown when a user gives a low rating. */
export const RATING_FEEDBACK_REASONS = [
  { key: "ingredients", label: "مواد لازم دقیق نبود" },
  { key: "amounts", label: "مقدارها درست نبود" },
  { key: "time", label: "زمان پخت واقعی نبود" },
  { key: "steps", label: "مراحل پخت گنگ بود" },
  { key: "result", label: "نتیجه با توضیح فرق داشت" },
  { key: "media", label: "عکس یا توضیح کافی نبود" },
  { key: "method", label: "روش پخت دیگری بهتر است" },
  { key: "other", label: "مورد دیگر" },
] as const;

export type RatingReasonKey = (typeof RATING_FEEDBACK_REASONS)[number]["key"];
export const RATING_FEEDBACK_REASON_KEYS = RATING_FEEDBACK_REASONS.map((r) => r.key) as RatingReasonKey[];

export function ratingReasonLabel(key: string): string {
  return RATING_FEEDBACK_REASONS.find((r) => r.key === key)?.label ?? key;
}

// ---- Zod shape (validated at read AND at admin save) ----
const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(160),
  qty: z.number().finite().nonnegative().nullable(),
  unit: z.string().trim().max(60).default(""),
});

const stepSchema = z.object({
  icon: z.string().trim().max(60).default(""),
  title: z.string().trim().min(1).max(160),
  time: z.string().trim().max(80).default(""),
  desc: z.string().trim().max(800).default(""),
});

const nutritionSchema = z.object({
  calories: z.string().trim().max(40).default(""),
  protein: z.string().trim().max(40).default(""),
  carb: z.string().trim().max(40).default(""),
  fat: z.string().trim().max(40).default(""),
  health: z.string().trim().max(60).default(""),
});

export const recipeMetaSchema = z.object({
  prepTime: z.string().trim().max(60).default(""),
  cookTime: z.string().trim().max(60).default(""),
  baseServings: z.number().int().min(1).max(99).default(4),
  difficulty: z.enum(RECIPE_DIFFICULTIES).default("medium"),
  dietaryTags: z.array(z.string()).default([]).transform((arr) => arr.filter((t) => RECIPE_DIET_TAG_KEYS.includes(t as RecipeDietTagKey))),
  nutrition: nutritionSchema.default({ calories: "", protein: "", carb: "", fat: "", health: "" }),
  costEstimate: z.number().int().nonnegative().nullable().default(null), // raw Toman for baseServings
  ingredients: z.array(ingredientSchema).max(60).default([]),
  steps: z.array(stepSchema).max(40).default([]),
});

export type RecipeMeta = z.infer<typeof recipeMetaSchema>;
export type RecipeIngredient = z.infer<typeof ingredientSchema>;
export type RecipeStep = z.infer<typeof stepSchema>;

/** Parse a stored Post.recipeMeta JSON into a validated RecipeMeta (or null). */
export function parseRecipeMeta(raw: unknown): RecipeMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = recipeMetaSchema.safeParse(raw);
  if (!parsed.success) return null;
  // a recipe with no ingredients AND no steps carries no useful structure
  if (parsed.data.ingredients.length === 0 && parsed.data.steps.length === 0) return null;
  return parsed.data;
}

// ---- scaling + formatting ----

/** Multiply a per-person quantity by the chosen serving count. */
export function scaleQty(perPerson: number, servings: number): number {
  return perPerson * servings;
}

/** Format a numeric quantity for display: trim to ≤2 decimals, Persian digits, `٫` decimal. */
export function formatQty(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const s = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", "٫");
  return toPersianNumbers(s);
}

/** Scale a base-servings cost (Toman) to the chosen serving count. */
export function scaleCost(costAtBase: number, baseServings: number, servings: number): number {
  if (baseServings <= 0) return costAtBase;
  return Math.round((costAtBase * servings) / baseServings);
}

/** Count of distinct ingredients (for the «N قلم» summary). */
export function ingredientCount(meta: RecipeMeta): number {
  return meta.ingredients.length;
}

// ---- ISO 8601 durations for schema.org/Recipe (honest; omit if unparseable) ----

/** Extract minutes from free text like «۱ ساعت و ۱۰ دقیقه» / «۲۰ دقیقه» / «۲ تا ۳ ساعت». */
export function parseMinutes(text: string): number | null {
  if (!text) return null;
  const ascii = text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const nums = ascii.match(/\d+(?:\.\d+)?/g);
  if (!nums) return null;
  const first = Number(nums[0]);
  if (!Number.isFinite(first)) return null;
  const hasHour = /ساعت/.test(ascii);
  const hasMin = /دقیقه/.test(ascii);
  if (hasHour && hasMin && nums.length >= 2) return Math.round(first * 60 + Number(nums[1]));
  if (hasHour) return Math.round(first * 60);
  if (hasMin) return Math.round(first);
  return Math.round(first); // bare number → assume minutes
}

/** minutes → ISO 8601 duration (e.g. 70 → "PT1H10M"). */
export function minutesToISO(min: number | null): string | null {
  if (min == null || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : h ? "" : "0M"}`;
}
