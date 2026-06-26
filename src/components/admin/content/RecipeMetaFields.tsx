"use client";

// Recipe metabox (RECIPE-CP1) — the ACF-style structured-data editor shown in
// ArticleForm when articleType === "RECIPE". Binds to form field `recipeMeta`.
import { useFormContext, useFieldArray } from "react-hook-form";
import { Clock, Flame, ShoppingBasket, ListOrdered, Plus, X, Sprout } from "lucide-react";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { RECIPE_DIET_TAGS, DIFFICULTY_LABELS, RECIPE_DIFFICULTIES, RECIPE_STEP_ICONS } from "@/lib/blog/recipe";

const groupClass = "border-t border-dz-a-primary-100 pt-4 mt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-dz-a-night-border";
const groupHead = "mb-3 flex items-center gap-1.5 text-sm font-bold text-dz-a-primary-700 dark:text-dz-a-night-fg";
const labelClass = "text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-muted";

export function RecipeMetaFields() {
  const { register, watch, setValue, control } = useFormContext();
  const ing = useFieldArray({ control, name: "recipeMeta.ingredients" });
  const stp = useFieldArray({ control, name: "recipeMeta.steps" });

  const tags: string[] = watch("recipeMeta.dietaryTags") ?? [];
  const toggleTag = (k: string) =>
    setValue("recipeMeta.dietaryTags", tags.includes(k) ? tags.filter((x) => x !== k) : [...tags, k], {
      shouldDirty: true,
    });

  return (
    <div className="rounded-2xl border border-dz-a-primary-200 bg-dz-a-primary-50/40 p-4 dark:border-dz-a-night-border dark:bg-white/5">
      {/* زمان، مقدار، سختی */}
      <div className={groupClass}>
        <h4 className={groupHead}>
          <Clock className="size-4 text-dz-a-primary-500" /> زمان، مقدار و سختی
        </h4>
        <div className="grid gap-3 @md:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>زمان آماده‌سازی</span>
            <input className={fieldClass()} placeholder="۲۰ دقیقه" {...register("recipeMeta.prepTime")} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>زمان پخت</span>
            <input className={fieldClass()} placeholder="۵۰ دقیقه" {...register("recipeMeta.cookTime")} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>تعداد نفرات (پایه)</span>
            <input className={fieldClass()} type="number" dir="ltr" min={1} max={99} {...register("recipeMeta.baseServings")} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>سختی</span>
            <select className={fieldClass()} {...register("recipeMeta.difficulty")}>
              {RECIPE_DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* برچسب‌های رژیمی */}
      <div className={groupClass}>
        <h4 className={groupHead}>
          <Sprout className="size-4 text-dz-a-primary-500" /> برچسب‌های رژیمی
        </h4>
        <div className="flex flex-wrap gap-2">
          {RECIPE_DIET_TAGS.map((t) => {
            const on = tags.includes(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleTag(t.key)}
                aria-pressed={on}
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "border-dz-a-primary-500 bg-dz-a-primary-500 text-white"
                    : "border-dz-a-primary-200 bg-white text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-muted"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ارزش غذایی + هزینه */}
      <div className={groupClass}>
        <h4 className={groupHead}>
          <Flame className="size-4 text-dz-a-primary-500" /> ارزش غذایی (هر نفر) — خالی‌ها نمایش داده نمی‌شوند
        </h4>
        <div className="grid gap-3 @md:grid-cols-5">
          {([
            ["calories", "کالری", "۴۲۰"],
            ["protein", "پروتئین", "۸ گرم"],
            ["carb", "کربوهیدرات", "۷۲ گرم"],
            ["fat", "چربی", "۱۰ گرم"],
            ["health", "میزان سلامتی", "🙂 متعادل"],
          ] as const).map(([key, label, ph]) => (
            <label key={key} className="flex flex-col gap-1">
              <span className={labelClass}>{label}</span>
              <input className={fieldClass()} placeholder={ph} {...register(`recipeMeta.nutrition.${key}`)} />
            </label>
          ))}
        </div>
        <label className="mt-3 flex flex-col gap-1">
          <span className={labelClass}>هزینه‌ی حدودی پخت (تومان، برای تعداد نفرات پایه)</span>
          <input className={fieldClass()} type="number" dir="ltr" min={0} placeholder="۳۲۰۰۰۰" {...register("recipeMeta.costEstimate")} />
          <span className="text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">خالی بگذارید اگر مطمئن نیستید؛ عدد جعلی ننویسید.</span>
        </label>
      </div>

      {/* مواد لازم — repeater */}
      <div className={groupClass}>
        <h4 className={groupHead}>
          <ShoppingBasket className="size-4 text-dz-a-primary-500" /> مواد لازم
        </h4>
        <div className="overflow-hidden rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border">
          <div className="grid grid-cols-[1fr_5rem_6rem_2rem] gap-2 bg-dz-a-primary-50 px-3 py-2 text-[11px] font-bold text-dz-a-primary-500 dark:bg-white/5 dark:text-dz-a-night-faint">
            <span>نام ماده</span>
            <span>مقدار (۱ نفر)</span>
            <span>واحد</span>
            <span></span>
          </div>
          {ing.fields.length === 0 && (
            <p className="px-3 py-3 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">هنوز ماده‌ای اضافه نشده.</p>
          )}
          {ing.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_5rem_6rem_2rem] items-center gap-2 border-t border-dz-a-primary-100 px-3 py-2 dark:border-dz-a-night-border">
              <input className={fieldClass()} placeholder="برنج ایرانی دانه‌بلند" {...register(`recipeMeta.ingredients.${i}.name`)} />
              <input className={fieldClass()} type="number" step="any" dir="ltr" placeholder="—" {...register(`recipeMeta.ingredients.${i}.qty`)} />
              <input className={fieldClass()} placeholder="پیمانه" {...register(`recipeMeta.ingredients.${i}.unit`)} />
              <button type="button" onClick={() => ing.remove(i)} className="focus-ring grid size-8 place-items-center rounded-lg text-dz-a-primary-400 hover:bg-dz-a-error/10 hover:text-dz-a-error" aria-label="حذف">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => ing.append({ name: "", qty: "", unit: "" })}
          className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg bg-dz-a-primary-100 px-3 py-1.5 text-xs font-bold text-dz-a-primary-700 hover:bg-dz-a-primary-200 dark:bg-white/10 dark:text-dz-a-night-fg"
        >
          <Plus className="size-4" /> افزودن ماده
        </button>
      </div>

      {/* مراحل پخت — repeater */}
      <div className={groupClass}>
        <h4 className={groupHead}>
          <ListOrdered className="size-4 text-dz-a-primary-500" /> مراحل پخت
        </h4>
        <div className="flex flex-col gap-2">
          {stp.fields.length === 0 && (
            <p className="rounded-xl border border-dz-a-primary-100 px-3 py-3 text-xs text-dz-a-primary-400 dark:border-dz-a-night-border dark:text-dz-a-night-faint">هنوز مرحله‌ای اضافه نشده.</p>
          )}
          {stp.fields.map((f, i) => (
            <div key={f.id} className="rounded-xl border border-dz-a-primary-200 p-3 dark:border-dz-a-night-border">
              <div className="grid gap-2 @md:grid-cols-[10rem_1fr_8rem_2rem]">
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>آیکون مرحله</span>
                  <select className={fieldClass()} {...register(`recipeMeta.steps.${i}.icon`)}>
                    {RECIPE_STEP_ICONS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>عنوان مرحله</span>
                  <input className={fieldClass()} placeholder="خیساندن" {...register(`recipeMeta.steps.${i}.title`)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>زمان</span>
                  <input className={fieldClass()} placeholder="۱۰ دقیقه" {...register(`recipeMeta.steps.${i}.time`)} />
                </label>
                <div className="flex items-end">
                  <button type="button" onClick={() => stp.remove(i)} className="focus-ring grid size-9 place-items-center rounded-lg text-dz-a-primary-400 hover:bg-dz-a-error/10 hover:text-dz-a-error" aria-label="حذف">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <label className="mt-2 flex flex-col gap-1">
                <span className={labelClass}>توضیح مرحله</span>
                <textarea rows={2} className={fieldClass()} placeholder="برنج را بشویید و در آبِ نمک خیس کنید." {...register(`recipeMeta.steps.${i}.desc`)} />
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => stp.append({ icon: "prep", title: "", time: "", desc: "" })}
          className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg bg-dz-a-primary-100 px-3 py-1.5 text-xs font-bold text-dz-a-primary-700 hover:bg-dz-a-primary-200 dark:bg-white/10 dark:text-dz-a-night-fg"
        >
          <Plus className="size-4" /> افزودن مرحله
        </button>
      </div>
    </div>
  );
}
