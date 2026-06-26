import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createReview, listMyReviews, reviewInputSchema } from "@/lib/account/reviews";
import { badRequest, notFoundJson, unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ reviews: await listMyReviews(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const parsed = reviewInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  const review = await createReview(user.id, parsed.data);
  if (!review) return notFoundJson("محصول یافت نشد.");
  return NextResponse.json(review);
}
