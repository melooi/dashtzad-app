import Link from "next/link";
import { Check, X, Trash2, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge, type BadgeTone } from "@/components/admin/ui/AdminStatusBadge";
import { setSuggestionStatus, deleteSuggestion } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { PENDING: "در انتظار بررسی", APPROVED: "بررسی‌شده", REJECTED: "رد شده" };
const STATUS_TONE: Record<string, BadgeTone> = { PENDING: "amber", APPROVED: "green", REJECTED: "red" };

type Row = {
  id: string;
  name: string;
  phone: string;
  text: string;
  status: string;
  dateLabel: string;
  postTitle: string;
  postSlug: string;
};

export default async function RecipeSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status === "PENDING" || sp.status === "APPROVED" || sp.status === "REJECTED" ? sp.status : undefined;

  const where: Prisma.RecipeSuggestionWhereInput = status ? { status } : {};
  const list = await prisma.recipeSuggestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true, slug: true } } },
    take: 200,
  });
  const pendingCount = await prisma.recipeSuggestion.count({ where: { status: "PENDING" } });

  const rows: Row[] = list.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    text: s.text,
    status: s.status,
    dateLabel: formatJalali(s.createdAt),
    postTitle: s.post?.title ?? "—",
    postSlug: s.post?.slug ?? "",
  }));

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
    { key: "name", header: "فرستنده", render: (r) => <span className="font-medium text-dz-primary-800 dark:text-dz-night-fg">{r.name}</span> },
    { key: "phone", header: "تماس", render: (r) => <span dir="ltr" className="text-xs text-dz-primary-600 dark:text-dz-primary-300">{r.phone}</span> },
    {
      key: "text",
      header: "پیشنهاد",
      render: (r) => <p className="max-w-md whitespace-pre-wrap text-xs leading-6 text-dz-primary-600 dark:text-dz-night-muted">{r.text}</p>,
    },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => <AdminStatusBadge tone={STATUS_TONE[r.status] ?? "gray"}>{STATUS_LABEL[r.status] ?? r.status}</AdminStatusBadge>,
    },
    { key: "date", header: "تاریخ", render: (r) => <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{r.dateLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.status !== "APPROVED" && (
            <form action={setSuggestionStatus}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button type="submit" title="علامت‌گذاری به‌عنوان بررسی‌شده" className="inline-flex rounded-lg p-1.5 text-dz-success hover:bg-dz-success/10">
                <Check className="size-4" />
              </button>
            </form>
          )}
          {r.status !== "REJECTED" && (
            <form action={setSuggestionStatus}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button type="submit" title="رد کردن" className="inline-flex rounded-lg p-1.5 text-dz-primary-400 hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:hover:bg-white/5">
                <X className="size-4" />
              </button>
            </form>
          )}
          <form action={deleteSuggestion}>
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
        title="پیشنهادهای دستور پخت"
        description={`پیشنهادهای کاربران برای بهتر شدن دستورها${pendingCount ? ` · ${pendingCount} مورد در انتظار بررسی` : ""}.`}
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "پیشنهادهای دستور پخت" }]}
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
                { value: "APPROVED", label: "بررسی‌شده" },
                { value: "REJECTED", label: "رد شده" },
              ],
            },
          ]}
        />
      </AdminToolbar>
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={<p className="p-10 text-center text-sm text-dz-primary-400 dark:text-dz-night-faint">هنوز پیشنهادی ثبت نشده.</p>}
      />
    </div>
  );
}
