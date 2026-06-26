import { NextResponse } from "next/server";
import { resolveCaller, aiSessionCookieHeader } from "@/lib/ai/route-helpers";
import { listAiConversations, serializeConversation } from "@/lib/ai/chat-session";

export const runtime = "nodejs";

/** List the caller's AI conversations (by session, plus their customer id if logged in). */
export async function GET(req: Request) {
  const caller = await resolveCaller(req);
  const conversations = await listAiConversations({
    sessionId: caller.session.id,
    customerId: caller.customerId,
  });
  const res = NextResponse.json({ ok: true, conversations: conversations.map(serializeConversation) });
  res.headers.set("Set-Cookie", aiSessionCookieHeader(caller.session.token));
  return res;
}
