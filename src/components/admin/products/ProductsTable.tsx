"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, PackagePlus, Pencil, Trash2 } from "lucide-react";
import { productsCollection } from "@/lib/admin/collections";
import { toPersianNumbers } from "@/lib/price";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminBulkActionBar } from "@/components/admin/ui/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { deleteProduct, duplicateProduct } from "@/app/admin/collections/products/actions";

export type ProductRow = {
  id: string;
  title: string;
  slug: string;
  categoryTitle: string;
  basePriceLabel: string;
  unitLabel: string;
  variantCount: number;
  stockTotal: number;
  priceRangeLabel: string;
  isActive: boolean;
  updatedAtLabel: string;
};

const ROUTE = productsCollection.route;
const headerOf = (key: string) =>
  productsCollection.columns.find((c) => c.key === key)?.header ?? "";

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
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
      const res = await duplicateProduct(id);
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
        const res = await deleteProduct(target.id);
        setNotice(res.ok ? { ok: true, message: "محصول حذف شد." } : { ok: false, message: res.error });
      } else {
        const ids = [...selected];
        const results = await Promise.all(ids.map((id) => deleteProduct(id)));
        const deleted = results.filter((r) => r.ok).length;
        const blocked = results.length - deleted;
        setSelected(new Set());
        setNotice({
          ok: blocked === 0,
          message:
            blocked === 0
              ? `${toPersianNumbers(deleted)} محصول حذف شد.`
              : `${toPersianNumbers(deleted)} حذف شد، ${toPersianNumbers(blocked)} مورد به‌دلیل وابستگی حذف نشد.`,
        });
      }
      setConfirm(null);
      router.refresh();
    });
  };

  const columns: TableColumn<ProductRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: headerOf("title"),
        render: (r) => (
          <Link href={`${ROUTE}/${r.id}`} className="block font-medium text-dz-primary-800 hover:text-dz-primary-600 dark:text-dz-night-fg dark:hover:text-dz-primary-300">
            {r.title}
            <span dir="ltr" className="mt-0.5 block text-start font-mono text-xs text-dz-primary-400 dark:text-dz-night-faint">
              {r.slug}
            </span>
          </Link>
        ),
      },
      { key: "category", header: headerOf("category"), render: (r) => <span className="text-dz-primary-700 dark:text-dz-night-fg">{r.categoryTitle}</span> },
      {
        key: "basePrice",
        header: headerOf("basePrice"),
        align: "center",
        render: (r) => (
          <span className="text-dz-primary-700 dark:text-dz-night-fg">
            {r.basePriceLabel}
            <span className="mr-1 text-xs text-dz-primary-400 dark:text-dz-night-faint">/ {r.unitLabel}</span>
          </span>
        ),
      },
      {
        key: "variants",
        header: headerOf("variants"),
        align: "center",
        render: (r) =>
          r.variantCount > 0 ? (
            <span className="text-dz-primary-700 dark:text-dz-night-fg">{toPersianNumbers(r.variantCount)}</span>
          ) : (
            <span className="text-dz-primary-300 dark:text-dz-night-faint">—</span>
          ),
      },
      {
        key: "stock",
        header: headerOf("stock"),
        align: "center",
        render: (r) => <span className="text-dz-primary-700 dark:text-dz-night-fg">{toPersianNumbers(r.stockTotal)}</span>,
      },
      {
        key: "priceRange",
        header: headerOf("priceRange"),
        align: "center",
        render: (r) =>
          r.variantCount > 0 ? (
            <span className="text-xs text-dz-primary-600 dark:text-dz-primary-300">{r.priceRangeLabel}</span>
          ) : (
            <span className="text-dz-primary-300 dark:text-dz-night-faint">—</span>
          ),
      },
      {
        key: "active",
        header: headerOf("active"),
        align: "center",
        render: (r) => (
          <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>
            {r.isActive ? "فعال" : "غیرفعال"}
          </AdminStatusBadge>
        ),
      },
      { key: "updatedAt", header: headerOf("updatedAt"), render: (r) => <span className="text-xs text-dz-primary-500 dark:text-dz-night-muted">{r.updatedAtLabel}</span> },
      {
        key: "actions",
        header: "",
        align: "end",
        render: (r) => (
          <div className="flex items-center justify-end gap-1">
            <Link href={`${ROUTE}/${r.id}`} title="ویرایش" aria-label={`ویرایش ${r.title}`} className="focus-ring rounded-lg p-1.5 text-dz-primary-500 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg">
              <Pencil className="size-4" />
            </Link>
            <button type="button" title="تکثیر" aria-label={`تکثیر ${r.title}`} disabled={pending} onClick={() => runDuplicate(r.id)} className="focus-ring rounded-lg p-1.5 text-dz-primary-500 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-700 disabled:opacity-50 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg">
              <Copy className="size-4" />
            </button>
            <button type="button" title="حذف" aria-label={`حذف ${r.title}`} disabled={pending} onClick={() => setConfirm({ kind: "single", id: r.id })} className="focus-ring rounded-lg p-1.5 text-dz-error/70 transition-colors hover:bg-dz-error/10 hover:text-dz-error disabled:opacity-50 dark:text-dz-error-300/80 dark:hover:bg-dz-error/15 dark:hover:text-dz-error-300">
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
            <div className="flex size-14 items-center justify-center rounded-2xl bg-dz-primary-50 text-dz-primary-400 ring-1 ring-dz-primary-100 dark:bg-white/5 dark:text-dz-night-faint dark:ring-dz-night-border">
              <PackagePlus className="size-7" />
            </div>
            <p className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">محصولی یافت نشد</p>
            <p className="max-w-sm text-sm text-dz-primary-500 dark:text-dz-night-muted">
              با این جستجو/فیلتر محصولی پیدا نشد. اولین محصول دشت‌زاد را اضافه کنید.
            </p>
            <Link href={`${ROUTE}/new`} className="focus-ring mt-1 inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700">
              <PackagePlus className="size-4" />
              {productsCollection.addLabel}
            </Link>
          </div>
        }
      />

      <AdminBulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button type="button" disabled={pending} onClick={() => setConfirm({ kind: "bulk" })} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-dz-error px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dz-error/90 disabled:opacity-60">
          <Trash2 className="size-3.5" />
          حذف انتخاب‌ها
        </button>
      </AdminBulkActionBar>

      <AdminConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "bulk" ? "حذف محصولات انتخاب‌شده" : "حذف محصول"}
        description="محصولاتی که در سفارش یا سبد استفاده شده‌اند حذف نمی‌شوند. این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        danger
        loading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
