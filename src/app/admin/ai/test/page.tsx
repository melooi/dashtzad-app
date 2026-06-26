import { requireAdmin } from "@/lib/auth/guards";
import { AiChatTest } from "@/components/admin/ai/AiChatTest";

export const dynamic = "force-dynamic";

export default async function AdminAiTestPage() {
  await requireAdmin();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="sr-only">
        <h1>تست دستیار هوش مصنوعی</h1>
      </div>
      <AiChatTest />
    </div>
  );
}
