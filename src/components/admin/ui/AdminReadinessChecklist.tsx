"use client";

import { Check, Circle, CircleAlert } from "lucide-react";

export type ReadinessItem = {
  label: string;
  done: boolean;
  /** optional items don't count toward the required progress score. */
  optional?: boolean;
  /** short hint shown when the item is not done. */
  hint?: string;
};

/**
 * Compact "readiness" panel for content/product forms. It is PURELY derived
 * from current form values passed in by the parent — it never fetches or
 * fabricates data. Required items drive a progress score; optional items are
 * shown for guidance but don't block "complete".
 */
export function AdminReadinessChecklist({
  title = "آمادگی انتشار",
  items,
  bare = false,
}: {
  title?: string;
  items: ReadinessItem[];
  /** وقتی true باشد: بدون کارت wrapper — مستقیم داخل پنل سایدبار */
  bare?: boolean;
}) {
  const required = items.filter((i) => !i.optional);
  const doneCount = required.filter((i) => i.done).length;
  const pct = required.length ? Math.round((doneCount / required.length) * 100) : 100;
  const complete = doneCount === required.length;

  const inner = (
    <>
      {!bare && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            {complete ? (
              <Check className="size-4 text-dz-a-success" />
            ) : (
              <CircleAlert className="size-4 text-dz-a-warning" />
            )}
            {title}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              complete
                ? "bg-dz-a-success/15 text-dz-a-success dark:text-dz-a-success-300"
                : "bg-dz-a-warning/15 text-dz-a-warning dark:text-dz-a-warning-300"
            }`}
          >
            {toFa(doneCount)}‏/‏{toFa(required.length)}
          </span>
        </div>
      )}

      {bare && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            {complete ? (
              <Check className="size-3.5 text-dz-a-success" />
            ) : (
              <CircleAlert className="size-3.5 text-dz-a-warning" />
            )}
            {toFa(doneCount)} از {toFa(required.length)} کامل
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              complete
                ? "bg-dz-a-success/15 text-dz-a-success dark:text-dz-a-success-300"
                : "bg-dz-a-warning/15 text-dz-a-warning dark:text-dz-a-warning-300"
            }`}
          >
            {toFa(Math.round(pct))}٪
          </span>
        </div>
      )}

      <div className={`overflow-hidden rounded-full bg-dz-a-primary-100 dark:bg-white/10 ${bare ? "mb-3 h-1" : "mb-4 h-1.5"}`}>
        <div
          className={`h-full rounded-full transition-all ${complete ? "bg-dz-a-success" : "bg-dz-a-primary-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className={`flex items-start gap-2 ${bare ? "text-xs" : "text-sm"}`}>
            {item.done ? (
              <Check className={`shrink-0 text-dz-a-success ${bare ? "mt-px size-3.5" : "mt-0.5 size-4"}`} aria-hidden />
            ) : (
              <Circle
                className={`shrink-0 ${bare ? "mt-px size-3.5" : "mt-0.5 size-4"} ${item.optional ? "text-dz-a-primary-200 dark:text-dz-a-night-faint" : "text-dz-a-primary-300 dark:text-dz-a-night-muted"}`}
                aria-hidden
              />
            )}
            <span className="min-w-0">
              <span className={item.done ? "text-dz-a-primary-700 dark:text-dz-a-night-fg" : "text-dz-a-primary-600 dark:text-dz-a-night-muted"}>
                {item.label}
              </span>
              {item.optional && (
                <span className="ms-1 text-[11px] text-dz-a-primary-300 dark:text-dz-a-night-faint">(اختیاری)</span>
              )}
              {!item.done && item.hint && (
                <span className="mt-0.5 block text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">{item.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </>
  );

  if (bare) return <div>{inner}</div>;

  return (
    <section className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      {inner}
    </section>
  );
}

// local Persian digit helper (avoids importing price utils into a pure UI cmp)
function toFa(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
