"use client";

/* eslint-disable @next/next/no-img-element */
import { type TransitionStartFunction } from "react";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Save, Search, Wand2,
  Check, X as XIcon, KeyRound,
} from "lucide-react";
import { useState } from "react";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { type SeoMetaInput } from "@/lib/admin/seo";
import { META_BOUNDS, truncateMetaText, stripHtmlForMeta } from "@/lib/seo/text";
import { buildCanonical } from "@/lib/seo/urls";
import { saveSeoMeta } from "@/lib/admin/seo-actions";
import { toPersianNumbers } from "@/lib/price";
import type { ArticleSeoPanelProps } from "./ArticleForm";

type SeoTab = "general" | "social" | "advanced";
const TAB_LABELS: Record<SeoTab, string> = { general: "سئو عمومی", social: "اشتراک‌گذاری", advanced: "پیشرفته" };

const inputCls =
  "w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2.5 text-sm text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg";
const labelCls = "mb-1.5 block text-xs font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg";

function QualityBar({ val, min, max }: { val: string; min: number; max: number }) {
  const l = val.length;
  const color = l === 0 ? "bg-dz-a-primary-200" : l < min ? "bg-dz-a-warning" : l > max ? "bg-dz-a-error" : "bg-dz-a-success";
  const pct = l === 0 ? 0 : Math.min(100, (l / max) * 100);
  const statusLabel = l === 0 ? "خالی" : l < min ? "کوتاه" : l > max ? "طولانی" : "عالی";
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex justify-between text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
        <span>{toPersianNumbers(l)} / {toPersianNumbers(max)} نویسه</span>
        <span>{statusLabel}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-dz-a-primary-100 dark:bg-white/10">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── SEO analysis engine ───────────────────────────────────────────────────────

interface SeoCheck {
  label: string;
  done: boolean;
}

interface SeoAnalysis {
  basic: SeoCheck[];
  titleReadability: SeoCheck[];
  contentReadability: SeoCheck[];
  extra: SeoCheck[];
  score: number;
  errors: number;
}

function analyzeSeo(
  kw: string,
  effTitle: string,
  effDesc: string,
  path: string,
  contentText?: string,
): SeoAnalysis | null {
  if (!kw) return null;

  const kwLower = kw.toLowerCase();
  const titleLower = effTitle.toLowerCase();
  const descLower = effDesc.toLowerCase();
  const pathLower = path.toLowerCase();
  const plain = contentText ? contentText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase() : "";
  const wordCount = plain ? plain.split(" ").filter(Boolean).length : 0;

  const kwSlug = kwLower.replace(/\s+/g, "-");

  const basic: SeoCheck[] = [
    { label: "کلمه کلیدی اصلی در عنوان سئو استفاده شده است", done: titleLower.includes(kwLower) },
    { label: "کلمه کلیدی اصلی در توضیحات متا سئو استفاده شده است", done: descLower.includes(kwLower) },
    { label: "کلمه کلیدی اصلی در URL یافت شد", done: pathLower.includes(kwLower) || pathLower.includes(kwSlug) },
    { label: "طول عنوان سئو مناسب است (۵۰–۶۰ نویسه)", done: effTitle.length >= 50 && effTitle.length <= 60 },
    { label: "طول توضیح متا مناسب است (۱۲۰–۱۶۰ نویسه)", done: effDesc.length >= 120 && effDesc.length <= 160 },
    ...(plain
      ? [
          {
            label: `طول محتوا مناسب است (${toPersianNumbers(wordCount)} کلمه)`,
            done: wordCount >= 300,
          },
          { label: "کلمه کلیدی اصلی در محتوا پیدا شد", done: plain.includes(kwLower) },
          {
            label: "کلمه کلیدی اصلی در ۱۰٪ اول محتوا ظاهر می‌شود",
            done: plain.slice(0, Math.floor(plain.length * 0.1)).includes(kwLower),
          },
        ]
      : []),
  ];

  const titleReadability: SeoCheck[] = [
    { label: "کلمه کلیدی اصلی در ابتدای عنوان سئو استفاده می‌شود", done: titleLower.trimStart().startsWith(kwLower) },
    { label: "عنوان سئو دارای عدد است", done: /\d/.test(effTitle) },
  ];

  const contentReadability: SeoCheck[] = plain
    ? [
        { label: "محتوا دارای تصویر یا ویدئو است", done: /<img|<video/.test(contentText ?? "") },
        { label: "از پاراگراف‌های کوتاه استفاده شده", done: wordCount > 0 },
      ]
    : [];

  const extra: SeoCheck[] = [
    ...(plain
      ? [
          {
            label: "کلمه کلیدی اصلی در زیربخش‌ها یافت شد",
            done: new RegExp(`<h[1-6][^>]*>[^<]*${kwLower}`, "i").test(contentText ?? ""),
          },
          {
            label: "کلمه کلیدی اصلی در alt تصاویر یافت شد",
            done: new RegExp(`alt="[^"]*${kwLower}`, "i").test(contentText ?? ""),
          },
        ]
      : []),
    { label: `آدرس URL طول مناسبی دارد (${toPersianNumbers(path.length)} نویسه)`, done: path.length <= 75 },
  ];

  const all = [...basic, ...titleReadability, ...contentReadability, ...extra];
  const passed = all.filter((c) => c.done).length;
  const score = all.length > 0 ? Math.round((passed / all.length) * 100) : 0;
  const errors = all.length - passed;

  return { basic, titleReadability, contentReadability, extra, score, errors };
}

// ── Score circle ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-dz-a-success border-dz-a-success" :
    score >= 50 ? "text-dz-a-warning border-dz-a-warning" :
    "text-dz-a-error border-dz-a-error";
  return (
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black tabular-nums ${color}`}>
      {score}
    </div>
  );
}

// ── Check category accordion ──────────────────────────────────────────────────

function CheckGroup({ title, checks, defaultOpen = false }: { title: string; checks: SeoCheck[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const errors = checks.filter((c) => !c.done).length;
  return (
    <div className="border-t border-dz-a-primary-100 dark:border-dz-a-night-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-start transition-colors hover:bg-dz-a-primary-50/50 dark:hover:bg-white/3"
      >
        <span className="flex-1 text-sm font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">{title}</span>
        {errors > 0 ? (
          <span className="rounded-full bg-dz-a-error/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-error">{toPersianNumbers(errors)} خطا</span>
        ) : (
          <span className="rounded-full bg-dz-a-success/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-success">همه خوبه</span>
        )}
        {open
          ? <ChevronUp className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
          : <ChevronDown className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" />}
      </button>
      {open && (
        <ul className="flex flex-col gap-2 px-4 pb-4">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {c.done
                ? <Check className="mt-0.5 size-4 shrink-0 text-dz-a-success" />
                : <XIcon className="mt-0.5 size-4 shrink-0 text-dz-a-error" />}
              <span className={c.done ? "text-dz-a-primary-600 dark:text-dz-a-night-muted" : "text-dz-a-primary-800 dark:text-dz-a-night-fg"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArticleSeoSection({
  seoPanel,
  contentText,
  seoV,
  setSeoV,
  seoTab,
  setSeoTab,
  seoPending,
  startSeoTransition,
  seoSuccess,
  setSeoSuccess,
  router,
}: {
  seoPanel: ArticleSeoPanelProps;
  contentText?: string;
  seoV: SeoMetaInput;
  setSeoV: (fn: (s: SeoMetaInput) => SeoMetaInput) => void;
  seoTab: SeoTab;
  setSeoTab: (t: SeoTab) => void;
  seoPending: boolean;
  startSeoTransition: TransitionStartFunction;
  seoSuccess: string | null;
  setSeoSuccess: (v: string | null) => void;
  router: AppRouterInstance;
}) {
  const [open, setOpen] = useState(true);
  const [focusKeyword, setFocusKeyword] = useState("");

  const { entityId: seoId, autoSource, defaults } = seoPanel;
  const sv = (k: keyof SeoMetaInput) => (seoV[k] as string) ?? "";
  const set = (patch: Partial<SeoMetaInput>) => { setSeoV((s) => ({ ...s, ...patch })); setSeoSuccess(null); };

  const effTitle = sv("title") || autoSource.title;
  const fullTitle = effTitle.includes("دشت‌زاد")
    ? effTitle
    : defaults.titleTemplate.includes("%s")
      ? defaults.titleTemplate.replace("%s", effTitle)
      : `${effTitle} | دشت‌زاد`;
  const effDesc = truncateMetaText(sv("description") || stripHtmlForMeta(autoSource.description), 160);
  const canonical = buildCanonical(autoSource.path, sv("canonicalUrl") || null, defaults.canonicalBase || null);
  const ogImage = sv("ogImageUrl") || autoSource.image || defaults.defaultOgImageUrl || "";

  const analysis = analyzeSeo(focusKeyword, effTitle, effDesc, autoSource.path, contentText);

  const saveSeo = () => {
    startSeoTransition(async () => {
      const res = await saveSeoMeta("POST", seoId, seoV);
      if (res.ok) { setSeoSuccess("تنظیمات سئو ذخیره شد."); router.refresh(); }
    });
  };

  const autofill = () =>
    set({
      title: autoSource.title,
      description: truncateMetaText(stripHtmlForMeta(autoSource.description), 160),
      ogTitle: autoSource.title,
      ogDescription: truncateMetaText(stripHtmlForMeta(autoSource.description), 200),
      ogImageUrl: autoSource.image ?? "",
    });

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-start transition-colors hover:bg-dz-a-primary-50/50 dark:hover:bg-white/3"
      >
        <Search className="size-4 text-dz-a-primary-500 dark:text-dz-a-night-muted" />
        <span className="flex-1 text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">دستیار سئو</span>
        {analysis && (
          <span className={`text-xs font-bold tabular-nums ${
            analysis.score >= 80 ? "text-dz-a-success" :
            analysis.score >= 50 ? "text-dz-a-warning" :
            "text-dz-a-error"
          }`}>
            {toPersianNumbers(analysis.score)} / ۱۰۰
          </span>
        )}
        {open
          ? <ChevronUp className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
          : <ChevronDown className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" />}
      </button>

      {open && (
        <div className="border-t border-dz-a-primary-100 dark:border-dz-a-night-border">
          {/* Tab bar */}
          <div className="flex border-b border-dz-a-primary-100 dark:border-dz-a-night-border">
            {(["general", "social", "advanced"] as SeoTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSeoTab(t)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  seoTab === t
                    ? "border-b-2 border-dz-a-primary-600 text-dz-a-primary-700 dark:border-dz-a-primary-400 dark:text-dz-a-night-fg"
                    : "text-dz-a-primary-400 hover:text-dz-a-primary-600 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-muted"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── سئو عمومی ── */}
            {seoTab === "general" && (
              <div className="flex flex-col gap-6">
                {/* Focus keyword + score */}
                <div className="flex items-start gap-4 rounded-xl border border-dz-a-primary-100 bg-dz-a-primary-50/50 p-4 dark:border-dz-a-night-border dark:bg-white/3">
                  <KeyRound className="mt-2.5 size-4 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                  <div className="min-w-0 flex-1">
                    <label className={labelCls}>کلمه کلیدی اصلی (Focus Keyword)</label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="مثال: رگلاژ دکل مهاری"
                      className={inputCls}
                    />
                    <p className="mt-1.5 text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
                      برای تحلیل سئو وارد کنید — در دیتابیس ذخیره نمی‌شود.
                    </p>
                  </div>
                  {analysis && <ScoreBadge score={analysis.score} />}
                </div>

                {/* Title/description + preview — grid */}
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={labelCls}>عنوان سئو (Title Tag)</label>
                      <input value={sv("title")} onChange={(e) => set({ title: e.target.value })} placeholder={autoSource.title} className={inputCls} />
                      <QualityBar val={effTitle} min={META_BOUNDS.title.min} max={META_BOUNDS.title.max} />
                    </div>
                    <div>
                      <label className={labelCls}>توضیح متا (Meta Description)</label>
                      <textarea rows={4} value={sv("description")} onChange={(e) => set({ description: e.target.value })} placeholder={effDesc} className={`${inputCls} resize-y leading-6`} />
                      <QualityBar val={sv("description") || effDesc} min={META_BOUNDS.description.min} max={META_BOUNDS.description.max} />
                    </div>
                    <button type="button" onClick={autofill} className="inline-flex w-fit items-center gap-2 rounded-lg border border-dz-a-primary-200 px-3 py-2 text-xs font-medium text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300 dark:hover:bg-white/5">
                      <Wand2 className="size-3.5" /> تولید خودکار از محتوا
                    </button>
                  </div>

                  {/* Google preview */}
                  <div className="flex flex-col gap-3">
                    <p className={labelCls}>پیش‌نمایش گوگل</p>
                    <div dir="ltr" className="rounded-xl border border-dz-a-primary-100 bg-white p-4 text-left text-sm shadow-xs dark:bg-dz-a-night-base">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="size-4 rounded-full bg-dz-a-primary-200" />
                        <div>
                          <div className="text-[11px] font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">دشت‌زاد</div>
                          <div className="text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">{canonical}</div>
                        </div>
                      </div>
                      <div className="line-clamp-1 text-[17px] font-medium leading-tight text-[#1a0dab]">{fullTitle || "عنوان صفحه"}</div>
                      <div className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#4d5156]">{effDesc || "توضیح صفحه‌ی شما در نتایج جستجو اینجا نمایش داده می‌شود."}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── اشتراک‌گذاری ── */}
            {seoTab === "social" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">Open Graph (فیسبوک / واتس‌اپ / لینکدین)</p>
                  <div>
                    <label className={labelCls}>عنوان OG</label>
                    <input value={sv("ogTitle")} onChange={(e) => set({ ogTitle: e.target.value })} placeholder={fullTitle} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>توضیح OG</label>
                    <textarea rows={3} value={sv("ogDescription")} onChange={(e) => set({ ogDescription: e.target.value })} placeholder={effDesc} className={`${inputCls} resize-y leading-6`} />
                  </div>
                  <div>
                    <label className={labelCls}>تصویر OG</label>
                    <MediaPicker value={sv("ogImageUrl")} onChange={(v) => set({ ogImageUrl: v })} usage="SEO" withUrlInput={false} />
                    <p className="mt-1 text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">ابعاد توصیه‌شده: ۱۲۰۰×۶۳۰ px</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">توییتر / X</p>
                  <div>
                    <label className={labelCls}>عنوان</label>
                    <input value={sv("twitterTitle")} onChange={(e) => set({ twitterTitle: e.target.value })} placeholder={sv("ogTitle") || fullTitle} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>توضیح</label>
                    <textarea rows={3} value={sv("twitterDescription")} onChange={(e) => set({ twitterDescription: e.target.value })} placeholder={sv("ogDescription") || effDesc} className={`${inputCls} resize-y leading-6`} />
                  </div>
                  {ogImage && (
                    <img src={ogImage} alt="" className="w-full rounded-xl object-cover" style={{ aspectRatio: "1200/630" }} />
                  )}
                </div>
              </div>
            )}

            {/* ── پیشرفته ── */}
            {seoTab === "advanced" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={labelCls}>Canonical URL</label>
                  <input dir="ltr" value={sv("canonicalUrl")} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder={canonical} className={`${inputCls} font-mono text-xs`} />
                  <p className="mt-1 font-mono text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint" dir="ltr">{canonical}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => set({ noindex: !seoV.noindex })}
                    aria-pressed={Boolean(seoV.noindex)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${seoV.noindex ? "border-dz-a-warning/40 bg-dz-a-warning/10 text-dz-a-warning" : "border-dz-a-primary-200 text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300 dark:hover:bg-white/5"}`}
                  >
                    {seoV.noindex ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    {seoV.noindex ? "ایندکس نشود (noindex)" : "ایندکس شود"}
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ nofollow: !seoV.nofollow })}
                    aria-pressed={Boolean(seoV.nofollow)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${seoV.nofollow ? "border-dz-a-warning/40 bg-dz-a-warning/10 text-dz-a-warning" : "border-dz-a-primary-200 text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300 dark:hover:bg-white/5"}`}
                  >
                    {seoV.nofollow ? "لینک‌ها دنبال نشوند (nofollow)" : "دنبال‌کردن لینک‌ها"}
                  </button>
                </div>
              </div>
            )}

            {/* Save bar */}
            <div className="mt-5 flex items-center gap-3 border-t border-dz-a-primary-100 pt-4 dark:border-dz-a-night-border">
              {seoSuccess && (
                <span className="text-sm font-medium text-dz-a-success">{seoSuccess} ✓</span>
              )}
              <button
                type="button"
                onClick={saveSeo}
                disabled={seoPending}
                className="focus-ring ms-auto inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dz-a-primary-700 disabled:opacity-60 dark:bg-dz-a-primary-500 dark:hover:bg-dz-a-primary-400"
              >
                {seoPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {seoPending ? "در حال ذخیره…" : "ذخیره‌ی سئو"}
              </button>
            </div>
          </div>

          {/* ── تحلیل سئو — فقط وقتی کلمه کلیدی وارد شده ── */}
          {analysis && (
            <div className="border-t border-dz-a-primary-100 dark:border-dz-a-night-border">
              {analysis.basic.length > 0 && (
                <CheckGroup title="سئو پایه‌ای" checks={analysis.basic} defaultOpen />
              )}
              {analysis.extra.length > 0 && (
                <CheckGroup title="اضافی" checks={analysis.extra} />
              )}
              {analysis.titleReadability.length > 0 && (
                <CheckGroup title="خوانایی عنوان" checks={analysis.titleReadability} />
              )}
              {analysis.contentReadability.length > 0 && (
                <CheckGroup title="خوانایی محتوا" checks={analysis.contentReadability} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
