import Link from "next/link";
import { Check, X, Trash2, ExternalLink, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import { ratingReasonLabel } from "@/lib/blog/recipe";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge, type BadgeTone } from "@/components/admin/ui/AdminStatusBadge";
import { setRatingStatus, deleteRating } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { PENDING: "در انتظار بررسی", APPROVED: "تأییدشده", REJECTED: "رد شده" };
const STATUS_TONE: Record<string, BadgeTone> = { PENDING: "amber", APPROVED: "green", REJECTED: "red" };

type Row = {
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

export default async function RecipeRatingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status === "PENDING" || sp.status === "APPROVED" || sp.status === "REJECTED" ? sp.status : undefined;
  const where = status ? { status } : {};

  const [userRatings, guestRatings, pendingCount] = await Promise.all([
    prisma.postRating.findMany({
      where: where as Prisma.PostRatingWhereInput,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } }, user: { select: { name: true, phoneNumber: true } } },
      take: 200,
    }),
    prisma.recipeGuestRating.findMany({
      where: where as Prisma.RecipeGuestRatingWhereInput,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } } },
      take: 200,
    }),
    prisma.postRating.count({ where: { status: "PENDING" } }).then(async (u) => u + (await prisma.recipeGuestRating.count({ where: { status: "PENDING" } }))),
  ]);

  const rows: Row[] = [
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

  const columns: TableColumn<Row>[] = [
    {
      key: "post",
      header: "دستور",
      render: (r) =>
        r.postSlug ? (
          <Link href={`/blog/${r.postSlug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-dz-primary-700 hover:underline dark:text-dz-primary-300">
            {r.postTitle} <ExternalLink className="size-3" />
          </Link>
        ) : (
          <span className="text-xs text-dz-primary-500">{r.postTitle}</span>
        ),
    },
    {
      key: "value",
      header: "امتیاز",
      align: "center",
      render: (r) => (
        <span className="inline-flex items-center gap-1 font-bold text-dz-primary-800 dark:text-dz-night-fg">
          <Star className="size-3.5 fill-dz-warning text-dz-warning" /> {toPersianNumbers(r.value)}
        </span>
      ),
    },
    {
      key: "identity",
      header: "فرستنده",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg">{r.identity}</span>
          {r.phone && <span dir="ltr" className="text-[11px] text-dz-primary-500 dark:text-dz-night-muted">{r.phone}</span>}
        </div>
      ),
    },
    {
      key: "source",
      header: "نوع",
      align: "center",
      render: (r) => <AdminStatusBadge tone={r.kind === "user" ? "blue" : "gray"}>{r.sourceLabel}</AdminStatusBadge>,
    },
    {
      key: "feedback",
      header: "بازخورد",
      render: (r) => (
        <div className="max-w-sm">
          {r.reasons.length > 0 && (
            <div className="mb-1 flex flex-wrap gap-1">
              {r.reasons.map((k) => (
                <span key={k} className="rounded-full bg-dz-primary-50 px-2 py-0.5 text-[11px] text-dz-primary-600 dark:bg-white/5 dark:text-dz-night-muted">
                  {ratingReasonLabel(k)}
                </span>
              ))}
            </div>
          )}
          {r.feedbackText && <p className="whitespace-pre-wrap text-xs leading-6 text-dz-primary-600 dark:text-dz-night-muted">{r.feedbackText}</p>}
          {r.reasons.length === 0 && !r.feedbackText && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">—</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => <AdminStatusBadge tone={STATUS_TONE[r.status] ?? "gray"}>{STATUS_LABEL[r.status] ?? r.status}</AdminStatusBadge>,
    },
    { key: "date", header: "تاریخ", render: (r) => <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{formatJalali(r.createdAt)}</span> },
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
              <button type="submit" title="تأیید (در میانگین عمومی اعمال می‌شود)" className="inline-flex rounded-lg p-1.5 text-dz-success hover:bg-dz-success/10">
                <Check className="size-4" />
              </button>
            </form>
          )}
          {r.status !== "REJECTED" && (
            <form action={setRatingStatus}>
              <input type="hidden" name="kind" value={r.kind} />
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button type="submit" title="رد کردن" className="inline-flex rounded-lg p-1.5 text-dz-primary-400 hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:hover:bg-white/5">
                <X className="size-4" />
              </button>
            </form>
          )}
          <form action={deleteRating}>
            <input type="hidden" name="kind" value={r.kind} />
            <input type="hidden" name="id" value={r.id} />
            <button type="submit" title="حذف" className="inline-flex rounded-lg p-1.5 text-dz-error/70 hover:bg-dz-error/10 hover:text-dz-error">
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="امتیازهای دستور پخت"
        description={`فقط امتیازهای «تأییدشده» در میانگین عمومی اعمال می‌شوند${pendingCount ? ` · ${toPersianNumbers(pendingCount)} مورد در انتظار بررسی` : ""}.`}
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "امتیازهای دستور پخت" }]}
      />
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
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => `${r.kind}:${r.id}`}
        empty={<p className="p-10 text-center text-sm text-dz-primary-400 dark:text-dz-night-faint">هنوز امتیازی ثبت نشده.</p>}
      />
    </div>
  );
}
