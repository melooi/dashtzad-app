"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { indexMdFile, deleteMdSource } from "@/lib/ai/memory/md-indexer";

export type KnowledgeActionResult = {
  ok: boolean;
  message: string;
  sourceId?: string;
};

export async function uploadKnowledgeFileAction(
  formData: FormData,
): Promise<KnowledgeActionResult> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }

  if (!file.name.toLowerCase().endsWith(".md")) {
    return { ok: false, message: "فقط فایل‌های .md پشتیبانی می‌شوند." };
  }

  const MAX_SIZE = 500 * 1024; // 500KB
  if (file.size > MAX_SIZE) {
    return { ok: false, message: "حجم فایل نباید بیشتر از ۵۰۰ کیلوبایت باشد." };
  }

  const content = await file.text();
  const title = file.name
    .replace(/\.md$/i, "")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  const result = await indexMdFile({ title, content });

  revalidatePath("/admin/ai/knowledge");
  return { ok: true, message: "فایل با موفقیت بارگذاری و ایندکس شد.", sourceId: result.sourceId };
}

export async function deleteKnowledgeSourceAction(
  sourceId: string,
): Promise<KnowledgeActionResult> {
  await requireAdmin();

  await deleteMdSource(sourceId);

  revalidatePath("/admin/ai/knowledge");
  return { ok: true, message: "منبع حذف شد." };
}

export async function reindexKnowledgeSourceAction(
  sourceId: string,
): Promise<KnowledgeActionResult> {
  await requireAdmin();

  const source = await prisma.aiKnowledgeSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: {
      documents: {
        take: 1,
        include: {
          chunks: {
            select: { chunkIndex: true, content: true },
            orderBy: { chunkIndex: "asc" },
          },
        },
      },
    },
  });

  const doc = source.documents[0];
  const reconstructedContent = doc
    ? doc.chunks.map((c) => c.content).join("\n\n")
    : "";

  await indexMdFile({ title: source.title, content: reconstructedContent });

  revalidatePath("/admin/ai/knowledge");
  return { ok: true, message: "ایندکس‌گذاری مجدد انجام شد." };
}

export async function getFrequentTopicsAction(): Promise<
  { id: string; slug: string; topic: string; answer: string | null; hitCount: number }[]
> {
  await requireAdmin();

  return prisma.aiFrequentTopic.findMany({
    orderBy: { hitCount: "desc" },
    take: 20,
  });
}

export async function updateTopicAnswerAction(
  topicId: string,
  answer: string,
): Promise<KnowledgeActionResult> {
  await requireAdmin();

  await prisma.aiFrequentTopic.update({
    where: { id: topicId },
    data: { answer },
  });

  revalidatePath("/admin/ai/knowledge");
  return { ok: true, message: "پاسخ ذخیره شد." };
}
