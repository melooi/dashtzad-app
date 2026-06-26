"use client";

import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { PricingGrid } from "./PricingGrid";
import { EditablePriceCell } from "./EditablePriceCell";
import { updatePackagingCostAction } from "@/app/admin/collections/pricing/actions";

export type PackagingCostRow = {
  id: string;
  title: string;
  typeLabel: string;
  capacityLabel: string;
  costToman: number;
  isActive: boolean;
  updatedAtLabel: string;
};

export function PackagingCostTable({ rows }: { rows: PackagingCostRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dz-primary-100 bg-white p-8 text-center text-sm text-dz-primary-400 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-faint">
        گزینه‌ی بسته‌بندی ثبت نشده.
      </div>
    );
  }

  return (
    <PricingGrid className="overflow-x-auto rounded-2xl border border-dz-primary-100 bg-white shadow-xs dark:border-dz-night-border dark:bg-dz-night-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-dz-primary-100 bg-dz-primary-50/40 text-xs text-dz-primary-500 dark:border-dz-night-border dark:bg-white/5 dark:text-dz-night-muted">
            <th className="px-3 py-2.5 text-start font-medium">عنوان</th>
            <th className="px-3 py-2.5 text-center font-medium">نوع</th>
            <th className="px-3 py-2.5 text-center font-medium">ظرفیت</th>
            <th className="px-3 py-2.5 text-center font-medium" title="هزینه‌ی بسته‌بندی (تومان). تغییر آن، مدل‌های فروشِ قفل‌نشده را بازمحاسبه می‌کند.">
              هزینه (تومان)
            </th>
            <th className="px-3 py-2.5 text-center font-medium">وضعیت</th>
            <th className="px-3 py-2.5 text-center font-medium">آخرین ویرایش</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-dz-primary-50 last:border-0 dark:border-dz-night-border">
              <td className="px-3 py-2.5 align-middle text-dz-primary-800 dark:text-dz-night-fg">{p.title}</td>
              <td className="px-3 py-2.5 text-center align-middle">
                <AdminStatusBadge tone="blue">{p.typeLabel}</AdminStatusBadge>
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-dz-primary-600 dark:text-dz-primary-300">
                {p.capacityLabel}
              </td>
              <td className="px-3 py-2.5 text-center align-middle">
                <EditablePriceCell
                  value={p.costToman}
                  kind="packaging"
                  ariaLabel={`هزینه‌ی بسته‌بندی ${p.title}`}
                  title="هزینه‌ی بسته‌بندی (تومان) — برای ویرایش کلیک کنید"
                  onSave={(v) => updatePackagingCostAction(p.id, String(v ?? ""))}
                />
              </td>
              <td className="px-3 py-2.5 text-center align-middle">
                {p.isActive ? (
                  <AdminStatusBadge tone="green">فعال</AdminStatusBadge>
                ) : (
                  <AdminStatusBadge tone="gray">غیرفعال</AdminStatusBadge>
                )}
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-xs text-dz-primary-400 dark:text-dz-night-faint">
                {p.updatedAtLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PricingGrid>
  );
}
