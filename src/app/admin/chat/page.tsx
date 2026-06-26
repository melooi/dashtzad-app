import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminChatWorkspace } from "@/components/admin/chat/AdminChatWorkspace";
import { ChatHeaderActions } from "@/components/admin/chat/ChatHeaderActions";
import { listAdminConversations, getOperatorPresence, listDepartments } from "@/lib/chat/service";
import { getChatSettings } from "@/lib/admin/global-service";
import { isAiConfigured, providerForModel } from "@/lib/chat/ai";

export const dynamic = "force-dynamic";

// CHAT-CP1/CP2 — real support inbox. Lists persisted conversations; the detail
// pane opens at /admin/chat/[id].
export default async function AdminChatPage() {
  const user = await requireAdmin();
  const [conversations, presence, departments, settings] = await Promise.all([
    listAdminConversations(),
    getOperatorPresence(),
    listDepartments(false),
    getChatSettings(),
  ]);
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
          { label: "چت و پشتیبانی" },
        ]}
        actions={<ChatHeaderActions />}
      />
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
      />
    </div>
  );
}
