"use client";

import { Search, X, LayoutGrid, List } from "lucide-react";
import { fieldClass } from "@/components/admin/ui/AdminField";
import {
  MEDIA_SORT_OPTIONS,
  MEDIA_USAGE_OPTIONS,
  type MediaSort,
} from "@/lib/media/shared";
import type { MediaUsage } from "@/generated/prisma/client";

const MIME_FILTER_OPTIONS = [
  { value: "", label: "همه‌ی فرمت‌ها" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WEBP" },
  { value: "image/gif", label: "GIF" },
];

export function MediaToolbar({
  q,
  onQ,
  usage,
  onUsage,
  mime,
  onMime,
  sort,
  onSort,
  view,
  onView,
}: {
  q: string;
  onQ: (v: string) => void;
  usage: MediaUsage | "";
  onUsage: (v: MediaUsage | "") => void;
  mime: string;
  onMime: (v: string) => void;
  sort: MediaSort;
  onSort: (v: MediaSort) => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 inset-s-3 size-4 -translate-y-1/2 text-dz-primary-400 dark:text-dz-night-faint" />
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="جستجو در نام، عنوان، توضیح…"
          aria-label="جستجوی رسانه"
          className="w-full rounded-xl border border-dz-primary-200 bg-white py-2.5 pe-9 ps-9 text-sm text-dz-primary-900 shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-dz-primary-300 hover:border-dz-primary-300 focus:border-dz-primary-500 focus:ring-3 focus:ring-dz-primary-500/15 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg dark:placeholder:text-dz-night-faint dark:hover:border-dz-primary-500/50"
        />
        {q && (
          <button
            type="button"
            onClick={() => onQ("")}
            aria-label="پاک کردن جستجو"
            className="focus-ring absolute top-1/2 inset-e-2 -translate-y-1/2 rounded-md p-1 text-dz-primary-400 hover:text-dz-primary-700 dark:text-dz-night-faint dark:hover:text-dz-night-fg"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <select
        value={usage}
        onChange={(e) => onUsage(e.target.value as MediaUsage | "")}
        aria-label="فیلتر بر اساس کاربرد"
        className={`${fieldClass()} w-auto`}
      >
        <option value="">همه‌ی کاربردها</option>
        {MEDIA_USAGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={mime}
        onChange={(e) => onMime(e.target.value)}
        aria-label="فیلتر بر اساس فرمت"
        className={`${fieldClass()} w-auto`}
      >
        {MIME_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as MediaSort)}
        aria-label="مرتب‌سازی"
        className={`${fieldClass()} w-auto`}
      >
        {MEDIA_SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="inline-flex overflow-hidden rounded-xl border border-dz-primary-200 dark:border-dz-night-border">
        <button
          type="button"
          onClick={() => onView("grid")}
          aria-label="نمایش شبکه‌ای"
          aria-pressed={view === "grid"}
          className={`focus-ring p-2.5 transition-colors ${
            view === "grid"
              ? "bg-dz-primary-600 text-white"
              : "bg-white text-dz-primary-500 hover:bg-dz-primary-50 dark:bg-dz-night-elevated dark:text-dz-night-muted dark:hover:bg-white/5"
          }`}
        >
          <LayoutGrid className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onView("list")}
          aria-label="نمایش فهرستی"
          aria-pressed={view === "list"}
          className={`focus-ring border-s border-dz-primary-200 p-2.5 transition-colors dark:border-dz-night-border ${
            view === "list"
              ? "bg-dz-primary-600 text-white"
              : "bg-white text-dz-primary-500 hover:bg-dz-primary-50 dark:bg-dz-night-elevated dark:text-dz-night-muted dark:hover:bg-white/5"
          }`}
        >
          <List className="size-4" />
        </button>
      </div>
    </div>
  );
}
