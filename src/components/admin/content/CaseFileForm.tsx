"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  seriesFormSchema,
  emptySeriesForm,
  SERIES_STATUS_OPTIONS,
  type SeriesFormInput,
} from "@/lib/admin/content-series";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminTextareaField } from "@/components/admin/ui/AdminTextareaField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminRichTextField } from "@/components/admin/ui/AdminRichTextField";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormNavigator, type FormNavItem } from "@/components/admin/ui/AdminFormNavigator";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { createCaseFile, updateCaseFile, deleteCaseFile } from "@/app/admin/content/case-files/actions";

const LIST = "/admin/content/case-files";

export function CaseFileForm({
  mode,
  caseFileId,
  defaultValues = emptySeriesForm,
}: {
  mode: "create" | "edit";
  caseFileId?: string;
  defaultValues?: SeriesFormInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<SeriesFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(seriesFormSchema) as any,
    defaultValues,
    mode: "onTouched",
  });

  const title = form.watch("title");
  const subtitle = form.watch("subtitle");
  const cover = form.watch("coverImage");

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createCaseFile(raw) : await updateCaseFile(caseFileId!, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (mode === "create") router.push(`${LIST}/${res.id}`);
      else {
        setSuccess("تغییرات ذخیره شد.");
        form.reset(raw);
        router.refresh();
      }
    });
  };

  const navItems: FormNavItem[] = [
    { id: "main", label: "اطلاعات اصلی" },
    { id: "intro", label: "معرفی پرونده" },
    { id: "cover", label: "جلد و محورها" },
    { id: "settings", label: "تنظیمات" },
    ...(mode === "edit" && caseFileId ? [{ id: "danger", label: "حذف", tone: "danger" as const }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <div className="relative flex min-h-[140px] items-center justify-center bg-dz-a-primary-50 dark:bg-white/5">
          {cover ? (
            <img src={String(cover)} alt={String(title ?? "")} className="h-36 w-full object-cover" />
          ) : (
            <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">پیش‌نمایش جلد پرونده</span>
          )}
          <span className="absolute end-3 top-3 rounded-full bg-[#7a5538] px-2.5 py-1 text-[11px] font-bold text-white">پرونده</span>
        </div>
        <div className="p-4">
          <h3 className="font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">{String(title) || "عنوان پرونده"}</h3>
          {subtitle && <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{String(subtitle)}</p>}
        </div>
      </div>

      <AdminFormShell form={form} onSubmit={submit}>
        <AdminFormSection id="main" title="اطلاعات اصلی">
          <AdminTextField name="title" label="عنوان پرونده" required />
          <AdminSlugField name="slug" sourceName="title" required previewBase="/blog/case-files/" />
          <AdminTextField name="subtitle" label="زیرعنوان" />
        </AdminFormSection>

        <AdminFormSection id="intro" title="معرفی پرونده">
          <AdminTextareaField name="summary" label="خلاصه" rows={2} />
          <AdminRichTextField name="intro" label="درآمد پرونده (اختیاری)" minHeight={220} />
        </AdminFormSection>

        <AdminFormSection id="cover" title="جلد و محورها">
          <AdminField label="تصویر جلد">
            <MediaPicker
              value={String(cover ?? "")}
              onChange={(v) => form.setValue("coverImage", v, { shouldDirty: true, shouldValidate: true })}
              usage="BLOG"
            />
          </AdminField>
          <AdminTextField name="keyTopics" label="محورهای کلیدی" placeholder="شالیزار، انواع برنج، نگهداری" />
        </AdminFormSection>

        <AdminFormSection id="settings" title="تنظیمات">
          <div className="grid gap-4 @md:grid-cols-2">
            <AdminSelectField name="status" label="وضعیت" options={[...SERIES_STATUS_OPTIONS]} />
            <AdminTextField name="sortOrder" label="ترتیب" dir="ltr" inputMode="numeric" />
          </div>
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          errorCount={Object.keys(form.formState.errors).length}
          cancelHref={LIST}
          saveLabel={mode === "create" ? "ایجاد پرونده" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && caseFileId && (
        <div id="danger" className="scroll-mt-24">
          <AdminDangerZone
            description="حذف این پرونده قابل بازگشت نیست. مقاله‌های عضو، از پرونده جدا می‌شوند (حذف نمی‌شوند)."
            confirmTitle="حذف پرونده"
            confirmDescription="آیا مطمئن هستید؟"
            buttonLabel="حذف این پرونده"
            onConfirm={() => deleteCaseFile(caseFileId)}
            onDeleted={() => router.push(LIST)}
          />
        </div>
      )}
      </div>
      <AdminFormNavigator items={navItems} />
    </div>
  );
}
