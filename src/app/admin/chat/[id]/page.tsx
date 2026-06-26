import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminChatWorkspace } from "@/components/admin/chat/AdminChatWorkspace";
import { ChatHeaderActions } from "@/components/admin/chat/ChatHeaderActions";
import {
  listAdminConversations,
  getOperatorPresence,
  listDepartments,
  getAdminConversation,
} from "@/lib/chat/service";
import { getChatSettings } from "@/lib/admin/global-service";
import { isAiConfigured, providerForModel } from "@/lib/chat/ai";

export const dynamic = "force-dynamic";

export default async function AdminChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const [conversations, presence, departments, settings, active] = await Promise.all([
    listAdminConversations(),
    getOperatorPresence(),
    listDepartments(false),
    getChatSettings(),
    getAdminConversation(id),
  ]);
  if (!active) notFound();

  const aiEnabled = settings.aiCopilotEnabled && isAiConfigured(providerForModel(settings.aiModel));
  const selfOnline = presence.find((p) => p.id === user.id)?.online ?? false;
  const cannedReplies = settings.cannedReplies.filter((c) => c.body.trim());

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="چت و پشتیبانی"
        description="گفت‌وگوی زنده با مشتریان فروشگاه."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "چت و پشتیبانی", href: "/admin/chat" },
          { label: active.displayName },
        ]}
        actions={<ChatHeaderActions />}
      />
      <AdminChatWorkspace
        conversations={conversations}
        active={active}
        presence={presence}
        departments={departments}
        cannedReplies={cannedReplies}
        aiEnabled={aiEnabled}
        soundEnabled={settings.soundEnabled}
        selfOnline={selfOnline}
        currentUserId={user.id}
      />
    </div>
  );
}
