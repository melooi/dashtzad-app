"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  redirectSchema,
  emptyRedirect,
  REDIRECT_STATUS_OPTIONS,
  type RedirectInput,
} from "@/lib/admin/site-experience";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { createRedirect, updateRedirect, deleteRedirect } from "@/app/admin/collections/redirects/actions";

const LIST_PATH = "/admin/collections/redirects";

export function RedirectForm({
  mode,
  redirectId,
  defaultValues = emptyRedirect,
}: {
  mode: "create" | "edit";
  redirectId?: string;
  defaultValues?: RedirectInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<RedirectInput>({
    resolver: zodResolver(redirectSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createRedirect(raw) : await updateRedirect(redirectId!, raw);
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
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminFormShell form={form} onSubmit={submit}>
        <AdminFormSection title="ریدایرکت" description="مسیر مبدأ باید با / شروع شود؛ مقصد می‌تواند مسیر داخلی یا URL کامل باشد.">
          <AdminTextField name="source" label="مسیر مبدأ" required dir="ltr" placeholder="/old-path" />
          <AdminTextField name="destination" label="مقصد" required dir="ltr" placeholder="/new-path یا https://…" />
          <AdminSelectField name="statusCode" label="کد وضعیت" options={REDIRECT_STATUS_OPTIONS} />
          <AdminCheckboxField name="isActive" label="فعال" />
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد ریدایرکت" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && redirectId && (
        <AdminDangerZone
          description="حذف این ریدایرکت قابل بازگشت نیست."
          confirmTitle="حذف ریدایرکت"
          confirmDescription="آیا مطمئن هستید؟"
          buttonLabel="حذف این ریدایرکت"
          onConfirm={() => deleteRedirect(redirectId)}
          onDeleted={() => router.push(LIST_PATH)}
        />
      )}
    </div>
  );
}
