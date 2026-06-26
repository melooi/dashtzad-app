"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import {
  answerQuestionAction,
  setQuestionStatusAction,
  setReviewStatusAction,
} from "@/app/admin/collections/reviews/actions";
import type { AdminQuestionRow, AdminReviewRow } from "@/lib/admin/product-feedback";

const REVIEW_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  APPROVED: "منتشر شده",
  REJECTED: "رد شده",
};
const QUESTION_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  ANSWERED: "پاسخ داده شده",
  REJECTED: "رد شده",
};

const okBtn = "inline-flex items-center gap-1 rounded-lg bg-dz-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60";
const noBtn = "inline-flex items-center gap-1 rounded-lg bg-dz-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60";

export function ReviewRow({ review }: { review: AdminReviewRow }) {
  const [pending, start] = useTransition();
  const act = (status: string) => start(async () => void (await setReviewStatusAction(review.id, status)));
  return (
    <div className="rounded-2xl border border-dz-primary-100 bg-white p-4 dark:border-dz-night-border dark:bg-dz-night-card">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-dz-primary-800 dark:text-dz-night-fg">{review.productTitle}</span>
        <span className="text-dz-warning">{"★".repeat(review.rating)}</span>
        {review.verifiedPurchase && <span className="text-xs text-dz-success">خرید تأییدشده</span>}
        <span className="ms-auto text-xs text-dz-primary-400">
          {review.authorName} · وضعیت: {REVIEW_LABEL[review.status]}
        </span>
      </div>
      {review.title && <p className="mt-1 text-sm font-medium text-dz-primary-700 dark:text-dz-night-muted">{review.title}</p>}
      <p className="mt-1 text-sm leading-7 text-dz-primary-600 dark:text-dz-night-muted">{review.text}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={pending || review.status === "APPROVED"} onClick={() => act("APPROVED")} className={okBtn}>
          <Check className="size-3.5" /> تأیید
        </button>
        <button type="button" disabled={pending || review.status === "REJECTED"} onClick={() => act("REJECTED")} className={noBtn}>
          <X className="size-3.5" /> رد
        </button>
      </div>
    </div>
  );
}

export function QuestionRow({ question }: { question: AdminQuestionRow }) {
  const [pending, start] = useTransition();
  const [answer, setAnswer] = useState(question.answer ?? "");
  const submit = () => start(async () => void (await answerQuestionAction(question.id, answer)));
  const reject = () => start(async () => void (await setQuestionStatusAction(question.id, "REJECTED")));
  return (
    <div className="rounded-2xl border border-dz-primary-100 bg-white p-4 dark:border-dz-night-border dark:bg-dz-night-card">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-dz-primary-800 dark:text-dz-night-fg">{question.productTitle}</span>
        <span className="ms-auto text-xs text-dz-primary-400">
          {question.authorName} · وضعیت: {QUESTION_LABEL[question.status]}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium text-dz-primary-700 dark:text-dz-night-muted">پرسش: {question.question}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="پاسخ کارشناس…"
        className="mt-2 w-full resize-y rounded-xl border border-dz-primary-200 bg-white px-3 py-2 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
      />
      <div className="mt-2 flex gap-2">
        <button type="button" disabled={pending || !answer.trim()} onClick={submit} className={okBtn}>
          <Check className="size-3.5" /> ثبت پاسخ و انتشار
        </button>
        <button type="button" disabled={pending || question.status === "REJECTED"} onClick={reject} className={noBtn}>
          <X className="size-3.5" /> رد
        </button>
      </div>
    </div>
  );
}
