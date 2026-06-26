"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  icon,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-store-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-[min(34rem,100%)] flex-col overflow-hidden rounded-3xl bg-store-surface text-store-text shadow-store-popover"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center gap-3 border-b border-store-border px-5 py-4">
          {icon && (
            <span className="grid size-10 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
              {icon}
            </span>
          )}
          <h2 className="flex-1 font-heading text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="store-focus grid size-9 place-items-center rounded-full bg-store-surface-soft text-store-text-muted transition-colors hover:text-store-text"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex gap-2 border-t border-store-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
