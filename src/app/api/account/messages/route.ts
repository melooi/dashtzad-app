import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listMyConversations } from "@/lib/account/messages";
import { unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ conversations: await listMyConversations(user.id) });
}
