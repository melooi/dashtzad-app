"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { bannerFormSchema, type BannerFormInput } from "@/lib/admin/site-experience";

const LIST_PATH = "/admin/collections/banners";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function toData(v: ReturnType<typeof bannerFormSchema.parse>) {
  return {
    title: v.title,
    slug: v.slug,
    subtitle: v.subtitle,
    description: v.description,
    imageUrl: v.imageUrl,
    mobileImageUrl: v.mobileImageUrl,
    linkLabel: v.linkLabel,
    linkHref: v.linkHref,
    placement: v.placement,
    startsAt: v.startsAt ? new Date(v.startsAt) : null,
    endsAt: v.endsAt ? new Date(v.endsAt) : null,
    isActive: v.isActive,
    sortOrder: v.sortOrder,
  };
}

export async function createBanner(raw: BannerFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) =>
    Boolean(await prisma.banner.findUnique({ where: { slug: s } })),
  );

  const created = await prisma.banner.create({ data: { ...toData(parsed.data), slug } });
  revalidatePath(LIST_PATH);
  revalidatePath("/");
  return { ok: true, id: created.id };
}

export async function updateBanner(id: string, raw: BannerFormInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "بنر یافت نشد." };

  const parsed = bannerFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌ها نامعتبر است." };

  const slug = await ensureUniqueSlug(parsed.data.slug, async (s) => {
    const hit = await prisma.banner.findUnique({ where: { slug: s } });
    return Boolean(hit && hit.id !== id);
  });

  await prisma.banner.update({ where: { id }, data: { ...toData(parsed.data), slug } });
  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  revalidatePath(LIST_PATH);
  revalidatePath("/");
  return { ok: true, id };
}

export async function duplicateBanner(id: string): Promise<ActionResult> {
  await requireAdmin();
  const src = await prisma.banner.findUnique({ where: { id } });
  if (!src) return { ok: false, error: "بنر یافت نشد." };

  const slug = await ensureUniqueSlug(`${src.slug}-copy`, async (s) =>
    Boolean(await prisma.banner.findUnique({ where: { slug: s } })),
  );

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
  const created = await prisma.banner.create({ data: { ...rest, title: `${src.title} (کپی)`, slug } });
  revalidatePath(LIST_PATH);
  return { ok: true, id: created.id };
}
