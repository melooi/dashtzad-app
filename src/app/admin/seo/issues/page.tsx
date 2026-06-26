import Link from "next/link";
import { Pencil, ExternalLink, Package, FileText, CheckCircle2 } from "lucide-react";
import { getSeoIssues } from "@/lib/admin/seo-issues";
import { SeoSection, SeoNote } from "@/components/admin/seo/SeoUi";
import { toPersianNumbers } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function SeoIssuesPage() {
  const { rows, total, truncated } = await getSeoIssues();

  const action =
    "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border bg-white dark:bg-dz-night-card px-2.5 py-1.5 text-xs font-medium text-dz-primary-700 dark:text-dz-night-fg transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5";

  return (
    <div className="flex flex-col gap-6">
      <SeoNote>
        صف خطاهای فنیِ سئو که از روی دادهٔ واقعی محصولات و نوشته‌ها محاسبه شده‌اند. هر مورد مستقیماً به صفحهٔ ویرایش همان
        موجودیت لینک دارد. این فهرست متریک گوگل نیست؛ فقط مشکلات قابل‌اصلاح داخلی را نشان می‌دهد.
      </SeoNote>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-primary-200 bg-dz-primary-50/30 p-12 text-center dark:border-dz-night-border dark:bg-white/2">
          <CheckCircle2 className="size-10 text-dz-success" />
          <h2 className="font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">هیچ خطای سئویی پیدا نشد</h2>
          <p className="max-w-md text-sm text-dz-primary-500 dark:text-dz-night-muted">
            همهٔ محصولات فعال و نوشته‌های منتشرشده تصویر و توضیح/خلاصهٔ کافی دارند.
          </p>
        </div>
      ) : (
        <SeoSection
          title={`خطاهای نیازمند اصلاح (${toPersianNumbers(total)})`}
          description={truncated ? `${toPersianNumbers(rows.length)} مورد اول نمایش داده می‌شود.` : undefined}
        >
          <ul className="flex flex-col divide-y divide-dz-primary-50 dark:divide-dz-night-line">
            {rows.map((row) => (
              <li key={`${row.entityType}-${row.id}`} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dz-primary-50 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                  {row.entityType === "PRODUCT" ? <Package className="size-4" /> : <FileText className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-dz-primary-800 dark:text-dz-night-fg">{row.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {row.issues.map((issue) => (
                      <span key={issue} className="rounded-full bg-dz-warning/15 px-2 py-0.5 text-[11px] font-medium text-dz-warning dark:text-dz-warning-300">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={row.editHref} className={action}>
                    <Pencil className="size-3.5" /> ویرایش
                  </Link>
                  {row.viewHref && (
                    <a href={row.viewHref} target="_blank" rel="noopener noreferrer" className={action}>
                      <ExternalLink className="size-3.5" /> مشاهده
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SeoSection>
      )}
    </div>
  );
}
