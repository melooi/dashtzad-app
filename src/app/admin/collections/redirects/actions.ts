"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { redirectSchema, type RedirectInput } from "@/lib/admin/site-experience";

const LIST_PATH = "/admin/collections/redirects";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function createRedirect(raw: RedirectInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = redirectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };
  const values = parsed.data;

  const dup = await prisma.redirect.findUnique({ where: { source: values.source } });
  if (dup) return { ok: false, error: "این مسیر مبدأ قبلاً ثبت شده است." };

  // One-hop loop guard: reject if destination already redirects back to source.
  const reverse = await prisma.redirect.findUnique({ where: { source: values.destination } });
  if (reverse && reverse.destination === values.source) {
    return { ok: false, error: "این ریدایرکت یک حلقه ایجاد می‌کند (مقصد به مبدأ بازمی‌گردد)." };
  }

  const created = await prisma.redirect.create({ data: values });
  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}

export async function updateRedirect(id: string, raw: RedirectInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.redirect.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "ریدایرکت یافت نشد." };

  const parsed = redirectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };
  const values = parsed.data;

  const dup = await prisma.redirect.findUnique({ where: { source: values.source } });
  if (dup && dup.id !== id) return { ok: false, error: "این مسیر مبدأ قبلاً ثبت شده است." };

  await prisma.redirect.update({ where: { id }, data: values });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true, id };
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.redirect.delete({ where: { id } });
  revalidatePath(LIST_PATH);
  return { ok: true, id };
}
