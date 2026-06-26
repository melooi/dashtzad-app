"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bannerFormSchema,
  emptyBannerForm,
  BANNER_PLACEMENT_OPTIONS,
  type BannerFormInput,
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
import { AdminField } from "@/components/admin/ui/AdminField";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { createBanner, updateBanner, deleteBanner } from "@/app/admin/collections/banners/actions";

const LIST_PATH = "/admin/collections/banners";

export function BannerForm({
  mode,
  bannerId,
  defaultValues = emptyBannerForm,
}: {
  mode: "create" | "edit";
  bannerId?: string;
  defaultValues?: BannerFormInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<BannerFormInput>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const title = form.watch("title");
  const subtitle = form.watch("subtitle");
  const image = form.watch("imageUrl");
  const mobileImage = form.watch("mobileImageUrl");
  const linkLabel = form.watch("linkLabel");

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createBanner(raw) : await updateBanner(bannerId!, raw);
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
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      {/* Preview card */}
      <div className="overflow-hidden rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card">
        <div className="relative flex min-h-[140px] items-center justify-center bg-dz-primary-50 dark:bg-white/5">
          {image ? (
            <img src={String(image)} alt={String(title ?? "")} className="h-36 w-full object-cover" />
          ) : (
            <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">پیش‌نمایش بنر</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">{String(title) || "عنوان بنر"}</h3>
          {subtitle && <p className="mt-1 text-sm text-dz-primary-500 dark:text-dz-night-muted">{String(subtitle)}</p>}
          {linkLabel && (
            <span className="mt-2 inline-block rounded-lg bg-dz-primary-600 px-3 py-1 text-xs text-white">{String(linkLabel)}</span>
          )}
        </div>
      </div>

      <AdminFormShell form={form} onSubmit={submit}>
        <AdminFormSection title="محتوای بنر">
          <AdminTextField name="title" label="عنوان" required />
          <AdminSlugField name="slug" sourceName="title" required />
          <AdminTextField name="subtitle" label="زیرعنوان" />
          <AdminTextareaField name="description" label="توضیحات" rows={2} />
        </AdminFormSection>

        <AdminFormSection title="تصاویر و لینک" description="تصویر را از کتابخانه‌ی رسانه انتخاب کنید یا نشانی (URL) را دستی وارد کنید.">
          <AdminField label="تصویر دسکتاپ">
            <MediaPicker
              value={String(image ?? "")}
              onChange={(v) => form.setValue("imageUrl", v, { shouldDirty: true, shouldValidate: true })}
              usage="BANNER"
            />
          </AdminField>
          <AdminField label="تصویر موبایل">
            <MediaPicker
              value={String(mobileImage ?? "")}
              onChange={(v) => form.setValue("mobileImageUrl", v, { shouldDirty: true, shouldValidate: true })}
              usage="BANNER"
            />
          </AdminField>
          <AdminTextField name="linkLabel" label="متن دکمه/لینک" />
          <AdminTextField name="linkHref" label="نشانی لینک" dir="ltr" placeholder="/products یا https://…" />
        </AdminFormSection>

        <AdminFormSection title="جایگاه و زمان‌بندی">
          <AdminSelectField name="placement" label="جایگاه" options={BANNER_PLACEMENT_OPTIONS} />
          <AdminTextField name="startsAt" label="شروع نمایش" type="datetime-local" dir="ltr" />
          <AdminTextField name="endsAt" label="پایان نمایش" type="datetime-local" dir="ltr" />
          <AdminTextField name="sortOrder" label="ترتیب" dir="ltr" inputMode="numeric" />
          <AdminCheckboxField name="isActive" label="فعال" />
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد بنر" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && bannerId && (
        <AdminDangerZone
          description="حذف این بنر قابل بازگشت نیست."
          confirmTitle="حذف بنر"
          confirmDescription="آیا مطمئن هستید؟"
          buttonLabel="حذف این بنر"
          onConfirm={() => deleteBanner(bannerId)}
          onDeleted={() => router.push(LIST_PATH)}
        />
      )}
    </div>
  );
}
