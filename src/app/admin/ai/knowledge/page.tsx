import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { KnowledgeManager } from "@/components/admin/ai/KnowledgeManager";

export const dynamic = "force-dynamic";

export default async function AdminAiKnowledgePage() {
  await requireAdmin();

  const [sources, topics] = await Promise.all([
    prisma.aiKnowledgeSource.findMany({
      where: { type: "GUIDE" },
      include: {
        documents: {
          include: {
            _count: { select: { chunks: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiFrequentTopic.findMany({
      orderBy: { hitCount: "desc" },
      take: 50,
    }),
  ]);

  // Flatten chunk counts per source (sum across all documents)
  const sourcesWithChunkCount = sources.map((source) => ({
    id: source.id,
    title: source.title,
    status: source.status,
    documentCount: source.documentCount,
    lastIndexedAt: source.lastIndexedAt?.toISOString() ?? null,
    createdAt: source.createdAt.toISOString(),
    chunkCount: source.documents.reduce((sum, doc) => sum + doc._count.chunks, 0),
  }));

  const topicsSerialized = topics.map((t) => ({
    id: t.id,
    slug: t.slug,
    topic: t.topic,
    answer: t.answer,
    hitCount: t.hitCount,
  }));

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="مدیریت دانش هوش مصنوعی"
        description="اسناد پایه‌ای دستیار را بارگذاری کنید و موضوعات رایج کاربران را مدیریت نمایید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "هوش مصنوعی", href: "/admin/ai" },
          { label: "پایگاه دانش" },
        ]}
      />
      <KnowledgeManager sources={sourcesWithChunkCount} topics={topicsSerialized} />
    </div>
  );
}
