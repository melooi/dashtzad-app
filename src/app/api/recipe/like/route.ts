import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const schema = z.object({ postId: z.string().uuid() });

// Toggle a recipe like — NO login required. Logged-in users toggle by account;
// anonymous visitors toggle by a cookie that holds their like row id.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  const { postId } = parsed.data;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "نوشته یافت نشد." }, { status: 404 });

  const user = await getCurrentUser();
  const cookieKey = `dz_lk_${postId}`;
  let liked: boolean;
  let clearCookie = false;
  let setCookieId: string | null = null;

  if (user) {
    const where = { userId_postId: { userId: user.id, postId } };
    const existing = await prisma.postLike.findUnique({ where });
    if (existing) {
      await prisma.postLike.delete({ where });
      liked = false;
    } else {
      await prisma.postLike.create({ data: { userId: user.id, postId } });
      liked = true;
    }
  } else {
    const jar = await cookies();
    const priorId = jar.get(cookieKey)?.value;
    if (priorId) {
      await prisma.postLike.delete({ where: { id: priorId } }).catch(() => null);
      liked = false;
      clearCookie = true;
    } else {
      const row = await prisma.postLike.create({ data: { postId } });
      liked = true;
      setCookieId = row.id;
    }
  }

  const count = await prisma.postLike.count({ where: { postId } });
  const res = NextResponse.json({ ok: true, liked, count });
  if (setCookieId) res.cookies.set(cookieKey, setCookieId, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  if (clearCookie) res.cookies.set(cookieKey, "", { path: "/", maxAge: 0 });
  return res;
}
