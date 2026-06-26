import { prisma } from "@/lib/prisma";
import type { CommentStatus } from "@/generated/prisma/enums";

export type AdminCommentRow = {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  authorName: string;
  text: string;
  status: CommentStatus;
  parentId: string | null;
  createdAtISO: string;
};

export async function listAdminComments(): Promise<AdminCommentRow[]> {
  const rows = await prisma.postComment.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      post: { select: { id: true, title: true, slug: true } },
      user: { select: { name: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    postId: c.postId,
    postTitle: c.post.title,
    postSlug: c.post.slug,
    authorName: c.user.name ?? "کاربر",
    text: c.text,
    status: c.status,
    parentId: c.parentId,
    createdAtISO: c.createdAt.toISOString(),
  }));
}

export async function setCommentStatus(id: string, status: CommentStatus): Promise<void> {
  await prisma.postComment.update({ where: { id }, data: { status } });
}

export async function commentCounts(): Promise<{ pending: number }> {
  const pending = await prisma.postComment.count({ where: { status: "PENDING" } });
  return { pending };
}
