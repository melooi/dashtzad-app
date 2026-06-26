import { z } from "zod";
import { resolveCaller, aiSessionCookieHeader, jsonError } from "@/lib/ai/route-helpers";
import {
  createAiConversation,
  getAiConversation,
  conversationAccessible,
  checkChatRateLimit,
} from "@/lib/ai/chat-session";
import { getAiChatbotConfig } from "@/lib/ai/chat-center";
import { runChatTurn } from "@/lib/ai/chat-engine";
import { sseResponse } from "@/lib/ai/sse";

// OpenAI + SSE require the Node runtime (never Edge).
export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().nullable().optional(),
});

/**
 * Send a customer message and stream the assistant response over SSE. Works in
 * degraded mode (no key / chatbot disabled): streams a clear AI_UNAVAILABLE
 * message + handoff offer instead of failing. Never 500s the widget.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return jsonError("پیام نامعتبر است.", 400);

  const caller = await resolveCaller(req);
  const config = await getAiChatbotConfig();

  // Per-session rate limit (first abuse guard).
  const rate = checkChatRateLimit(caller.session.token, config.rateLimitPerMinute);
  if (!rate.allowed) {
    return jsonError("تعداد پیام‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.", 429);
  }

  // Resolve or create the conversation, enforcing per-session access.
  let conversationId: string;
  if (parsed.data.conversationId) {
    const conv = await getAiConversation(parsed.data.conversationId);
    if (!conv) return jsonError("گفت‌وگو پیدا نشد.", 404);
    if (!conversationAccessible(conv, { sessionId: caller.session.id, customerId: caller.customerId })) {
      return jsonError("دسترسی به این گفت‌وگو مجاز نیست.", 403);
    }
    conversationId = conv.id;
  } else {
    const conv = await createAiConversation({
      sessionId: caller.session.id,
      channel: "STOREFRONT",
      customerId: caller.customerId,
      visitorId: caller.session.visitorId,
    });
    conversationId = conv.id;
  }

  const events = runChatTurn({
    conversationId,
    userText: parsed.data.message,
    actor: caller.actor,
    available: config.available,
    unavailableMessage: config.unavailableMessage,
    enabledToolCategories: config.toolCategories,
    instructions: config.instructions,
    safetySeed: caller.customerId ?? caller.session.token,
  });

  const res = sseResponse(events);
  res.headers.append("Set-Cookie", aiSessionCookieHeader(caller.session.token));
  return res;
}
