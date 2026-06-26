import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { setDefaultAddress } from "@/lib/account/addresses";
import { notFoundJson, unauthorized } from "@/lib/account/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const ok = await setDefaultAddress(user.id, id);
  if (!ok) return notFoundJson("آدرس یافت نشد.");
  return NextResponse.json({ ok: true });
}
