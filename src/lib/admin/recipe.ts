// ============================================================
// Admin recipe metabox schema (RECIPE-CP1). The form holds the INPUT shape
// (numbers arrive as strings from inputs); this schema transforms to the clean
// RecipeMeta object stored in Post.recipeMeta. Embedded into articleFormSchema.
// ============================================================

import { z } from "zod";
import { RECIPE_DIFFICULTIES, RECIPE_DIET_TAG_KEYS, parseRecipeMeta } from "@/lib/blog/recipe";

// "" / null → null, else coerce to a non-negative number (decimals allowed for qty).
const optNum = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : v),
  z.coerce.number().nonnegative().nullable(),
);

const optInt = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : v),
  z.coerce.number().int().nonnegative().nullable(),
);

const servings = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? 4 : v),
  z.coerce.number().int().min(1).max(99),
);

const nutrition = z.object({
  calories: z.string().trim().max(40).default(""),
  protein: z.string().trim().max(40).default(""),
  carb: z.string().trim().max(40).default(""),
  fat: z.string().trim().max(40).default(""),
  health: z.string().trim().max(60).default(""),
});

export const recipeFormSchema = z
  .object({
    prepTime: z.string().trim().max(60).default(""),
    cookTime: z.string().trim().max(60).default(""),
    baseServings: servings,
    difficulty: z.enum(RECIPE_DIFFICULTIES).default("medium"),
    dietaryTags: z.array(z.string()).default([]),
    nutrition: nutrition.default({ calories: "", protein: "", carb: "", fat: "", health: "" }),
    costEstimate: optInt, // raw Toman for baseServings
    ingredients: z
      .array(
        z.object({
          name: z.string().trim().max(160).default(""),
          qty: optNum,
          unit: z.string().trim().max(60).default(""),
        }),
      )
      .max(60)
      .default([]),
    steps: z
      .array(
        z.object({
          icon: z.string().trim().max(60).default(""),
          title: z.string().trim().max(160).default(""),
          time: z.string().trim().max(80).default(""),
          desc: z.string().trim().max(800).default(""),
        }),
      )
      .max(40)
      .default([]),
  })
  .transform((v) => ({
    prepTime: v.prepTime,
    cookTime: v.cookTime,
    baseServings: v.baseServings,
    difficulty: v.difficulty,
    dietaryTags: v.dietaryTags.filter((t) => (RECIPE_DIET_TAG_KEYS as string[]).includes(t)),
    nutrition: v.nutrition,
    costEstimate: v.costEstimate,
    ingredients: v.ingredients
      .filter((i) => i.name.trim() !== "")
      .map((i) => ({ name: i.name, qty: i.qty, unit: i.unit })),
    steps: v.steps
      .filter((s) => s.title.trim() !== "")
      .map((s) => ({ icon: s.icon, title: s.title, time: s.time, desc: s.desc })),
  }));

export type RecipeFormValues = z.input<typeof recipeFormSchema>;

export const emptyRecipeMeta: RecipeFormValues = {
  prepTime: "",
  cookTime: "",
  baseServings: 4,
  difficulty: "medium",
  dietaryTags: [],
  nutrition: { calories: "", protein: "", carb: "", fat: "", health: "" },
  costEstimate: "",
  ingredients: [],
  steps: [],
};

/** Stored Post.recipeMeta → editor-ready form input values. */
export function recipeMetaToForm(raw: unknown): RecipeFormValues {
  const m = parseRecipeMeta(raw);
  if (!m) return emptyRecipeMeta;
  return {
    prepTime: m.prepTime,
    cookTime: m.cookTime,
    baseServings: m.baseServings,
    difficulty: m.difficulty,
    dietaryTags: m.dietaryTags,
    nutrition: m.nutrition,
    costEstimate: m.costEstimate == null ? "" : String(m.costEstimate),
    ingredients: m.ingredients.map((i) => ({ name: i.name, qty: i.qty == null ? "" : String(i.qty), unit: i.unit })),
    steps: m.steps.map((s) => ({ icon: s.icon, title: s.title, time: s.time, desc: s.desc })),
  };
}
