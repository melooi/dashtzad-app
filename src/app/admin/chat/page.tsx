import { requireAdmin } from "@/lib/auth/guards";
import { AdminChatWorkspace } from "@/components/admin/chat/AdminChatWorkspace";
import { ChatPageTabs } from "@/components/admin/chat/ChatPageTabs";
import { ChatDashboardTab } from "@/components/admin/chat/ChatDashboardTab";
import { GlobalForm } from "@/components/admin/globals/GlobalForm";
import { AiSettingsPanel } from "@/components/admin/chat/AiSettingsPanel";
import { KnowledgeManager } from "@/components/admin/ai/KnowledgeManager";
import {
  listAdminConversations,
  getOperatorPresence,
  listDepartments,
} from "@/lib/chat/service";
import { getChatSettings, readGlobalRaw, loadFieldContext, ctxFlagsForGlobal } from "@/lib/admin/global-service";
import { isAiConfigured, providerForModel } from "@/lib/chat/ai";
import { getIntegrationConfigStatus } from "@/lib/admin/integration-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_TABS = ["conversations", "dashboard", "ai", "settings"] as const;
type TabKey = (typeof VALID_TABS)[number];

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireAdmin();
  const { tab: rawTab = "conversations" } = await searchParams;
  const tab: TabKey = VALID_TABS.includes(rawTab as TabKey)
    ? (rawTab as TabKey)
    : "conversations";

  // Always load conversations (needed for گفتگوها + داشبورد)
  const [conversations, presence, departments, settings] = await Promise.all([
    listAdminConversations(),
    getOperatorPresence(),
    listDepartments(false),
    getChatSettings(),
  ]);

  const aiEnabled =
    settings.aiCopilotEnabled && isAiConfigured(providerForModel(settings.aiModel));
  const selfOnline = presence.find((p) => p.id === user.id)?.online ?? false;
  const cannedReplies = settings.cannedReplies.filter((c) => c.body.trim());

  // Settings/AI tab: load form data + knowledge base
  let settingsData: Record<string, unknown> | null = null;
  let settingsCtx: Awaited<ReturnType<typeof loadFieldContext>> | null = null;
  let connectedProviders = { anthropic: false, openai: false, google: false };
  let knowledgeSources: { id: string; title: string; status: string; documentCount: number; lastIndexedAt: string | null; createdAt: string; chunkCount: number }[] = [];
  let knowledgeTopics: { id: string; slug: string; topic: string; answer: string; hitCount: number }[] = [];

  if (tab === "settings" || tab === "ai") {
    const [rawData, ctx, integrationStatus, sources, topics] = await Promise.all([
      readGlobalRaw("chatSettings"),
      loadFieldContext(ctxFlagsForGlobal("chatSettings")),
      getIntegrationConfigStatus(),
      tab === "ai" ? prisma.aiKnowledgeSource.findMany({
        where: { type: "GUIDE" },
        include: { documents: { include: { _count: { select: { chunks: true } } } } },
        orderBy: { createdAt: "desc" },
      }) : Promise.resolve([]),
      tab === "ai" ? prisma.aiFrequentTopic.findMany({ orderBy: { hitCount: "desc" }, take: 50 }) : Promise.resolve([]),
    ]);
    settingsData = rawData;
    settingsCtx = ctx;
    connectedProviders = {
      anthropic: integrationStatus["ai-anthropic"]?.apiKey ?? false,
      openai: integrationStatus["ai-openai"]?.apiKey ?? false,
      google: integrationStatus["ai-google"]?.apiKey ?? false,
    };
    knowledgeSources = sources.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      documentCount: s.documentCount,
      lastIndexedAt: s.lastIndexedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      chunkCount: s.documents.reduce((sum, doc) => sum + doc._count.chunks, 0),
    }));
    knowledgeTopics = topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      topic: t.topic,
      answer: t.answer ?? "",
      hitCount: t.hitCount,
    }));
  }

  return (
    // negative margins cancel the admin shell py-5/px-4 padding so the tab bar
    // touches the shell edges and workspace fills the viewport correctly.
    <div className="-mt-5 sm:-mt-7 -mx-4 sm:-mx-6">
      <ChatPageTabs activeTab={tab} />

      {tab === "conversations" && (
        <AdminChatWorkspace
          conversations={conversations}
          active={null}
          presence={presence}
          departments={departments}
          cannedReplies={cannedReplies}
          aiEnabled={aiEnabled}
          soundEnabled={settings.soundEnabled}
          selfOnline={selfOnline}
          currentUserId={user.id}
          withTabs
        />
      )}

      {tab === "dashboard" && (
        <div className="px-4 sm:px-6 py-6 max-w-5xl">
          <ChatDashboardTab conversations={conversations} />
        </div>
      )}

      {tab === "ai" && settingsData && settingsCtx && (
        <div className="px-4 sm:px-6 py-6 max-w-5xl space-y-8">
          <AiSettingsPanel initialData={settingsData} connectedProviders={connectedProviders} />
          <div>
            <h2 className="font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg mb-1">
              پایگاه دانش
            </h2>
            <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted mb-5">
              اسناد پایه‌ای دستیار را بارگذاری کنید و موضوعات رایج کاربران را مدیریت نمایید.
            </p>
            <KnowledgeManager sources={knowledgeSources} topics={knowledgeTopics} />
          </div>
        </div>
      )}

      {tab === "settings" && settingsData && settingsCtx && (
        <div className="px-4 sm:px-6 py-6 max-w-5xl">
          <GlobalForm
            globalKey="chatSettings"
            initialData={settingsData}
            ctx={settingsCtx}
            excludeSections={["ai", "aichatbot"]}
          />
        </div>
      )}
    </div>
  );
}
