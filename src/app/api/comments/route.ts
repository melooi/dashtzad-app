import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const schema = z.object({
  postId: z.string().uuid(),
  text: z.string().min(2).max(2000),
  parentId: z.string().uuid().optional(),
  // RECIPE-CP1: optional star rating posted with a recipe comment.
  rating: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "برای ثبت نظر باید وارد شوید." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: parsed.data.postId } });
  if (!post) {
    return NextResponse.json({ error: "نوشته یافت نشد." }, { status: 404 });
  }

  await prisma.postComment.create({
    data: {
      postId: parsed.data.postId,
      userId: user.id,
      parentId: parsed.data.parentId ?? null,
      text: parsed.data.text,
      // status defaults to PENDING — shown after moderation.
    },
  });

  // A star rating posted with the comment upserts the user's recipe rating.
  // Moderated: saved PENDING and only affects the public aggregate once approved.
  if (parsed.data.rating) {
    await prisma.postRating.upsert({
      where: { userId_postId: { userId: user.id, postId: parsed.data.postId } },
      create: { userId: user.id, postId: parsed.data.postId, value: parsed.data.rating },
      update: { value: parsed.data.rating, status: "PENDING", reviewedAt: null, reviewedByAdminId: null },
    });
  }

  return NextResponse.json(
    { ok: true, message: "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود." },
    { status: 201 },
  );
}
