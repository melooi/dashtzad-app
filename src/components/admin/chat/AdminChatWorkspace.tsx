"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Inbox, MessageSquare, Sparkles, Clock } from "lucide-react";
import { ChatTime } from "./ChatTime";
import { ChatConversationDetail } from "./ChatConversationDetail";
import { OperatorPresenceToggle } from "./OperatorPresenceToggle";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { playChime } from "@/lib/chat/sound";
import {
  CONVERSATION_STATUSES,
  STATUS_LABEL,
  STATUS_BADGE_TONE,
  TIER_LABEL,
  TIER_CLS,
  getCustomerTier,
  type AdminConversationListItem,
  type AdminConversationDetail,
  type ConversationStatus,
  type Department,
  type OperatorPresence,
  type CannedReply,
} from "@/lib/chat/types";

type Filter = ConversationStatus | "ALL";

const STATUS_ORDER: Record<ConversationStatus, number> = { NEW: 0, OPEN: 1, PENDING: 2, RESOLVED: 3 };

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
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [dept, setDept] = useState<string>("");
  const [sortMode, setSortMode] = useState<"smart" | "time">("smart");

  // Sound + browser notification when unread count rises.
  const totalUnread = conversations.reduce((s, c) => s + c.unreadForAdmin, 0);
  const prevUnread = useRef(totalUnread);
  useEffect(() => {
    if (totalUnread > prevUnread.current) {
      if (soundEnabled) playChime();
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("دشت‌زاد پشتیبانی", {
          body: "یک پیام جدید از مشتری دریافت شد.",
          icon: "/favicon.ico",
        });
      }
    }
    prevUnread.current = totalUnread;
  }, [totalUnread, soundEnabled]);

  // Request browser notification permission on mount.
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Unread count in document title.
  useEffect(() => {
    const base = "پنل چت | دشت‌زاد";
    document.title = totalUnread > 0 ? `(${totalUnread}) ${base}` : base;
    return () => { document.title = base; };
  }, [totalUnread]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: conversations.length, NEW: 0, OPEN: 0, PENDING: 0, RESOLVED: 0 };
    for (const conv of conversations) c[conv.status] += 1;
    return c;
  }, [conversations]);

  const filtered = useMemo(() => {
    const q = query.trim();
    let result = conversations.filter((conv) => {
      if (filter !== "ALL" && conv.status !== filter) return false;
      if (dept && conv.departmentId !== dept) return false;
      if (!q) return true;
      const hay = `${conv.displayName} ${conv.phone ?? ""} ${conv.subject ?? ""} ${conv.lastMessagePreview ?? ""}`;
      return hay.includes(q);
    });
    if (sortMode === "smart") {
      result = [...result].sort((a, b) => {
        const unreadDiff = b.unreadForAdmin - a.unreadForAdmin;
        if (unreadDiff !== 0) return unreadDiff;
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return b.lastMessageAt.localeCompare(a.lastMessageAt);
      });
    }
    return result;
  }, [conversations, query, filter, dept, sortMode]);

  const activeId = active?.id ?? null;

  return (
    <div className="flex h-[calc(100svh-12rem)] min-h-[34rem] flex-col overflow-hidden rounded-2xl border border-dz-primary-100 bg-white dark:border-dz-night-border dark:bg-dz-night-card">
      {/* ===== KPI bar — full width ===== */}
      <div className="flex shrink-0 items-center justify-around border-b border-dz-primary-100 bg-dz-canvas px-4 py-2 dark:border-dz-night-border dark:bg-dz-night">
        <KpiCell value={counts.ALL} label="همه" cls="text-dz-primary-800 dark:text-dz-night-fg" />
        <div className="h-6 w-px bg-dz-primary-100 dark:bg-dz-night-line" />
        <KpiCell value={counts.OPEN} label="باز" cls="text-green-600 dark:text-green-400" />
        <div className="h-6 w-px bg-dz-primary-100 dark:bg-dz-night-line" />
        <KpiCell value={counts.PENDING} label="در انتظار" cls="text-dz-warning dark:text-dz-warning-300" />
        <div className="h-6 w-px bg-dz-primary-100 dark:bg-dz-night-line" />
        <KpiCell value={counts.NEW} label="جدید" cls="text-blue-600 dark:text-blue-400" />
        <div className="h-6 w-px bg-dz-primary-100 dark:bg-dz-night-line" />
        <KpiCell value={presence.filter((p) => p.online).length} label="اپراتور آنلاین" cls="text-dz-primary-700 dark:text-dz-night-fg" />
        {totalUnread > 0 && (
          <>
            <div className="h-6 w-px bg-dz-primary-100 dark:bg-dz-night-line" />
            <KpiCell value={totalUnread} label="خوانده‌نشده" cls="text-red-600 dark:text-red-400" />
          </>
        )}
      </div>

      {/* ===== two-column layout ===== */}
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[21rem_1fr]">

      {/* ===== list pane ===== */}
      <div
        className={`min-h-0 flex-col border-dz-primary-100 lg:flex lg:border-e dark:border-dz-night-border ${
          active ? "hidden" : "flex"
        }`}
      >
        <div className="border-b border-dz-primary-100 p-3 dark:border-dz-night-border">
          {/* presence + departments link */}
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <OperatorPresenceToggle initialOnline={selfOnline} />
            <Link
              href="/admin/chat/departments"
              className="focus-ring text-xs font-medium text-dz-primary-500 underline-offset-2 hover:text-dz-primary-700 hover:underline dark:text-dz-night-muted"
            >
              دپارتمان‌ها
            </Link>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-dz-primary-200 bg-dz-canvas px-3 py-2 focus-within:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated">
            <Search className="size-4 shrink-0 text-dz-primary-300 dark:text-dz-night-faint" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی نام، شماره یا متن…"
              aria-label="جستجوی گفت‌وگو"
              className="w-full border-0 bg-transparent text-sm text-dz-primary-800 outline-none placeholder:text-dz-primary-300 dark:text-dz-night-fg dark:placeholder:text-dz-night-faint"
            />
          </div>

          {/* status filter + sort toggle */}
          <div className="mt-2.5 flex items-start gap-2">
            <div className="flex flex-1 flex-wrap gap-1.5">
              {(["ALL", ...CONVERSATION_STATUSES] as Filter[]).map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`focus-ring inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-dz-primary-600 bg-dz-primary-600 text-white"
                        : "border-dz-primary-200 text-dz-primary-600 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
                    }`}
                  >
                    {f === "ALL" ? "همه" : STATUS_LABEL[f]}
                    <span className={isActive ? "text-white/80" : "text-dz-primary-400 dark:text-dz-night-faint"}>
                      {counts[f]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="inline-flex shrink-0 overflow-hidden rounded-lg border border-dz-primary-200 dark:border-dz-night-border">
              <button
                type="button"
                onClick={() => setSortMode("smart")}
                title="مرتب‌سازی هوشمند"
                aria-label="مرتب‌سازی هوشمند"
                className={`grid size-7 place-items-center transition-colors ${sortMode === "smart" ? "bg-dz-primary-600 text-white" : "text-dz-primary-500 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"}`}
              >
                <Sparkles className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setSortMode("time")}
                title="مرتب‌سازی زمانی"
                aria-label="مرتب‌سازی زمانی"
                className={`grid size-7 place-items-center transition-colors ${sortMode === "time" ? "bg-dz-primary-600 text-white" : "text-dz-primary-500 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"}`}
              >
                <Clock className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>

          {/* department filter */}
          {departments.length > 0 && (
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label="فیلتر دپارتمان"
              className="mt-2 w-full rounded-xl border border-dz-primary-200 bg-dz-canvas px-2.5 py-1.5 text-xs text-dz-primary-700 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
            >
              <option value="">همه‌ی دپارتمان‌ها</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
              <Inbox className="size-9 text-dz-primary-200 dark:text-dz-night-faint" aria-hidden />
              <p className="text-sm text-dz-primary-400 dark:text-dz-night-muted">
                {conversations.length === 0 ? "هنوز گفت‌وگویی ثبت نشده است." : "موردی با این فیلتر یافت نشد."}
              </p>
            </div>
          ) : (
            <ul>
              {filtered.map((conv) => {
                const isSelected = conv.id === activeId;
                return (
                  <li key={conv.id}>
                    <Link
                      href={`/admin/chat/${conv.id}`}
                      aria-current={isSelected ? "true" : undefined}
                      className={`focus-ring flex gap-3 border-b border-dz-primary-50 px-3 py-3 transition-colors dark:border-dz-night-line ${
                        isSelected
                          ? "bg-dz-primary-50 dark:bg-white/5"
                          : "hover:bg-dz-primary-50/50 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-dz-primary-100 font-heading text-sm font-bold text-dz-primary-700 dark:bg-white/5 dark:text-dz-night-fg">
                        {conv.displayName.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
                            {conv.displayName}
                          </span>
                          <span className="shrink-0 text-[0.66rem] text-dz-primary-300 dark:text-dz-night-faint">
                            <ChatTime iso={conv.lastMessageAt} />
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-dz-primary-400 dark:text-dz-night-muted">
                          {conv.lastMessagePreview ?? "—"}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <AdminStatusBadge tone={STATUS_BADGE_TONE[conv.status]}>
                            {STATUS_LABEL[conv.status]}
                          </AdminStatusBadge>
                          {!conv.isGuest && (() => {
                            const tier = getCustomerTier(conv.orderCount);
                            return (
                              <span className={`rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold ${TIER_CLS[tier]}`}>
                                {TIER_LABEL[tier]}
                              </span>
                            );
                          })()}
                          {conv.departmentName && (
                            <span className="rounded-full bg-dz-primary-50 px-1.5 py-0.5 text-[0.62rem] font-medium text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                              {conv.departmentName}
                            </span>
                          )}
                          {conv.isGuest && (
                            <span className="text-[0.62rem] text-dz-primary-300 dark:text-dz-night-faint">مهمان</span>
                          )}
                        </div>
                      </div>
                      {conv.unreadForAdmin > 0 && (
                        <span className="mt-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-dz-primary-600 px-1.5 text-[0.66rem] font-bold text-white">
                          {conv.unreadForAdmin}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ===== detail pane ===== */}
      <div className={`min-h-0 flex-1 flex-col lg:flex ${active ? "flex" : "hidden lg:flex"}`}>
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
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-dz-primary-50 text-dz-primary-300 dark:bg-white/5 dark:text-dz-night-faint">
              <MessageSquare className="size-8" aria-hidden />
            </span>
            <p className="font-heading text-base font-bold text-dz-primary-700 dark:text-dz-night-fg">
              گفت‌وگویی را انتخاب کنید
            </p>
            <p className="max-w-xs text-sm text-dz-primary-400 dark:text-dz-night-muted">
              برای دیدن پیام‌ها و پاسخ‌دادن، یک گفت‌وگو را از فهرست سمت راست انتخاب کنید.
            </p>
          </div>
        )}
      </div>
      </div>{/* end two-column */}
    </div>
  );
}

function KpiCell({ value, label, cls }: { value: number; label: string; cls: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-bold tabular-nums ${cls}`}>{value}</span>
      <span className="text-[0.58rem] text-dz-primary-400 dark:text-dz-night-faint">{label}</span>
    </div>
  );
}
