import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyThread, replyAsOwner } from "@/lib/account/messages";
import { badRequest, notFoundJson, unauthorized } from "@/lib/account/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const thread = await getMyThread(user.id, id);
  if (!thread) return notFoundJson("گفتگو یافت نشد.");
  return NextResponse.json(thread);
}

const replySchema = z.object({ body: z.string().trim().min(1, "پیام را بنویسید.").max(4000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "پیام نامعتبر است.");
  const thread = await replyAsOwner(user.id, id, parsed.data.body);
  if (!thread) return notFoundJson("گفتگو یافت نشد.");
  return NextResponse.json(thread);
}
