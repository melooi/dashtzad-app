import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listAdminAiConversations } from "@/lib/ai/admin-conversations";
import type { AiConversationStatus, AiPriority } from "@/generated/prisma/enums";

export const runtime = "nodejs";

const STATUSES = ["ACTIVE", "AWAITING_HUMAN", "HANDED_OFF", "RESOLVED", "CLOSED", "EXPIRED"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

/** Admin: list AI conversations for the Chat Center, with filters. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const priorityParam = url.searchParams.get("priority");
  const conversations = await listAdminAiConversations({
    status: statusParam && STATUSES.includes(statusParam) ? (statusParam as AiConversationStatus) : "ALL",
    priority: priorityParam && PRIORITIES.includes(priorityParam) ? (priorityParam as AiPriority) : "ALL",
    query: url.searchParams.get("q"),
  });
  return NextResponse.json({ ok: true, conversations });
}
