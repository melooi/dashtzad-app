"use client";

import { useState, useTransition } from "react";
import { Trash2, ChevronDown, AlertTriangle, EyeOff } from "lucide-react";
import { AdminConfirmDialog } from "./AdminConfirmDialog";
import { AdminFormError } from "./AdminFormError";

type ActionResult = { ok: boolean; error?: string };

/**
 * Destructive-actions section. Collapsed by default (a quiet row), expands on
 * click to reveal the controls — so it no longer dominates every edit page.
 *
 * When the entity is published, callers can pass `isPublished` + `onUnpublish`
 * to offer "unpublish first" as the safer step before permanent deletion.
 * `onConfirm` runs the (guarded) server action; a blocked delete surfaces its
 * Persian reason inline.
 */
export function AdminDangerZone({
  title = "حذف",
  description,
  confirmTitle,
  confirmDescription,
  buttonLabel = "حذف",
  onConfirm,
  onDeleted,
  isPublished = false,
  onUnpublish,
  unpublishLabel = "خارج‌کردن از انتشار",
  defaultOpen = false,
}: {
  title?: string;
  description: string;
  confirmTitle: string;
  confirmDescription?: string;
  buttonLabel?: string;
  onConfirm: () => Promise<ActionResult>;
  onDeleted?: () => void;
  isPublished?: boolean;
  onUnpublish?: () => Promise<ActionResult>;
  unpublishLabel?: string;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await onConfirm();
      if (!res.ok) {
        setError(res.error ?? "حذف ممکن نشد.");
        setOpen(false);
        return;
      }
      setOpen(false);
      onDeleted?.();
    });
  };

  const handleUnpublish = () => {
    if (!onUnpublish) return;
    setError(null);
    startTransition(async () => {
      const res = await onUnpublish();
      if (!res.ok) setError(res.error ?? "تغییر وضعیت ممکن نشد.");
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-dz-a-error/25 bg-dz-a-error/5 dark:bg-dz-a-error/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="focus-ring flex w-full items-center gap-2 px-5 py-3.5 text-start"
      >
        <AlertTriangle className="size-4 shrink-0 text-dz-a-error dark:text-dz-a-error-300" />
        <span className="font-heading text-sm font-bold text-dz-a-error dark:text-dz-a-error-300">{title}</span>
        <ChevronDown
          className={`ms-auto size-4 text-dz-a-error/70 transition-transform dark:text-dz-a-error-300/70 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-dz-a-error/20 px-5 pb-5 pt-4">
          <p className="mb-4 text-xs leading-5 text-dz-a-primary-500 dark:text-dz-a-night-muted">{description}</p>
          {error && (
            <div className="mb-4">
              <AdminFormError message={error} />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && onUnpublish && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={pending}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-warning/40 bg-white px-4 py-2.5 text-sm font-medium text-dz-a-warning transition-colors hover:bg-dz-a-warning/10 disabled:opacity-50 dark:bg-dz-a-night-card dark:text-dz-a-warning-300"
              >
                <EyeOff className="size-4" />
                {unpublishLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={pending}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-error/40 bg-white px-4 py-2.5 text-sm font-medium text-dz-a-error transition-colors hover:bg-dz-a-error/10 disabled:opacity-50 dark:bg-dz-a-night-card dark:text-dz-a-error-300"
            >
              <Trash2 className="size-4" />
              {buttonLabel}
            </button>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="حذف دائمی"
        danger
        loading={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </section>
  );
}
