import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCaller, jsonError } from "@/lib/ai/route-helpers";
import { getAiConversation, conversationAccessible } from "@/lib/ai/chat-session";

export const runtime = "nodejs";

/** Close an AI conversation (customer-initiated). Idempotent. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const caller = await resolveCaller(req);
  const conv = await getAiConversation(id);
  if (!conv) return jsonError("گفت‌وگو پیدا نشد.", 404);
  if (!conversationAccessible(conv, { sessionId: caller.session.id, customerId: caller.customerId })) {
    return jsonError("دسترسی به این گفت‌وگو مجاز نیست.", 403);
  }

  // Don't override a handoff in progress.
  if (conv.status === "ACTIVE" || conv.status === "RESOLVED") {
    await prisma.aiConversation.update({ where: { id }, data: { status: "CLOSED" } });
  }
  return NextResponse.json({ ok: true, status: "CLOSED" });
}
