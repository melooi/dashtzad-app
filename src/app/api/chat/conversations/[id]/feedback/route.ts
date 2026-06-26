import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveCaller, jsonError } from "@/lib/ai/route-helpers";
import { getAiConversation, conversationAccessible } from "@/lib/ai/chat-session";

export const runtime = "nodejs";

const bodySchema = z.object({
  rating: z.enum(["up", "down"]),
  messageId: z.string().uuid().nullable().optional(),
  comment: z.string().max(1000).nullable().optional(),
});

/** Record thumbs up/down feedback on a conversation or a specific message. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return jsonError("ورودی نامعتبر است.", 400);

  const caller = await resolveCaller(req);
  const conv = await getAiConversation(id);
  if (!conv) return jsonError("گفت‌وگو پیدا نشد.", 404);
  if (!conversationAccessible(conv, { sessionId: caller.session.id, customerId: caller.customerId })) {
    return jsonError("دسترسی به این گفت‌وگو مجاز نیست.", 403);
  }

  await prisma.aiFeedback.create({
    data: {
      conversationId: id,
      messageId: parsed.data.messageId ?? null,
      rating: parsed.data.rating === "up" ? "UP" : "DOWN",
      comment: parsed.data.comment ?? null,
      visitorId: conv.visitorId,
      customerId: caller.customerId,
    },
  });

  return NextResponse.json({ ok: true });
}
