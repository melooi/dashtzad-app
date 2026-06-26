"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, Lock, LockOpen, Eye, EyeOff } from "lucide-react";
import { toPersianNumbers, toPersianNumbersWithComma } from "@/lib/price";
import { PRICE_MESSAGES } from "@/lib/admin/pricing-input";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { PricingGrid } from "./PricingGrid";
import { EditablePriceCell } from "./EditablePriceCell";
import { PricingToggleCell } from "./PricingToggleCell";
import {
  updateProductBasePriceAction,
  updateVariantPriceAction,
  updateVariantOffPriceAction,
  updateVariantStockAction,
  toggleVariantPriceLockAction,
  toggleVariantActiveAction,
} from "@/app/admin/collections/pricing/actions";

export type VariantPriceRow = {
  id: string;
  modelLabel: string;
  sku: string;
  calculatedToman: number;
  priceToman: number;
  offPriceToman: number | null;
  stock: number;
  isActive: boolean;
  isPriceLocked: boolean;
};

export type ProductPriceRow = {
  id: string;
  title: string;
  basePriceToman: number;
  unitLabel: string;
  variantCount: number;
  rangeLabel: string;
  lockedCount: number;
  variants: VariantPriceRow[];
};

const COL_COUNT = 6;

export function ProductPricingTable({ rows }: { rows: ProductPriceRow[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggleOpen = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-8 text-center text-sm text-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-faint">
        محصولی ثبت نشده.
      </div>
    );
  }

  return (
    <PricingGrid className="overflow-x-auto rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/60 text-xs font-medium text-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-white/5 dark:text-dz-a-night-muted">
            <th className="px-3 py-3.5 text-start font-medium">محصول</th>
            <th className="px-3 py-3.5 text-center font-medium" title="قیمت پایه برای هر واحد؛ مبنای محاسبه‌ی قیمت همه‌ی مدل‌های فروش. به تومان وارد می‌شود.">
              قیمت پایه (تومان)
            </th>
            <th className="px-3 py-3.5 text-center font-medium">تعداد مدل</th>
            <th className="px-3 py-3.5 text-center font-medium" title="کمترین تا بیشترین قیمت نهایی مدل‌های فروش این محصول.">
              بازه‌ی قیمت
            </th>
            <th className="px-3 py-3.5 text-center font-medium" title="تعداد مدل‌هایی که قیمتشان به‌صورت دستی قفل شده و با تغییر قیمت پایه/بسته‌بندی تغییر نمی‌کنند.">
              قفل‌شده
            </th>
            <th className="w-10 px-3 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const isOpen = open.has(p.id);
            return (
              <RowGroup
                key={p.id}
                product={p}
                isOpen={isOpen}
                onToggle={() => toggleOpen(p.id)}
              />
            );
          })}
        </tbody>
      </table>
    </PricingGrid>
  );
}

function RowGroup({
  product: p,
  isOpen,
  onToggle,
}: {
  product: ProductPriceRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-dz-a-primary-50 transition-colors last:border-0 hover:bg-dz-a-primary-50/40 dark:border-dz-a-night-border dark:hover:bg-white/5">
        <td className="px-3 py-3 align-middle">
          <Link
            href={`/admin/collections/products/${p.id}`}
            className="font-medium text-dz-a-primary-800 hover:text-dz-a-primary-600 dark:text-dz-a-night-fg dark:hover:text-dz-a-primary-300"
          >
            {p.title}
          </Link>
        </td>
        <td className="px-3 py-3 text-center align-middle">
          <EditablePriceCell
            value={p.basePriceToman}
            kind="money-required"
            ariaLabel={`قیمت پایه ${p.title}`}
            title="قیمت پایه (تومان) — برای ویرایش کلیک کنید"
            onSave={(v) => updateProductBasePriceAction(p.id, String(v ?? ""))}
          />
          <span className="ms-1 text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">/ {p.unitLabel}</span>
        </td>
        <td className="px-3 py-3 text-center align-middle text-dz-a-primary-700 dark:text-dz-a-night-fg">
          {toPersianNumbers(p.variantCount)}
        </td>
        <td className="px-3 py-3 text-center align-middle text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300">
          {p.rangeLabel}
        </td>
        <td className="px-3 py-3 text-center align-middle">
          {p.lockedCount > 0 ? (
            <AdminStatusBadge tone="amber">{toPersianNumbers(p.lockedCount)}</AdminStatusBadge>
          ) : (
            <span className="text-dz-a-primary-300 dark:text-dz-a-night-faint">—</span>
          )}
        </td>
        <td className="px-3 py-3 text-center align-middle">
          {p.variantCount > 0 && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-label={isOpen ? "بستن مدل‌ها" : "نمایش مدل‌ها"}
              className="focus-ring rounded-lg p-1 text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-600 dark:text-dz-a-night-muted dark:hover:bg-white/5"
            >
              {isOpen ? <ChevronDown className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          )}
        </td>
      </tr>
      {isOpen && p.variants.length > 0 && (
        <tr className="border-b border-dz-a-primary-50 dark:border-dz-a-night-border">
          <td colSpan={COL_COUNT} className="bg-dz-a-primary-50/30 px-3 py-3 dark:bg-white/2">
            <VariantSubTable variants={p.variants} />
          </td>
        </tr>
      )}
    </>
  );
}

function VariantSubTable({ variants }: { variants: VariantPriceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/60 text-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-white/5 dark:text-dz-a-night-muted">
            <th className="px-2 py-2 text-start font-medium">مدل فروش</th>
            <th className="px-2 py-2 text-center font-medium" title="خروجی موتور قیمت (پایه × وزن + بسته‌بندی). فقط خواندنی.">
              محاسبه‌شده (ت)
            </th>
            <th className="px-2 py-2 text-center font-medium" title="قیمت نهایی فروش. ویرایش دستی این مقدار، قیمت را قفل می‌کند.">
              قیمت نهایی (ت)
            </th>
            <th className="px-2 py-2 text-center font-medium">حراج (ت)</th>
            <th className="px-2 py-2 text-center font-medium">موجودی</th>
            <th className="px-2 py-2 text-center font-medium" title="قفلِ قیمت دستی؛ خودکار = پیروی از موتور قیمت.">
              قفل قیمت
            </th>
            <th className="px-2 py-2 text-center font-medium">فعال</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} className="border-b border-dz-a-primary-50 last:border-0 dark:border-dz-a-night-border">
              <td className="px-2 py-2 align-middle text-dz-a-primary-800 dark:text-dz-a-night-fg">{v.modelLabel}</td>
              <td className="px-2 py-2 text-center align-middle tabular-nums text-dz-a-primary-400 dark:text-dz-a-night-faint">
                {toPersianNumbersWithComma(v.calculatedToman)}
              </td>
              <td className="px-2 py-2 text-center align-middle">
                <EditablePriceCell
                  value={v.priceToman}
                  kind="money-required"
                  locked={v.isPriceLocked}
                  ariaLabel={`قیمت نهایی ${v.modelLabel}`}
                  title="قیمت نهایی (تومان) — ویرایش دستی قیمت را قفل می‌کند"
                  onSave={(val) => updateVariantPriceAction(v.id, String(val ?? ""))}
                />
              </td>
              <td className="px-2 py-2 text-center align-middle">
                <EditablePriceCell
                  value={v.offPriceToman}
                  kind="money-nullable"
                  ariaLabel={`قیمت تخفیفی ${v.modelLabel}`}
                  title="قیمت تخفیفی (تومان) — باید کمتر از قیمت نهایی باشد؛ خالی = بدون تخفیف"
                  validate={(val) =>
                    val != null && val >= v.priceToman ? PRICE_MESSAGES.offTooHigh : null
                  }
                  onSave={(val) => updateVariantOffPriceAction(v.id, val == null ? "" : String(val))}
                />
              </td>
              <td className="px-2 py-2 text-center align-middle">
                <EditablePriceCell
                  value={v.stock}
                  kind="stock"
                  ariaLabel={`موجودی ${v.modelLabel}`}
                  title="موجودی — عدد صحیح، نمی‌تواند منفی باشد"
                  onSave={(val) => updateVariantStockAction(v.id, String(val ?? ""))}
                />
              </td>
              <td className="px-2 py-2 text-center align-middle">
                <PricingToggleCell
                  active={v.isPriceLocked}
                  onLabel="دستی"
                  offLabel="خودکار"
                  onIcon={Lock}
                  offIcon={LockOpen}
                  tone="warning"
                  title="قفل قیمت دستی؛ باز کردن قفل، قیمت را به مقدار محاسبه‌شده برمی‌گرداند."
                  onToggle={(next) => toggleVariantPriceLockAction(v.id, next)}
                />
              </td>
              <td className="px-2 py-2 text-center align-middle">
                <PricingToggleCell
                  active={v.isActive}
                  onLabel="فعال"
                  offLabel="غیرفعال"
                  onIcon={Eye}
                  offIcon={EyeOff}
                  onToggle={(next) => toggleVariantActiveAction(v.id, next)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
