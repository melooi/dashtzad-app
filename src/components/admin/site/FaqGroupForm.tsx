"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  faqGroupSchema,
  emptyFaqGroup,
  FAQ_PLACEMENT_OPTIONS,
  type FaqGroupInput,
} from "@/lib/admin/site-experience";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminTextareaField } from "@/components/admin/ui/AdminTextareaField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { createFaqGroup, updateFaqGroup, deleteFaqGroup } from "@/app/admin/collections/faqs/actions";

const LIST_PATH = "/admin/collections/faqs";

export function FaqGroupForm({
  mode,
  groupId,
  defaultValues = emptyFaqGroup,
}: {
  mode: "create" | "edit";
  groupId?: string;
  defaultValues?: FaqGroupInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<FaqGroupInput>({
    resolver: zodResolver(faqGroupSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createFaqGroup(raw) : await updateFaqGroup(groupId!, raw);
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
        <AdminFormSection title="گروه سوالات">
          <AdminTextField name="title" label="عنوان گروه" required />
          <AdminSlugField name="slug" sourceName="title" required />
          <AdminTextareaField name="description" label="توضیحات" rows={2} />
          <AdminSelectField name="placement" label="جایگاه" options={FAQ_PLACEMENT_OPTIONS} />
          <AdminTextField name="sortOrder" label="ترتیب" dir="ltr" inputMode="numeric" />
          <AdminCheckboxField name="isActive" label="فعال" />
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد گروه" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && groupId && (
        <AdminDangerZone
          description="با حذف گروه، همه‌ی سوال‌های آن نیز حذف می‌شوند."
          confirmTitle="حذف گروه سوالات"
          confirmDescription="این عمل قابل بازگشت نیست."
          buttonLabel="حذف این گروه"
          onConfirm={() => deleteFaqGroup(groupId)}
          onDeleted={() => router.push(LIST_PATH)}
        />
      )}
    </div>
  );
}
