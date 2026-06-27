import Link from "next/link";
import { Check, X, Trash2, ExternalLink, Star, MessageSquare } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import { ratingReasonLabel } from "@/lib/blog/recipe";
import { listAdminComments } from "@/lib/admin/article-comments";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge, type BadgeTone } from "@/components/admin/ui/AdminStatusBadge";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { CommentRow } from "@/components/admin/comments/CommentModeration";
import { setRatingStatus, deleteRating } from "../recipe-ratings/actions";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { id: "comments", label: "دیدگاه‌ها" },
  { id: "ratings", label: "امتیازها" },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأییدشده",
  REJECTED: "رد شده",
};
const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

type RatingRow = {
  kind: "user" | "guest";
  id: string;
  value: number;
  identity: string;
  phone: string | null;
  sourceLabel: string;
  reasons: string[];
  feedbackText: string | null;
  status: string;
  createdAt: Date;
  postTitle: string;
  postSlug: string;
};

const COMMENT_TABS = [
  { id: "all", label: "همه" },
  { id: "PENDING", label: "در انتظار" },
  { id: "APPROVED", label: "منتشر شده" },
  { id: "REJECTED", label: "رد شده" },
] as const;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const section: Section =
    sp.section === "ratings" ? "ratings" : "comments";

  return (
    <div>
      <AdminPageHeader
        title="امتیازها و دیدگاه‌ها"
        description="مودریشن دیدگاه‌های نوشته‌ها و امتیازهای دستور پخت در یک صفحه."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "امتیازها و دیدگاه‌ها" },
        ]}
      />

      {/* Section tabs */}
      <div className="mb-6 flex gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`/admin/content/feedback?section=${s.id}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              section === s.id
                ? "bg-dz-a-primary-600 text-white"
                : "border border-dz-a-primary-200 text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {section === "comments" ? (
        <CommentsSection tab={sp.tab} />
      ) : (
        <RatingsSection status={sp.status} />
      )}
    </div>
  );
}

// ─── Comments section ────────────────────────────────────────────────────────

async function CommentsSection({ tab }: { tab?: string }) {
  const activeTab = ["all", "PENDING", "APPROVED", "REJECTED"].includes(tab ?? "")
    ? (tab ?? "all")
    : "all";

  const all = await listAdminComments();
  const pending = all.filter((c) => c.status === "PENDING").length;
  const rows = activeTab === "all" ? all : all.filter((c) => c.status === activeTab);

  return (
    <>
      <div className="mb-4 flex gap-2">
        {COMMENT_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/content/feedback?section=comments&tab=${t.id}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-dz-a-primary-600 text-white"
                : "border border-dz-a-primary-200 text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            }`}
          >
            {t.label}
            {t.id === "PENDING" && pending > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  activeTab === "PENDING" ? "bg-white/20" : "bg-dz-a-warning/15 text-dz-a-warning"
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
          mode={activeTab === "all" ? "empty" : "no-results"}
          icon={<MessageSquare className="size-7" />}
          title="دیدگاهی وجود ندارد"
          description="دیدگاه‌هایی که کاربران برای نوشته‌های مجله می‌نویسند اینجا نمایش داده می‌شوند."
          clearFiltersHref="/admin/content/feedback?section=comments"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Ratings section ─────────────────────────────────────────────────────────

async function RatingsSection({ status }: { status?: string }) {
  const statusFilter =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? status
      : undefined;
  const where = statusFilter ? { status: statusFilter } : {};

  const [userRatings, guestRatings, pendingCount] = await Promise.all([
    prisma.postRating.findMany({
      where: where as Prisma.PostRatingWhereInput,
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { title: true, slug: true } },
        user: { select: { name: true, phoneNumber: true } },
      },
      take: 200,
    }),
    prisma.recipeGuestRating.findMany({
      where: where as Prisma.RecipeGuestRatingWhereInput,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } } },
      take: 200,
    }),
    prisma.postRating
      .count({ where: { status: "PENDING" } })
      .then(
        async (u) =>
          u + (await prisma.recipeGuestRating.count({ where: { status: "PENDING" } })),
      ),
  ]);

  const rows: RatingRow[] = [
    ...userRatings.map((r) => ({
      kind: "user" as const,
      id: r.id,
      value: r.value,
      identity: r.user?.name ?? r.user?.phoneNumber ?? "کاربر",
      phone: r.user?.phoneNumber ?? null,
      sourceLabel: "کاربر",
      reasons: r.feedbackReasons,
      feedbackText: r.feedbackText,
      status: r.status,
      createdAt: r.createdAt,
      postTitle: r.post?.title ?? "—",
      postSlug: r.post?.slug ?? "",
    })),
    ...guestRatings.map((r) => ({
      kind: "guest" as const,
      id: r.id,
      value: r.value,
      identity: r.guestName ?? "مهمان",
      phone: r.guestPhone,
      sourceLabel: "مهمان",
      reasons: r.feedbackReasons,
      feedbackText: r.feedbackText,
      status: r.status,
      createdAt: r.createdAt,
      postTitle: r.post?.title ?? "—",
      postSlug: r.post?.slug ?? "",
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const columns: TableColumn<RatingRow>[] = [
    {
      key: "post",
      header: "دستور",
      render: (r) =>
        r.postSlug ? (
          <Link
            href={`/blog/${r.postSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-dz-a-primary-700 hover:underline dark:text-dz-a-primary-300"
          >
            {r.postTitle} <ExternalLink className="size-3" />
          </Link>
        ) : (
          <span className="text-xs text-dz-a-primary-500">{r.postTitle}</span>
        ),
    },
    {
      key: "value",
      header: "امتیاز",
      align: "center",
      render: (r) => (
        <span className="inline-flex items-center gap-1 font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          <Star className="size-3.5 fill-dz-a-warning text-dz-a-warning" />{" "}
          {toPersianNumbers(r.value)}
        </span>
      ),
    },
    {
      key: "identity",
      header: "فرستنده",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
            {r.identity}
          </span>
          {r.phone && (
            <span dir="ltr" className="text-[11px] text-dz-a-primary-500 dark:text-dz-a-night-muted">
              {r.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "source",
      header: "نوع",
      align: "center",
      render: (r) => (
        <AdminStatusBadge tone={r.kind === "user" ? "blue" : "gray"}>
          {r.sourceLabel}
        </AdminStatusBadge>
      ),
    },
    {
      key: "feedback",
      header: "بازخورد",
      render: (r) => (
        <div className="max-w-sm">
          {r.reasons.length > 0 && (
            <div className="mb-1 flex flex-wrap gap-1">
              {r.reasons.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-dz-a-primary-50 px-2 py-0.5 text-[11px] text-dz-a-primary-600 dark:bg-white/5 dark:text-dz-a-night-muted"
                >
                  {ratingReasonLabel(k)}
                </span>
              ))}
            </div>
          )}
          {r.feedbackText && (
            <p className="whitespace-pre-wrap text-xs leading-6 text-dz-a-primary-600 dark:text-dz-a-night-muted">
              {r.feedbackText}
            </p>
          )}
          {r.reasons.length === 0 && !r.feedbackText && (
            <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">—</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => (
        <AdminStatusBadge tone={STATUS_TONE[r.status] ?? "gray"}>
          {STATUS_LABEL[r.status] ?? r.status}
        </AdminStatusBadge>
      ),
    },
    {
      key: "date",
      header: "تاریخ",
      render: (r) => (
        <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          {formatJalali(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.status !== "APPROVED" && (
            <form action={setRatingStatus}>
              <input type="hidden" name="kind" value={r.kind} />
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button
                type="submit"
                title="تأیید"
                className="inline-flex rounded-lg p-1.5 text-dz-a-success hover:bg-dz-a-success/10"
              >
                <Check className="size-4" />
              </button>
            </form>
          )}
          {r.status !== "REJECTED" && (
            <form action={setRatingStatus}>
              <input type="hidden" name="kind" value={r.kind} />
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button
                type="submit"
                title="رد کردن"
                className="inline-flex rounded-lg p-1.5 text-dz-a-primary-400 hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:hover:bg-white/5"
              >
                <X className="size-4" />
              </button>
            </form>
          )}
          <form action={deleteRating}>
            <input type="hidden" name="kind" value={r.kind} />
            <input type="hidden" name="id" value={r.id} />
            <button
              type="submit"
              title="حذف"
              className="inline-flex rounded-lg p-1.5 text-dz-a-error/70 hover:bg-dz-a-error/10 hover:text-dz-a-error"
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminToolbar>
        <AdminFilterBar
          filters={[
            {
              paramKey: "status",
              label: "وضعیت",
              options: [
                { value: "", label: "همه" },
                { value: "PENDING", label: "در انتظار بررسی" },
                { value: "APPROVED", label: "تأییدشده" },
                { value: "REJECTED", label: "رد شده" },
              ],
            },
          ]}
        />
      </AdminToolbar>
      {pendingCount > 0 && (
        <p className="mb-4 text-sm text-dz-a-warning">
          {toPersianNumbers(pendingCount)} امتیاز در انتظار بررسی — فقط امتیازهای «تأییدشده» در میانگین عمومی اعمال می‌شوند.
        </p>
      )}
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => `${r.kind}-${r.id}`}
        empty={
          <AdminListEmptyState
            mode={statusFilter ? "no-results" : "empty"}
            icon={<Star className="size-7" />}
            title="امتیازی ثبت نشده"
            description="امتیازهایی که کاربران برای دستورهای پخت ثبت می‌کنند اینجا نمایش داده می‌شوند."
            clearFiltersHref="/admin/content/feedback?section=ratings"
          />
        }
      />
    </>
  );
}
