"use client";

import { useMemo } from "react";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from "lucide-react";
import type { AdminConversationListItem } from "@/lib/chat/types";
import { STATUS_LABEL } from "@/lib/chat/types";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: "primary" | "green" | "amber" | "red" | "purple";
  sub?: string;
}) {
  const colorMap = {
    primary: "bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300",
    green: "bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{label}</p>
          <p className="mt-1.5 font-heading text-3xl font-bold tabular-nums text-dz-a-primary-800 dark:text-dz-a-night-fg">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{sub}</p>}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-dz-a-primary-600 dark:text-dz-a-night-fg">{label}</span>
      <div className="flex-1 rounded-full bg-dz-a-primary-100 dark:bg-white/10" style={{ height: 6 }}>
        <div
          className="h-full rounded-full bg-dz-a-primary-500"
          style={{ width: `${pct}%`, transition: "width 600ms ease" }}
        />
      </div>
      <span className="w-8 text-end text-sm font-semibold tabular-nums text-dz-a-primary-700 dark:text-dz-a-night-fg">
        {count}
      </span>
      <span className="w-8 text-end text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{pct}٪</span>
    </div>
  );
}

export function ChatDashboardTab({ conversations }: { conversations: AdminConversationListItem[] }) {
  const stats = useMemo(() => {
    const total = conversations.length;
    const byStatus = {
      NEW: conversations.filter((c) => c.status === "NEW").length,
      OPEN: conversations.filter((c) => c.status === "OPEN").length,
      PENDING: conversations.filter((c) => c.status === "PENDING").length,
      RESOLVED: conversations.filter((c) => c.status === "RESOLVED").length,
    };
    const unread = conversations.reduce((s, c) => s + c.unreadForAdmin, 0);
    const waiting = conversations.filter((c) => c.lastSenderRole === "VISITOR").length;
    const highPriority = conversations.filter((c) => c.aiPriority === "HIGH").length;

    const activeConvs = conversations.filter((c) => c.status !== "RESOLVED");
    const avgWaitMs = activeConvs.length > 0
      ? activeConvs.reduce((s, c) => s + (Date.now() - new Date(c.lastMessageAt).getTime()), 0) / activeConvs.length
      : 0;
    const avgWaitMin = Math.round(avgWaitMs / 60000);

    return { total, byStatus, unread, waiting, highPriority, avgWaitMin };
  }, [conversations]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          داشبورد چت
        </h2>
        <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
          وضعیت لحظه‌ای مکالمات فعال
        </p>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="کل مکالمات" value={stats.total} icon={MessageSquare} color="primary" />
        <StatCard
          label="در انتظار پاسخ"
          value={stats.waiting}
          icon={Clock}
          color="amber"
          sub={`میانگین انتظار: ${stats.avgWaitMin} دقیقه`}
        />
        <StatCard label="پیام‌های خوانده‌نشده" value={stats.unread} icon={AlertCircle} color="red" />
        <StatCard label="اولویت بالا (AI)" value={stats.highPriority} icon={TrendingUp} color="purple" />
      </div>

      {/* status breakdown */}
      <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-6 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <h3 className="mb-4 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          وضعیت مکالمات
        </h3>
        <div className="space-y-3">
          <StatusRow label={STATUS_LABEL.NEW} count={stats.byStatus.NEW} total={stats.total} />
          <StatusRow label={STATUS_LABEL.OPEN} count={stats.byStatus.OPEN} total={stats.total} />
          <StatusRow label={STATUS_LABEL.PENDING} count={stats.byStatus.PENDING} total={stats.total} />
          <StatusRow label={STATUS_LABEL.RESOLVED} count={stats.byStatus.RESOLVED} total={stats.total} />
        </div>
      </div>

      {/* empty state */}
      {stats.total === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dz-a-primary-100 bg-white py-16 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <Users size={40} strokeWidth={1.2} className="text-dz-a-primary-300" />
          <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
            هنوز مکالمه‌ای وجود ندارد
          </p>
        </div>
      )}
    </div>
  );
}
