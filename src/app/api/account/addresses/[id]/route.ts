import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addressInputSchema, deleteAddress, updateAddress } from "@/lib/account/addresses";
import { badRequest, notFoundJson, unauthorized } from "@/lib/account/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = addressInputSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  const updated = await updateAddress(user.id, id, parsed.data);
  if (!updated) return notFoundJson("آدرس یافت نشد.");
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const ok = await deleteAddress(user.id, id);
  if (!ok) return notFoundJson("آدرس یافت نشد.");
  return NextResponse.json({ ok: true });
}
