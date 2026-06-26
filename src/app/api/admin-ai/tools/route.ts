import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureToolsRegistered, toolRegistry } from "@/lib/ai/tools";

export const runtime = "nodejs";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  return null;
}

/** Admin: list the registered AI tools (the Tools Registry). */
export async function GET() {
  const gate = await requireAdmin();
  if (gate) return gate;
  ensureToolsRegistered();
  const tools = toolRegistry.list().map((t) => ({
    name: t.name,
    category: t.category,
    description: t.description,
    readOnly: t.readOnly ?? true,
    requiresAuth: t.requiresAuth ?? false,
    requiresApproval: t.requiresApproval ?? false,
    isDestructive: t.isDestructive ?? false,
    internal: t.internal ?? false,
    enabled: t.enabled !== false,
  }));
  return NextResponse.json({ ok: true, count: tools.length, tools });
}

/** Admin: mirror the in-memory registry into the ai_tools table. */
export async function POST() {
  const gate = await requireAdmin();
  if (gate) return gate;
  ensureToolsRegistered();
  const count = await toolRegistry.syncToDb();
  return NextResponse.json({ ok: true, synced: count });
}
