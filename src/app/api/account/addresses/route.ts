import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addressInputSchema, createAddress, listAddresses } from "@/lib/account/addresses";
import { badRequest, unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ addresses: await listAddresses(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const json = await req.json().catch(() => null);
  const parsed = addressInputSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  return NextResponse.json(await createAddress(user.id, parsed.data));
}
