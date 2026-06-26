"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Wand2 } from "lucide-react";
import { slugify } from "@/lib/admin/slug";
import { AdminField, fieldClass } from "./AdminField";

/**
 * Slug input that auto-generates from a source field ONLY while the user hasn't
 * manually edited it. Stays fully editable, and shows a final-URL preview.
 */
export function AdminSlugField({
  name,
  sourceName,
  label = "نامک (slug)",
  hint,
  previewBase,
  required,
}: {
  name: string;
  sourceName: string;
  label?: string;
  hint?: string;
  previewBase?: string;
  required?: boolean;
}) {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  // Pre-filled slug (edit mode) → treat as already-touched so we don't clobber it.
  const touched = useRef(Boolean(getValues(name)));
  const source = watch(sourceName);
  const slug = watch(name) as string;
  const error = errors[name]?.message as string | undefined;

  useEffect(() => {
    if (!touched.current) {
      setValue(name, slugify(String(source ?? "")), { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const reg = register(name);

  const regenerate = () => {
    touched.current = false;
    setValue(name, slugify(String(getValues(sourceName) ?? "")), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <AdminField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <div className="flex gap-2">
        <input
          id={name}
          dir="ltr"
          className={`${fieldClass(error)} font-mono`}
          {...reg}
          onChange={(e) => { touched.current = true; void reg.onChange(e); }}
        />
        <button
          type="button"
          onClick={regenerate}
          title="تولید خودکار از عنوان"
          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border border-dz-primary-200 dark:border-dz-night-border px-3 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
        >
          <Wand2 className="size-4" />
          خودکار
        </button>
      </div>
      {previewBase && slug && (
        <span dir="ltr" className="mt-0.5 block text-start text-xs text-dz-primary-400 dark:text-dz-night-faint">
          {previewBase}
          <span className="text-dz-primary-600 dark:text-dz-primary-300">{slug}</span>
        </span>
      )}
    </AdminField>
  );
}
