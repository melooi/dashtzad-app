"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Wand2, RotateCcw, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";
import { META_BOUNDS, truncateMetaText, stripHtmlForMeta } from "@/lib/seo/text";
import { buildCanonical } from "@/lib/seo/urls";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { emptySeoMeta, type SeoEntityType, type SeoMetaInput } from "@/lib/admin/seo";
import { saveSeoMeta, deleteSeoMeta } from "@/lib/admin/seo-actions";

type AutoSource = { title: string; description: string; path: string; image?: string | null };
type Defaults = { titleTemplate: string; canonicalBase: string; defaultOgImageUrl?: string };

function quality(len: number, min: number, max: number) {
  if (len === 0) return { label: "خالی", pill: "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-400 dark:text-dz-night-faint", bar: "bg-dz-primary-200 dark:bg-dz-night-border", pct: 0 };
  if (len < min) return { label: "کوتاه", pill: "bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300", bar: "bg-dz-warning", pct: Math.min(100, (len / max) * 100) };
  if (len > max) return { label: "طولانی", pill: "bg-dz-error/10 text-dz-error dark:text-dz-error-300", bar: "bg-dz-error", pct: 100 };
  return { label: "عالی", pill: "bg-dz-success/10 text-dz-success dark:text-dz-success-300", bar: "bg-dz-success", pct: Math.min(100, (len / max) * 100) };
}

function Meter({ value, min, max, label }: { value: string; min: number; max: number; label: string }) {
  const q = quality(value.length, min, max);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-dz-primary-500 dark:text-dz-night-muted">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-dz-primary-400 dark:text-dz-night-faint">{toPersianNumbers(value.length)}/{toPersianNumbers(max)}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${q.pill}`}>{q.label}</span>
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-dz-primary-50 dark:bg-white/5">
        <div className={`h-full rounded-full ${q.bar}`} style={{ width: `${q.pct}%` }} />
      </div>
    </div>
  );
}

/** Reusable per-entity SEO editor: fields + live Google/social previews + quality. */
export function SeoPanel({
  entityType,
  entityId,
  initial,
  autoSource,
  defaults,
}: {
  entityType: SeoEntityType;
  entityId: string;
  initial: SeoMetaInput;
  autoSource: AutoSource;
  defaults: Defaults;
}) {
  const router = useRouter();
  const [v, setV] = useState<SeoMetaInput>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const set = (patch: Partial<SeoMetaInput>) => {
    setV((s) => ({ ...s, ...patch }));
    setSuccess(null);
  };
  const sv = (k: keyof SeoMetaInput) => (v[k] as string) ?? "";

  // Effective preview values (override → auto-source → defaults).
  const effTitle = sv("title") || autoSource.title;
  const fullTitle = useMemo(() => {
    const t = effTitle.trim();
    if (!t) return defaults.titleTemplate.replace("%s", "").trim();
    if (t.includes("دشت‌زاد")) return t;
    return defaults.titleTemplate.includes("%s") ? defaults.titleTemplate.replace("%s", t) : `${t} | دشت‌زاد`;
  }, [effTitle, defaults.titleTemplate]);
  const effDesc = truncateMetaText(sv("description") || stripHtmlForMeta(autoSource.description), 160);
  const canonical = buildCanonical(autoSource.path, sv("canonicalUrl") || null, defaults.canonicalBase || null);
  const host = canonical.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const ogImage = sv("ogImageUrl") || autoSource.image || defaults.defaultOgImageUrl || "";

  const autofill = () => {
    set({
      title: autoSource.title,
      description: truncateMetaText(stripHtmlForMeta(autoSource.description), 160),
      ogTitle: autoSource.title,
      ogDescription: truncateMetaText(stripHtmlForMeta(autoSource.description), 200),
      ogImageUrl: autoSource.image ?? "",
    });
  };

  const save = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await saveSeoMeta(entityType, entityId, v);
      if (!res.ok) return setError(res.error);
      setSuccess("تنظیمات سئو ذخیره شد.");
      router.refresh();
    });
  };

  const reset = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteSeoMeta(entityType, entityId);
      if (!res.ok) return setError(res.error);
      setV({ ...emptySeoMeta });
      setSuccess("به پیش‌فرض‌ها بازنشانی شد.");
      router.refresh();
    });
  };

  const labelCls = "mb-1.5 block text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg";
  const hintCls = "mt-1 block text-xs text-dz-primary-400 dark:text-dz-night-faint";

  return (
    <section className="rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-dz-primary-50 dark:border-dz-night-line pb-3.5">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">
            <span className="h-4 w-1 rounded-full bg-dz-primary-300 dark:bg-dz-primary-500" aria-hidden />
            دستیار سئو
          </h2>
          <p className="mt-1.5 ps-3 text-xs leading-5 text-dz-primary-400 dark:text-dz-night-faint">
            خالی بگذارید تا از محتوای صفحه به‌صورت خودکار ساخته شود. این تنظیمات فقط همین صفحه را تغییر می‌دهد.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={autofill} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-2.5 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5">
            <Wand2 className="size-3.5" /> تولید خودکار
          </button>
          <button type="button" onClick={reset} disabled={pending} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-2.5 py-1.5 text-xs text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 disabled:opacity-50">
            <RotateCcw className="size-3.5" /> بازنشانی
          </button>
        </div>
      </div>

      {error && <div className="mb-4"><AdminFormError message={error} /></div>}
      {success && <div className="mb-4"><AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} /></div>}

      {/* Google preview */}
      <div dir="ltr" className="mb-5 rounded-xl border border-dz-primary-100 dark:border-dz-night-border bg-dz-primary-50/30 dark:bg-white p-4 text-left">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-dz-primary-600 text-[10px] font-bold text-white">د</span>
          <div className="leading-tight">
            <div className="text-xs text-[#202124]">دشت‌زاد</div>
            <div className="text-[11px] text-[#5f6368]">{host} ›</div>
          </div>
        </div>
        <div className="mt-1.5 truncate text-lg text-[#1a0dab]">{fullTitle || "عنوان صفحه"}</div>
        <div className="mt-0.5 text-sm leading-6 text-[#4d5156] line-clamp-2">{effDesc || "توضیح صفحه اینجا نمایش داده می‌شود."}</div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className={labelCls}>عنوان سئو</label>
          <input value={sv("title")} onChange={(e) => set({ title: e.target.value })} placeholder={autoSource.title} className={fieldClass()} />
          <div className="mt-2"><Meter value={effTitle} min={META_BOUNDS.title.min} max={META_BOUNDS.title.max} label="طول عنوان" /></div>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={labelCls}>توضیح متا</label>
          <textarea rows={3} value={sv("description")} onChange={(e) => set({ description: e.target.value })} placeholder={stripHtmlForMeta(autoSource.description).slice(0, 160)} className={`${fieldClass()} resize-y leading-7`} />
          <div className="mt-2"><Meter value={sv("description") || effDesc} min={META_BOUNDS.description.min} max={META_BOUNDS.description.max} label="طول توضیحات" /></div>
        </div>

        {/* Canonical */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Canonical URL</label>
          <input dir="ltr" value={sv("canonicalUrl")} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder={canonical} className={`${fieldClass()} font-mono text-xs`} />
          <span dir="ltr" className={`${hintCls} flex items-center gap-1 text-start`}>
            <Search className="size-3" /> {canonical}
          </span>
        </div>

        {/* OG */}
        <div>
          <label className={labelCls}>عنوان Open Graph</label>
          <input value={sv("ogTitle")} onChange={(e) => set({ ogTitle: e.target.value })} placeholder={fullTitle} className={fieldClass()} />
        </div>
        <div>
          <label className={labelCls}>تصویر Open Graph</label>
          <input dir="ltr" value={sv("ogImageUrl")} onChange={(e) => set({ ogImageUrl: e.target.value })} placeholder={ogImage || "https://…"} className={`${fieldClass()} font-mono text-xs`} />
          <div className="mt-2">
            <MediaPicker value={sv("ogImageUrl")} onChange={(v) => set({ ogImageUrl: v })} usage="SEO" withUrlInput={false} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>توضیح Open Graph</label>
          <textarea rows={2} value={sv("ogDescription")} onChange={(e) => set({ ogDescription: e.target.value })} placeholder={effDesc} className={`${fieldClass()} resize-y leading-7`} />
        </div>

        {/* Twitter */}
        <div>
          <label className={labelCls}>عنوان توییتر</label>
          <input value={sv("twitterTitle")} onChange={(e) => set({ twitterTitle: e.target.value })} placeholder={sv("ogTitle") || fullTitle} className={fieldClass()} />
        </div>
        <div>
          <label className={labelCls}>تصویر توییتر</label>
          <input dir="ltr" value={sv("twitterImageUrl")} onChange={(e) => set({ twitterImageUrl: e.target.value })} placeholder={ogImage || "https://…"} className={`${fieldClass()} font-mono text-xs`} />
          <div className="mt-2">
            <MediaPicker value={sv("twitterImageUrl")} onChange={(v) => set({ twitterImageUrl: v })} usage="SEO" withUrlInput={false} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>توضیح توییتر</label>
          <textarea rows={2} value={sv("twitterDescription")} onChange={(e) => set({ twitterDescription: e.target.value })} placeholder={sv("ogDescription") || effDesc} className={`${fieldClass()} resize-y leading-7`} />
        </div>

        {/* Robots */}
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => set({ noindex: !v.noindex })} aria-pressed={Boolean(v.noindex)} className={`focus-ring inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${v.noindex ? "border-dz-warning/40 bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300" : "border-dz-primary-200 dark:border-dz-night-border text-dz-primary-600 dark:text-dz-primary-300 hover:bg-dz-primary-50 dark:hover:bg-white/5"}`}>
            {v.noindex ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {v.noindex ? "ایندکس نشود (noindex)" : "ایندکس شود"}
          </button>
          <button type="button" onClick={() => set({ nofollow: !v.nofollow })} aria-pressed={Boolean(v.nofollow)} className={`focus-ring inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${v.nofollow ? "border-dz-warning/40 bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300" : "border-dz-primary-200 dark:border-dz-night-border text-dz-primary-600 dark:text-dz-primary-300 hover:bg-dz-primary-50 dark:hover:bg-white/5"}`}>
            {v.nofollow ? "لینک‌ها دنبال نشوند (nofollow)" : "دنبال‌کردن لینک‌ها"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-dz-primary-50 dark:border-dz-night-line pt-4">
        <button type="button" onClick={save} disabled={pending} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "در حال ذخیره…" : "ذخیره‌ی سئو"}
        </button>
      </div>
    </section>
  );
}
