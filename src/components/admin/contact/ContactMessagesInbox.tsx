"use client";

import { useState, useTransition } from "react";
import { Phone, Trash2, Check, Mail, Archive, RotateCcw } from "lucide-react";
import { AdminStatusBadge, type BadgeTone } from "@/components/admin/ui/AdminStatusBadge";
import { setContactMessageStatus, deleteContactMessage } from "@/app/admin/collections/contact-messages/actions";

type Status = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export type InboxMessage = {
  id: string;
  name: string;
  phone: string;
  subject: string;
  type: string;
  message: string;
  status: Status;
  createdAtLabel: string;
};

const STATUS_META: Record<Status, { label: string; tone: BadgeTone }> = {
  NEW: { label: "جدید", tone: "amber" },
  READ: { label: "خوانده‌شده", tone: "blue" },
  REPLIED: { label: "پاسخ‌داده‌شده", tone: "green" },
  ARCHIVED: { label: "بایگانی", tone: "gray" },
};

export function ContactMessagesInbox({ messages }: { messages: InboxMessage[] }) {
  const [items, setItems] = useState(messages);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = (id: string, status: Status) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await setContactMessageStatus(id, status);
      if (res.ok) setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      setBusyId(null);
    });
  };

  const remove = (id: string) => {
    if (!confirm("این پیام حذف شود؟ این کار قابل بازگشت نیست.")) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteContactMessage(id);
      if (res.ok) setItems((prev) => prev.filter((m) => m.id !== id));
      setBusyId(null);
    });
  };

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dz-a-primary-100 bg-white p-10 text-center text-sm text-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-faint">
        هنوز پیامی از فرم تماس دریافت نشده.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((m) => {
        const meta = STATUS_META[m.status];
        const disabled = pending && busyId === m.id;
        return (
          <article
            key={m.id}
            className="rounded-2xl border border-dz-a-primary-100 bg-white p-4 shadow-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">{m.subject}</h3>
                  <AdminStatusBadge tone={meta.tone}>{meta.label}</AdminStatusBadge>
                  <span className="rounded-full bg-dz-a-primary-50 px-2 py-0.5 text-xs text-dz-a-primary-600 dark:bg-white/5 dark:text-dz-a-night-muted">{m.type}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  <span className="font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">{m.name}</span>
                  <a href={`tel:${m.phone}`} dir="ltr" className="inline-flex items-center gap-1 hover:text-dz-a-primary-700">
                    <Phone className="size-3.5" /> {m.phone}
                  </a>
                  <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{m.createdAtLabel}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-dz-a-primary-50/50 p-3 text-sm leading-7 text-dz-a-primary-700 dark:bg-white/5 dark:text-dz-a-night-muted">
              {m.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {m.status !== "READ" && (
                <button type="button" disabled={disabled} onClick={() => update(m.id, "READ")} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50 dark:border-sky-400/25 dark:text-sky-300">
                  <Mail className="size-3.5" /> خوانده‌شده
                </button>
              )}
              {m.status !== "REPLIED" && (
                <button type="button" disabled={disabled} onClick={() => update(m.id, "REPLIED")} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-400/25 dark:text-green-300">
                  <Check className="size-3.5" /> پاسخ‌داده‌شده
                </button>
              )}
              {m.status !== "ARCHIVED" ? (
                <button type="button" disabled={disabled} onClick={() => update(m.id, "ARCHIVED")} className="inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-500 hover:bg-dz-a-primary-50 disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
                  <Archive className="size-3.5" /> بایگانی
                </button>
              ) : (
                <button type="button" disabled={disabled} onClick={() => update(m.id, "NEW")} className="inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-500 hover:bg-dz-a-primary-50 disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
                  <RotateCcw className="size-3.5" /> بازگردانی
                </button>
              )}
              <button type="button" disabled={disabled} onClick={() => remove(m.id)} className="ms-auto inline-flex items-center gap-1.5 rounded-lg border border-dz-a-error/30 px-3 py-1.5 text-xs font-medium text-dz-a-error hover:bg-dz-a-error/10 disabled:opacity-50">
                <Trash2 className="size-3.5" /> حذف
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
