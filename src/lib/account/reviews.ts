// Customer product reviews (دیدگاه‌ها) + questions (پرسش‌ها). Ownership-enforced;
// new submissions are PENDING moderation. verifiedPurchase is derived from real
// order history (no fake "buyer" badge).
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { MyQuestionDTO, MyReviewDTO } from "./types";

const PURCHASED_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

const productThumb = {
  select: {
    slug: true,
    title: true,
    images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
  },
} as const;

export const reviewInputSchema = z.object({
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1, "امتیاز را انتخاب کنید.").max(5),
  title: z.string().trim().max(120).optional(),
  text: z.string().trim().min(5, "متن دیدگاه را کامل بنویسید.").max(2000),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const questionInputSchema = z.object({
  slug: z.string().min(1),
  question: z.string().trim().min(5, "متن پرسش را کامل بنویسید.").max(1000),
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

export async function listMyReviews(userId: string): Promise<MyReviewDTO[]> {
  const rows = await prisma.productReview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: productThumb },
  });
  return rows.map((r) => ({
    id: r.id,
    productSlug: r.product.slug,
    productTitle: r.product.title,
    productImage: r.product.images[0]?.url ?? null,
    rating: r.rating,
    title: r.title,
    text: r.text,
    status: r.status,
    createdAtISO: r.createdAt.toISOString(),
  }));
}

/** Create or update the user's single review for a product (PENDING again). */
export async function createReview(userId: string, input: ReviewInput): Promise<MyReviewDTO | null> {
  const product = await prisma.product.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (!product) return null;

  const verifiedPurchase =
    (await prisma.order.count({
      where: { userId, status: { in: PURCHASED_STATUSES }, items: { some: { productId: product.id } } },
    })) > 0;

  const r = await prisma.productReview.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: {
      userId,
      productId: product.id,
      rating: input.rating,
      title: input.title || null,
      text: input.text,
      verifiedPurchase,
      status: "PENDING",
    },
    update: {
      rating: input.rating,
      title: input.title || null,
      text: input.text,
      verifiedPurchase,
      status: "PENDING",
    },
    include: { product: productThumb },
  });
  return {
    id: r.id,
    productSlug: r.product.slug,
    productTitle: r.product.title,
    productImage: r.product.images[0]?.url ?? null,
    rating: r.rating,
    title: r.title,
    text: r.text,
    status: r.status,
    createdAtISO: r.createdAt.toISOString(),
  };
}

export async function listMyQuestions(userId: string): Promise<MyQuestionDTO[]> {
  const rows = await prisma.productQuestion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: productThumb },
  });
  return rows.map((q) => ({
    id: q.id,
    productSlug: q.product.slug,
    productTitle: q.product.title,
    productImage: q.product.images[0]?.url ?? null,
    question: q.question,
    answer: q.answer,
    status: q.status,
    createdAtISO: q.createdAt.toISOString(),
  }));
}

export async function createQuestion(
  userId: string,
  input: QuestionInput,
): Promise<MyQuestionDTO | null> {
  const product = await prisma.product.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (!product) return null;
  const q = await prisma.productQuestion.create({
    data: { userId, productId: product.id, question: input.question, status: "PENDING" },
    include: { product: productThumb },
  });
  return {
    id: q.id,
    productSlug: q.product.slug,
    productTitle: q.product.title,
    productImage: q.product.images[0]?.url ?? null,
    question: q.question,
    answer: q.answer,
    status: q.status,
    createdAtISO: q.createdAt.toISOString(),
  };
}

/** Count of the user's pending reviews + questions (dashboard badge). */
export async function countPendingReviewsAndQuestions(userId: string): Promise<number> {
  const [r, q] = await Promise.all([
    prisma.productReview.count({ where: { userId, status: "PENDING" } }),
    prisma.productQuestion.count({ where: { userId, status: "PENDING" } }),
  ]);
  return r + q;
}
