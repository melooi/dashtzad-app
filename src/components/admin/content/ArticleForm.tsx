"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ShieldAlert } from "lucide-react";
import {
  articleFormSchema,
  emptyArticleForm,
  estimateReadingTime,
  ARTICLE_STATUS_OPTIONS,
  ARTICLE_ACCESS_OPTIONS,
  type ArticleFormInput,
} from "@/lib/admin/articles";
import { ARTICLE_TYPES, ARTICLE_TYPE_KEYS, type ArticleTypeKey } from "@/lib/admin/article-types";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminTextareaField } from "@/components/admin/ui/AdminTextareaField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminSlugField } from "@/components/admin/ui/AdminSlugField";
import { AdminRelationSelect, type RelationOption } from "@/components/admin/ui/AdminRelationSelect";
import { AdminRichTextField } from "@/components/admin/ui/AdminRichTextField";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormNavigator, type FormNavItem } from "@/components/admin/ui/AdminFormNavigator";
import { AdminReadinessChecklist, type ReadinessItem } from "@/components/admin/ui/AdminReadinessChecklist";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { SourcesField } from "./SourcesField";
import { MultiSelectField, type MultiOption } from "./MultiSelectField";
import { TypeMetaFields } from "./TypeMetaFields";
import { RecipeMetaFields } from "./RecipeMetaFields";
import { createArticle, updateArticle, deleteArticle } from "@/app/admin/content/articles/actions";

const LIST = "/admin/content/articles";

export function ArticleForm({
  mode,
  articleId,
  defaultValues = emptyArticleForm,
  categories,
  authors,
  series,
  products,
  posts,
}: {
  mode: "create" | "edit";
  articleId?: string;
  defaultValues?: ArticleFormInput;
  categories: RelationOption[];
  authors: RelationOption[];
  series: RelationOption[];
  products: MultiOption[];
  posts: MultiOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ArticleFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(articleFormSchema) as any,
    defaultValues,
    mode: "onTouched",
  });

  const articleType = (form.watch("articleType") ?? "TASTE_STORY") as ArticleTypeKey;
  const identity = ARTICLE_TYPES[articleType];
  const title = form.watch("title");
  const subtitle = form.watch("subtitle");
  const cover = form.watch("coverImage");
  const brief = form.watch("briefText");

  const pickType = (key: ArticleTypeKey) => {
    const cur = (form.getValues("typeMeta") ?? {}) as Record<string, string>;
    const next: Record<string, string> = {};
    for (const f of ARTICLE_TYPES[key].metaFields) next[f.key] = cur[f.key] ?? f.default ?? "";
    form.setValue("articleType", key, { shouldDirty: true, shouldValidate: true });
    form.setValue("typeMeta", next, { shouldDirty: true });
  };

  const estimate = () => {
    const html = form.getValues("text") || "";
    form.setValue("readingTime", estimateReadingTime(String(html)), { shouldDirty: true });
  };

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = mode === "create" ? await createArticle(raw) : await updateArticle(articleId!, raw);
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

  // Editorial readiness — purely derived from current form values.
  const slug = form.watch("slug");
  const categoryId = form.watch("categoryId");
  const authorId = form.watch("authorId");
  const status = form.watch("status");
  const text = form.watch("text");
  const recipeMeta = form.watch("recipeMeta") as { ingredients?: unknown[]; steps?: unknown[] } | undefined;
  const isRecipe = articleType === "RECIPE";
  const hasContent =
    typeof text === "string" ? text.replace(/<[^>]*>/g, "").trim().length > 20 : Boolean(text);
  const editorialItems: ReadinessItem[] = [
    { label: "عنوان", done: Boolean(String(title ?? "").trim()) },
    { label: "اسلاگ (نامک)", done: Boolean(String(slug ?? "").trim()) },
    { label: "خلاصه / لید", done: Boolean(String(brief ?? "").trim()) },
    { label: "تصویر شاخص", done: Boolean(String(cover ?? "").trim()), hint: "برای کارت مقاله و اشتراک‌گذاری لازم است." },
    { label: "محتوای اصلی", done: hasContent },
    { label: "دسته‌بندی", done: Boolean(String(categoryId ?? "").trim()) },
    { label: "نویسنده", done: Boolean(String(authorId ?? "").trim()) },
    ...(isRecipe
      ? ([
          { label: "مواد لازم", done: Array.isArray(recipeMeta?.ingredients) && recipeMeta!.ingredients!.length > 0 },
          { label: "مراحل پخت", done: Array.isArray(recipeMeta?.steps) && recipeMeta!.steps!.length > 0 },
        ] as ReadinessItem[])
      : []),
    { label: "منتشر شده", done: status === "PUBLISHED", optional: true },
  ];

  const navItems: FormNavItem[] = [
    { id: "main", label: "اطلاعات اصلی" },
    { id: "type", label: "نوع و قالب" },
    { id: "type-meta", label: articleType === "RECIPE" ? "کارت دستور پخت" : "فیلدهای نوع" },
    { id: "taxonomy", label: "دسته و برچسب" },
    { id: "media", label: "تصویر شاخص" },
    { id: "summary", label: "خلاصه" },
    { id: "content", label: "محتوا" },
    { id: "sources", label: "منابع" },
    { id: "relations", label: "ارتباطات" },
    { id: "publish", label: "انتشار" },
    ...(mode === "edit" && articleId ? [{ id: "danger", label: "حذف", tone: "danger" as const }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      {/* preview */}
      <div className="overflow-hidden rounded-2xl border border-dz-primary-100 bg-white shadow-xs dark:border-dz-night-border dark:bg-dz-night-card">
        <div className="relative flex min-h-[150px] items-center justify-center bg-dz-primary-50 dark:bg-white/5">
          {cover ? (
            <img src={String(cover)} alt={String(title ?? "")} className="h-40 w-full object-cover" />
          ) : (
            <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">پیش‌نمایش تصویر شاخص</span>
          )}
          <span
            className="absolute end-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ background: identity.accent }}
          >
            {identity.badge}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">{String(title) || "عنوان مقاله"}</h3>
          {subtitle && <p className="mt-1 text-sm text-dz-primary-500 dark:text-dz-night-muted">{String(subtitle)}</p>}
          {brief && <p className="mt-2 line-clamp-2 text-xs text-dz-primary-400 dark:text-dz-night-faint">{String(brief)}</p>}
        </div>
      </div>

      <AdminReadinessChecklist title="آمادگی انتشار مقاله" items={editorialItems} />

      <AdminFormShell form={form} onSubmit={submit}>
        {/* 1 — اطلاعات اصلی */}
        <AdminFormSection id="main" title="اطلاعات اصلی">
          <AdminTextField name="title" label="عنوان" required />
          <AdminSlugField name="slug" sourceName="title" required previewBase="/blog/" />
          <AdminTextField name="subtitle" label="زیرعنوان / لید کوتاه" />
        </AdminFormSection>

        {/* 2 — نوع مقاله و قالب */}
        <AdminFormSection id="type" title="نوع مقاله و قالب" description="نوع مقاله، قالبِ نمایش و بلوک‌های پیشنهادی ویرایشگر را تعیین می‌کند.">
          <div className="grid gap-2 @md:grid-cols-3">
            {ARTICLE_TYPE_KEYS.map((key) => {
              const t = ARTICLE_TYPES[key];
              const active = key === articleType;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickType(key)}
                  aria-pressed={active}
                  className={`focus-ring flex flex-col items-start gap-1 rounded-xl border p-3 text-start transition-colors ${
                    active
                      ? "border-transparent text-white shadow-xs"
                      : "border-dz-primary-200 bg-white text-dz-primary-700 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-fg dark:hover:bg-white/5"
                  }`}
                  style={active ? { background: t.accent } : undefined}
                >
                  <span className="text-sm font-bold">{t.label}</span>
                  <span className={`text-[11px] leading-4 ${active ? "text-white/85" : "text-dz-primary-400 dark:text-dz-night-faint"}`}>
                    {t.description}
                  </span>
                </button>
              );
            })}
          </div>
          {(identity.requiresDisclaimer || identity.requiresSources) && (
            <div className="flex items-start gap-2 rounded-xl border border-dz-warning/30 bg-dz-warning/10 p-3 text-xs text-dz-warning dark:border-dz-warning-300/30 dark:text-dz-warning-300">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                این نوع مقاله حساس است: سلب مسئولیت {identity.requiresSources ? "و منبع معتبر " : ""}الزامی است. بدون منبع
                واقعی، مقاله را پیش‌نویس نگه دارید و در «یادداشت مدیر» بنویسید «منبع معتبر باید تکمیل شود».
              </span>
            </div>
          )}
        </AdminFormSection>

        {/* فیلدهای اختصاصی نوع مقاله */}
        {articleType === "RECIPE" ? (
          <AdminFormSection id="type-meta" title="کارت دستور پخت" description="داده‌ی ساختاریِ دستور؛ بالای متنِ مقاله نمایش داده می‌شود.">
            <RecipeMetaFields />
          </AdminFormSection>
        ) : (
          <AdminFormSection id="type-meta" title="فیلدهای اختصاصی این نوع مقاله">
            <TypeMetaFields articleType={articleType} />
          </AdminFormSection>
        )}

        {/* 3 — دسته‌بندی و برچسب‌ها */}
        <AdminFormSection id="taxonomy" title="دسته‌بندی و برچسب‌ها">
          <AdminRelationSelect name="categoryId" label="دسته‌بندی" options={categories} emptyLabel="— انتخاب دسته —" required />
          <AdminTextField name="tags" label="برچسب‌ها" placeholder="برنج، زعفران، نگهداری" />
        </AdminFormSection>

        {/* 4 — تصویر شاخص */}
        <AdminFormSection id="media" title="تصویر شاخص" description="از کتابخانه‌ی رسانه انتخاب کنید. برای انتشار، تصویر شاخص لازم است.">
          <AdminField label="تصویر شاخص">
            <MediaPicker
              value={String(cover ?? "")}
              onChange={(v) => form.setValue("coverImage", v, { shouldDirty: true, shouldValidate: true })}
              usage="BLOG"
            />
          </AdminField>
        </AdminFormSection>

        {/* 5 — خلاصه و لید */}
        <AdminFormSection id="summary" title="خلاصه و لید">
          <AdminTextareaField name="briefText" label="خلاصه / لید" rows={3} required />
        </AdminFormSection>

        {/* 6 + 7 — ویرایشگر محتوا + بلوک‌های اختصاصی */}
        <AdminFormSection
          id="content"
          title="ویرایشگر محتوا"
          description={`بلوک‌های پیشنهادی «${identity.label}» از منوی «بلوک‌های این نوع مقاله» در نوار ابزار در دسترس‌اند.`}
        >
          <AdminRichTextField name="text" label="متن مقاله" articleType={articleType} minHeight={360} />
        </AdminFormSection>

        {/* 8 — منابع و ارجاعات */}
        <AdminFormSection id="sources" title="منابع و ارجاعات" description="فقط منابع واقعی. منبع جعلی ممنوع است.">
          <SourcesField />
        </AdminFormSection>

        {/* 9 — ارتباطات */}
        <AdminFormSection id="relations" title="ارتباطات">
          <div className="grid gap-4 @md:grid-cols-2">
            <AdminRelationSelect name="seriesId" label="پرونده‌ی مرتبط" options={series} emptyLabel="— بدون پرونده —" />
            <AdminTextField name="seriesOrder" label="ترتیب در پرونده" dir="ltr" inputMode="numeric" />
          </div>
          <AdminField label="مقالات مرتبط">
            <MultiSelectField name="relatedPostIds" options={posts} emptyText="مقاله‌ی دیگری برای ارتباط نیست." searchPlaceholder="جستجوی مقاله…" />
          </AdminField>
          <AdminField label="محصولات مرتبط" hint="فقط محصولات واقعی موجود.">
            <MultiSelectField name="relatedProductIds" options={products} emptyText="محصولی موجود نیست." searchPlaceholder="جستجوی محصول…" />
          </AdminField>
        </AdminFormSection>

        {/* 10 — تنظیمات انتشار */}
        <AdminFormSection id="publish" title="تنظیمات انتشار">
          <div className="grid gap-4 @md:grid-cols-2">
            <AdminSelectField name="status" label="وضعیت" options={[...ARTICLE_STATUS_OPTIONS]} />
            <AdminSelectField name="accessType" label="سطح دسترسی" options={[...ARTICLE_ACCESS_OPTIONS]} />
            <AdminRelationSelect name="authorId" label="نویسنده" options={authors} emptyLabel="— انتخاب نویسنده —" required />
            <AdminField label="زمان مطالعه (دقیقه)">
              <div className="flex gap-2">
                <AdminTextField name="readingTime" dir="ltr" inputMode="numeric" />
                <button
                  type="button"
                  onClick={estimate}
                  title="تخمین خودکار از متن"
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dz-primary-200 px-3 text-xs text-dz-primary-600 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-primary-300 dark:hover:bg-white/5"
                >
                  <Sparkles className="size-4" /> تخمین
                </button>
              </div>
            </AdminField>
          </div>
          <AdminTextareaField name="adminNote" label="یادداشت مدیر (خصوصی)" rows={2} />
        </AdminFormSection>

        <AdminSubmitBar
          submitting={pending}
          dirty={form.formState.isDirty}
          errorCount={Object.keys(form.formState.errors).length}
          cancelHref={LIST}
          saveLabel={mode === "create" ? "ایجاد مقاله" : "ذخیره‌ی تغییرات"}
        />
      </AdminFormShell>

      {mode === "edit" && articleId && (
        <div id="danger" className="scroll-mt-24">
          <AdminDangerZone
            description="حذف این مقاله و دیدگاه‌های آن قابل بازگشت نیست."
            confirmTitle="حذف مقاله"
            confirmDescription="آیا مطمئن هستید؟"
            buttonLabel="حذف این مقاله"
            onConfirm={() => deleteArticle(articleId)}
            onDeleted={() => router.push(LIST)}
          />
        </div>
      )}
      </div>
      <AdminFormNavigator items={navItems} />
    </div>
  );
}
