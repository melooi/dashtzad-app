"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check, X, Star, MessageCircle, ChevronLeft,
  ExternalLink, User, Calendar, ShoppingBag,
  Send, Loader2, Pencil, RotateCcw,
} from "lucide-react";
import {
  answerQuestionAction,
  setQuestionStatusAction,
  setReviewStatusAction,
  updateQuestionAction,
  updateReviewAction,
} from "@/app/admin/collections/reviews/actions";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { toPersianNumbers } from "@/lib/price";
import type { AdminQuestionRow, AdminReviewRow } from "@/lib/admin/product-feedback";

// ---- status maps ----

const REVIEW_TONE: Record<string, "amber" | "green" | "red"> = {
  PENDING: "amber", APPROVED: "green", REJECTED: "red",
};
const REVIEW_LABEL: Record<string, string> = {
  PENDING: "در انتظار", APPROVED: "منتشر شده", REJECTED: "رد شده",
};
const Q_TONE: Record<string, "amber" | "green" | "red"> = {
  PENDING: "amber", ANSWERED: "green", REJECTED: "red",
};
const Q_LABEL: Record<string, string> = {
  PENDING: "در انتظار", ANSWERED: "پاسخ داده شده", REJECTED: "رد شده",
};

// ---- tab bar ----

type Tab = "all" | "pending" | "approved" | "rejected" | "questions";
type FeedbackCounts = { pendingReviews: number; pendingQuestions: number };

const TABS: { id: Tab; label: string; badge?: (c: FeedbackCounts) => number }[] = [
  { id: "all",       label: "تازه" },
  { id: "pending",   label: "در انتظار",   badge: (c) => c.pendingReviews },
  { id: "approved",  label: "تأیید شده" },
  { id: "rejected",  label: "رد شده" },
  { id: "questions", label: "پرسش‌ها",     badge: (c) => c.pendingQuestions },
];

function TabBar({ tab, counts }: { tab: Tab; counts: FeedbackCounts }) {
  return (
    <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const active = tab === t.id;
        const badge = t.badge?.(counts) ?? 0;
        return (
          <Link
            key={t.id}
            href={`/admin/collections/reviews?tab=${t.id}`}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-dz-a-primary-600 text-white shadow-sm"
                : "border border-dz-a-primary-200 text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            }`}
          >
            {t.label}
            {badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"
              }`}>
                {toPersianNumbers(badge)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ---- helpers ----

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

// ---- star picker ----

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5 focus:outline-none"
        >
          <Star
            className={`size-5 transition-colors ${
              s <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-300 dark:text-slate-600"
            }`}
          />
        </button>
      ))}
      <span className="ms-1.5 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-muted">
        {toPersianNumbers(hover || value)}/۵
      </span>
    </div>
  );
}

// ---- review card ----

function ReviewCard({ review: initial }: { review: AdminReviewRow }) {
  const [review, setReview] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initial.title ?? "");
  const [editText, setEditText] = useState(initial.text);
  const [editRating, setEditRating] = useState(initial.rating);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const openEdit = () => {
    setEditTitle(review.title ?? "");
    setEditText(review.text);
    setEditRating(review.rating);
    setError("");
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setError(""); };

  const saveEdit = () => {
    start(async () => {
      const res = await updateReviewAction(review.id, {
        title: editTitle || null,
        text: editText,
        rating: editRating,
      });
      if (res.ok) {
        setReview((r) => ({ ...r, title: editTitle || null, text: editText, rating: editRating }));
        setEditing(false);
      } else {
        setError(res.error);
      }
    });
  };

  const changeStatus = (status: "APPROVED" | "REJECTED") => {
    start(async () => {
      const res = await setReviewStatusAction(review.id, status);
      if (res.ok) setReview((r) => ({ ...r, status }));
    });
  };

  return (
    <div className="rounded-2xl border border-dz-a-primary-100 bg-dz-a-canvas p-4 transition-shadow hover:shadow-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      {/* header */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-dz-a-primary-200 px-2 py-0.5 text-[11px] font-medium text-dz-a-primary-600 dark:border-dz-a-night-border dark:text-dz-a-primary-300">
          <Star className="size-3" /> دیدگاه
        </span>
        {!editing && (
          <span className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`size-3.5 ${i < review.rating ? "fill-amber-400" : "fill-none stroke-amber-300"}`} />
            ))}
            <span className="ms-1 text-xs font-medium text-dz-a-primary-600 dark:text-dz-a-night-muted">
              {toPersianNumbers(review.rating)}/۵
            </span>
          </span>
        )}
        {review.verifiedPurchase && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <ShoppingBag className="size-3" /> خرید تأییدشده
          </span>
        )}
        <div className="ms-auto flex items-center gap-2">
          <AdminStatusBadge tone={REVIEW_TONE[review.status]} dot>
            {REVIEW_LABEL[review.status]}
          </AdminStatusBadge>
          {!editing && (
            <button
              type="button"
              onClick={openEdit}
              className="rounded-lg p-1.5 text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
              title="ویرایش"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* meta */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-dz-a-primary-500 dark:text-dz-a-night-faint">
        <span className="flex items-center gap-1"><User className="size-3" /> {review.authorName}</span>
        <span className="flex items-center gap-1"><Calendar className="size-3" /> {shortDate(review.createdAtISO)}</span>
        <Link
          href={`/products/${review.productSlug}`}
          target="_blank"
          className="ms-auto flex items-center gap-1 font-medium text-dz-a-primary-600 hover:underline dark:text-dz-a-primary-300"
        >
          {review.productTitle} <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* content — view or edit */}
      {editing ? (
        <div className="space-y-3 rounded-xl border border-dz-a-primary-200 bg-dz-a-cream p-3 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-primary-600 dark:text-dz-a-night-muted">امتیاز</label>
            <StarPicker value={editRating} onChange={setEditRating} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-primary-600 dark:text-dz-a-night-muted">عنوان دیدگاه</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="بدون عنوان"
              className="w-full rounded-lg border border-dz-a-primary-200 bg-dz-a-canvas px-3 py-2 text-sm text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-primary-600 dark:text-dz-a-night-muted">متن دیدگاه</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-dz-a-primary-200 bg-dz-a-canvas px-3 py-2 text-sm leading-6 text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
            />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending || !editText.trim()}
              onClick={saveEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-dz-a-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              ذخیره
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-600 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:bg-white/5"
            >
              <RotateCcw className="size-3.5" /> لغو
            </button>
          </div>
        </div>
      ) : (
        <>
          {review.title && (
            <p className="mb-1 text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
              {review.title}
            </p>
          )}
          <p className="line-clamp-3 text-sm leading-6 text-dz-a-primary-700 dark:text-dz-a-night-muted">
            {review.text}
          </p>
        </>
      )}

      {/* status actions */}
      {!editing && (
        <div className="mt-3 flex items-center gap-2 border-t border-dz-a-primary-100 pt-3 dark:border-dz-a-night-line">
          {review.status !== "APPROVED" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus("APPROVED")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Check className="size-3.5" /> تأیید
            </button>
          )}
          {review.status !== "REJECTED" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus("REJECTED")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <X className="size-3.5" /> رد
            </button>
          )}
          {pending && <Loader2 className="ms-1 size-4 animate-spin text-dz-a-primary-400" />}
        </div>
      )}
    </div>
  );
}

// ---- question card ----

function QuestionCard({
  question,
  onSelect,
}: {
  question: AdminQuestionRow;
  onSelect: (q: AdminQuestionRow) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(question)}
      className="group w-full rounded-2xl border border-dz-a-primary-100 bg-dz-a-canvas p-4 text-start transition-all hover:border-dz-a-primary-300 hover:shadow-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:hover:border-dz-a-primary-500/50"
    >
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-dz-a-primary-200 px-2 py-0.5 text-[11px] font-medium text-dz-a-primary-600 dark:border-dz-a-night-border dark:text-dz-a-primary-300">
          <MessageCircle className="size-3" /> پرسش
        </span>
        <div className="ms-auto flex items-center gap-2">
          <AdminStatusBadge tone={Q_TONE[question.status]} dot>
            {Q_LABEL[question.status]}
          </AdminStatusBadge>
          <ChevronLeft className="size-4 text-dz-a-primary-300 transition-transform group-hover:-translate-x-0.5 dark:text-dz-a-night-faint" />
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-dz-a-primary-500 dark:text-dz-a-night-faint">
        <span className="flex items-center gap-1"><User className="size-3" /> {question.authorName}</span>
        <span className="flex items-center gap-1"><Calendar className="size-3" /> {shortDate(question.createdAtISO)}</span>
        <span className="ms-auto font-medium text-dz-a-primary-600 dark:text-dz-a-primary-300">{question.productTitle}</span>
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-dz-a-primary-800 dark:text-dz-a-night-fg">
        {question.question}
      </p>
      {question.answer && (
        <p className="mt-1 line-clamp-1 text-xs text-dz-a-primary-500 dark:text-dz-a-night-faint">
          پاسخ: {question.answer}
        </p>
      )}
    </button>
  );
}

// ---- question modal ----

function QuestionModal({
  question: initialQ,
  onClose,
}: {
  question: AdminQuestionRow;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState(initialQ);
  const [draft, setDraft] = useState(initialQ.answer ?? "");
  const [editingQ, setEditingQ] = useState(false);
  const [editQText, setEditQText] = useState(initialQ.question);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const submitAnswer = () => {
    if (!draft.trim()) return;
    start(async () => {
      const res = await answerQuestionAction(question.id, draft.trim());
      if (res.ok) {
        setQuestion((q) => ({ ...q, answer: draft.trim(), status: "ANSWERED" }));
        setError("");
      } else {
        setError(res.error);
      }
    });
  };

  const saveQuestionText = () => {
    if (!editQText.trim()) return;
    start(async () => {
      const res = await updateQuestionAction(question.id, editQText.trim());
      if (res.ok) {
        setQuestion((q) => ({ ...q, question: editQText.trim() }));
        setEditingQ(false);
        setError("");
      } else {
        setError(res.error);
      }
    });
  };

  const changeStatus = (status: "ANSWERED" | "PENDING" | "REJECTED") => {
    start(async () => {
      const res = await setQuestionStatusAction(question.id, status);
      if (res.ok) {
        setQuestion((q) => ({ ...q, status }));
        if (status === "REJECTED") setTimeout(onClose, 500);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-dz-a-canvas shadow-2xl dark:border-dz-a-night-border dark:bg-dz-a-night-card" style={{ maxHeight: "90dvh" }}>

        {/* header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-dz-a-primary-100 px-5 py-4 dark:border-dz-a-night-border">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                {question.productTitle}
              </span>
              <AdminStatusBadge tone={Q_TONE[question.status]} dot>
                {Q_LABEL[question.status]}
              </AdminStatusBadge>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-dz-a-primary-500 dark:text-dz-a-night-faint">
              <span className="flex items-center gap-1"><User className="size-3" /> {question.authorName}</span>
              <span className="flex items-center gap-1"><Calendar className="size-3" /> {shortDate(question.createdAtISO)}</span>
              <Link
                href={`/products/${question.productSlug}`}
                target="_blank"
                className="flex items-center gap-1 hover:text-dz-a-primary-600 dark:hover:text-dz-a-primary-300"
              >
                مشاهده محصول <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-dz-a-primary-500 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* thread */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* question bubble */}
          <div className="flex justify-end">
            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-dz-a-cream p-4 dark:bg-dz-a-night-elevated">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-dz-a-primary-100 text-[11px] font-bold text-dz-a-primary-600 dark:bg-dz-a-primary-400/20 dark:text-dz-a-primary-300">
                  {question.authorName.charAt(0)}
                </span>
                <span className="text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-muted">
                  {question.authorName}
                </span>
                <button
                  type="button"
                  onClick={() => { setEditQText(question.question); setEditingQ(true); setError(""); }}
                  className="ms-auto rounded p-1 text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-100 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:bg-white/10 dark:hover:text-dz-a-night-fg"
                  title="ویرایش پرسش"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
              {editingQ ? (
                <div className="space-y-2">
                  <textarea
                    value={editQText}
                    onChange={(e) => setEditQText(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full resize-none rounded-lg border border-dz-a-primary-300 bg-dz-a-canvas px-3 py-2 text-sm leading-6 text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pending || !editQText.trim()}
                      onClick={saveQuestionText}
                      className="inline-flex items-center gap-1 rounded-lg bg-dz-a-primary-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingQ(false); setError(""); }}
                      className="rounded-lg border border-dz-a-primary-200 px-2.5 py-1 text-xs text-dz-a-primary-600 dark:border-dz-a-night-border dark:text-dz-a-night-muted"
                    >
                      لغو
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-7 text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  {question.question}
                </p>
              )}
            </div>
          </div>

          {/* answer bubble */}
          {question.answer && (
            <div className="flex justify-start">
              <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-dz-a-primary-600 p-4 text-white">
                <div className="mb-2 text-xs font-semibold text-white/80">پاسخ کارشناس</div>
                <p className="text-sm leading-7">{question.answer}</p>
              </div>
            </div>
          )}

          {!question.answer && (
            <p className="py-4 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
              هنوز پاسخی ثبت نشده
            </p>
          )}
        </div>

        {/* composer + actions */}
        <div className="shrink-0 space-y-3 border-t border-dz-a-primary-100 p-4 dark:border-dz-a-night-border">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={question.answer ? "ویرایش پاسخ…" : "پاسخ کارشناس را بنویسید…"}
              className="flex-1 resize-none rounded-xl border border-dz-a-primary-200 bg-dz-a-cream px-3 py-2.5 text-sm text-dz-a-primary-900 outline-none transition focus:border-dz-a-primary-500 focus:bg-dz-a-canvas dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg dark:focus:bg-dz-a-night-card"
            />
            <button
              type="button"
              disabled={pending || !draft.trim()}
              onClick={submitAnswer}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-dz-a-primary-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {question.answer ? "بروزرسانی" : "ثبت پاسخ"}
            </button>
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            {question.status !== "ANSWERED" && question.answer && (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("ANSWERED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check className="size-3.5" /> تأیید و انتشار
              </button>
            )}
            {question.status !== "PENDING" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("PENDING")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
              >
                بازگشت به در انتظار
              </button>
            )}
            {question.status !== "REJECTED" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("REJECTED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <X className="size-3.5" /> رد پرسش
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ms-auto text-xs text-dz-a-primary-500 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-muted"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- empty state ----

function EmptyState({ tab }: { tab: string }) {
  const msgs: Record<string, { title: string; desc: string }> = {
    all:       { title: "هنوز دیدگاهی ثبت نشده", desc: "دیدگاه‌های مشتریان اینجا نمایش داده می‌شوند." },
    pending:   { title: "صف در انتظار خالی است", desc: "همهٔ دیدگاه‌ها بررسی شده‌اند." },
    approved:  { title: "دیدگاه تأییدشده‌ای وجود ندارد", desc: "دیدگاه‌های تأییدشده اینجا نمایش داده می‌شوند." },
    rejected:  { title: "دیدگاه ردشده‌ای وجود ندارد", desc: "دیدگاه‌های ردشده اینجا نمایش داده می‌شوند." },
    questions: { title: "پرسشی ثبت نشده", desc: "پرسش‌های مشتریان اینجا نمایش داده می‌شوند." },
  };
  const m = msgs[tab] ?? msgs.all;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-a-primary-200 p-16 text-center dark:border-dz-a-night-border">
      <Star className="size-8 text-dz-a-primary-300 dark:text-dz-a-night-faint" strokeWidth={1.5} />
      <p className="font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">{m.title}</p>
      <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">{m.desc}</p>
    </div>
  );
}

// ---- workspace ----

export function FeedbackWorkspace({
  tab,
  reviews,
  questions,
  counts,
}: {
  tab: "all" | "pending" | "approved" | "rejected" | "questions";
  reviews: AdminReviewRow[];
  questions: AdminQuestionRow[];
  counts: { pendingReviews: number; pendingQuestions: number };
}) {
  const [selectedQ, setSelectedQ] = useState<AdminQuestionRow | null>(null);

  return (
    <div>
      <TabBar tab={tab} counts={counts} />

      {tab === "questions" ? (
        questions.length === 0
          ? <EmptyState tab="questions" />
          : (
            <div className="flex flex-col gap-3">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} onSelect={setSelectedQ} />
              ))}
            </div>
          )
      ) : (
        reviews.length === 0
          ? <EmptyState tab={tab} />
          : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )
      )}

      {selectedQ && (
        <QuestionModal question={selectedQ} onClose={() => setSelectedQ(null)} />
      )}
    </div>
  );
}
