import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAdminAiConversation,
  updateAdminAiConversation,
} from "@/lib/ai/admin-conversations";

export const runtime = "nodejs";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 }) };
  if (user.role !== "ADMIN") return { error: NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 }) };
  return { user };
}

/** Admin: AI conversation detail (messages, tool calls, handoffs, feedback). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  const conv = await getAdminAiConversation(id);
  if (!conv) return NextResponse.json({ error: "گفت‌وگو پیدا نشد." }, { status: 404 });
  return NextResponse.json({ ok: true, conversation: conv });
}

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "AWAITING_HUMAN", "HANDED_OFF", "RESOLVED", "CLOSED", "EXPIRED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  tags: z.array(z.string()).optional(),
  operatorNote: z.string().max(4000).nullable().optional(),
  operatorId: z.string().uuid().nullable().optional(),
});

/** Admin: update AI conversation metadata (status/priority/tags/note/assignment). */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });

  const existing = await getAdminAiConversation(id);
  if (!existing) return NextResponse.json({ error: "گفت‌وگو پیدا نشد." }, { status: 404 });

  await updateAdminAiConversation(id, parsed.data);
  return NextResponse.json({ ok: true });
}
