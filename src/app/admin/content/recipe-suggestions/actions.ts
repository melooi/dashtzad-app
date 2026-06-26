"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { CommentStatus } from "@/generated/prisma/client";

const LIST = "/admin/content/recipe-suggestions";
const VALID: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED"];

/** Mark a recipe suggestion as reviewed (APPROVED) / dismissed (REJECTED). */
export async function setSuggestionStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as CommentStatus;
  if (!id || !VALID.includes(status)) return;
  await prisma.recipeSuggestion.update({ where: { id }, data: { status } });
  revalidatePath(LIST);
}

export async function deleteSuggestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.recipeSuggestion.delete({ where: { id } });
  revalidatePath(LIST);
}
