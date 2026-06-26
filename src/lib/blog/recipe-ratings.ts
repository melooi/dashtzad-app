// Server-only helper (RECIPE-CP1): the PUBLIC recipe rating aggregate is built
// from APPROVED ratings only — combining logged-in (PostRating) and moderated
// guest (RecipeGuestRating) rows. PENDING/REJECTED never affect it.
// (Server-only by virtue of importing prisma.)
import { prisma } from "@/lib/prisma";

export type RatingAggregate = { average: number; count: number };

export async function getApprovedRatingAggregate(postId: string): Promise<RatingAggregate> {
  const [u, g] = await Promise.all([
    prisma.postRating.aggregate({ where: { postId, status: "APPROVED" }, _sum: { value: true }, _count: true }),
    prisma.recipeGuestRating.aggregate({ where: { postId, status: "APPROVED" }, _sum: { value: true }, _count: true }),
  ]);
  const count = u._count + g._count;
  const sum = (u._sum.value ?? 0) + (g._sum.value ?? 0);
  return { count, average: count > 0 ? sum / count : 0 };
}
