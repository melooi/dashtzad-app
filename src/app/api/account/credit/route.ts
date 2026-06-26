import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCreditSummary } from "@/lib/credit/service";
import { unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json(await getCreditSummary(user.id));
}
