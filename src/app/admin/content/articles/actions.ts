"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { articleFormSchema, toArticleData, type ArticleFormInput } from "@/lib/admin/articles";
import type { Prisma } from "@/generated/prisma/client";

const LIST = "/admin/content/articles";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function revalidateArticle(slug?: string) {
  revalidatePath(LIST);
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createArticle(raw: ArticleFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = articleFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const data = toArticleData(parsed.data);
  const slug = await ensureUniqueSlug(data.slug, async (s) => Boolean(await prisma.post.findUnique({ where: { slug: s } })));
  const publishedAt = parsed.data.status === "PUBLISHED" ? new Date() : null;

  const created = await prisma.post.create({
    data: { ...data, slug, publishedAt } as Prisma.PostUncheckedCreateInput,
  });
  revalidateArticle(slug);
  return { ok: true, id: created.id };
}

export async function updateArticle(id: string, raw: ArticleFormInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "مقاله یافت نشد." };

  const parsed = articleFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const data = toArticleData(parsed.data);
  const slug = await ensureUniqueSlug(data.slug, async (s) => {
    const hit = await prisma.post.findUnique({ where: { slug: s } });
    return Boolean(hit && hit.id !== id);
  });

  // Honest publish date: stamp on first publish, keep thereafter.
  let publishedAt = existing.publishedAt;
  if (parsed.data.status === "PUBLISHED" && !existing.publishedAt) publishedAt = new Date();

  await prisma.post.update({
    where: { id },
    data: { ...data, slug, publishedAt } as Prisma.PostUncheckedUpdateInput,
  });
  revalidateArticle(slug);
  revalidatePath(`${LIST}/${id}`);
  if (existing.slug !== slug) revalidatePath(`/blog/${existing.slug}`);
  return { ok: true, id };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  await prisma.post.delete({ where: { id } }); // PostComment cascades on delete
  revalidateArticle(existing?.slug);
  return { ok: true, id };
}
