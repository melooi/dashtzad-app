"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  menuFormSchema,
  emptyMenuForm,
  MENU_LOCATION_OPTIONS,
  type MenuFormInput,
} from "@/lib/admin/site-experience";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { createMenu, updateMenu, deleteMenu } from "@/app/admin/collections/menus/actions";

const LIST_PATH = "/admin/collections/menus";

export function MenuForm({
  mode,
  menuId,
  defaultValues = emptyMenuForm,
}: {
  mode: "create" | "edit";
  menuId?: string;
  defaultValues?: MenuFormInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<MenuFormInput>({
    resolver: zodResolver(menuFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createMenu(raw) : await updateMenu(menuId!, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (mode === "create") router.push(`${LIST_PATH}/${res.id}`);
      else {
        setSuccess("تغییرات ذخیره شد.");
        form.reset(raw);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminFormShell form={form} onSubmit={submit}>
        <AdminFormSection title="اطلاعات منو">
          <AdminTextField name="title" label="عنوان منو" required />
          <AdminSlugField name="slug" sourceName="title" required />
          <AdminSelectField name="location" label="جایگاه" options={MENU_LOCATION_OPTIONS} />
          <AdminTextField name="sortOrder" label="ترتیب" dir="ltr" inputMode="numeric" />
          <AdminCheckboxField name="isActive" label="فعال" />
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد منو" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && menuId && (
        <AdminDangerZone
          description="اگر این منو در هدر یا فوتر استفاده شده باشد، ابتدا باید از آنجا برداشته شود."
          confirmTitle="حذف منو"
          confirmDescription="با حذف منو، همه‌ی موارد آن نیز حذف می‌شوند."
          buttonLabel="حذف این منو"
          onConfirm={() => deleteMenu(menuId)}
          onDeleted={() => router.push(LIST_PATH)}
        />
      )}
    </div>
  );
}
