import { ImagePlus, SearchX } from "lucide-react";

/** Empty state for the library — distinct copy for "no media yet" vs "no
 *  matches" so the dead-end never reads the same as an active filter. */
export function MediaEmptyState({
  filtered,
  onUploadClick,
  onClearFilters,
}: {
  filtered: boolean;
  onUploadClick?: () => void;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-primary-200 bg-dz-primary-50/30 p-12 text-center dark:border-dz-night-border dark:bg-white/2">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-dz-primary-300 shadow-xs ring-1 ring-dz-primary-100 dark:bg-dz-night-elevated dark:text-dz-primary-300 dark:ring-dz-night-border">
        {filtered ? <SearchX className="size-7" /> : <ImagePlus className="size-7" />}
      </div>
      <h2 className="mt-1 font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">
        {filtered ? "نتیجه‌ای یافت نشد" : "هنوز رسانه‌ای ندارید"}
      </h2>
      <p className="max-w-md text-sm leading-6 text-dz-primary-500 dark:text-dz-night-muted">
        {filtered
          ? "با این جستجو یا فیلتر چیزی پیدا نشد. فیلترها را پاک کنید یا عبارت دیگری را امتحان کنید."
          : "تصاویر فروشگاه، بنرها، لوگو و تصاویر سئو را یک‌بار آپلود کنید و در همه‌جای پنل دوباره از آن‌ها استفاده کنید."}
      </p>
      {filtered ? (
        onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="focus-ring mt-2 rounded-xl border border-dz-primary-200 px-4 py-2 text-sm text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg dark:hover:bg-white/5"
          >
            پاک کردن فیلترها
          </button>
        )
      ) : (
        onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="focus-ring mt-2 inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800"
          >
            <ImagePlus className="size-4" />
            اولین تصویر را آپلود کنید
          </button>
        )
      )}
    </div>
  );
}
