import { NextResponse } from "next/server";
import { setVisitorTyping } from "@/lib/chat/service";

export const runtime = "nodejs";

/** POST /api/chat/conversations/[id]/typing
 * Called by the visitor widget when they start typing.
 * Sets a 5-second heartbeat so the admin can show a typing indicator.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  // id here is the public token (consistent with other visitor routes)
  await setVisitorTyping(id);
  return NextResponse.json({ ok: true });
}
