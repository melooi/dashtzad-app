"use client";

// Structured recipe card (RECIPE-CP1) — rendered at the top of a recipe article
// body. Interactive: the serving stepper rescales every ingredient quantity and
// the cost; ingredients can be ticked off. Visuals ported from the design under
// the .dz-recipe-card scope (globals.css).
import { useState, type ReactNode } from "react";
import {
  Clock, Flame, Users, Gauge, Sprout, Wheat, PartyPopper, Leaf, Drumstick, HeartPulse,
  ShoppingBasket, Receipt, Check, ListOrdered, Timer, Printer,
  ChefHat, Droplets, Salad, Soup, Filter, Layers, UtensilsCrossed,
} from "lucide-react";
import {
  type RecipeMeta, DIFFICULTY_LABELS, dietTag, scaleQty, formatQty, scaleCost,
} from "@/lib/blog/recipe";
import { toPersianNumbers, toPersianNumbersWithComma } from "@/lib/price";

const DIET_ICON: Record<string, ReactNode> = {
  vegetarian: <Sprout />,
  gluten_free: <Wheat />,
  party: <PartyPopper />,
  low_calorie: <Leaf />,
  high_protein: <Drumstick />,
};

const STEP_ICON: Record<string, ReactNode> = {
  prep: <ChefHat />,
  soak: <Droplets />,
  chop: <Salad />,
  fry: <Flame />,
  boil: <Soup />,
  simmer: <Soup />,
  drain: <Filter />,
  layer: <Layers />,
  season: <UtensilsCrossed />,
  rest: <Timer />,
  serve: <UtensilsCrossed />,
};

export function RecipeCard({ meta, rating, actions }: { meta: RecipeMeta; rating?: ReactNode; actions?: ReactNode }) {
  const [servings, setServings] = useState(meta.baseServings);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const n = meta.nutrition;
  const nutriCells = [
    { v: n.calories, l: "کیلوکالری" },
    { v: n.protein, l: "پروتئین" },
    { v: n.carb, l: "کربوهیدرات" },
    { v: n.fat, l: "چربی" },
  ].filter((c) => c.v.trim() !== "");
  const hasNutrition = nutriCells.length > 0 || n.health.trim() !== "";

  const scaledCost = meta.costEstimate != null ? scaleCost(meta.costEstimate, meta.baseServings, servings) : null;

  return (
    <section className="dz-recipe-card" aria-label="دستور پخت">
      {/* stats */}
      <div className="recipe__statsbox">
        <div className="recipe__stats">
          {meta.prepTime.trim() !== "" && (
            <div className="recipe__stat">
              <Clock />
              <span className="recipe__stat-v">{meta.prepTime}</span>
              <span className="recipe__stat-l">آماده‌سازی</span>
            </div>
          )}
          {meta.cookTime.trim() !== "" && (
            <div className="recipe__stat">
              <Flame />
              <span className="recipe__stat-v">{meta.cookTime}</span>
              <span className="recipe__stat-l">پخت</span>
            </div>
          )}
          <div className="recipe__stat">
            <Users />
            <span className="recipe__stat-v serv-step">
              <button type="button" className="serv-btn" aria-label="کمتر" onClick={() => setServings((s) => Math.max(1, s - 1))} disabled={servings <= 1}>
                −
              </button>
              <span>{toPersianNumbers(servings)} نفر</span>
              <button type="button" className="serv-btn" aria-label="بیشتر" onClick={() => setServings((s) => Math.min(99, s + 1))} disabled={servings >= 99}>
                +
              </button>
            </span>
            <span className="recipe__stat-l">مقدار</span>
          </div>
          <div className="recipe__stat">
            <Gauge />
            <span className="recipe__stat-v">{DIFFICULTY_LABELS[meta.difficulty]}</span>
            <span className="recipe__stat-l">سختی</span>
          </div>
        </div>
      </div>

      {/* dietary tags */}
      {meta.dietaryTags.length > 0 && (
        <div className="recipe__tags">
          {meta.dietaryTags.map((key) => {
            const t = dietTag(key);
            if (!t) return null;
            return (
              <span key={key} className={`rtag rtag--${t.variant}`}>
                {DIET_ICON[key]} {t.label}
              </span>
            );
          })}
        </div>
      )}

      {/* nutrition */}
      {hasNutrition && (
        <div className="recipe__nutri">
          <div className="nutri-head">
            <Flame /> ارزش غذایی <span className="nutri-head__sub">به ازای هر نفر</span>
          </div>
          <div className="nutri-grid">
            {nutriCells.map((c) => (
              <div key={c.l} className="nutri-cell">
                <span className="nutri-cell__v">{c.v}</span>
                <span className="nutri-cell__l">{c.l}</span>
              </div>
            ))}
            {n.health.trim() !== "" && (
              <div className="health">
                <span className="health__l">
                  <HeartPulse /> میزان سلامتی
                </span>
                <span className="health__badge">{n.health}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ingredients + steps */}
      <div className="recipe__body">
        {meta.ingredients.length > 0 && (
          <div className="recipe__ing">
            <div className="ing-summary">
              <div className="ing-summary__item">
                <span className="ing-summary__ic"><ShoppingBasket /></span>
                <div>
                  <span className="ing-summary__v">{toPersianNumbers(meta.ingredients.length)} قلم</span>
                  <span className="ing-summary__l">مواد اولیه</span>
                </div>
              </div>
              {scaledCost != null && (
                <div className="ing-summary__item">
                  <span className="ing-summary__ic"><Receipt /></span>
                  <div>
                    <span className="ing-summary__v">
                      حدود {toPersianNumbersWithComma(scaledCost)} <i className="store-toman" aria-hidden />
                    </span>
                    <span className="ing-summary__l">هزینه‌ی حدودی پخت</span>
                  </div>
                </div>
              )}
            </div>
            <h3 className="recipe__sec-h"><ShoppingBasket /> مواد لازم</h3>
            <p className="recipe__sec-note"><Check /> روی هر ماده‌ای که در خانه داری بزن تا تیک بخورد.</p>
            <ul className="ing-list">
              {meta.ingredients.map((ing, i) => {
                const isChecked = checked.has(i);
                const qtyText =
                  ing.qty == null
                    ? ing.unit
                    : `${formatQty(scaleQty(ing.qty, servings))}${ing.unit ? " " + ing.unit : ""}`;
                return (
                  <li
                    key={i}
                    className={isChecked ? "is-checked" : undefined}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isChecked}
                    aria-label={`${ing.name}${qtyText.trim() ? "، " + qtyText : ""}`}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(i);
                      }
                    }}
                  >
                    <span className="tick"><Check /></span>
                    <span className="ing-name">{ing.name}</span>
                    {qtyText.trim() !== "" && <span className="ing-qty">{qtyText}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {meta.steps.length > 0 && (
          <div className="recipe__steps">
            <h3 className="recipe__sec-h"><ListOrdered /> مراحل پخت</h3>
            <ol className="step-list">
              {meta.steps.map((s, i) => (
                <li key={i}>
                  <span className="step-ic">{STEP_ICON[s.icon] ?? <ChefHat />}</span>
                  <div className="step-t">{s.title}</div>
                  {s.desc.trim() !== "" && <div className="step-d">{s.desc}</div>}
                  {s.time.trim() !== "" && (
                    <span className="step-timer"><Timer /> {s.time}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* foot — rating (left) + like/suggest/print (right) */}
      {(rating || actions) && (
        <div className="recipe__foot">
          {rating}
          <div className="recipe__foot-actions flex flex-wrap items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-store-border-strong bg-store-surface px-3.5 py-2 text-sm font-bold text-store-text-muted transition-colors hover:border-store-primary hover:text-store-primary"
            >
              <Printer className="size-4" /> چاپ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
