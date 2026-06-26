"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Power, PowerOff, Trash2, TicketPercent } from "lucide-react";
import { couponsCollection } from "@/lib/admin/collections";
import type { StatusTone } from "@/lib/admin/coupons";
import { toPersianNumbers } from "@/lib/price";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminBulkActionBar } from "@/components/admin/ui/AdminBulkActionBar";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { deleteCoupon, setCouponActive } from "@/app/admin/collections/coupons/actions";

export type CouponRow = {
  id: string;
  code: string;
  title: string | null;
  typeLabel: string;
  typeKey: string;
  valueLabel: string;
  ruleSummary: string;
  usageLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
  datesLabel: string;
  isActive: boolean;
};

const ROUTE = couponsCollection.route;
const headerOf = (key: string) => couponsCollection.columns.find((c) => c.key === key)?.header ?? "";

export function CouponsTable({ rows }: { rows: CouponRow[] }) {
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

  const runToggleActive = (id: string, next: boolean) => {
    setNotice(null);
    startTransition(async () => {
      const res = await setCouponActive(id, next);
      setNotice(
        res.ok
          ? { ok: true, message: next ? "کوپن فعال شد." : "کوپن غیرفعال شد." }
          : { ok: false, message: res.error },
      );
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!confirm) return;
    const target = confirm;
    setNotice(null);
    startTransition(async () => {
      if (target.kind === "single" && target.id) {
        const res = await deleteCoupon(target.id);
        setNotice(res.ok ? { ok: true, message: "کوپن حذف شد." } : { ok: false, message: res.error });
      } else {
        const ids = [...selected];
        const results = await Promise.all(ids.map((id) => deleteCoupon(id)));
        const deleted = results.filter((r) => r.ok).length;
        const blocked = results.length - deleted;
        setSelected(new Set());
        setNotice({
          ok: blocked === 0,
          message:
            blocked === 0
              ? `${toPersianNumbers(deleted)} کوپن حذف شد.`
              : `${toPersianNumbers(deleted)} حذف شد، ${toPersianNumbers(blocked)} مورد به‌دلیل استفاده‌شدن حذف نشد.`,
        });
      }
      setConfirm(null);
      router.refresh();
    });
  };

  const columns: TableColumn<CouponRow>[] = useMemo(
    () => [
      {
        key: "code",
        header: headerOf("code"),
        render: (r) => (
          <Link
            href={`${ROUTE}/${r.id}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg hover:text-dz-a-primary-600 dark:hover:text-dz-a-primary-300"
          >
            {r.code}
          </Link>
        ),
      },
      {
        key: "title",
        header: headerOf("title"),
        render: (r) =>
          r.title ? (
            <span className="text-dz-a-primary-700 dark:text-dz-a-night-fg">{r.title}</span>
          ) : (
            <span className="text-dz-a-primary-300 dark:text-dz-a-night-faint">—</span>
          ),
      },
      {
        key: "type",
        header: headerOf("type"),
        render: (r) => (
          <AdminStatusBadge tone={r.typeKey === "PERCENT" ? "green" : "blue"}>
            {r.typeLabel}
          </AdminStatusBadge>
        ),
      },
      {
        key: "value",
        header: headerOf("value"),
        align: "center",
        render: (r) => (
          <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.valueLabel}</span>
        ),
      },
      {
        key: "rule",
        header: headerOf("rule"),
        render: (r) => (
          <span className="text-xs text-dz-a-primary-600 dark:text-dz-a-night-muted">{r.ruleSummary}</span>
        ),
      },
      {
        key: "usage",
        header: headerOf("usage"),
        align: "center",
        render: (r) => (
          <span dir="ltr" className="text-xs text-dz-a-primary-700 dark:text-dz-a-night-fg">
            {r.usageLabel}
          </span>
        ),
      },
      {
        key: "status",
        header: headerOf("status"),
        align: "center",
        render: (r) => <AdminStatusBadge tone={r.statusTone}>{r.statusLabel}</AdminStatusBadge>,
      },
      {
        key: "dates",
        header: headerOf("dates"),
        render: (r) => <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{r.datesLabel}</span>,
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
              className="rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg"
            >
              <Pencil className="size-4" />
            </Link>
            <button
              type="button"
              title={r.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
              disabled={pending}
              onClick={() => runToggleActive(r.id, !r.isActive)}
              className="rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg disabled:opacity-50"
            >
              {r.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            </button>
            <button
              type="button"
              title="حذف"
              disabled={pending}
              onClick={() => setConfirm({ kind: "single", id: r.id })}
              className="rounded-lg p-1.5 text-dz-a-error/70 dark:text-dz-a-error-300 hover:bg-dz-a-error/10 hover:text-dz-a-error dark:hover:text-dz-a-error-300 disabled:opacity-50"
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
            <TicketPercent className="size-10 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
            <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">کوپنی مطابق این نمایش یافت نشد.</p>
            <Link
              href={`${ROUTE}/new`}
              className="text-sm font-medium text-dz-a-primary-600 dark:text-dz-a-primary-300 hover:text-dz-a-primary-800 dark:hover:text-dz-a-night-fg"
            >
              {couponsCollection.addLabel}
            </Link>
          </div>
        }
      />

      <AdminBulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirm({ kind: "bulk" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dz-a-error px-3 py-1.5 text-xs font-medium text-white hover:bg-dz-a-error/90 disabled:opacity-60"
        >
          <Trash2 className="size-3.5" />
          حذف انتخاب‌ها
        </button>
      </AdminBulkActionBar>

      <AdminConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "bulk" ? "حذف کوپن‌های انتخاب‌شده" : "حذف کوپن"}
        description={
          confirm?.kind === "bulk"
            ? "کوپن‌هایی که در سفارش یا سبد خرید استفاده شده‌اند حذف نمی‌شوند."
            : "این عمل قابل بازگشت نیست. کوپن‌های استفاده‌شده حذف نمی‌شوند (به‌جای آن غیرفعال کنید)."
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
