"use client";

import { toPersianNumbers } from "@/lib/price";

// Quality bands (char counts). Short / good / long → Persian status chips.
function quality(
  len: number,
  min: number,
  max: number,
): { label: string; text: string; pill: string; bar: string; pct: number } {
  const pct = Math.min(100, Math.round((len / max) * 100));
  if (len === 0)
    return { label: "خالی", text: "text-dz-primary-400 dark:text-dz-night-faint", pill: "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-400 dark:text-dz-night-faint", bar: "bg-dz-primary-200 dark:bg-dz-night-border", pct: 0 };
  if (len < min)
    return { label: "کوتاه", text: "text-dz-warning dark:text-dz-warning-300", pill: "bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300", bar: "bg-dz-warning", pct };
  if (len > max)
    return { label: "طولانی", text: "text-dz-error dark:text-dz-error-300", pill: "bg-dz-error/10 text-dz-error dark:text-dz-error-300", bar: "bg-dz-error", pct: 100 };
  return { label: "عالی", text: "text-dz-success dark:text-dz-success-300", pill: "bg-dz-success/10 text-dz-success dark:text-dz-success-300", bar: "bg-dz-success", pct };
}

function Counter({ value, min, max, label }: { value: string; min: number; max: number; label: string }) {
  const len = value.length;
  const q = quality(len, min, max);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-dz-primary-600 dark:text-dz-primary-300">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-dz-primary-400 dark:text-dz-night-faint">
            {toPersianNumbers(len)} / {toPersianNumbers(max)} نویسه
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${q.pill}`}>{q.label}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dz-primary-50 dark:bg-white/5">
        <div className={`h-full rounded-full transition-all ${q.bar}`} style={{ width: `${q.pct}%` }} />
      </div>
    </div>
  );
}

/** Live Google-style preview + character counters for SEO defaults. */
export function SeoPreview({ data }: { data: Record<string, unknown> }) {
  const title = String(data.defaultTitle ?? "");
  const description = String(data.defaultDescription ?? "");
  const base = String(data.canonicalBase ?? "") || "https://dashtzad.com";
  const host = base.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <section className="@container rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-5 shadow-xs sm:p-6">
      <div className="mb-4 border-b border-dz-primary-50 dark:border-dz-night-line pb-3.5">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">
          <span className="h-4 w-1 rounded-full bg-dz-primary-300 dark:bg-dz-primary-500" aria-hidden />
          دستیار سئو · پیش‌نمایش گوگل
        </h2>
        <p className="mt-1.5 ps-3 text-xs text-dz-primary-400 dark:text-dz-night-faint">نمایش تقریبی نتیجه‌ی جستجو و کیفیت عنوان و توضیحات.</p>
      </div>

      <div dir="ltr" className="rounded-xl border border-dz-primary-100 dark:border-dz-night-border bg-dz-primary-50/30 dark:bg-white p-4 text-left">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-dz-primary-600 text-[10px] font-bold text-white">د</span>
          <div className="leading-tight">
            <div className="text-xs text-[#202124]">دشت‌زاد</div>
            <div className="text-[11px] text-[#5f6368]">{host} › </div>
          </div>
        </div>
        <div className="mt-1.5 truncate text-lg text-[#1a0dab]">{title || "عنوان پیش‌فرض سایت"}</div>
        <div className="mt-0.5 text-sm leading-6 text-[#4d5156] line-clamp-2">
          {description || "توضیح پیش‌فرض سایت اینجا نمایش داده می‌شود."}
        </div>
      </div>

      <div className="mt-4 grid gap-3 @md:grid-cols-2">
        <Counter value={title} min={30} max={60} label="طول عنوان" />
        <Counter value={description} min={70} max={160} label="طول توضیحات" />
      </div>
    </section>
  );
}
