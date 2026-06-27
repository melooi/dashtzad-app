"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { seriesFormSchema, toSeriesData, type SeriesFormInput } from "@/lib/admin/content-series";

const LIST = "/admin/content/case-files";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function createCaseFile(raw: SeriesFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = seriesFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const data = toSeriesData(parsed.data);
  const slug = await ensureUniqueSlug(data.slug, async (s) => Boolean(await prisma.contentSeries.findUnique({ where: { slug: s } })));
  const created = await prisma.contentSeries.create({ data: { ...data, slug } });
  revalidatePath(LIST);
  revalidatePath("/blog/case-files");
  return { ok: true, id: created.id };
}

export async function updateCaseFile(id: string, raw: SeriesFormInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.contentSeries.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "پرونده یافت نشد." };

  const parsed = seriesFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const data = toSeriesData(parsed.data);
  const slug = await ensureUniqueSlug(data.slug, async (s) => {
    const hit = await prisma.contentSeries.findUnique({ where: { slug: s } });
    return Boolean(hit && hit.id !== id);
  });

  await prisma.contentSeries.update({ where: { id }, data: { ...data, slug } });
  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  revalidatePath("/blog/case-files");
  revalidatePath(`/blog/case-files/${slug}`);
  return { ok: true, id };
}

export async function deleteCaseFile(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contentSeries.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath(LIST);
  revalidatePath("/blog/case-files");
  return { ok: true, id };
}
