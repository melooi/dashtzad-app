"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { categoriesCollection } from "@/lib/admin/collections";
import { toPersianNumbers } from "@/lib/price";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminBulkActionBar } from "@/components/admin/ui/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { deleteCategory, duplicateCategory } from "@/app/admin/collections/categories/actions";

export type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  type: string;
  typeLabel: string;
  parentTitle: string | null;
  depth: number;
  childCount: number;
  usageCount: number;
  usageUnit: string;
  updatedAtLabel: string;
};

const ROUTE = categoriesCollection.route;
const headerOf = (key: string) =>
  categoriesCollection.columns.find((c) => c.key === key)?.header ?? "";

export function CategoriesTable({ rows }: { rows: CategoryRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ kind: "single" | "bulk"; id?: string } | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());

  const runDuplicate = (id: string) => {
    setNotice(null);
    startTransition(async () => {
      const res = await duplicateCategory(id);
      if (res.ok) router.push(`${ROUTE}/${res.id}`);
      else setNotice({ ok: false, message: res.error });
    });
  };

  const confirmDelete = () => {
    if (!confirm) return;
    const target = confirm;
    setNotice(null);
    startTransition(async () => {
      if (target.kind === "single" && target.id) {
        const res = await deleteCategory(target.id);
        setNotice(
          res.ok
            ? { ok: true, message: "دسته‌بندی حذف شد." }
            : { ok: false, message: res.error },
        );
      } else {
        const ids = [...selected];
        const results = await Promise.all(ids.map((id) => deleteCategory(id)));
        const deleted = results.filter((r) => r.ok).length;
        const blocked = results.length - deleted;
        setSelected(new Set());
        setNotice({
          ok: blocked === 0,
          message:
            blocked === 0
              ? `${toPersianNumbers(deleted)} دسته حذف شد.`
              : `${toPersianNumbers(deleted)} حذف شد، ${toPersianNumbers(blocked)} مورد به‌دلیل وابستگی حذف نشد.`,
        });
      }
      setConfirm(null);
      router.refresh();
    });
  };

  const columns: TableColumn<CategoryRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: headerOf("title"),
        render: (r) => (
          <Link
            href={`${ROUTE}/${r.id}`}
            className="flex items-center font-medium text-dz-primary-800 dark:text-dz-night-fg hover:text-dz-primary-600 dark:hover:text-dz-primary-300"
            style={{ paddingInlineStart: `${r.depth * 18}px` }}
          >
            {r.depth > 0 && <span className="ms-1 text-dz-primary-300 dark:text-dz-night-faint">↳</span>}
            {r.title}
          </Link>
        ),
      },
      {
        key: "slug",
        header: headerOf("slug"),
        render: (r) => (
          <span dir="ltr" className="block text-start font-mono text-xs text-dz-primary-500 dark:text-dz-night-muted">
            {r.slug}
          </span>
        ),
      },
      {
        key: "type",
        header: headerOf("type"),
        render: (r) => (
          <AdminStatusBadge tone={r.type === "PRODUCT" ? "green" : "blue"}>
            {r.typeLabel}
          </AdminStatusBadge>
        ),
      },
      {
        key: "parent",
        header: headerOf("parent"),
        render: (r) =>
          r.parentTitle ? (
            <span className="text-dz-primary-700 dark:text-dz-night-fg">{r.parentTitle}</span>
          ) : (
            <span className="text-dz-primary-300 dark:text-dz-night-faint">—</span>
          ),
      },
      {
        key: "children",
        header: headerOf("children"),
        align: "center",
        render: (r) =>
          r.childCount > 0 ? (
            <span className="text-dz-primary-700 dark:text-dz-night-fg">{toPersianNumbers(r.childCount)}</span>
          ) : (
            <span className="text-dz-primary-300 dark:text-dz-night-faint">—</span>
          ),
      },
      {
        key: "usage",
        header: headerOf("usage"),
        align: "center",
        render: (r) =>
          r.usageCount > 0 ? (
            <span className="text-dz-primary-700 dark:text-dz-night-fg">
              {toPersianNumbers(r.usageCount)} {r.usageUnit}
            </span>
          ) : (
            <span className="text-dz-primary-300 dark:text-dz-night-faint">—</span>
          ),
      },
      {
        key: "updatedAt",
        header: headerOf("updatedAt"),
        render: (r) => <span className="text-xs text-dz-primary-500 dark:text-dz-night-muted">{r.updatedAtLabel}</span>,
      },
      {
        key: "actions",
        header: headerOf("actions"),
        align: "end",
        render: (r) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`${ROUTE}/${r.id}`}
              title="ویرایش"
              className="rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted hover:bg-dz-primary-50 dark:hover:bg-white/5 hover:text-dz-primary-700 dark:hover:text-dz-night-fg"
            >
              <Pencil className="size-4" />
            </Link>
            <button
              type="button"
              title="تکثیر"
              disabled={pending}
              onClick={() => runDuplicate(r.id)}
              className="rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted hover:bg-dz-primary-50 dark:hover:bg-white/5 hover:text-dz-primary-700 dark:hover:text-dz-night-fg disabled:opacity-50"
            >
              <Copy className="size-4" />
            </button>
            <button
              type="button"
              title="حذف"
              disabled={pending}
              onClick={() => setConfirm({ kind: "single", id: r.id })}
              className="rounded-lg p-1.5 text-dz-error/70 dark:text-dz-error-300 hover:bg-dz-error/10 hover:text-dz-error dark:hover:text-dz-error-300 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [pending],
  );

  return (
    <div>
      {notice && (
        <div className="mb-4">
          {notice.ok ? (
            <AdminSuccessNotice message={notice.message} onDismiss={() => setNotice(null)} />
          ) : (
            <AdminFormError message={notice.message} />
          )}
        </div>
      )}

      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        selectable
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        empty={
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <FolderPlus className="size-10 text-dz-primary-300 dark:text-dz-night-faint" />
            <p className="text-sm text-dz-primary-500 dark:text-dz-night-muted">دسته‌بندی‌ای مطابق این نمایش یافت نشد.</p>
            <Link
              href={`${ROUTE}/new`}
              className="text-sm font-medium text-dz-primary-600 dark:text-dz-primary-300 hover:text-dz-primary-800 dark:hover:text-dz-night-fg"
            >
              {categoriesCollection.addLabel}
            </Link>
          </div>
        }
      />

      <AdminBulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirm({ kind: "bulk" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dz-error px-3 py-1.5 text-xs font-medium text-white hover:bg-dz-error/90 disabled:opacity-60"
        >
          <Trash2 className="size-3.5" />
          حذف انتخاب‌ها
        </button>
      </AdminBulkActionBar>

      <AdminConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "bulk" ? "حذف دسته‌های انتخاب‌شده" : "حذف دسته‌بندی"}
        description={
          confirm?.kind === "bulk"
            ? "دسته‌هایی که زیرمجموعه، محصول یا نوشته دارند حذف نخواهند شد."
            : "این عمل قابل بازگشت نیست. دسته‌های دارای وابستگی حذف نمی‌شوند."
        }
        confirmLabel="حذف"
        danger
        loading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
