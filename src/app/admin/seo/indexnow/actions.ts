"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { submitToIndexNow } from "@/lib/seo/indexnow";

export async function submitAllProductsAction(): Promise<{ ok: boolean; error?: string; count?: number }> {
  await requireAdmin();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true },
  });

  const urls = products.map((p) => `${baseUrl}/products/${p.slug}`);
  const result = await submitToIndexNow(urls);
  return { ...result, count: urls.length };
}

export async function submitAllPostsAction(): Promise<{ ok: boolean; error?: string; count?: number }> {
  await requireAdmin();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { slug: true },
  });

  const urls = posts.map((p) => `${baseUrl}/blog/${p.slug}`);
  const result = await submitToIndexNow(urls);
  return { ...result, count: urls.length };
}

export async function submitCustomUrlsAction(raw: string): Promise<{ ok: boolean; error?: string; count?: number }> {
  await requireAdmin();

  const urls = raw
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http"));

  if (urls.length === 0) return { ok: false, error: "هیچ URL معتبری پیدا نشد" };

  const result = await submitToIndexNow(urls);
  return { ...result, count: urls.length };
}
