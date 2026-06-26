// Admin moderation of product reviews (دیدگاه‌ها) + questions (پرسش‌ها).
import { prisma } from "@/lib/prisma";
import type { ReviewStatus, QuestionStatus } from "@/generated/prisma/enums";

const thumb = {
  select: {
    slug: true,
    title: true,
    images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
  },
} as const;

export type AdminReviewRow = {
  id: string;
  productSlug: string;
  productTitle: string;
  authorName: string;
  rating: number;
  title: string | null;
  text: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAtISO: string;
};

export async function listAdminReviews(opts?: { status?: ReviewStatus; newestFirst?: boolean }): Promise<AdminReviewRow[]> {
  const rows = await prisma.productReview.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: opts?.newestFirst
      ? [{ createdAt: "desc" }]
      : [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { product: thumb, user: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    productSlug: r.product.slug,
    productTitle: r.product.title,
    authorName: r.user.name ?? "کاربر",
    rating: r.rating,
    title: r.title,
    text: r.text,
    verifiedPurchase: r.verifiedPurchase,
    status: r.status,
    createdAtISO: r.createdAt.toISOString(),
  }));
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  await prisma.productReview.update({ where: { id }, data: { status } });
}

export async function updateReview(
  id: string,
  data: { title?: string | null; text?: string; rating?: number },
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title?.trim() || null;
  if (data.text !== undefined) {
    const t = data.text.trim();
    if (!t) throw new Error("متن دیدگاه نمی‌تواند خالی باشد.");
    update.text = t;
  }
  if (data.rating !== undefined) {
    if (data.rating < 1 || data.rating > 5) throw new Error("امتیاز باید بین ۱ تا ۵ باشد.");
    update.rating = data.rating;
  }
  await prisma.productReview.update({ where: { id }, data: update });
}

export type AdminQuestionRow = {
  id: string;
  productSlug: string;
  productTitle: string;
  authorName: string;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  createdAtISO: string;
};

export async function listAdminQuestions(opts?: { status?: QuestionStatus; newestFirst?: boolean }): Promise<AdminQuestionRow[]> {
  const rows = await prisma.productQuestion.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: opts?.newestFirst
      ? [{ createdAt: "desc" }]
      : [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { product: thumb, user: { select: { name: true } } },
  });
  return rows.map((q) => ({
    id: q.id,
    productSlug: q.product.slug,
    productTitle: q.product.title,
    authorName: q.user.name ?? "کاربر",
    question: q.question,
    answer: q.answer,
    status: q.status,
    createdAtISO: q.createdAt.toISOString(),
  }));
}

export async function updateQuestion(id: string, question: string): Promise<void> {
  const text = question.trim();
  if (!text) throw new Error("متن پرسش نمی‌تواند خالی باشد.");
  await prisma.productQuestion.update({ where: { id }, data: { question: text } });
}

export async function answerQuestion(id: string, answer: string, adminId: string): Promise<void> {
  const text = answer.trim();
  if (!text) throw new Error("متن پاسخ خالی است.");
  await prisma.productQuestion.update({
    where: { id },
    data: { answer: text, answeredById: adminId, answeredAt: new Date(), status: "ANSWERED" },
  });
}

export async function setQuestionStatus(id: string, status: QuestionStatus): Promise<void> {
  await prisma.productQuestion.update({ where: { id }, data: { status } });
}

export async function feedbackCounts(): Promise<{ pendingReviews: number; pendingQuestions: number }> {
  const [pendingReviews, pendingQuestions] = await Promise.all([
    prisma.productReview.count({ where: { status: "PENDING" } }),
    prisma.productQuestion.count({ where: { status: "PENDING" } }),
  ]);
  return { pendingReviews, pendingQuestions };
}
