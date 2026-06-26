"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RatingStatus } from "@/generated/prisma/client";

const LIST = "/admin/content/recipe-ratings";
const VALID: RatingStatus[] = ["PENDING", "APPROVED", "REJECTED"];

// Moderate a rating (user PostRating OR guest RecipeGuestRating). Approving makes
// it count toward the public aggregate; rejecting keeps it out.
export async function setRatingStatus(formData: FormData) {
  const admin = await requireAdmin();
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as RatingStatus;
  if (!id || !VALID.includes(status) || (kind !== "user" && kind !== "guest")) return;

  const data = { status, reviewedAt: new Date(), reviewedByAdminId: admin.id };
  if (kind === "user") await prisma.postRating.update({ where: { id }, data }).catch(() => null);
  else await prisma.recipeGuestRating.update({ where: { id }, data }).catch(() => null);
  revalidatePath(LIST);
}

export async function deleteRating(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (kind === "user") await prisma.postRating.delete({ where: { id } }).catch(() => null);
  else await prisma.recipeGuestRating.delete({ where: { id } }).catch(() => null);
  revalidatePath(LIST);
}
