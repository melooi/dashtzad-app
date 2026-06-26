"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Wand2, Save, Lock, LockOpen } from "lucide-react";
import { calculateVariantPrice, type BaseUnit } from "@/lib/admin/product-pricing";
import { normalizeDigits } from "@/lib/admin/slug";
import { MARKETING_BADGE_OPTIONS, filterByCompatibility } from "@/lib/admin/products";
import { toPersianNumbersWithComma } from "@/lib/price";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { saveProductVariants } from "@/app/admin/collections/products/actions";

export type WeightOpt = { id: string; title: string; gramValue: number; compatibility: string[] };
export type PackagingOpt = { id: string; title: string; type: string; cost_rial: number; compatibility: string[] };
export type ExistingVariant = {
  id: string;
  weightPresetId: string | null;
  packagingOptionId: string | null;
  sku: string;
  stock: number;
  isActive: boolean;
  isPriceLocked: boolean;
  price_rial: number;
  offPrice_rial: number | null;
  marketingBadge: string | null;
  sortOrder: number;
};

type Row = {
  key: string;
  id: string | null;
  weightPresetId: string;
  packagingOptionId: string | null;
  sku: string | null;
  stock: string;
  isActive: boolean;
  isPriceLocked: boolean;
  manualPriceToman: string;
  offPriceToman: string;
  marketingBadge: string;
  sortOrder: number;
};

const toEn = (s: string) => normalizeDigits(String(s ?? "")).replace(/[^\d]/g, "");
const toInt = (s: string) => {
  const n = parseInt(toEn(s), 10);
  return Number.isFinite(n) ? n : 0;
};
const rialToTomanStr = (rial: number) => toPersianNumbersWithComma(Math.round(rial / 10));

export function VariantMatrix({
  productId,
  productCategoryId,
  basePriceRial,
  basePriceUnit,
  weightPresets,
  packagingOptions,
  existingVariants,
}: {
  productId: string;
  productCategoryId: string;
  basePriceRial: number;
  basePriceUnit: string;
  weightPresets: WeightOpt[];
  packagingOptions: PackagingOpt[];
  existingVariants: ExistingVariant[];
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const weightById = useMemo(() => new Map(weightPresets.map((w) => [w.id, w])), [weightPresets]);
  const pkgById = useMemo(() => new Map(packagingOptions.map((p) => [p.id, p])), [packagingOptions]);

  const comboKey = (wId: string, pId: string | null) => `${wId}::${pId ?? "none"}`;

  const [rows, setRows] = useState<Row[]>(() =>
    existingVariants.map((v) => ({
      key: comboKey(v.weightPresetId ?? "", v.packagingOptionId),
      id: v.id,
      weightPresetId: v.weightPresetId ?? "",
      packagingOptionId: v.packagingOptionId,
      sku: v.sku,
      stock: String(v.stock),
      isActive: v.isActive,
      isPriceLocked: v.isPriceLocked,
      manualPriceToman: v.isPriceLocked ? String(Math.round(v.price_rial / 10)) : "",
      offPriceToman: v.offPrice_rial ? String(Math.round(v.offPrice_rial / 10)) : "",
      marketingBadge: v.marketingBadge ?? "",
      sortOrder: v.sortOrder,
    })),
  );

  const [selWeights, setSelWeights] = useState<Set<string>>(
    () => new Set(existingVariants.map((v) => v.weightPresetId ?? "").filter(Boolean)),
  );
  const [selPkgs, setSelPkgs] = useState<Set<string>>(
    () => new Set(existingVariants.map((v) => v.packagingOptionId).filter((x): x is string => Boolean(x))),
  );

  // Selector lists prefer options compatible with the product category; any
  // already-selected (possibly incompatible) option stays visible.
  const visibleWeights = useMemo(() => {
    const f = filterByCompatibility(weightPresets, productCategoryId, showAll);
    const ids = new Set(f.map((w) => w.id));
    return [...f, ...weightPresets.filter((w) => selWeights.has(w.id) && !ids.has(w.id))];
  }, [weightPresets, productCategoryId, showAll, selWeights]);
  const visiblePackagings = useMemo(() => {
    const f = filterByCompatibility(packagingOptions, productCategoryId, showAll);
    const ids = new Set(f.map((p) => p.id));
    return [...f, ...packagingOptions.filter((p) => selPkgs.has(p.id) && !ids.has(p.id))];
  }, [packagingOptions, productCategoryId, showAll, selPkgs]);

  const calcRial = (wId: string, pId: string | null) => {
    const w = weightById.get(wId);
    if (!w) return 0;
    const pkg = pId ? pkgById.get(pId) : null;
    return calculateVariantPrice({
      basePriceRial,
      basePriceUnit: basePriceUnit as BaseUnit,
      gramValue: w.gramValue,
      packagingCostRial: pkg?.cost_rial ?? 0,
    });
  };

  const generate = () => {
    setNotice(null);
    const pkgChoices: (string | null)[] = selPkgs.size ? [...selPkgs] : [null];
    setRows((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key));
      const additions: Row[] = [];
      let order = prev.length;
      for (const wId of selWeights) {
        for (const pId of pkgChoices) {
          const key = comboKey(wId, pId);
          if (existingKeys.has(key)) continue;
          existingKeys.add(key);
          additions.push({
            key,
            id: null,
            weightPresetId: wId,
            packagingOptionId: pId,
            sku: null,
            stock: "0",
            isActive: true,
            isPriceLocked: false,
            manualPriceToman: "",
            offPriceToman: "",
            marketingBadge: "",
            sortOrder: order++,
          });
        }
      }
      return [...prev, ...additions];
    });
  };

  const patch = (key: string, p: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const toggleSet = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const save = () => {
    setNotice(null);
    const payload = rows.map((r) => ({
      id: r.id,
      weightPresetId: r.weightPresetId,
      packagingOptionId: r.packagingOptionId,
      stock: toInt(r.stock),
      isActive: r.isActive,
      isPriceLocked: r.isPriceLocked,
      manualPriceToman: r.isPriceLocked ? toInt(r.manualPriceToman) : null,
      offPriceToman: r.offPriceToman ? toInt(r.offPriceToman) : null,
      marketingBadge: r.marketingBadge || null,
      sortOrder: r.sortOrder,
    }));
    startSaving(async () => {
      const res = await saveProductVariants(productId, payload);
      if (!res.ok) {
        setNotice({ ok: false, message: res.error ?? "ذخیره ناموفق بود." });
        return;
      }
      const blockedNote = res.blocked ? ` (${res.blocked} مدلِ دارای وابستگی حذف نشد)` : "";
      setNotice({ ok: true, message: `مدل‌های فروش ذخیره شد${blockedNote}.` });
      router.refresh();
    });
  };

  const chip = (active: boolean) =>
    `focus-ring rounded-lg border px-2.5 py-1 text-xs transition-colors ${
      active
        ? "border-dz-primary-600 bg-dz-primary-600 text-white shadow-xs"
        : "border-dz-primary-200 bg-white text-dz-primary-700 hover:border-dz-primary-300 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg dark:hover:border-dz-primary-500/50 dark:hover:bg-white/5"
    }`;

  const stepLabel = (n: string, text: string) => (
    <p className="mb-2.5 flex items-center gap-2 text-xs font-bold text-dz-primary-600 dark:text-dz-primary-300">
      <span className="flex size-5 items-center justify-center rounded-full bg-dz-primary-600 text-[10px] text-white">
        {n}
      </span>
      {text}
    </p>
  );

  return (
    <div className="flex flex-col gap-4">
      {notice && (notice.ok ? <AdminSuccessNotice message={notice.message} onDismiss={() => setNotice(null)} /> : <AdminFormError message={notice.message} />)}

      {/* Selectors */}
      <div className="rounded-xl border border-dz-primary-100 bg-dz-primary-50/40 p-4 shadow-xs dark:border-dz-night-border dark:bg-white/2">
        <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-dz-primary-600 ring-1 ring-dz-primary-100 dark:bg-dz-night-elevated dark:text-dz-primary-300 dark:ring-dz-night-border">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="size-3.5 accent-dz-primary-600" />
          نمایش همه گزینه‌ها (بدون فیلتر دسته)
        </label>
        {stepLabel("۱", "وزن‌های مجاز")}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {visibleWeights.map((w) => (
            <button type="button" key={w.id} className={chip(selWeights.has(w.id))} onClick={() => toggleSet(selWeights, w.id, setSelWeights)}>
              {w.title}
            </button>
          ))}
          {visibleWeights.length === 0 && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">وزن سازگاری یافت نشد؛ «نمایش همه» را بزنید.</span>}
        </div>
        {stepLabel("۲", "بسته‌بندی‌های مجاز (اختیاری)")}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {visiblePackagings.map((p) => (
            <button type="button" key={p.id} className={chip(selPkgs.has(p.id))} onClick={() => toggleSet(selPkgs, p.id, setSelPkgs)}>
              {p.title}
            </button>
          ))}
          {visiblePackagings.length === 0 && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">بسته‌بندی سازگاری یافت نشد؛ «نمایش همه» را بزنید.</span>}
        </div>
        <button type="button" onClick={generate} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-primary-300 bg-white px-4 py-2 text-sm font-medium text-dz-primary-700 shadow-xs transition-colors hover:border-dz-primary-400 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg dark:hover:border-dz-primary-500/50 dark:hover:bg-white/5">
          <Wand2 className="size-4" />
          تولید/به‌روزرسانی ماتریس
        </button>
      </div>

      {/* Matrix table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-dz-primary-200 bg-dz-primary-50/30 p-8 text-center dark:border-dz-night-border dark:bg-white/2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white text-dz-primary-300 shadow-xs ring-1 ring-dz-primary-100 dark:bg-dz-night-elevated dark:text-dz-night-faint dark:ring-dz-night-border">
            <Wand2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-dz-primary-700 dark:text-dz-night-fg">هنوز مدلی تعریف نشده</p>
          <p className="max-w-sm text-xs leading-5 text-dz-primary-400 dark:text-dz-night-faint">
            وزن و بسته‌بندیِ مجاز را از بالا انتخاب کنید و «تولید ماتریس» را بزنید تا قیمت‌ها به‌صورت خودکار ساخته شوند.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-dz-primary-100 shadow-xs dark:border-dz-night-border">
          <table className="w-full min-w-[920px] text-xs">
            <thead>
              <tr className="border-b border-dz-primary-100 bg-dz-primary-50/60 text-dz-primary-500 dark:border-dz-night-border dark:bg-white/5 dark:text-dz-night-muted">
                <th className="px-2 py-2.5 text-start font-medium">وزن</th>
                <th className="px-2 py-2.5 text-start font-medium">بسته‌بندی</th>
                <th className="px-2 py-2.5 text-start font-medium">SKU</th>
                <th className="px-2 py-2.5 text-center font-medium">محاسبه‌شده (ت)</th>
                <th className="px-2 py-2.5 text-center font-medium">قیمت</th>
                <th className="px-2 py-2.5 text-center font-medium">قیمت نهایی (ت)</th>
                <th className="px-2 py-2.5 text-center font-medium">حراج (ت)</th>
                <th className="px-2 py-2.5 text-center font-medium">موجودی</th>
                <th className="px-2 py-2.5 text-center font-medium">برچسب</th>
                <th className="px-2 py-2.5 text-center font-medium">فعال</th>
                <th className="px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const calc = calcRial(r.weightPresetId, r.packagingOptionId);
                const finalToman = r.isPriceLocked ? toInt(r.manualPriceToman) : Math.round(calc / 10);
                return (
                  <tr key={r.key} className="border-b border-dz-primary-50 last:border-0 dark:border-dz-night-line">
                    <td className="px-2 py-2 text-dz-primary-800 dark:text-dz-night-fg">{weightById.get(r.weightPresetId)?.title ?? "—"}</td>
                    <td className="px-2 py-2 text-dz-primary-700 dark:text-dz-night-fg">{r.packagingOptionId ? pkgById.get(r.packagingOptionId)?.title : <span className="text-dz-primary-300 dark:text-dz-night-faint">بدون</span>}</td>
                    <td className="px-2 py-2"><span dir="ltr" className="block text-start font-mono text-[11px] text-dz-primary-400 dark:text-dz-night-faint">{r.sku ?? "خودکار"}</span></td>
                    <td className="px-2 py-2 text-center text-dz-primary-400 tabular-nums dark:text-dz-night-faint">{rialToTomanStr(calc)}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => patch(r.key, { isPriceLocked: !r.isPriceLocked })}
                        className={`focus-ring inline-flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors ${r.isPriceLocked ? "border-dz-warning/40 bg-dz-warning/10 text-dz-warning dark:bg-dz-warning/15 dark:text-dz-warning-300" : "border-dz-primary-200 text-dz-primary-500 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"}`}
                        title={r.isPriceLocked ? "قیمت دستی قفل" : "خودکار"}
                      >
                        {r.isPriceLocked ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
                        {r.isPriceLocked ? "دستی" : "خودکار"}
                      </button>
                      {r.isPriceLocked && (
                        <input
                          value={r.manualPriceToman}
                          onChange={(e) => patch(r.key, { manualPriceToman: e.target.value })}
                          dir="ltr"
                          placeholder="تومان"
                          className={`${fieldClass()} mt-1 w-24 px-2 py-1 text-center`}
                        />
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-bold tabular-nums ${r.isPriceLocked ? "bg-dz-warning/10 text-dz-warning dark:bg-dz-warning/15 dark:text-dz-warning-300" : "text-dz-primary-800 dark:text-dz-night-fg"}`}>
                        {r.isPriceLocked && <Lock className="size-3" />}
                        {toPersianNumbersWithComma(finalToman)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input value={r.offPriceToman} onChange={(e) => patch(r.key, { offPriceToman: e.target.value })} dir="ltr" placeholder="—" className={`${fieldClass()} w-20 px-2 py-1 text-center`} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input value={r.stock} onChange={(e) => patch(r.key, { stock: e.target.value })} dir="ltr" className={`${fieldClass()} w-16 px-2 py-1 text-center`} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <select value={r.marketingBadge} onChange={(e) => patch(r.key, { marketingBadge: e.target.value })} className={`${fieldClass()} w-28 px-1.5 py-1`}>
                        <option value="">—</option>
                        {MARKETING_BADGE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={r.isActive} onChange={(e) => patch(r.key, { isActive: e.target.checked })} className="size-4 accent-dz-primary-600" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button type="button" onClick={() => removeRow(r.key)} title="حذف ردیف" aria-label="حذف ردیف" className="focus-ring rounded-lg p-1 text-dz-error/70 transition-colors hover:bg-dz-error/10 hover:text-dz-error dark:text-dz-error-300/80 dark:hover:bg-dz-error/15 dark:hover:text-dz-error-300">
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-dz-primary-400 dark:text-dz-night-faint">قیمت‌ها به تومان وارد می‌شوند و در دیتابیس به ریال ذخیره می‌شوند.</p>
        <button type="button" onClick={save} disabled={saving} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300 sm:w-auto dark:disabled:bg-dz-primary-800">
          <Save className="size-4" />
          {saving ? "در حال ذخیره…" : "ذخیره‌ی مدل‌های فروش"}
        </button>
      </div>
    </div>
  );
}
