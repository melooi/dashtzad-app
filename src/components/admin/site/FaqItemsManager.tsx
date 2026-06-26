"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { faqItemSchema, emptyFaqItem, type FaqItemInput } from "@/lib/admin/site-experience";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminRichTextField } from "@/components/admin/ui/AdminRichTextField";
import { htmlToPlainText } from "@/lib/richtext/sanitize";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { saveFaqItem, deleteFaqItem, moveFaqItem } from "@/app/admin/collections/faqs/actions";

export type FaqItemRow = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

export function FaqItemsManager({ groupId, items }: { groupId: string; items: FaqItemRow[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const form = useForm<FaqItemInput>({ resolver: zodResolver(faqItemSchema), defaultValues: emptyFaqItem });

  const startEdit = (r: FaqItemRow) => {
    setEditingId(r.id);
    setServerError(null);
    form.reset({ question: r.question, answer: r.answer, isActive: r.isActive, sortOrder: r.sortOrder });
  };
  const startNew = () => {
    setEditingId(null);
    setServerError(null);
    form.reset(emptyFaqItem);
  };

  const submit = () => {
    setServerError(null);
    setNotice(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = await saveFaqItem(groupId, editingId, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      setNotice(editingId ? "سوال ویرایش شد." : "سوال افزوده شد.");
      startNew();
    });
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    const id = confirmId;
    startTransition(async () => {
      const res = await deleteFaqItem(id);
      if (!res.ok) setServerError(res.error);
      else setNotice("سوال حذف شد.");
      setConfirmId(null);
    });
  };

  const move = (id: string, dir: "up" | "down") => {
    startTransition(async () => {
      await moveFaqItem(id, dir);
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="h-fit rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-5 shadow-xs lg:sticky lg:top-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            <span className="h-4 w-1 rounded-full bg-dz-a-primary-300 dark:bg-dz-a-primary-500" aria-hidden />
            {editingId ? "ویرایش سوال" : "افزودن سوال"}
          </h2>
          {editingId && (
            <button type="button" onClick={startNew} className="focus-ring flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
              <Plus className="size-3.5" /> جدید
            </button>
          )}
        </div>
        {serverError && <div className="mb-3"><AdminFormError message={serverError} /></div>}
        {notice && <div className="mb-3"><AdminSuccessNotice message={notice} onDismiss={() => setNotice(null)} /></div>}
        <AdminFormShell form={form} onSubmit={submit}>
          <AdminTextField name="question" label="پرسش" required />
          <AdminRichTextField name="answer" label="پاسخ" required placeholder="پاسخ کامل پرسش…" minHeight={160} />
          <AdminCheckboxField name="isActive" label="فعال" />
          <button type="submit" disabled={pending} className="focus-ring mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-a-primary-700 active:bg-dz-a-primary-800 disabled:bg-dz-a-primary-300 dark:disabled:bg-dz-a-primary-800">
            {pending ? "در حال ذخیره…" : editingId ? "ذخیره" : "افزودن"}
          </button>
        </AdminFormShell>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-dz-a-primary-200 dark:border-dz-a-night-border bg-dz-a-primary-50/30 dark:bg-white/5 p-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-dz-a-night-card text-dz-a-primary-400 dark:text-dz-a-night-faint shadow-xs ring-1 ring-dz-a-primary-100 dark:ring-dz-a-night-border"><Plus className="size-5" /></div>
            <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">هنوز سوالی در این گروه نیست. از فرم کنار، اولین پرسش را اضافه کنید.</p>
          </div>
        )}
        {items.map((r, i) => (
          <div key={r.id} className="rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-4 shadow-xs transition-shadow hover:shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.question}</h3>
                  <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{htmlToPlainText(r.answer)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={() => move(r.id, "up")} disabled={i === 0 || pending} title="انتقال به بالا" aria-label="انتقال به بالا" className="focus-ring rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
                  <ChevronUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(r.id, "down")} disabled={i === items.length - 1 || pending} title="انتقال به پایین" aria-label="انتقال به پایین" className="focus-ring rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
                  <ChevronDown className="size-4" />
                </button>
                <button type="button" onClick={() => startEdit(r)} title="ویرایش" aria-label="ویرایش پرسش" className="focus-ring rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
                  <Pencil className="size-4" />
                </button>
                <button type="button" onClick={() => setConfirmId(r.id)} title="حذف" aria-label="حذف پرسش" className="focus-ring rounded-lg p-1.5 text-dz-a-error/70 dark:text-dz-a-error-300 transition-colors hover:bg-dz-a-error/10 hover:text-dz-a-error dark:hover:text-dz-a-error-300">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminConfirmDialog
        open={confirmId !== null}
        title="حذف سوال"
        description="این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        danger
        loading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
