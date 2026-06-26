import { NextResponse } from "next/server";
import { resolveCaller, aiSessionCookieHeader } from "@/lib/ai/route-helpers";
import { getWidgetConfig } from "@/lib/ai/chat-center";

export const runtime = "nodejs";

/**
 * Create or resume an AI chat session (guest or logged-in). Sets an httpOnly
 * opaque session cookie and returns the public widget config (incl. whether the
 * AI is available right now). No secrets exposed.
 */
export async function POST(req: Request) {
  const caller = await resolveCaller(req);
  const widget = await getWidgetConfig();

  const res = NextResponse.json({
    ok: true,
    sessionToken: caller.session.token,
    isNewSession: caller.isNewSession,
    loggedIn: caller.customerId != null,
    widget,
  });
  res.headers.set("Set-Cookie", aiSessionCookieHeader(caller.session.token));
  return res;
}
