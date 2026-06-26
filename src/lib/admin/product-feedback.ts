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

export async function listAdminReviews(status?: ReviewStatus): Promise<AdminReviewRow[]> {
  const rows = await prisma.productReview.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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

export async function listAdminQuestions(status?: QuestionStatus): Promise<AdminQuestionRow[]> {
  const rows = await prisma.productQuestion.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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
