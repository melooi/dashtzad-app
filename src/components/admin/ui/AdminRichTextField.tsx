"use client";

import { Controller, useFormContext } from "react-hook-form";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";

/**
 * react-hook-form wrapper around the rich-text editor. Stores sanitized HTML as
 * the field value. Matches AdminField's label/hint/error styling so it sits
 * cleanly beside the other admin form fields.
 */
export function AdminRichTextField({
  name,
  label,
  hint,
  placeholder,
  required,
  minHeight = 220,
  articleType,
}: {
  name: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  minHeight?: number;
  /** ArticleType (CONTENT-CP1) — recommended blocks in the editor toolbar. */
  articleType?: string | null;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const labelId = `${name}-rte-label`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label id={labelId} className="text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg">
          {label}
          {required && <span className="text-dz-error dark:text-dz-error-300"> *</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RichTextEditor
            value={typeof field.value === "string" ? field.value : ""}
            onChange={field.onChange}
            placeholder={placeholder}
            minHeight={minHeight}
            error={Boolean(error)}
            ariaLabelledBy={label ? labelId : undefined}
            articleType={articleType}
          />
        )}
      />
      {hint && !error && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{hint}</span>}
      {error && <span className="text-xs text-dz-error dark:text-dz-error-300">{error}</span>}
    </div>
  );
}
