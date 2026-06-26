import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// «کمک به بهتر شدن این دستور» — visitor suggestion, stored PENDING for admin
// review. No auto-discount code (coupon system is out of scope / locked).
const schema = z.object({
  postId: z.string().uuid(),
  name: z.string().trim().min(2, "نام را وارد کنید.").max(120),
  phone: z.string().trim().min(5, "شماره تماس را وارد کنید.").max(40),
  text: z.string().trim().min(5, "پیشنهاد را بنویسید.").max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: parsed.data.postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "نوشته یافت نشد." }, { status: 404 });

  await prisma.recipeSuggestion.create({
    data: {
      postId: parsed.data.postId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      text: parsed.data.text,
      // status defaults to PENDING — reviewed by an editor.
    },
  });

  return NextResponse.json(
    { ok: true, message: "پیشنهادت ثبت شد و پس از بررسی سردبیر بررسی می‌شود. ممنون از مشارکتت!" },
    { status: 201 },
  );
}
