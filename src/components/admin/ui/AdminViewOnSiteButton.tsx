import { Eye, ExternalLink } from "lucide-react";

/**
 * "View on site" / "preview" link for content edit pages. Three presentations:
 *  - mode="view"    → published entity: opens the live public page ("مشاهده در سایت").
 *  - mode="preview" → draft / unsaved: labelled "پیش‌نمایش".
 *  - disabled       → no public URL yet (e.g. unsaved new item); renders a muted,
 *                     non-interactive chip with a short reason tooltip.
 * Backward compatible: passing only `href` keeps the original "view" behaviour.
 */
export function AdminViewOnSiteButton({
  href,
  label,
  mode = "view",
  disabled = false,
  disabledReason = "این مورد هنوز نشانی عمومی ندارد.",
}: {
  href?: string;
  label?: string;
  mode?: "view" | "preview";
  disabled?: boolean;
  disabledReason?: string;
}) {
  const text = label ?? (mode === "preview" ? "پیش‌نمایش" : "مشاهده‌ی صفحه در سایت");

  if (disabled || !href) {
    return (
      <span
        title={disabledReason}
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-dz-primary-100 bg-dz-primary-50/50 px-3.5 py-2 text-sm font-medium text-dz-primary-300 dark:border-dz-night-border dark:bg-white/5 dark:text-dz-night-faint"
      >
        <Eye className="size-4 shrink-0" aria-hidden />
        {text}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-primary-200 bg-white px-3.5 py-2 text-sm font-medium text-dz-primary-700 shadow-xs transition-colors hover:border-dz-primary-300 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-fg dark:shadow-none dark:hover:bg-white/5"
    >
      <Eye className="size-4 shrink-0" aria-hidden />
      {text}
      <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
    </a>
  );
}
