import { NextResponse } from "next/server";
import { getWidgetConfig } from "@/lib/ai/chat-center";

export const runtime = "nodejs";

/**
 * Public widget configuration for the chat surface (labels, quick actions, and
 * the AI availability flag). Safe to call unauthenticated; contains no secrets.
 */
export async function GET() {
  const widget = await getWidgetConfig();
  return NextResponse.json({ ok: true, widget });
}
