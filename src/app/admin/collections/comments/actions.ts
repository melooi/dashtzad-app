"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { setCommentStatus } from "@/lib/admin/article-comments";
import type { CommentStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok: true } | { ok: false; error: string };

const COMMENT_STATUSES: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export async function setCommentStatusAction(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!COMMENT_STATUSES.includes(status as CommentStatus)) {
    return { ok: false, error: "وضعیت نامعتبر است." };
  }
  await setCommentStatus(id, status as CommentStatus);
  revalidatePath("/admin/collections/comments");
  return { ok: true };
}
