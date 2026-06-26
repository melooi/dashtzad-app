"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ChatConversationDetail } from "./ChatConversationDetail";
import { OperatorPresenceToggle } from "./OperatorPresenceToggle";
import { ChatTime } from "./ChatTime";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type {
  AdminConversationListItem,
  AdminConversationDetail,
  Department,
  OperatorPresence,
  CannedReply,
  OperatorStats,
  ConversationSentiment,
  ConversationAiPriority,
  CustomerTier,
} from "@/lib/chat/types";
import {
  STATUS_LABEL,
  STATUS_BADGE_TONE,
  SENTIMENT_LABEL,
  SENTIMENT_EMOJI,
  PRIORITY_LABEL,
  CUSTOMER_TIER_LABEL,
} from "@/lib/chat/types";

// ---- wait timer ----

function useWaitSecs(lastMessageAt: string, lastSenderRole: string | null): number {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (lastSenderRole !== "VISITOR") { setSecs(0); return; }
    const calc = () => Math.floor((Date.now() - new Date(lastMessageAt).getTime()) / 1000);
    setSecs(calc());
    const id = setInterval(() => setSecs(calc()), 30_000);
    return () => clearInterval(id);
  }, [lastMessageAt, lastSenderRole]);
  return secs;
}

function WaitTimer({ lastMessageAt, lastSenderRole }: { lastMessageAt: string; lastSenderRole: string | null }) {
  const secs = useWaitSecs(lastMessageAt, lastSenderRole);
  if (lastSenderRole !== "VISITOR") return null;
  const mins = Math.floor(secs / 60);
  // color tier: green→lime→yellow→orange→red→urgent-red (every 10 min)
  const tier =
    mins >= 60 ? "t6" :
    mins >= 50 ? "t5" :
    mins >= 40 ? "t4" :
    mins >= 30 ? "t3" :
    mins >= 20 ? "t2" :
    mins >= 10 ? "t1" : "t0";
  const timeStr = new Date(lastMessageAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  return (
    <span className={`chat-wait-timer ${tier}`}>
      <span className="chat-wait-dot" />
      بی‌پاسخ از {timeStr}
    </span>
  );
}

// ---- mini chips ----

function SentimentChip({ s }: { s: ConversationSentiment | null }) {
  if (!s) return null;
  return (
    <span className={`chat-sentiment-chip ${s.toLowerCase()}`}>
      {SENTIMENT_EMOJI[s]} {SENTIMENT_LABEL[s]}
    </span>
  );
}

function PriorityDot({ p }: { p: ConversationAiPriority | null }) {
  if (!p) return null;
  return <span className={`chat-priority-dot ${p.toLowerCase()}`} title={PRIORITY_LABEL[p]} />;
}

function TierChip({ tier }: { tier: CustomerTier | null }) {
  if (!tier || tier === "NEW_CUSTOMER") return null;
  return <span className={`chat-tier-chip ${tier.toLowerCase()}`}>{CUSTOMER_TIER_LABEL[tier]}</span>;
}

// ---- smart sort ----

function smartScore(c: AdminConversationListItem): number {
  if (c.status === "RESOLVED") return -10000;
  let score = new Date(c.lastMessageAt).getTime() / 1000;
  if (c.aiPriority === "HIGH") score += 86400 * 3;
  else if (c.aiPriority === "MEDIUM") score += 86400;
  if (c.unreadForAdmin > 0) score += 86400 * 2;
  if (c.lastSenderRole === "VISITOR") score += 3600;
  return score;
}

// ---- workspace ----

export function AdminChatWorkspace({
  conversations,
  active,
  presence,
  departments,
  cannedReplies,
  aiEnabled,
  soundEnabled,
  selfOnline,
  currentUserId,
  operatorStats,
  withTabs,
}: {
  conversations: AdminConversationListItem[];
  active: AdminConversationDetail | null;
  presence: OperatorPresence[];
  departments: Department[];
  cannedReplies: CannedReply[];
  aiEnabled: boolean;
  soundEnabled: boolean;
  selfOnline: boolean;
  currentUserId: string;
  operatorStats?: OperatorStats;
  withTabs?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "NEW" | "OPEN" | "PENDING" | "RESOLVED">("ALL");
  const [dept, setDept] = useState("");
  const prevUnread = useRef(0);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  const totalUnread = useMemo(() => conversations.reduce((s, c) => s + c.unreadForAdmin, 0), [conversations]);
  useEffect(() => {
    if (soundEnabled && totalUnread > prevUnread.current) {
      chimeRef.current?.play().catch(() => {});
    }
    prevUnread.current = totalUnread;
  }, [totalUnread, soundEnabled]);

  const counts = useMemo(() => ({
    ALL: conversations.length,
    NEW: conversations.filter((c) => c.status === "NEW").length,
    OPEN: conversations.filter((c) => c.status === "OPEN").length,
    PENDING: conversations.filter((c) => c.status === "PENDING").length,
    RESOLVED: conversations.filter((c) => c.status === "RESOLVED").length,
  }), [conversations]);

  const filtered = useMemo(() => {
    const list = conversations.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      if (dept && c.departmentId !== dept) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          c.displayName.toLowerCase().includes(q) ||
          (c.phone?.includes(q) ?? false) ||
          (c.subject?.toLowerCase().includes(q) ?? false) ||
          (c.lastMessagePreview?.toLowerCase().includes(q) ?? false) ||
          (c.topicLabel?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
    return [...list].sort((a, b) => smartScore(b) - smartScore(a));
  }, [conversations, filter, dept, query]);

  return (
    <div className={`chat-workspace${active ? " has-active" : ""}${withTabs ? " with-tabs" : ""}`}>
      <audio ref={chimeRef} src="/sounds/chime.mp3" preload="none" />

      {/* list pane */}
      <aside className="chat-list-pane">
        {/* header row */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-(--color-dz-a-border)">
          <OperatorPresenceToggle initialOnline={selfOnline} />
        </div>

        {/* operator stats */}
        {operatorStats && (
          <div className="chat-op-stats">
            <div className="chat-op-stat">
              <span className="chat-op-stat-value">{operatorStats.todayTotal}</span>
              <span className="chat-op-stat-label">امروز</span>
            </div>
            <div className="chat-op-stat">
              <span className="chat-op-stat-value">{operatorStats.todayResolved}</span>
              <span className="chat-op-stat-label">حل‌شده</span>
            </div>
            <div className="flex-1" />
            <span className="text-[0.6875rem] text-(--color-dz-a-text-muted)">{filtered.length} مکالمه</span>
          </div>
        )}

        {/* search + filters */}
        <div className="chat-list-controls">
          <input className="chat-search" placeholder="جستجو…" value={query}
            onChange={(e) => setQuery(e.target.value)} dir="rtl" />
          <div className="chat-filter-pills">
            {(["ALL", "NEW", "OPEN", "PENDING", "RESOLVED"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`chat-filter-pill${filter === s ? " active" : ""}`}>
                {s === "ALL" ? "همه" : STATUS_LABEL[s]}
                <span className="count">{counts[s]}</span>
              </button>
            ))}
          </div>
          {departments.length > 0 && (
            <select className="chat-search text-sm" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">همه دپارتمان‌ها</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* list */}
        <ul className="chat-conv-list">
          {filtered.length === 0 && (
            <li className="py-10 text-center text-sm text-(--color-dz-a-text-muted)">
              مکالمه‌ای یافت نشد
            </li>
          )}
          {filtered.map((c) => (
            <ConvItem key={c.id} conv={c} isActive={active?.id === c.id} />
          ))}
        </ul>
      </aside>

      {/* thread pane */}
      <main className="chat-thread-pane">
        {active ? (
          <ChatConversationDetail
            conversation={active}
            presence={presence}
            departments={departments}
            cannedReplies={cannedReplies}
            aiEnabled={aiEnabled}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-(--color-dz-a-text-muted)">
            <MessageSquare size={44} strokeWidth={1.2} />
            <p className="text-sm">یک مکالمه را انتخاب کنید</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ---- conv list item ----

function ConvItem({ conv, isActive }: { conv: AdminConversationListItem; isActive: boolean }) {
  return (
    <li>
      <Link href={`/admin/chat/${conv.id}`}
        className={`chat-conv-item${isActive ? " active" : ""}${conv.unreadForAdmin > 0 ? " has-unread" : ""}`}>
        {/* row 1 */}
        <div className="chat-conv-row1">
          <div className="chat-conv-avatar">{conv.displayName.charAt(0) || "?"}</div>
          <span className="chat-conv-name">{conv.displayName}</span>
          <span className="chat-conv-time"><ChatTime iso={conv.lastMessageAt} /></span>
          {conv.unreadForAdmin > 0 && (
            <span className="chat-unread-badge">{conv.unreadForAdmin}</span>
          )}
        </div>
        {/* row 2: timer when visitor is waiting, preview when operator replied */}
        <div className="chat-conv-row2">
          {conv.lastSenderRole === "VISITOR" ? (
            <WaitTimer lastMessageAt={conv.lastMessageAt} lastSenderRole={conv.lastSenderRole} />
          ) : (
            <span className="chat-conv-preview">{conv.lastMessagePreview ?? "…"}</span>
          )}
        </div>
        {/* row 3 */}
        <div className="chat-conv-row3">
          <PriorityDot p={conv.aiPriority} />
          <AdminStatusBadge tone={STATUS_BADGE_TONE[conv.status]}>{STATUS_LABEL[conv.status]}</AdminStatusBadge>
          <SentimentChip s={conv.sentiment} />
          <TierChip tier={conv.customerTier} />
          {conv.topicLabel && <span className="chat-topic-label">{conv.topicLabel}</span>}
          {conv.departmentName && !conv.topicLabel && (
            <span className="chat-topic-label">{conv.departmentName}</span>
          )}
        </div>
      </Link>
    </li>
  );
}
