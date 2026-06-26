"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormSchema,
  productPreviewBase,
  BASE_UNIT_OPTIONS,
  SALE_MODE_OPTIONS,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/admin/products";
import { productsCollection } from "@/lib/admin/collections";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminRichTextField } from "@/components/admin/ui/AdminRichTextField";
import { AdminViewOnSiteButton } from "@/components/admin/ui/AdminViewOnSiteButton";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminRelationSelect } from "@/components/admin/ui/AdminRelationSelect";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormNavigator, type FormNavItem } from "@/components/admin/ui/AdminFormNavigator";
import { AdminReadinessChecklist, type ReadinessItem } from "@/components/admin/ui/AdminReadinessChecklist";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { VariantMatrix, type WeightOpt, type PackagingOpt, type ExistingVariant } from "@/components/admin/products/VariantMatrix";
import { ProductImageManager, type ImageItem } from "@/components/admin/products/ProductImageManager";
import { SeoPanel } from "@/components/admin/seo/SeoPanel";
import type { SeoMetaInput } from "@/lib/admin/seo";
import { createProduct, updateProduct, deleteProduct } from "@/app/admin/collections/products/actions";

const LIST = productsCollection.route;

export type VariantData = {
  categoryId: string;
  basePriceRial: number;
  basePriceUnit: string;
  weightPresets: WeightOpt[];
  packagingOptions: PackagingOpt[];
  existingVariants: ExistingVariant[];
};

export type ProductSeo = {
  meta: SeoMetaInput;
  autoImage: string | null;
  defaults: { titleTemplate: string; canonicalBase: string; defaultOgImageUrl?: string };
};

export function ProductForm({
  mode,
  productId,
  defaultValues,
  categories,
  variantData,
  seo,
  initialImages = [],
}: {
  mode: "create" | "edit";
  productId?: string;
  defaultValues: ProductFormInput;
  categories: { id: string; title: string }[];
  variantData?: VariantData;
  seo?: ProductSeo;
  initialImages?: ImageItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const isDirty = form.formState.isDirty;

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
      const res = mode === "create" ? await createProduct(raw) : await updateProduct(productId!, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (mode === "create") {
        router.push(`${LIST}/${res.id}`);
      } else {
        setSuccess("تغییرات محصول ذخیره شد.");
        form.reset(raw);
        router.refresh();
      }
    });
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.title }));

  // Product readiness — purely derived from current form values / loaded data.
  const title = form.watch("title");
  const slug = form.watch("slug");
  const categoryId = form.watch("categoryId");
  const basePriceToman = form.watch("basePriceToman");
  const description = form.watch("description");
  const isActive = form.watch("isActive");
  const hasDescription =
    typeof description === "string" ? description.replace(/<[^>]*>/g, "").trim().length > 10 : Boolean(description);
  const variantCount = variantData?.existingVariants?.length ?? 0;
  const hasSeo = Boolean(
    seo?.meta && (String(seo.meta.title ?? "").trim() || String(seo.meta.description ?? "").trim()),
  );
  const readinessItems: ReadinessItem[] = [
    { label: "عنوان محصول", done: Boolean(String(title ?? "").trim()) },
    { label: "اسلاگ (نامک)", done: Boolean(String(slug ?? "").trim()) },
    { label: "دسته‌بندی", done: Boolean(String(categoryId ?? "").trim()) },
    { label: "قیمت پایه", done: Boolean(String(basePriceToman ?? "").trim()) },
    { label: "توضیحات", done: hasDescription },
    { label: "مدل‌های فروش (وزن × بسته‌بندی)", done: variantCount > 0, optional: true, hint: "برای محصولات متغیر لازم است." },
    { label: "سئو (عنوان/متا)", done: hasSeo, optional: true },
    { label: "فعال برای نمایش", done: Boolean(isActive), optional: true },
  ];

  const navItems: FormNavItem[] = [
    { id: "main", label: "اطلاعات اصلی" },
    { id: "sale", label: "حالت فروش" },
    { id: "price", label: "قیمت پایه" },
    { id: "description", label: "توضیحات" },
    { id: "image", label: "تصویر" },
    { id: "variants", label: "مدل‌های فروش" },
    { id: "seo", label: "سئو" },
    ...(mode === "edit" && productId ? [{ id: "danger", label: "حذف", tone: "danger" as const }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
      {mode === "edit" && defaultValues.slug && (
        <div className="flex justify-end">
          <AdminViewOnSiteButton href={`/products/${defaultValues.slug}`} label="مشاهده‌ی محصول در سایت" />
        </div>
      )}
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminReadinessChecklist title="آمادگی انتشار محصول" items={readinessItems} />

      <AdminFormShell form={form} onSubmit={submit}>
        <AdminFormSection id="main" title="اطلاعات اصلی">
          <AdminTextField name="title" label="عنوان محصول" required placeholder="مثلاً: زعفران نگین" />
          <AdminSlugField name="slug" sourceName="title" required previewBase={productPreviewBase()} />
          <AdminRelationSelect name="categoryId" label="دسته‌بندی محصول" required options={categoryOptions} emptyLabel="— انتخاب دسته —" />
          <AdminTextField name="brand" label="برند" placeholder="دشت‌زاد" />
          <AdminTextField name="tags" label="برچسب‌ها" hint="با کاما جدا کنید: زعفران، نگین" />
          <AdminCheckboxField name="isActive" label="محصول فعال است" />
        </AdminFormSection>

        <AdminFormSection
          id="sale"
          title="حالت فروش کارت محصول"
          description="تعیین می‌کند کارت این محصول چه دکمه و وضعیتی نمایش دهد. «خودکار» یعنی سیستم بر اساس موجودی و قیمت تصمیم می‌گیرد."
        >
          <AdminSelectField
            name="saleMode"
            label="حالت فروش"
            required
            options={SALE_MODE_OPTIONS}
          />
          {form.watch("saleMode") === "CONTACT" && (
            <AdminTextField
              name="contactPhone"
              label="شماره تماس (اختیاری)"
              hint="روی کارت محصول با دکمه‌ی تماس نمایش داده می‌شود. فقط اعداد وارد کنید."
              dir="ltr"
              placeholder="02112345678"
            />
          )}
          <AdminCheckboxField
            name="installmentEnabled"
            label='نمایش تراشه‌ی «خرید قسطی» روی کارت'
          />
        </AdminFormSection>

        <AdminFormSection id="price" title="قیمت پایه" description="قیمت پایه مبنای محاسبه‌ی قیمت مدل‌های فروش (وزن × بسته‌بندی) است.">
          <AdminTextField name="basePriceToman" label="قیمت پایه (تومان)" required dir="ltr" inputMode="numeric" hint="در دیتابیس به ریال ذخیره می‌شود." />
          <AdminSelectField name="basePriceUnit" label="واحد قیمت پایه" required options={BASE_UNIT_OPTIONS} />
        </AdminFormSection>

        <AdminFormSection id="description" title="توضیحات محصول" description="ویرایشگر غنی با حالت دیداری و کد. برای متن‌های بلند، فهرست، نقل‌قول و نکته‌ها.">
          <AdminRichTextField name="description" label="توضیحات" placeholder="معرفی کامل محصول…" />
          <AdminRichTextField name="story" label="روایت محصول (Story)" placeholder="داستان و ریشه‌ی این محصول…" minHeight={180} />
        </AdminFormSection>

        <AdminFormSection id="image" title="تصاویر محصول" description="تصاویر را از کتابخانه‌ی رسانه انتخاب کنید. اولین تصویر به‌عنوان تصویر شاخص نمایش داده می‌شود.">
          {mode === "edit" && productId ? (
            <ProductImageManager productId={productId} initialImages={initialImages} />
          ) : (
            <p className="rounded-xl border border-dashed border-dz-primary-200 p-5 text-center text-sm text-dz-primary-400 dark:border-dz-night-border dark:text-dz-night-faint">
              ابتدا محصول را ذخیره کنید تا بتوانید تصاویر اضافه کنید.
            </p>
          )}
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={isDirty}
          errorCount={Object.keys(form.formState.errors).length}
          cancelHref={LIST}
          saveLabel={mode === "create" ? "ایجاد محصول" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {/* Variant matrix — edit mode only (needs a saved product + base price) */}
      <AdminFormSection id="variants" title="مدل‌های فروش (وزن × بسته‌بندی)" description="وزن و بسته‌بندی مجاز را انتخاب کنید تا ماتریس قیمت ساخته شود.">
        {mode === "edit" && productId && variantData ? (
          <VariantMatrix
            productId={productId}
            productCategoryId={variantData.categoryId}
            basePriceRial={variantData.basePriceRial}
            basePriceUnit={variantData.basePriceUnit}
            weightPresets={variantData.weightPresets}
            packagingOptions={variantData.packagingOptions}
            existingVariants={variantData.existingVariants}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-dz-primary-200 p-5 text-center text-sm text-dz-primary-400 dark:border-dz-night-border dark:text-dz-night-faint">
            ابتدا محصول را ذخیره کنید، سپس مدل‌های فروش (وزن و بسته‌بندی) را تعریف کنید.
          </p>
        )}
      </AdminFormSection>

      <div id="seo" className="scroll-mt-24">
        {mode === "edit" && productId && seo ? (
          <SeoPanel
            entityType="PRODUCT"
            entityId={productId}
            initial={seo.meta}
            autoSource={{
              title: defaultValues.title,
              description: defaultValues.description ?? "",
              path: `/products/${defaultValues.slug}`,
              image: seo.autoImage,
            }}
            defaults={seo.defaults}
          />
        ) : (
          <AdminFormSection title="سئو">
            <p className="rounded-xl border border-dashed border-dz-primary-200 p-5 text-center text-sm text-dz-primary-400 dark:border-dz-night-border dark:text-dz-night-faint">
              ابتدا محصول را ذخیره کنید تا پنل سئو (عنوان، توضیحات متا، پیش‌نمایش گوگل) فعال شود.
            </p>
          </AdminFormSection>
        )}
      </div>

      {mode === "edit" && productId && (
        <div id="danger" className="scroll-mt-24">
          <AdminDangerZone
            description="حذف محصول فقط زمانی ممکن است که در سفارش یا سبد خرید استفاده نشده باشد. مدل‌های فروش آن نیز حذف می‌شوند."
            confirmTitle="حذف محصول"
            confirmDescription="این عمل قابل بازگشت نیست. آیا مطمئن هستید؟"
            buttonLabel="حذف این محصول"
            onConfirm={() => deleteProduct(productId)}
            onDeleted={() => router.push(LIST)}
          />
        </div>
      )}
      </div>
      <AdminFormNavigator items={navItems} />
    </div>
  );
}
