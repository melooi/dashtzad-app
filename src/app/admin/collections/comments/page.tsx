import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listAdminComments } from "@/lib/admin/article-comments";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { CommentRow } from "@/components/admin/comments/CommentModeration";
import { toPersianNumbers } from "@/lib/price";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { id: "all", label: "همه" },
  { id: "PENDING", label: "در انتظار" },
  { id: "APPROVED", label: "منتشر شده" },
  { id: "REJECTED", label: "رد شده" },
] as const;

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = ["all", "PENDING", "APPROVED", "REJECTED"].includes(sp.tab ?? "")
    ? (sp.tab ?? "all")
    : "all";

  const all = await listAdminComments();
  const pending = all.filter((c) => c.status === "PENDING").length;

  const rows =
    tab === "all" ? all : all.filter((c) => c.status === tab);

  return (
    <div>
      <AdminPageHeader
        title="دیدگاه‌های نوشته‌ها"
        description="بررسی و مودریشن دیدگاه‌هایی که کاربران برای مقاله‌ها می‌نویسند."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "دیدگاه‌های نوشته‌ها" },
        ]}
      />

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/collections/comments?tab=${t.id}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-dz-a-primary-600 text-white"
                : "border border-dz-a-primary-200 text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            }`}
          >
            {t.label}
            {t.id === "PENDING" && pending > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  tab === "PENDING" ? "bg-white/20" : "bg-dz-a-warning/15 text-dz-a-warning"
                }`}
              >
                {toPersianNumbers(pending)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <AdminListEmptyState
          mode={tab === "all" ? "empty" : "no-results"}
          icon={<MessageSquare className="size-7" />}
          title="دیدگاهی وجود ندارد"
          description="دیدگاه‌هایی که کاربران برای مقاله‌های مجله می‌نویسند اینجا برای بررسی و تأیید نمایش داده می‌شوند."
          clearFiltersHref="/admin/collections/comments"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
}
