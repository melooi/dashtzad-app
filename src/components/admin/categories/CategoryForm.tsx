"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categoryFormSchema,
  categoryPreviewBase,
  type CategoryFormInput,
  type CategoryFormValues,
} from "@/lib/admin/categories";
import { categoriesCollection } from "@/lib/admin/collections";
import { descendantIds, depthOf } from "@/lib/admin/tree";
import { toPersianNumbers } from "@/lib/price";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminTextareaField } from "@/components/admin/ui/AdminTextareaField";
import { AdminRichTextField } from "@/components/admin/ui/AdminRichTextField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminRelationSelect } from "@/components/admin/ui/AdminRelationSelect";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/collections/categories/actions";

export type CategoryOption = {
  id: string;
  title: string;
  type: string;
  parentId: string | null;
};

const LIST_PATH = categoriesCollection.route;

export function CategoryForm({
  mode,
  categoryId,
  defaultValues,
  allCategories,
  dependency,
}: {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues: CategoryFormInput;
  allCategories: CategoryOption[];
  dependency?: { children: number; products: number; posts: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const type = form.watch("type");
  const isDirty = form.formState.isDirty;

  // Parent options: same type, excluding self + its descendants (cycle-safe).
  const parentOptions = useMemo(() => {
    const blocked = categoryId ? descendantIds(allCategories, categoryId) : new Set<string>();
    return allCategories
      .filter((c) => c.type === type && !blocked.has(c.id))
      .map((c) => ({
        value: c.id,
        label: `${"— ".repeat(depthOf(allCategories, c.id))}${c.title}`,
      }));
  }, [allCategories, type, categoryId]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createCategory(raw)
          : await updateCategory(categoryId!, raw);

      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (mode === "create") {
        // Continue editing the freshly created category.
        router.push(`${LIST_PATH}/${res.id}`);
      } else {
        setSuccess("تغییرات با موفقیت ذخیره شد.");
        form.reset(raw); // clears the dirty state
        router.refresh();
      }
    });
  };

  const renderField = (fieldName: string) => {
    const field = categoriesCollection.fields.find((f) => f.name === fieldName);
    if (!field) return null;

    switch (field.type) {
      case "text":
        return (
          <AdminTextField
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            required={field.required}
            dir={field.dir}
          />
        );
      case "textarea":
        return (
          <AdminTextareaField
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows}
          />
        );
      case "richtext":
        return (
          <AdminRichTextField
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case "select":
        return (
          <AdminSelectField
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            required={field.required}
            options={field.options ?? []}
          />
        );
      case "slug":
        return (
          <AdminSlugField
            key={field.name}
            name={field.name}
            sourceName={field.slugSource ?? "title"}
            label={field.label}
            required={field.required}
            previewBase={categoryPreviewBase(type)}
          />
        );
      case "relation":
        return (
          <AdminRelationSelect
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            options={parentOptions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminFormShell form={form} onSubmit={submit}>
        {categoriesCollection.sections.map((section) => {
          const fields = categoriesCollection.fields.filter((f) => f.section === section.key);
          if (fields.length === 0) return null;
          return (
            <AdminFormSection
              key={section.key}
              title={section.title}
              description={section.description}
            >
              {fields.map((f) => renderField(f.name))}
            </AdminFormSection>
          );
        })}

        <AdminSubmitBar
          submitting={pending}
          dirty={isDirty}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد دسته‌بندی" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && categoryId && (
        <AdminDangerZone
          description="حذف دسته فقط زمانی ممکن است که زیرمجموعه، محصول یا نوشته‌ای به آن متصل نباشد."
          confirmTitle="حذف دسته‌بندی"
          confirmDescription="این عمل قابل بازگشت نیست. آیا مطمئن هستید؟"
          buttonLabel="حذف این دسته"
          onConfirm={() => deleteCategory(categoryId)}
          onDeleted={() => router.push(LIST_PATH)}
        />
      )}

      {dependency && mode === "edit" && (
        <p className="text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          وابستگی‌ها — زیرمجموعه: {toPersianNumbers(dependency.children)} · محصول:{" "}
          {toPersianNumbers(dependency.products)} · نوشته: {toPersianNumbers(dependency.posts)}
        </p>
      )}
    </div>
  );
}
