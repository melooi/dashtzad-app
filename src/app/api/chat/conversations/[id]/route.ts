import { NextResponse } from "next/server";
import { resolveCaller, jsonError } from "@/lib/ai/route-helpers";
import {
  getAiConversationWithMessages,
  conversationAccessible,
  serializeConversation,
  serializeMessage,
} from "@/lib/ai/chat-session";

export const runtime = "nodejs";

/** Get one AI conversation with its message history (caller-scoped). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const caller = await resolveCaller(req);
  const conv = await getAiConversationWithMessages(id);
  if (!conv) return jsonError("گفت‌وگو پیدا نشد.", 404);
  if (!conversationAccessible(conv, { sessionId: caller.session.id, customerId: caller.customerId })) {
    return jsonError("دسترسی به این گفت‌وگو مجاز نیست.", 403);
  }
  // Hide internal/system/tool turns from the customer view.
  const messages = conv.messages
    .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
    .map(serializeMessage);
  return NextResponse.json({ ok: true, conversation: serializeConversation(conv), messages });
}
