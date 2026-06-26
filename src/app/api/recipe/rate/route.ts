import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getApprovedRatingAggregate } from "@/lib/blog/recipe-ratings";
import { LOW_RATING_THRESHOLD, RATING_FEEDBACK_REASON_KEYS } from "@/lib/blog/recipe";

// Rate a recipe. NO login required, but ratings are MODERATED — every new/changed
// rating is saved PENDING and does NOT affect the public aggregate until an admin
// approves it. Logged-in → PostRating (userId required). Guest → RecipeGuestRating
// (deduped per browser via a hashed guest key). Low ratings (<4) carry feedback.
const schema = z.object({
  postId: z.string().uuid(),
  value: z.number().int().min(1).max(5),
  guestKey: z.string().trim().min(8).max(200).optional(),
  guestName: z.string().trim().max(120).optional(),
  guestPhone: z.string().trim().max(40).optional(),
  feedbackText: z.string().trim().max(2000).optional(),
  feedbackReasons: z.array(z.string()).max(8).optional(),
});

const hashGuestKey = (k: string) => crypto.createHash("sha256").update(k).digest("hex");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  const { postId, value, guestKey, guestName, guestPhone, feedbackText, feedbackReasons } = parsed.data;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "نوشته یافت نشد." }, { status: 404 });

  const reasons = (feedbackReasons ?? []).filter((r) => (RATING_FEEDBACK_REASON_KEYS as string[]).includes(r));
  const user = await getCurrentUser();

  if (user) {
    // Logged-in rating — kept PENDING for now (no auto-trust); changing it resets review.
    const base = { value, status: "PENDING" as const, reviewedAt: null, reviewedByAdminId: null };
    const extra: Record<string, unknown> = {};
    if (feedbackText !== undefined) extra.feedbackText = feedbackText || null;
    if (feedbackReasons !== undefined) extra.feedbackReasons = reasons;
    await prisma.postRating.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      create: { userId: user.id, postId, value, feedbackText: feedbackText || null, feedbackReasons: reasons },
      update: { ...base, ...extra },
    });
  } else {
    if (!guestKey) return NextResponse.json({ error: "شناسه‌ی مهمان نامعتبر است." }, { status: 400 });
    const guestKeyHash = hashGuestKey(guestKey);
    // Only overwrite optional identity/feedback fields when the client sends them
    // (so a later value-only change doesn't wipe an earlier phone/feedback).
    const update: Record<string, unknown> = { value, status: "PENDING", reviewedAt: null, reviewedByAdminId: null };
    if (guestName !== undefined) update.guestName = guestName || null;
    if (guestPhone !== undefined) update.guestPhone = guestPhone || null;
    if (feedbackText !== undefined) update.feedbackText = feedbackText || null;
    if (feedbackReasons !== undefined) update.feedbackReasons = reasons;
    await prisma.recipeGuestRating.upsert({
      where: { postId_guestKeyHash: { postId, guestKeyHash } },
      create: {
        postId,
        guestKeyHash,
        value,
        guestName: guestName || null,
        guestPhone: guestPhone || null,
        feedbackText: feedbackText || null,
        feedbackReasons: reasons,
      },
      update,
    });
  }

  // Public aggregate reflects ONLY approved ratings → a new pending rating leaves it unchanged.
  const agg = await getApprovedRatingAggregate(postId);
  return NextResponse.json({
    ok: true,
    status: "PENDING",
    needsFeedback: value < LOW_RATING_THRESHOLD,
    average: agg.average,
    count: agg.count,
    userValue: value,
  });
}
