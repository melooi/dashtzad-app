"use client";

import { useFormContext } from "react-hook-form";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { ARTICLE_TYPES, type ArticleTypeKey } from "@/lib/admin/article-types";

/**
 * Renders the graphical, article-type-specific fields (stored in Post.typeMeta).
 * No raw JSON — each descriptor becomes a labelled input bound to typeMeta.<key>.
 */
export function TypeMetaFields({ articleType }: { articleType: ArticleTypeKey }) {
  const { register } = useFormContext();
  const fields = ARTICLE_TYPES[articleType]?.metaFields ?? [];

  if (fields.length === 0) {
    return <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">این نوع مقاله فیلد اختصاصی ندارد.</p>;
  }

  return (
    <div className="grid gap-4 @md:grid-cols-2">
      {fields.map((f) => {
        const name = `typeMeta.${f.key}`;
        const wide = f.input === "textarea" || f.input === "tags";
        return (
          <div key={f.key} className={`flex flex-col gap-1.5 ${wide ? "@md:col-span-2" : ""}`}>
            <label htmlFor={name} className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
              {f.label}
            </label>
            {f.input === "textarea" ? (
              <textarea id={name} rows={3} className={`${fieldClass()} resize-y leading-7`} {...register(name)} />
            ) : f.input === "select" ? (
              <select id={name} className={fieldClass()} {...register(name)}>
                <option value="">— انتخاب —</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input id={name} className={fieldClass()} {...register(name)} />
            )}
            {f.hint && <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{f.hint}</span>}
          </div>
        );
      })}
    </div>
  );
}
