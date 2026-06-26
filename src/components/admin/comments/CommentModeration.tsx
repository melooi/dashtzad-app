"use client";

import { useTransition } from "react";
import { Check, X, Reply } from "lucide-react";
import Link from "next/link";
import { setCommentStatusAction } from "@/app/admin/collections/comments/actions";
import type { AdminCommentRow } from "@/lib/admin/article-comments";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  APPROVED: "منتشر شده",
  REJECTED: "رد شده",
};

const okBtn =
  "inline-flex items-center gap-1 rounded-lg bg-dz-a-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60";
const noBtn =
  "inline-flex items-center gap-1 rounded-lg bg-dz-a-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60";

export function CommentRow({ comment }: { comment: AdminCommentRow }) {
  const [pending, start] = useTransition();
  const act = (status: string) =>
    start(async () => void (await setCommentStatusAction(comment.id, status)));

  return (
    <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href={`/admin/content/articles/${comment.postId}`}
          className="font-bold text-dz-a-primary-800 hover:underline dark:text-dz-a-night-fg"
        >
          {comment.postTitle}
        </Link>
        {comment.parentId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-dz-a-primary-100 px-2 py-0.5 text-xs text-dz-a-primary-600 dark:bg-white/8 dark:text-dz-a-night-muted">
            <Reply className="size-3" /> پاسخ به دیدگاه
          </span>
        )}
        <span className="ms-auto text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          {comment.authorName} · وضعیت: {STATUS_LABEL[comment.status] ?? comment.status}
        </span>
      </div>
      <p className="mt-2 text-sm leading-7 text-dz-a-primary-700 dark:text-dz-a-night-muted">{comment.text}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending || comment.status === "APPROVED"}
          onClick={() => act("APPROVED")}
          className={okBtn}
        >
          <Check className="size-3.5" /> تأیید
        </button>
        <button
          type="button"
          disabled={pending || comment.status === "REJECTED"}
          onClick={() => act("REJECTED")}
          className={noBtn}
        >
          <X className="size-3.5" /> رد
        </button>
      </div>
    </div>
  );
}
