"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  answerQuestion,
  setQuestionStatus,
  setReviewStatus,
} from "@/lib/admin/product-feedback";
import type { QuestionStatus, ReviewStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok: true } | { ok: false; error: string };

const REVIEW_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const QUESTION_STATUSES: QuestionStatus[] = ["PENDING", "ANSWERED", "REJECTED"];

export async function setReviewStatusAction(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!REVIEW_STATUSES.includes(status as ReviewStatus)) {
    return { ok: false, error: "وضعیت نامعتبر است." };
  }
  await setReviewStatus(id, status as ReviewStatus);
  revalidatePath("/admin/collections/reviews");
  return { ok: true };
}

export async function answerQuestionAction(id: string, answer: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await answerQuestion(id, answer, admin.id);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در ثبت پاسخ." };
  }
  revalidatePath("/admin/collections/reviews");
  return { ok: true };
}

export async function setQuestionStatusAction(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!QUESTION_STATUSES.includes(status as QuestionStatus)) {
    return { ok: false, error: "وضعیت نامعتبر است." };
  }
  await setQuestionStatus(id, status as QuestionStatus);
  revalidatePath("/admin/collections/reviews");
  return { ok: true };
}
