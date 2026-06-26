import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCaller, jsonError } from "@/lib/ai/route-helpers";
import { getAiConversation, conversationAccessible } from "@/lib/ai/chat-session";
import { getAiChatbotConfig } from "@/lib/ai/chat-center";
import { createHandoff } from "@/lib/ai/handoff";

export const runtime = "nodejs";

const bodySchema = z.object({
  reason: z.string().max(500).nullable().optional(),
  guestName: z.string().max(120).nullable().optional(),
  guestPhone: z.string().max(30).nullable().optional(),
});

/**
 * Hand the conversation to a human operator — creates a row in the EXISTING
 * operator inbox (Conversation) and links it via AiHandoff. Works regardless of
 * AI availability (this is the human safety net).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json ?? {});
  if (!parsed.success) return jsonError("ورودی نامعتبر است.", 400);

  const caller = await resolveCaller(req);
  const conv = await getAiConversation(id);
  if (!conv) return jsonError("گفت‌وگو پیدا نشد.", 404);
  if (!conversationAccessible(conv, { sessionId: caller.session.id, customerId: caller.customerId })) {
    return jsonError("دسترسی به این گفت‌وگو مجاز نیست.", 403);
  }

  const config = await getAiChatbotConfig();
  if (!config.handoffEnabled) return jsonError("انتقال به پشتیبان انسانی غیرفعال است.", 403);

  const result = await createHandoff({
    aiConversationId: id,
    reason: parsed.data.reason ?? null,
    guestName: parsed.data.guestName ?? null,
    guestPhone: parsed.data.guestPhone ?? null,
  });

  return NextResponse.json({
    ok: true,
    handoffId: result.handoffId,
    ticketToken: result.conversationToken,
    message: "گفت‌وگو به پشتیبانیِ انسانی منتقل شد.",
  });
}
