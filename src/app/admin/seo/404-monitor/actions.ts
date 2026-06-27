"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function markResolvedAction(id: string) {
  await requireAdmin();
  await prisma.error404Log.update({
    where: { id },
    data: { isResolved: true },
  });
  revalidatePath("/admin/seo/404-monitor");
}

export async function deleteLogAction(id: string) {
  await requireAdmin();
  await prisma.error404Log.delete({ where: { id } });
  revalidatePath("/admin/seo/404-monitor");
}

export async function clearResolvedAction() {
  await requireAdmin();
  await prisma.error404Log.deleteMany({ where: { isResolved: true } });
  revalidatePath("/admin/seo/404-monitor");
}

export async function createRedirectFromLogAction(id: string, path: string) {
  await requireAdmin();
  await prisma.error404Log.update({
    where: { id },
    data: { isResolved: true },
  });
  // Redirect admin to create a new redirect pre-filled with this source path
  redirect(`/admin/collections/redirects/new?source=${encodeURIComponent(path)}`);
}
