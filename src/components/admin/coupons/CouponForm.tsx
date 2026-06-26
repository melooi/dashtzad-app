"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, CircleCheck, CircleAlert, TriangleAlert } from "lucide-react";
import {
  couponFormSchema,
  draftCouponFromForm,
  calculateDiscountPreview,
  summarizeCouponRule,
  getCouponStatus,
  COUPON_TYPE_OPTIONS,
  type CouponFormInput,
  type CouponFormValues,
} from "@/lib/admin/coupons";
import { couponsCollection } from "@/lib/admin/collections";
import { normalizeDigits } from "@/lib/admin/slug";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminTextareaField } from "@/components/admin/ui/AdminTextareaField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormNavigator, type FormNavItem } from "@/components/admin/ui/AdminFormNavigator";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/admin/collections/coupons/actions";

const LIST_PATH = couponsCollection.route;
const sectionTitle = (key: string) =>
  couponsCollection.sections.find((s) => s.key === key)?.title ?? "";

export function CouponForm({
  mode,
  couponId,
  defaultValues,
  usageCount,
}: {
  mode: "create" | "edit";
  couponId?: string;
  defaultValues: CouponFormInput;
  usageCount?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sampleToman, setSampleToman] = useState("");

  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const values = form.watch();
  const isPercent = values.type === "PERCENT";
  const isDirty = form.formState.isDirty;

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
      const res = mode === "create" ? await createCoupon(raw) : await updateCoupon(couponId!, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (mode === "create") {
        router.push(`${LIST_PATH}/${res.id}`);
      } else {
        setSuccess("تغییرات با موفقیت ذخیره شد.");
        form.reset(raw);
        router.refresh();
      }
    });
  };

  // ---- Live preview (pure calculator, no fake order data) ----
  const draft = draftCouponFromForm(values as CouponFormInput);
  const ruleSummary = summarizeCouponRule(draft);
  const status = getCouponStatus(draft);
  const sampleNum = Number(normalizeDigits(sampleToman).trim()) || 0;
  const subtotalRial = sampleNum * 10;
  const preview = calculateDiscountPreview(draft, subtotalRial);
  const showAmounts = sampleNum > 0;
  const percentNeedsCap = isPercent && draft.maxDiscount_rial === null;

  const navItems: FormNavItem[] = [
    { id: "main", label: sectionTitle("main") },
    { id: "discount", label: sectionTitle("discount") },
    { id: "rules", label: sectionTitle("rules") },
    { id: "schedule", label: sectionTitle("schedule") },
    { id: "limits", label: sectionTitle("limits") },
    { id: "preview", label: sectionTitle("preview") },
    ...(mode === "edit" && couponId ? [{ id: "danger", label: "حذف", tone: "danger" as const }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminFormShell form={form} onSubmit={submit}>
        {/* اطلاعات اصلی */}
        <AdminFormSection id="main" title={sectionTitle("main")}>
          <AdminTextField
            name="code"
            label="کد تخفیف"
            required
            dir="ltr"
            placeholder="WELCOME-1313"
            hint="فقط حروف بزرگ لاتین، عدد انگلیسی، خط‌تیره و زیرخط. ارقام فارسی خودکار انگلیسی می‌شوند."
          />
          <AdminTextField name="title" label="نام داخلی" placeholder="مثلاً: کمپین نوروز" hint="برای مدیریت داخلی؛ به مشتری نمایش داده نمی‌شود." />
          <AdminTextareaField name="description" label="یادداشت / توضیحات" rows={2} placeholder="توضیح کوتاه برای ادمین…" />
          <AdminCheckboxField name="isActive" label="فعال باشد" hint="کوپن غیرفعال در پرداخت قابل استفاده نخواهد بود." />
        </AdminFormSection>

        {/* نوع و مقدار تخفیف */}
        <AdminFormSection id="discount" title={sectionTitle("discount")}>
          <AdminSelectField name="type" label="نوع تخفیف" required options={COUPON_TYPE_OPTIONS} />
          <AdminTextField
            name="value"
            label={isPercent ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
            required
            dir="ltr"
            inputMode="numeric"
            hint={isPercent ? "عددی بین ۱ تا ۱۰۰." : "به تومان وارد کنید؛ در دیتابیس به ریال ذخیره می‌شود."}
          />
          {isPercent && (
            <AdminTextField
              name="maxDiscount"
              label="سقف تخفیف (تومان)"
              dir="ltr"
              inputMode="numeric"
              hint="پیشنهاد می‌شود برای کوپن‌های درصدی یک سقف تعیین کنید."
            />
          )}
        </AdminFormSection>

        {/* قوانین استفاده */}
        <AdminFormSection id="rules" title={sectionTitle("rules")}>
          <AdminTextField
            name="minOrder"
            label="حداقل مبلغ سفارش (تومان)"
            dir="ltr"
            inputMode="numeric"
            hint="در صورت خالی بودن، محدودیتی برای حداقل سفارش وجود ندارد."
          />
          <AdminCheckboxField
            name="firstOrderOnly"
            label="فقط برای اولین سفارش"
            hint="فعلاً فقط ذخیره می‌شود؛ اعمال آن در پرداخت در این مرحله انجام نمی‌شود (در انتظار توسعه)."
          />
        </AdminFormSection>

        {/* زمان‌بندی */}
        <AdminFormSection id="schedule" title={sectionTitle("schedule")} description="تاریخ شروع اختیاری است؛ تاریخ انقضا الزامی است.">
          <AdminTextField name="startsAt" label="شروع فعال‌سازی" type="datetime-local" dir="ltr" />
          <AdminTextField name="expiresAt" label="تاریخ انقضا" required type="datetime-local" dir="ltr" />
        </AdminFormSection>

        {/* محدودیت‌ها */}
        <AdminFormSection id="limits" title={sectionTitle("limits")}>
          <AdminTextField
            name="usageLimit"
            label="سقف کل دفعات استفاده"
            required
            dir="ltr"
            inputMode="numeric"
            hint="حداقل ۱. تعداد کل دفعاتی که این کوپن می‌تواند استفاده شود."
          />
          <AdminTextField
            name="perUserLimit"
            label="سقف استفاده هر کاربر"
            dir="ltr"
            inputMode="numeric"
            hint="فعلاً فقط ذخیره می‌شود؛ اعمال آن در پرداخت در این مرحله انجام نمی‌شود (در انتظار توسعه)."
          />
        </AdminFormSection>

        {/* پیش‌نمایش */}
        <AdminFormSection
          id="preview"
          title={sectionTitle("preview")}
          description="یک ماشین‌حساب داخلی برای بررسی رفتار کوپن. هیچ سفارش واقعی ساخته نمی‌شود."
        >
          <div className="flex flex-col gap-2 rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-dz-a-primary-50/40 dark:bg-white/5 p-3.5">
            <div className="flex items-center gap-2 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg">
              <Calculator className="size-4 text-dz-a-primary-500 dark:text-dz-a-night-muted" />
              <span>خلاصه‌ی قانون:</span>
              <span className="font-medium">{ruleSummary}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">
              <span>وضعیت فعلی:</span>
              <AdminStatusBadge tone={status.tone}>{status.label}</AdminStatusBadge>
            </div>
          </div>

          <AdminField label="مبلغ نمونه‌ی سبد خرید (تومان)">
            <input
              dir="ltr"
              inputMode="numeric"
              value={sampleToman}
              onChange={(e) => setSampleToman(e.target.value)}
              placeholder="مثلاً: ۱۰۰۰۰۰۰"
              className="w-full rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-elevated px-3.5 py-2.5 text-sm text-dz-a-primary-900 dark:text-dz-a-night-fg shadow-xs outline-none transition-colors placeholder:text-dz-a-primary-300 dark:placeholder:text-dz-a-night-faint hover:border-dz-a-primary-300 dark:hover:border-dz-a-primary-500/50 focus:border-dz-a-primary-500 focus:ring-3 focus:ring-dz-a-primary-500/15"
            />
          </AdminField>

          <div
            className={`flex flex-col gap-2 rounded-xl border p-3.5 text-sm ${
              preview.valid
                ? "border-dz-a-success/30 bg-dz-a-success/5 dark:bg-dz-a-success/10"
                : "border-dz-a-warning/30 bg-dz-a-warning/5 dark:bg-dz-a-warning/10"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {preview.valid ? (
                <CircleCheck className="size-4 text-dz-a-success" />
              ) : (
                <CircleAlert className="size-4 text-dz-a-warning" />
              )}
              <span className={preview.valid ? "text-dz-a-success" : "text-dz-a-warning"}>
                {preview.valid ? "کوپن برای این مبلغ معتبر است." : preview.reason}
              </span>
            </div>

            {showAmounts && preview.valid && (
              <dl className="mt-1 grid grid-cols-1 gap-1.5 text-xs text-dz-a-primary-700 dark:text-dz-a-night-fg @sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/60 dark:bg-black/10 px-2.5 py-1.5">
                  <dt className="text-dz-a-primary-500 dark:text-dz-a-night-muted">مبلغ تخفیف</dt>
                  <dd dir="ltr" className="font-medium">{formatToman(preview.discount_rial)} تومان</dd>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/60 dark:bg-black/10 px-2.5 py-1.5">
                  <dt className="text-dz-a-primary-500 dark:text-dz-a-night-muted">مبلغ نهایی</dt>
                  <dd dir="ltr" className="font-medium">{formatToman(preview.final_rial)} تومان</dd>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/60 dark:bg-black/10 px-2.5 py-1.5">
                  <dt className="text-dz-a-primary-500 dark:text-dz-a-night-muted">سقف اعمال شد؟</dt>
                  <dd className="font-medium">{preview.capped ? "بله" : "خیر"}</dd>
                </div>
              </dl>
            )}
            {!showAmounts && (
              <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                برای دیدن مبلغ تخفیف، یک مبلغ نمونه وارد کنید.
              </p>
            )}
          </div>

          {percentNeedsCap && (
            <div className="flex items-start gap-2 rounded-xl border border-dz-a-warning/30 bg-dz-a-warning/5 dark:bg-dz-a-warning/10 p-3 text-xs text-dz-a-warning">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>برای کوپن درصدی توصیه می‌شود یک «سقف تخفیف» تعیین کنید تا تخفیف از حد معینی بیشتر نشود.</span>
            </div>
          )}
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={isDirty}
          errorCount={Object.keys(form.formState.errors).length}
          cancelHref={LIST_PATH}
          saveLabel={mode === "create" ? "ایجاد کوپن" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && couponId && (
        <div id="danger" className="scroll-mt-24">
          <AdminDangerZone
            description="حذف فقط برای کوپن‌های استفاده‌نشده ممکن است. برای کوپن‌های استفاده‌شده به‌جای حذف، آن‌ها را غیرفعال کنید تا تاریخچه‌ی سفارش‌ها سالم بماند."
            confirmTitle="حذف کوپن"
            confirmDescription="این عمل قابل بازگشت نیست. آیا مطمئن هستید؟"
            buttonLabel="حذف این کوپن"
            onConfirm={() => deleteCoupon(couponId)}
            onDeleted={() => router.push(LIST_PATH)}
          />
        </div>
      )}

      {mode === "edit" && typeof usageCount === "number" && (
        <p className="text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          تعداد دفعات استفاده‌شده تاکنون: {toPersianNumbers(usageCount)}
        </p>
      )}
      </div>
      <AdminFormNavigator items={navItems} />
    </div>
  );
}
