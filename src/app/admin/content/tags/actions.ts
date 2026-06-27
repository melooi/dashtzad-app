"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export async function renameTag(oldName: string, newName: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const n = newName.trim();
  if (!n) return { ok: false, error: "نام برچسب نمی‌تواند خالی باشد." };
  if (n === oldName) return { ok: true };

  try {
    const posts = await prisma.post.findMany({
      where: { tags: { has: oldName }, deletedAt: null },
      select: { id: true, tags: true },
    });
    for (const p of posts) {
      const next = Array.from(new Set(p.tags.map((t) => (t === oldName ? n : t))));
      await prisma.post.update({ where: { id: p.id }, data: { tags: next } });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "خطا در تغییر نام." };
  }
}

export async function deleteTag(name: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const posts = await prisma.post.findMany({
      where: { tags: { has: name }, deletedAt: null },
      select: { id: true, tags: true },
    });
    for (const p of posts) {
      await prisma.post.update({
        where: { id: p.id },
        data: { tags: p.tags.filter((t) => t !== name) },
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "خطا در حذف برچسب." };
  }
}
