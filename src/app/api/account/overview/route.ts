import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAccountOverview } from "@/lib/account/overview";
import { unauthorized } from "@/lib/account/api";

// Dashboard aggregate for the account panel — all real values (SKILL §H3).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json(await getAccountOverview(user.id));
}
