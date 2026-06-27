import { AlertTriangle, ArrowLeftRight, CheckCircle2, Trash2, XCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import { SeoSection, SeoNote } from "@/components/admin/seo/SeoUi";
import {
  markResolvedAction,
  deleteLogAction,
  clearResolvedAction,
  createRedirectFromLogAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function NotFoundMonitorPage() {
  await requireAdmin();

  const logs = await prisma.error404Log.findMany({
    orderBy: [{ isResolved: "asc" }, { hitCount: "desc" }, { lastSeenAt: "desc" }],
    take: 200,
  });

  const unresolved = logs.filter((l) => !l.isResolved);
  const resolved = logs.filter((l) => l.isResolved);

  return (
    <div className="flex flex-col gap-6">
      <SeoNote tone="warn">
        URLهایی که بازدیدکنندگان در آن‌ها خطای ۴۰۴ گرفته‌اند. برای هر مورد می‌توانید ریدایرکت بسازید یا آن را علامت‌گذاری
        کنید.
      </SeoNote>

      {unresolved.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-a-primary-200 bg-dz-a-primary-50/30 p-12 text-center dark:border-dz-a-night-border dark:bg-white/2">
          <CheckCircle2 className="size-10 text-dz-a-success" />
          <h2 className="font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">هیچ خطای ۴۰۴ حل‌نشده‌ای وجود ندارد</h2>
        </div>
      ) : (
        <SeoSection
          title={`خطاهای حل‌نشده (${toPersianNumbers(unresolved.length)})`}
          description="مرتب‌شده بر اساس تعداد بازدید — پرتکرارترین‌ها اول"
        >
          <ul className="flex flex-col divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
            {unresolved.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <AlertTriangle className="size-4 text-amber-500" />
                </span>

                <div className="min-w-0 flex-1">
                  <p dir="ltr" className="truncate font-mono text-sm text-dz-a-primary-800 dark:text-dz-a-night-fg">
                    {log.path}
                  </p>
                  <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                    {toPersianNumbers(log.hitCount)} بار · آخرین بازدید: {formatJalali(log.lastSeenAt)}
                  </p>
                </div>

                {/* Create redirect */}
                <form
                  action={createRedirectFromLogAction.bind(null, log.id, log.path)}
                >
                  <button
                    type="submit"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-2.5 py-1.5 text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    ریدایرکت
                  </button>
                </form>

                {/* Mark resolved */}
                <form action={markResolvedAction.bind(null, log.id)}>
                  <button
                    type="submit"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-2.5 py-1.5 text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    حل‌شده
                  </button>
                </form>

                {/* Delete */}
                <form action={deleteLogAction.bind(null, log.id)}>
                  <button
                    type="submit"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-red-100 dark:border-red-900/30 bg-white dark:bg-dz-a-night-card px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="size-3.5" />
                    حذف
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </SeoSection>
      )}

      {resolved.length > 0 && (
        <SeoSection
          title={`حل‌شده‌ها (${toPersianNumbers(resolved.length)})`}
          description="این موارد علامت‌گذاری شده‌اند و می‌توانید همه را یکجا پاک کنید"
        >
          <div className="mb-4">
            <form action={clearResolvedAction}>
              <button
                type="submit"
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-3 py-1.5 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5"
              >
                <Trash2 className="size-4" />
                پاک‌کردن همه‌ی حل‌شده‌ها
              </button>
            </form>
          </div>

          <ul className="flex flex-col divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
            {resolved.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0 opacity-50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dz-a-primary-50 dark:bg-white/5">
                  <XCircle className="size-4 text-dz-a-primary-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p dir="ltr" className="truncate font-mono text-sm text-dz-a-primary-600 dark:text-dz-a-night-muted">
                    {log.path}
                  </p>
                  <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                    {toPersianNumbers(log.hitCount)} بار
                  </p>
                </div>
                <form action={deleteLogAction.bind(null, log.id)}>
                  <button
                    type="submit"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-red-100 dark:border-red-900/30 bg-white dark:bg-dz-a-night-card px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </SeoSection>
      )}
    </div>
  );
}
