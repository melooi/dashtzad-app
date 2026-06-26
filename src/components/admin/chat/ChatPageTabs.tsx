import Link from "next/link";
import { MessageSquare, BarChart2, Bot, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tab = { key: string; label: string; icon: LucideIcon };

const TABS: Tab[] = [
  { key: "conversations", label: "گفتگوها", icon: MessageSquare },
  { key: "dashboard", label: "داشبورد", icon: BarChart2 },
  { key: "ai", label: "هوش مصنوعی", icon: Bot },
  { key: "settings", label: "تنظیمات", icon: Settings },
];

export function ChatPageTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="chat-page-tabs px-4 sm:px-6">
      {TABS.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          href={key === "conversations" ? "/admin/chat" : `/admin/chat?tab=${key}`}
          className={`chat-page-tab${activeTab === key ? " active" : ""}`}
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
    </div>
  );
}
