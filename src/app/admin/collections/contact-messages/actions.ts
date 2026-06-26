"use server";

import { revalidatePath } from "next/cache";
import type { ContactMessageStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const LIST_PATH = "/admin/collections/contact-messages";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function setContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "پیام یافت نشد." };

  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath(LIST_PATH);
  return { ok: true };
}

export async function deleteContactMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "پیام یافت نشد." };

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath(LIST_PATH);
  return { ok: true };
}
