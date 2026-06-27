"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldAlert,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  Check,
  CircleAlert,
  Circle,
  Search,
  NotebookPen,
  ImagePlus,
  X,
  MapPin,
  Clock,
  Pencil,
} from "lucide-react";
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
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminDangerZone } from "@/components/admin/ui/AdminDangerZone";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { SourcesField } from "./SourcesField";
import { MultiSelectField, type MultiOption } from "./MultiSelectField";
import { TagChipInput } from "./TagChipInput";
import { ArticleSeoSection } from "./ArticleSeoSection";
import { TypeMetaFields } from "./TypeMetaFields";
import { RecipeMetaFields } from "./RecipeMetaFields";
import { createArticle, updateArticle, deleteArticle } from "@/app/admin/content/articles/actions";
import { emptySeoMeta, type SeoMetaInput } from "@/lib/admin/seo";

const LIST = "/admin/content/articles";

// ─── SEO types (mirrors SeoPanel props) ──────────────────────────────────────

export type SeoAutoSource = { title: string; description: string; path: string; image?: string | null };
export type SeoDefaults = { titleTemplate: string; canonicalBase: string; defaultOgImageUrl?: string };
export type ArticleSeoPanelProps = {
  entityId: string;
  initial: SeoMetaInput;
  autoSource: SeoAutoSource;
  defaults: SeoDefaults;
};

// ─── Panel IDs (sidebar) ──────────────────────────────────────────────────────

type PanelId = "publish-panel" | "type" | "taxonomy" | "media";

const DEFAULT_PANEL_ORDER: PanelId[] = [
  "publish-panel",
  "type",
  "taxonomy",
  "media",
];

const PANEL_LABELS: Record<PanelId, string> = {
  "publish-panel": "انتشار",
  type: "نوع مقاله و قالب",
  taxonomy: "دسته‌بندی و برچسب‌ها",
  media: "تصویر شاخص",
};

// ─── Section IDs (main column) ────────────────────────────────────────────────

type SectionId = "type-meta" | "summary" | "content" | "sources" | "relations";

const DEFAULT_SECTION_ORDER: SectionId[] = [
  "type-meta",
  "summary",
  "content",
  "sources",
  "relations",
];

const SECTION_LABELS: Record<SectionId, string> = {
  "type-meta": "فیلدهای اختصاصی نوع",
  summary: "خلاصه و لید",
  content: "ویرایشگر محتوا",
  sources: "منابع و ارجاعات",
  relations: "ارتباطات",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reorderById<T extends string>(arr: T[], from: T, to: T): T[] {
  const next = [...arr];
  const fi = next.indexOf(from);
  const ti = next.indexOf(to);
  if (fi < 0 || ti < 0 || fi === ti) return arr;
  next.splice(fi, 1);
  next.splice(ti, 0, from);
  return next;
}

function moveById<T extends string>(arr: T[], id: T, dir: -1 | 1): T[] {
  const next = [...arr];
  const idx = next.indexOf(id);
  const dest = idx + dir;
  if (dest < 0 || dest >= next.length) return arr;
  [next[idx], next[dest]] = [next[dest], next[idx]];
  return next;
}

// ─── DragBar — the ONLY draggable element in each panel ──────────────────────
// Keeping draggable off the panel body so selects/inputs stay fully interactive.

function DragBar({
  label,
  idx,
  total,
  collapsed,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  idx: number;
  total: number;
  collapsed: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="flex cursor-grab select-none items-center gap-1 rounded-t-xl border-b border-dz-a-primary-100 bg-dz-a-primary-50/60 px-2.5 py-2 active:cursor-grabbing dark:border-dz-a-night-border dark:bg-dz-a-night-elevated"
    >
      <GripVertical className="size-3.5 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
      <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-dz-a-primary-500 dark:text-dz-a-night-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
        disabled={idx === 0}
        title="بالاتر"
        className="inline-flex rounded p-0.5 text-dz-a-primary-300 hover:text-dz-a-primary-600 disabled:opacity-25 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
        disabled={idx === total - 1}
        title="پایین‌تر"
        className="inline-flex rounded p-0.5 text-dz-a-primary-300 hover:text-dz-a-primary-600 disabled:opacity-25 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
      >
        <ChevronDown className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        title={collapsed ? "بازکردن" : "بستن"}
        className="ms-0.5 inline-flex w-5 shrink-0 items-center justify-center rounded font-bold leading-none text-dz-a-primary-300 hover:text-dz-a-primary-600 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
        style={{ fontSize: 15 }}
      >
        {collapsed ? "+" : "−"}
      </button>
    </div>
  );
}

// ─── SectionBar — drag handle for main-column sections ───────────────────────

function SectionBar({
  label,
  idx,
  total,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  idx: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="flex cursor-grab select-none items-center gap-1 rounded-t-xl border border-b-0 border-dz-a-primary-100 bg-dz-a-primary-50/60 px-3 py-1.5 active:cursor-grabbing dark:border-dz-a-night-border dark:bg-dz-a-night-elevated"
    >
      <GripVertical className="size-3.5 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
      <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-dz-a-primary-400 dark:text-dz-a-night-faint">
        {label}
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
        disabled={idx === 0}
        title="بالاتر"
        className="inline-flex rounded p-0.5 text-dz-a-primary-300 hover:text-dz-a-primary-600 disabled:opacity-25 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
        disabled={idx === total - 1}
        title="پایین‌تر"
        className="inline-flex rounded p-0.5 text-dz-a-primary-300 hover:text-dz-a-primary-600 disabled:opacity-25 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
      >
        <ChevronDown className="size-3.5" />
      </button>
    </div>
  );
}

// ─── ArticleForm ──────────────────────────────────────────────────────────────

export function ArticleForm({
  mode,
  articleId,
  defaultValues = emptyArticleForm,
  categories,
  series,
  products,
  posts,
  seoPanel,
}: {
  mode: "create" | "edit";
  articleId?: string;
  defaultValues?: ArticleFormInput;
  categories: RelationOption[];
  series: RelationOption[];
  products: MultiOption[];
  posts: MultiOption[];
  seoPanel?: ArticleSeoPanelProps;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [panelOrder, setPanelOrder] = useState<PanelId[]>(DEFAULT_PANEL_ORDER);
  const [collapsed, setCollapsed] = useState<Partial<Record<PanelId, boolean>>>({});
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_SECTION_ORDER);

  // ── Category tab & media picker state ────────────────────────────────────
  const [catTab, setCatTab] = useState<"all" | "selected">("all");
  const [mediaOpen, setMediaOpen] = useState(false);

  // ── SEO state (separate from main form, saved independently) ─────────────
  const [seoV, setSeoV] = useState<SeoMetaInput>(seoPanel?.initial ?? emptySeoMeta);
  const [seoTab, setSeoTab] = useState<"general" | "social" | "advanced">("general");
  const [seoPending, startSeoTransition] = useTransition();
  const [seoSuccess, setSeoSuccess] = useState<string | null>(null);

  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const dragSrc = useRef<string | null>(null);

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
  const slug = form.watch("slug");
  const categoryId = form.watch("categoryId");
  const status = form.watch("status");
  const text = form.watch("text");
  const recipeMeta = form.watch("recipeMeta") as
    | { ingredients?: unknown[]; steps?: unknown[] }
    | undefined;
  const isRecipe = articleType === "RECIPE";

  const pickType = (key: ArticleTypeKey) => {
    const cur = (form.getValues("typeMeta") ?? {}) as Record<string, string>;
    const next: Record<string, string> = {};
    for (const f of ARTICLE_TYPES[key].metaFields) next[f.key] = cur[f.key] ?? f.default ?? "";
    form.setValue("articleType", key, { shouldDirty: true, shouldValidate: true });
    form.setValue("typeMeta", next, { shouldDirty: true });
  };

  // Auto-calculate reading time whenever text changes
  useEffect(() => {
    if (!text) return;
    const calculated = estimateReadingTime(String(text));
    form.setValue("readingTime", calculated, { shouldDirty: true });
  }, [text, form]);

  const submit = () => {
    setServerError(null);
    setSuccess(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res =
        mode === "create" ? await createArticle(raw) : await updateArticle(articleId!, raw);
      if (!res.ok) { setServerError(res.error); return; }
      if (mode === "create") router.push(`${LIST}/${res.id}`);
      else {
        setSuccess("تغییرات ذخیره شد.");
        form.reset(raw);
        router.refresh();
      }
    });
  };

  // ── Readiness ────────────────────────────────────────────────────────────
  const hasContent =
    typeof text === "string" ? text.replace(/<[^>]*>/g, "").trim().length > 20 : Boolean(text);
  const readinessItems = [
    { label: "عنوان", done: Boolean(String(title ?? "").trim()) },
    { label: "اسلاگ (نامک)", done: Boolean(String(slug ?? "").trim()) },
    { label: "خلاصه / لید", done: Boolean(String(brief ?? "").trim()) },
    {
      label: "تصویر شاخص",
      done: Boolean(String(cover ?? "").trim()),
      hint: "برای کارت مقاله و اشتراک‌گذاری لازم است.",
    },
    { label: "محتوای اصلی", done: hasContent },
    { label: "دسته‌بندی", done: Boolean(String(categoryId ?? "").trim()) },
    ...(isRecipe
      ? [
          {
            label: "مواد لازم",
            done: Array.isArray(recipeMeta?.ingredients) && recipeMeta!.ingredients!.length > 0,
          },
          {
            label: "مراحل پخت",
            done: Array.isArray(recipeMeta?.steps) && recipeMeta!.steps!.length > 0,
          },
        ]
      : []),
    { label: "منتشر شده", done: status === "PUBLISHED", optional: true },
  ];
  const required = readinessItems.filter((i) => !i.optional);
  const doneCount = required.filter((i) => i.done).length;
  const pct = required.length ? Math.round((doneCount / required.length) * 100) : 100;
  const complete = doneCount === required.length;

  // ── Drag ─────────────────────────────────────────────────────────────────
  const startDrag = (e: React.DragEvent, id: string) => {
    dragSrc.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const endDrag = () => {
    dragSrc.current = null;
    setDragTarget(null);
  };

  function makeDropProps(id: string, setOrder: (fn: (p: string[]) => string[]) => void) {
    return {
      onDragEnter(e: React.DragEvent) {
        e.preventDefault();
        if (dragSrc.current && dragSrc.current !== id) setDragTarget(id);
      },
      onDragOver(e: React.DragEvent) { e.preventDefault(); },
      onDragLeave() { setDragTarget((prev) => (prev === id ? null : prev)); },
      onDrop(e: React.DragEvent) {
        e.preventDefault();
        if (!dragSrc.current || dragSrc.current === id) { setDragTarget(null); return; }
        const src = dragSrc.current;
        setOrder((prev) => reorderById(prev as string[], src, id) as string[]);
        setDragTarget(null);
        dragSrc.current = null;
      },
    };
  }

  // ── Sidebar panel content ─────────────────────────────────────────────────
  const renderPanel = (id: PanelId): ReactNode => {
    switch (id) {

      // ── Merged publish panel (actions + info rows + readiness + note) ────────
      case "publish-panel": {
        const errorCount = Object.keys(form.formState.errors).length;
        const readingTimeVal = form.watch("readingTime") ?? 0;

        return (
          <div className="flex flex-col divide-y divide-dz-a-primary-100 dark:divide-dz-a-night-border">

            {/* ── اقدام اصلی — ذخیره و پیش‌نمایش ──────────────────── */}
            <div className="flex flex-col gap-2 p-3">
              {errorCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-dz-a-error/10 px-3 py-2 text-xs text-dz-a-error">
                  <CircleAlert className="size-3.5 shrink-0" />
                  {errorCount} خطا در فرم
                </div>
              )}
              <button
                type="submit"
                disabled={pending}
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dz-a-primary-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-dz-a-primary-800 disabled:opacity-60 dark:bg-dz-a-primary-600 dark:hover:bg-dz-a-primary-700"
              >
                <Save className="size-4" />
                {pending
                  ? "در حال ذخیره…"
                  : mode === "create"
                    ? "ایجاد نوشته"
                    : status === "PUBLISHED"
                      ? "ذخیره و انتشار"
                      : "ذخیره‌ی تغییرات"}
              </button>
              {mode === "edit" && slug && (
                <a
                  href={`/blog/${String(slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
                >
                  <Eye className="size-3.5" /> پیش‌نمایش
                </a>
              )}
            </div>

            {/* ── ردیف‌های اطلاعات ─────────────────────────────────── */}
            <div>
              {/* وضعیت انتشار */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <MapPin className="size-3.5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">وضعیت</span>
                <div className="ms-auto">
                  <select
                    {...form.register("status")}
                    className="cursor-pointer rounded-md border border-dz-a-primary-200 bg-white px-2 py-1 text-xs font-medium text-dz-a-primary-700 outline-none focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                  >
                    {ARTICLE_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* قابلیت مشاهده */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Eye className="size-3.5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">قابلیت مشاهده</span>
                <div className="ms-auto">
                  <select
                    {...form.register("accessType")}
                    className="cursor-pointer rounded-md border border-dz-a-primary-200 bg-white px-2 py-1 text-xs font-medium text-dz-a-primary-700 outline-none focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                  >
                    {ARTICLE_ACCESS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* زمان مطالعه */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Clock className="size-3.5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">زمان مطالعه</span>
                <span className="ms-auto text-xs font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">
                  {Number(readingTimeVal)} دقیقه
                </span>
              </div>
            </div>

            {/* ── آمادگی انتشار ─────────────────────────────────────── */}
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">
                  {complete
                    ? <Check className="size-3.5 text-dz-a-success" />
                    : <CircleAlert className="size-3.5 text-dz-a-warning" />}
                  آمادگی انتشار
                </span>
                <span className={`text-[11px] font-bold tabular-nums ${complete ? "text-dz-a-success" : "text-dz-a-warning"}`}>
                  {doneCount}/{required.length}
                </span>
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-dz-a-primary-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    complete ? "bg-dz-a-success" : pct > 50 ? "bg-dz-a-primary-500" : "bg-dz-a-warning"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <ul className="flex flex-col gap-1">
                {readinessItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    {item.done
                      ? <Check className="mt-px size-3 shrink-0 text-dz-a-success" />
                      : <Circle className="mt-px size-3 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />}
                    <span className={`flex-1 ${item.done
                      ? "text-dz-a-primary-400 dark:text-dz-a-night-faint"
                      : item.optional
                        ? "text-dz-a-primary-400 dark:text-dz-a-night-faint"
                        : "font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg"}`}>
                      {item.label}
                      {item.optional && <span className="ms-1 text-[9px] opacity-60">(اختیاری)</span>}
                      {"hint" in item && item.hint && !item.done && (
                        <span className="mt-0.5 block text-[9px] font-normal text-dz-a-primary-400 dark:text-dz-a-night-faint">
                          {item.hint as string}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── یادداشت داخلی ─────────────────────────────────────── */}
            <div className="p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <NotebookPen className="size-3 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                <span className="text-xs font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">یادداشت داخلی</span>
              </div>
              <AdminTextareaField
                name="adminNote"
                rows={2}
                placeholder="یادداشت خصوصی برای ادمین‌ها…"
                hint="فقط برای ادمین — در سایت نشان داده نمی‌شود."
              />
            </div>

            {/* ── انصراف / حذف ──────────────────────────────────────── */}
            <div className="flex flex-col gap-2 p-3">
              <a
                href={LIST}
                className="focus-ring inline-flex w-full items-center justify-center rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs font-medium text-dz-a-primary-500 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:bg-white/5"
              >
                انصراف
              </a>
              {mode === "edit" && articleId && (
                <AdminDangerZone
                  description="حذف این مقاله و دیدگاه‌های آن قابل بازگشت نیست."
                  confirmTitle="حذف مقاله"
                  confirmDescription="آیا مطمئن هستید؟"
                  buttonLabel="حذف این مقاله"
                  onConfirm={() => deleteArticle(articleId)}
                  onDeleted={() => router.push(LIST)}
                />
              )}
            </div>
          </div>
        );
      }

      case "type":
        return (
          <div className="flex flex-col gap-1">
            {ARTICLE_TYPE_KEYS.map((key) => {
              const t = ARTICLE_TYPES[key];
              const active = key === articleType;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickType(key)}
                  aria-pressed={active}
                  className={`focus-ring flex w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                    active
                      ? "border-transparent text-white"
                      : "border-dz-a-primary-100 bg-white text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg dark:hover:bg-white/5"
                  }`}
                  style={active ? { background: t.accent } : undefined}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      active ? "bg-white/70" : "bg-dz-a-primary-200 dark:bg-dz-a-night-faint"
                    }`}
                  />
                  {t.label}
                </button>
              );
            })}
            {(identity.requiresDisclaimer || identity.requiresSources) && (
              <div className="mt-1 flex items-start gap-1.5 rounded-lg border border-dz-a-warning/30 bg-dz-a-warning/10 p-2 text-[11px] text-dz-a-warning dark:border-dz-a-warning-300/30 dark:text-dz-a-warning-300">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                <span>این نوع حساس است — سلب مسئولیت الزامی است.</span>
              </div>
            )}
          </div>
        );

      case "taxonomy": {
        const primaryId: string = form.watch("categoryId") ?? "";
        const storedIds: string[] = form.watch("additionalCategoryIds") ?? [];

        // Always treat primaryId as selected even when DB didn't include it in additionalCategoryIds
        const allSelectedIds = Array.from(
          new Set([...storedIds, ...(primaryId ? [primaryId] : [])])
        );

        const toggleCat = (id: string) => {
          const isSelected = allSelectedIds.includes(id);
          if (isSelected) {
            const next = allSelectedIds.filter((x) => x !== id);
            form.setValue("additionalCategoryIds", next, { shouldDirty: true });
            if (primaryId === id) {
              form.setValue("categoryId", next[0] ?? "", { shouldDirty: true, shouldValidate: true });
            }
          } else {
            const next = [...allSelectedIds, id];
            form.setValue("additionalCategoryIds", next, { shouldDirty: true });
            if (!primaryId) {
              form.setValue("categoryId", id, { shouldDirty: true, shouldValidate: true });
            }
          }
        };

        const setPrimary = (id: string) => {
          if (!allSelectedIds.includes(id)) return;
          form.setValue("categoryId", id, { shouldDirty: true, shouldValidate: true });
        };

        const displayCats = catTab === "selected"
          ? categories.filter((c) => allSelectedIds.includes(c.value))
          : categories;

        return (
          <div className="flex flex-col">
            {/* ── تب‌ها ─────────────────────────────────────── */}
            <div className="flex border-b border-dz-a-primary-100 dark:border-dz-a-night-border">
              <button
                type="button"
                onClick={() => setCatTab("all")}
                className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                  catTab === "all"
                    ? "border-b-2 border-dz-a-primary-600 text-dz-a-primary-700 dark:border-dz-a-primary-500 dark:text-dz-a-night-fg"
                    : "text-dz-a-primary-400 hover:text-dz-a-primary-600 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-muted"
                }`}
              >
                همه دسته‌ها
              </button>
              <button
                type="button"
                onClick={() => setCatTab("selected")}
                className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                  catTab === "selected"
                    ? "border-b-2 border-dz-a-primary-600 text-dz-a-primary-700 dark:border-dz-a-primary-500 dark:text-dz-a-night-fg"
                    : "text-dz-a-primary-400 hover:text-dz-a-primary-600 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-muted"
                }`}
              >
                انتخاب‌شده
                {allSelectedIds.length > 0 && (
                  <span className="ms-1 inline-flex size-4 items-center justify-center rounded-full bg-dz-a-primary-600 text-[9px] font-bold text-white dark:bg-dz-a-primary-500">
                    {allSelectedIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* ── لیست دسته‌ها ─────────────────────────────── */}
            {categories.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">دسته‌ای ثبت نشده.</p>
            ) : displayCats.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">هنوز دسته‌ای انتخاب نشده.</p>
            ) : (
              <ul className="max-h-52 divide-y divide-dz-a-primary-50 overflow-y-auto dark:divide-dz-a-night-line">
                {displayCats.map((c) => {
                  const isSelected = allSelectedIds.includes(c.value);
                  const isPrimary = primaryId === c.value;
                  return (
                    <li key={c.value} className="flex items-center gap-2.5 px-3 py-2.5">
                      {/* چک‌باکس — در RTL سمت راست */}
                      <input
                        type="checkbox"
                        id={`cat-${c.value}`}
                        checked={isSelected}
                        onChange={() => toggleCat(c.value)}
                        className="size-3.5 shrink-0 cursor-pointer accent-dz-a-primary-600"
                      />
                      {/* نام دسته */}
                      <label
                        htmlFor={`cat-${c.value}`}
                        className={`min-w-0 flex-1 cursor-pointer truncate text-sm leading-snug ${
                          isSelected
                            ? "font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
                            : "text-dz-a-primary-500 dark:text-dz-a-night-muted"
                        }`}
                      >
                        {c.label}
                      </label>
                      {/* دایره رادیو — فقط برای گزینه‌های انتخاب‌شده، در RTL سمت چپ */}
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => setPrimary(c.value)}
                          title={isPrimary ? "دسته اصلی" : "تعیین به‌عنوان دسته اصلی"}
                          className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isPrimary
                              ? "border-dz-a-primary-600 bg-dz-a-primary-600 dark:border-dz-a-primary-500 dark:bg-dz-a-primary-500"
                              : "border-dz-a-primary-300 bg-white hover:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-transparent dark:hover:border-dz-a-primary-400"
                          }`}
                        >
                          {isPrimary && <span className="size-1.5 rounded-full bg-white" />}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── افزودن دسته ──────────────────────────────── */}
            <div className="border-t border-dz-a-primary-100 px-3 py-2 dark:border-dz-a-night-border">
              <a
                href="/admin/collections/categories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-dz-a-primary-500 transition-colors hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:text-dz-a-night-fg"
              >
                + افزودن دسته
              </a>
            </div>

            {/* ── برچسب‌ها ──────────────────────────────────── */}
            <div className="border-t border-dz-a-primary-100 p-3 dark:border-dz-a-night-border">
              <p className="mb-1.5 text-[11px] font-semibold text-dz-a-primary-600 dark:text-dz-a-night-muted">برچسب‌ها</p>
              <TagChipInput name="tags" placeholder="جستجو یا ساخت برچسب…" />
            </div>
          </div>
        );
      }

      case "media":
        return (
          <div className="flex flex-col gap-2 p-3">
            {cover ? (
              <>
                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={String(cover)}
                      alt="تصویر شاخص"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="size-5 text-white" />
                    <span className="text-xs font-medium text-white">تغییر تصویر</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("coverImage", "", { shouldDirty: true, shouldValidate: true })}
                  className="text-center text-[11px] text-dz-a-primary-400 transition-colors hover:text-dz-a-error dark:text-dz-a-night-faint dark:hover:text-dz-a-error"
                >
                  پاک کردن تصویر شاخص
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dz-a-primary-200 py-8 text-dz-a-primary-400 transition-colors hover:border-dz-a-primary-400 hover:text-dz-a-primary-600 dark:border-dz-a-night-border dark:text-dz-a-night-faint dark:hover:border-dz-a-night-muted dark:hover:text-dz-a-night-muted"
              >
                <ImagePlus className="size-6" />
                <span className="text-xs font-medium">انتخاب تصویر شاخص</span>
              </button>
            )}
            <MediaPickerDialog
              open={mediaOpen}
              usage="BLOG"
              onClose={() => setMediaOpen(false)}
              onPick={(asset) => {
                form.setValue("coverImage", asset.url, { shouldDirty: true, shouldValidate: true });
                setMediaOpen(false);
              }}
            />
          </div>
        );

    }
  };

  // ── Main section content ──────────────────────────────────────────────────
  const renderSection = (id: SectionId): ReactNode => {
    switch (id) {
      case "type-meta":
        return isRecipe ? (
          <AdminFormSection
            id="type-meta"
            title="کارت دستور پخت"
            description="داده‌ی ساختاریِ دستور؛ بالای متنِ مقاله نمایش داده می‌شود."
          >
            <RecipeMetaFields />
          </AdminFormSection>
        ) : (
          <AdminFormSection id="type-meta" title="فیلدهای اختصاصی این نوع مقاله">
            <TypeMetaFields articleType={articleType} />
          </AdminFormSection>
        );
      case "summary":
        return (
          <AdminFormSection id="summary" title="خلاصه و لید">
            <AdminTextareaField name="briefText" label="خلاصه / لید" rows={3} required />
          </AdminFormSection>
        );
      case "content":
        return (
          <AdminFormSection
            id="content"
            title="ویرایشگر محتوا"
            description={`بلوک‌های پیشنهادی «${identity.label}» از منوی «بلوک‌های این نوع مقاله» در نوار ابزار در دسترس‌اند.`}
          >
            <AdminRichTextField
              name="text"
              label="متن مقاله"
              articleType={articleType}
              minHeight={360}
            />
          </AdminFormSection>
        );
      case "sources":
        return (
          <AdminFormSection
            id="sources"
            title="منابع و ارجاعات"
            description="فقط منابع واقعی. منبع جعلی ممنوع است."
          >
            <SourcesField />
          </AdminFormSection>
        );
      case "relations":
        return (
          <AdminFormSection id="relations" title="ارتباطات">
            <div className="grid gap-4 @md:grid-cols-2">
              <AdminRelationSelect
                name="seriesId"
                label="پرونده‌ی مرتبط"
                options={series}
                emptyLabel="— بدون پرونده —"
              />
              <AdminTextField
                name="seriesOrder"
                label="ترتیب در پرونده"
                dir="ltr"
                inputMode="numeric"
              />
            </div>
            <AdminField label="مقالات مرتبط">
              <MultiSelectField
                name="relatedPostIds"
                options={posts}
                emptyText="مقاله‌ی دیگری برای ارتباط نیست."
                searchPlaceholder="جستجوی مقاله…"
              />
            </AdminField>
            <AdminField label="محصولات مرتبط" hint="فقط محصولات واقعی موجود.">
              <MultiSelectField
                name="relatedProductIds"
                options={products}
                emptyText="محصولی موجود نیست."
                searchPlaceholder="جستجوی محصول…"
              />
            </AdminField>
          </AdminFormSection>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminFormError message={serverError} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      <AdminFormShell form={form} onSubmit={submit}>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">

          {/* ─── Main column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Preview card + اطلاعات اصلی — merged, always on top */}
            <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              {/* Cover preview */}
              <div className="relative flex min-h-37.5 items-center justify-center bg-dz-a-primary-50 dark:bg-white/5">
                {cover ? (
                  <img
                    src={String(cover)}
                    alt={String(title ?? "")}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                    پیش‌نمایش تصویر شاخص
                  </span>
                )}
                <span
                  className="absolute inset-e-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                  style={{ background: identity.accent }}
                >
                  {identity.badge}
                </span>
              </div>

              {/* Live preview row */}
              {(title || subtitle || brief) && (
                <div className="border-b border-dz-a-primary-50 px-5 py-3 dark:border-dz-a-night-border">
                  <p className="font-heading text-base font-bold leading-snug text-dz-a-primary-800 dark:text-dz-a-night-fg">
                    {String(title) || ""}
                  </p>
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
                      {String(subtitle)}
                    </p>
                  )}
                  {brief && (
                    <p className="mt-1 line-clamp-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                      {String(brief)}
                    </p>
                  )}
                </div>
              )}

              {/* Form fields */}
              <div className="flex flex-col gap-4 p-5">
                <AdminTextField name="title" label="عنوان" required />
                <AdminSlugField name="slug" sourceName="title" required previewBase="/blog/" />
                <AdminTextField name="subtitle" label="زیرعنوان / لید کوتاه" />
              </div>
            </div>

            {/* Reorderable main sections */}
            {sectionOrder.map((id, idx) => (
              <div
                key={id}
                {...makeDropProps(id, setSectionOrder as (fn: (p: string[]) => string[]) => void)}
                className={`rounded-xl transition-shadow ${
                  dragTarget === id
                    ? "ring-2 ring-dz-a-primary-300 dark:ring-dz-a-primary-700"
                    : ""
                }`}
              >
                <SectionBar
                  label={SECTION_LABELS[id]}
                  idx={idx}
                  total={sectionOrder.length}
                  onMoveUp={() => setSectionOrder((p) => moveById(p, id, -1))}
                  onMoveDown={() => setSectionOrder((p) => moveById(p, id, 1))}
                  onDragStart={(e) => startDrag(e, id)}
                  onDragEnd={endDrag}
                />
                {renderSection(id)}
              </div>
            ))}
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
            {panelOrder.map((id, idx) => (
              <div
                key={id}
                {...makeDropProps(id, setPanelOrder as (fn: (p: string[]) => string[]) => void)}
                className={`rounded-xl border bg-white transition-shadow dark:bg-dz-a-night-card ${
                  dragTarget === id
                    ? "border-dz-a-primary-400 ring-2 ring-dz-a-primary-200 dark:border-dz-a-primary-500 dark:ring-dz-a-primary-800"
                    : "border-dz-a-primary-100 shadow-xs dark:border-dz-a-night-border"
                }`}
              >
                {/* Only the DragBar is draggable — panel content is fully interactive */}
                <DragBar
                  label={PANEL_LABELS[id]}
                  idx={idx}
                  total={panelOrder.length}
                  collapsed={!!collapsed[id]}
                  onMoveUp={() => setPanelOrder((p) => moveById(p, id, -1))}
                  onMoveDown={() => setPanelOrder((p) => moveById(p, id, 1))}
                  onToggle={() => setCollapsed((p) => ({ ...p, [id]: !p[id] }))}
                  onDragStart={(e) => startDrag(e, id)}
                  onDragEnd={endDrag}
                />

                {/* publish-panel manages its own internal padding per section */}
                {!collapsed[id] && (
                  id === "publish-panel"
                    ? <div className="rounded-b-xl overflow-hidden">{renderPanel(id)}</div>
                    : <div className="rounded-b-xl p-3">{renderPanel(id)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── دستیار سئو ── زیر لایوت اصلی، full-width ───────────────────── */}
        {seoPanel ? (
          <ArticleSeoSection
            seoPanel={seoPanel}
            contentText={text}
            seoV={seoV}
            setSeoV={setSeoV}
            seoTab={seoTab}
            setSeoTab={setSeoTab}
            seoPending={seoPending}
            startSeoTransition={startSeoTransition}
            seoSuccess={seoSuccess}
            setSeoSuccess={setSeoSuccess}
            router={router}
          />
        ) : (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-dz-a-primary-100 bg-white px-5 py-4 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-50 dark:bg-dz-a-night-elevated">
              <Search className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-dz-a-primary-700 dark:text-dz-a-night-fg">دستیار سئو</p>
              <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                پس از ذخیره‌ی اولیه، تنظیمات سئو (عنوان، توضیح متا، Open Graph) در اینجا در دسترس خواهند بود.
              </p>
            </div>
          </div>
        )}
      </AdminFormShell>
    </div>
  );
}
