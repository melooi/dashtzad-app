"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, ScrollText } from "lucide-react";
import { fieldClass } from "@/components/admin/ui/AdminField";

/**
 * Repeatable source / reference rows (label + optional url + optional note),
 * stored as Post.sources Json. No fake sources — admin enters real references.
 */
export function SourcesField({ name = "sources" }: { name?: string }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed border-dz-a-primary-200 bg-dz-a-primary-50/30 p-4 text-xs text-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-white/2 dark:text-dz-a-night-faint">
          منبعی ثبت نشده. برای محتوای سلامت/پزشکی، افزودن منبع معتبر الزامی است.
        </p>
      )}

      {fields.map((f, i) => (
        <div key={f.id} className="rounded-xl border border-dz-a-primary-100 bg-white p-3 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-dz-a-primary-500 dark:text-dz-a-night-muted">
            <ScrollText className="size-3.5" /> منبع {i + 1}
            <button
              type="button"
              onClick={() => remove(i)}
              title="حذف منبع"
              aria-label="حذف منبع"
              className="focus-ring ms-auto inline-flex size-7 items-center justify-center rounded-lg text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <div className="grid gap-2">
            <input {...register(`${name}.${i}.label`)} placeholder="عنوان منبع (لازم)" className={fieldClass()} />
            <input {...register(`${name}.${i}.url`)} dir="ltr" placeholder="https://… (اختیاری)" className={`${fieldClass()} font-mono text-xs`} />
            <input {...register(`${name}.${i}.note`)} placeholder="توضیح کوتاه (اختیاری)" className={fieldClass()} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ label: "", url: "", note: "" })}
        className="focus-ring inline-flex items-center gap-1.5 self-start rounded-xl border border-dashed border-dz-a-primary-300 px-3 py-2 text-xs text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
      >
        <Plus className="size-3.5" /> افزودن منبع
      </button>
    </div>
  );
}
