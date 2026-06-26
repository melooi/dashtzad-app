"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Search, Loader2, Zap } from "lucide-react";
import { saveCannedRepliesAction } from "@/app/admin/chat/actions";
import type { CannedReply } from "@/lib/chat/types";

const EMPTY: CannedReply = { title: "", shortcut: "", body: "" };

function normalizeShortcut(v: string): string {
  const s = v.trim();
  if (!s) return "";
  return s.startsWith("/") ? s : `/${s}`;
}

export function CannedRepliesManager({ initialReplies }: { initialReplies: CannedReply[] }) {
  const [replies, setReplies] = useState<CannedReply[]>(initialReplies);
  const [query, setQuery] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<CannedReply>(EMPTY);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = query.trim()
    ? replies.filter(
        (r) =>
          r.title.includes(query) ||
          r.shortcut.includes(query) ||
          r.body.includes(query),
      )
    : replies;

  const save = (next: CannedReply[]) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await saveCannedRepliesAction(next);
      if (res.ok) {
        setReplies(next);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        setError(res.error);
      }
    });
  };

  const commitAdd = () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("عنوان و متن پاسخ الزامی هستند.");
      return;
    }
    const next = [...replies, { ...draft, shortcut: normalizeShortcut(draft.shortcut) }];
    save(next);
    setShowAdd(false);
    setDraft(EMPTY);
  };

  const commitEdit = () => {
    if (editIndex === null) return;
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("عنوان و متن پاسخ الزامی هستند.");
      return;
    }
    const next = replies.map((r, i) =>
      i === editIndex ? { ...draft, shortcut: normalizeShortcut(draft.shortcut) } : r,
    );
    save(next);
    setEditIndex(null);
    setDraft(EMPTY);
  };

  const confirmDelete = (idx: number) => {
    const next = replies.filter((_, i) => i !== idx);
    save(next);
    setDeleteIdx(null);
  };

  const startEdit = (idx: number) => {
    setEditIndex(idx);
    setDraft({ ...replies[idx] });
    setShowAdd(false);
    setError(null);
  };

  const cancelForm = () => {
    setShowAdd(false);
    setEditIndex(null);
    setDraft(EMPTY);
    setError(null);
  };

  const inputCls =
    "w-full rounded-xl border border-dz-primary-200 bg-white px-3 py-2 text-sm text-dz-primary-800 outline-none transition-colors focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg";
  const labelCls = "mb-1 block text-xs font-medium text-dz-primary-600 dark:text-dz-night-muted";

  return (
    <div className="flex flex-col gap-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-dz-primary-200 bg-white px-3 py-2 focus-within:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-card">
          <Search className="size-4 shrink-0 text-dz-primary-300 dark:text-dz-night-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در عنوان، میان‌بر یا متن…"
            aria-label="جستجو در پیام‌های آماده"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-dz-primary-800 outline-none placeholder:text-dz-primary-300 dark:text-dz-night-fg dark:placeholder:text-dz-night-faint"
          />
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(true); setEditIndex(null); setDraft(EMPTY); setError(null); }}
          disabled={showAdd}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dz-primary-700 disabled:opacity-60 dark:bg-dz-primary-500 dark:hover:bg-dz-primary-600"
        >
          <Plus className="size-4" aria-hidden />
          افزودن پیام آماده
        </button>
      </div>

      {/* feedback */}
      {error && (
        <p className="rounded-xl border border-dz-error/30 bg-dz-error/5 px-4 py-2.5 text-sm text-dz-error dark:text-dz-error-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-dz-success/30 bg-dz-success/5 px-4 py-2.5 text-sm text-dz-success dark:text-dz-success-300">
          پیام‌های آماده ذخیره شدند.
        </p>
      )}

      {/* add form */}
      {showAdd && (
        <ReplyForm
          draft={draft}
          onChange={setDraft}
          onCommit={commitAdd}
          onCancel={cancelForm}
          pending={pending}
          inputCls={inputCls}
          labelCls={labelCls}
          title="پیام آماده جدید"
        />
      )}

      {/* list */}
      <div className="overflow-hidden rounded-2xl border border-dz-primary-100 bg-white dark:border-dz-night-border dark:bg-dz-night-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-dz-primary-50 text-dz-primary-300 dark:bg-white/5 dark:text-dz-night-faint">
              <Zap className="size-7" aria-hidden />
            </span>
            <p className="text-sm text-dz-primary-400 dark:text-dz-night-muted">
              {replies.length === 0
                ? "هنوز پیام آماده‌ای ثبت نشده است."
                : "موردی با این جستجو یافت نشد."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dz-primary-50 dark:divide-dz-night-line">
            {filtered.map((r, displayIdx) => {
              // find real index in replies (needed for edit/delete when filtering)
              const realIdx = replies.indexOf(r);
              const isEditing = editIndex === realIdx;
              return (
                <li key={realIdx} className="px-4 py-4">
                  {isEditing ? (
                    <ReplyForm
                      draft={draft}
                      onChange={setDraft}
                      onCommit={commitEdit}
                      onCancel={cancelForm}
                      pending={pending}
                      inputCls={inputCls}
                      labelCls={labelCls}
                      title="ویرایش پیام آماده"
                    />
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-dz-primary-50 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                        <Zap className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
                            {r.title}
                          </span>
                          {r.shortcut && (
                            <span className="rounded-lg border border-dz-primary-200 bg-dz-primary-50 px-2 py-0.5 font-mono text-[0.7rem] text-dz-primary-600 dark:border-dz-night-border dark:bg-white/5 dark:text-dz-night-muted" dir="ltr">
                              {r.shortcut}
                            </span>
                          )}
                        </div>
                        <p className="text-[0.82rem] leading-6 text-dz-primary-500 dark:text-dz-night-muted line-clamp-2">
                          {r.body}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {deleteIdx === realIdx ? (
                          <>
                            <button
                              type="button"
                              onClick={() => confirmDelete(realIdx)}
                              disabled={pending}
                              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-error/40 px-2.5 py-1.5 text-xs font-medium text-dz-error transition-colors hover:bg-dz-error/10 disabled:opacity-60 dark:text-dz-error-300"
                            >
                              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                              حذف
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteIdx(null)}
                              className="focus-ring grid size-8 place-items-center rounded-lg text-dz-primary-400 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-faint dark:hover:bg-white/5"
                            >
                              <X className="size-4" aria-hidden />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(realIdx)}
                              aria-label={`ویرایش ${r.title}`}
                              className="focus-ring grid size-8 place-items-center rounded-lg text-dz-primary-500 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                            >
                              <Pencil className="size-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteIdx(realIdx)}
                              aria-label={`حذف ${r.title}`}
                              className="focus-ring grid size-8 place-items-center rounded-lg text-dz-primary-400 transition-colors hover:bg-dz-error/10 hover:text-dz-error dark:text-dz-night-faint dark:hover:text-dz-error-300"
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-dz-primary-400 dark:text-dz-night-faint">
        {replies.length} پیام آماده ·{" "}
        در کادر پاسخ چت، دکمه «پیام آماده» را بزنید یا میان‌بر را تایپ کنید.
      </p>
    </div>
  );
}

function ReplyForm({
  draft,
  onChange,
  onCommit,
  onCancel,
  pending,
  inputCls,
  labelCls,
  title,
}: {
  draft: CannedReply;
  onChange: (v: CannedReply) => void;
  onCommit: () => void;
  onCancel: () => void;
  pending: boolean;
  inputCls: string;
  labelCls: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-dz-primary-200 bg-dz-canvas p-4 dark:border-dz-night-border dark:bg-dz-night-elevated">
      <p className="mb-3 text-sm font-bold text-dz-primary-700 dark:text-dz-night-fg">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>عنوان <span className="text-dz-error">*</span></label>
          <input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
            placeholder="سلام و خوش‌آمد"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>میان‌بر (اختیاری)</label>
          <input
            value={draft.shortcut}
            onChange={(e) => onChange({ ...draft, shortcut: e.target.value })}
            placeholder="/hi"
            dir="ltr"
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className={labelCls}>متن پاسخ <span className="text-dz-error">*</span></label>
        <textarea
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          rows={3}
          placeholder="متن کامل پاسخی که به مشتری ارسال می‌شود…"
          className={`${inputCls} resize-none`}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onCommit}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-dz-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dz-primary-700 disabled:opacity-60 dark:bg-dz-primary-500 dark:hover:bg-dz-primary-600"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
          ذخیره
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-primary-200 px-4 py-2 text-sm font-medium text-dz-primary-600 transition-colors hover:bg-dz-primary-50 disabled:opacity-60 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
        >
          <X className="size-4" aria-hidden />
          لغو
        </button>
      </div>
    </div>
  );
}
