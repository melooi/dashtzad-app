"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, CheckCircle2, Copy, Eraser, ListPlus } from "lucide-react";
import { normalizeDigits } from "@/lib/admin/slug";
import { BASE_UNIT_OPTIONS, filterByCompatibility } from "@/lib/admin/products";
import { toPersianNumbers } from "@/lib/price";
import { SelectCell } from "@/components/admin/products/cells/SelectCell";
import { MultiChipCell, type ChipOption } from "@/components/admin/products/cells/MultiChipCell";
import { quickAddProducts } from "@/app/admin/collections/products/actions";
import type { QuickAddResult } from "@/lib/admin/product-service";

type Category = { id: string; title: string; parentTitle?: string | null };
type Weight = { id: string; title: string; gramValue: number; compatibility: string[] };
type Packaging = { id: string; title: string; compatibility: string[] };

type Row = {
  key: string;
  title: string;
  categoryId: string;
  basePriceToman: string;
  basePriceUnit: string;
  weightIds: string[];
  packagingIds: string[];
  stock: string;
  isActive: boolean;
  error?: string;
  savedId?: string;
  savedVariants?: number;
};

const COLS = 8;
let counter = 0;
const newRow = (): Row => ({
  key: `r${counter++}`,
  title: "",
  categoryId: "",
  basePriceToman: "",
  basePriceUnit: "GRAM",
  weightIds: [],
  packagingIds: [],
  stock: "0",
  isActive: true,
});

const toInt = (s: string) => {
  const n = parseInt(normalizeDigits(String(s ?? "")).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** Inline keyboard-shortcut hint chip for the sheet help bar. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-dz-primary-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-dz-primary-600 shadow-xs dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-primary-300">
      {children}
    </kbd>
  );
}
const weightChip = (gram: number) =>
  gram >= 1000 && Number.isInteger(gram) && gram % 1000 === 0
    ? `${toPersianNumbers(gram / 1000)}kg`
    : `${toPersianNumbers(gram)}g`;

export function QuickAddSheet({
  categories,
  weights,
  packagings,
}: {
  categories: Category[];
  weights: Weight[];
  packagings: Packaging[];
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow(), newRow()]);
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef(rows);
  const undo = useRef<Row[][]>([]);
  const pendingFocus = useRef<{ r: number; c: number } | null>(null);

  // Keep rowsRef in sync so event-handler callbacks always see the latest rows.
  useEffect(() => { rowsRef.current = rows; }, [rows]);

  const pushUndo = () => {
    undo.current.push(rowsRef.current.map((r) => ({ ...r })));
    if (undo.current.length > 50) undo.current.shift();
  };
  const doUndo = () => {
    const prev = undo.current.pop();
    if (prev) setRows(prev);
  };

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.title, sub: c.parentTitle ?? undefined })),
    [categories],
  );
  const catTitle = useMemo(() => new Map(categories.map((c) => [c.id, c.title])), [categories]);

  const buildOptions = (
    all: { id: string; title: string; compatibility: string[]; gramValue?: number }[],
    selectedIds: string[],
    categoryId: string,
    isWeight: boolean,
  ): ChipOption[] => {
    const filtered = filterByCompatibility(all, categoryId || null, showAll);
    const ids = new Set(filtered.map((x) => x.id));
    const extra = all.filter((x) => selectedIds.includes(x.id) && !ids.has(x.id));
    return [...filtered, ...extra].map((x) => ({
      id: x.id,
      label: x.title,
      chip: isWeight && x.gramValue != null ? weightChip(x.gramValue) : x.title,
    }));
  };

  // ---- mutations ----
  const patch = (key: string, p: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...p, error: undefined } : r)));
  const patchUndoable = (key: string, p: Partial<Row>) => {
    pushUndo();
    patch(key, p);
  };
  const addRow = () => {
    pushUndo();
    setRows((prev) => [...prev, newRow()]);
  };
  const addFive = () => {
    pushUndo();
    setRows((prev) => [...prev, ...Array.from({ length: 5 }, newRow)]);
  };
  const duplicateRowAt = (i: number) => {
    pushUndo();
    setRows((prev) => {
      const src = prev[i];
      if (!src) return prev;
      const copy: Row = { ...src, key: `r${counter++}`, error: undefined, savedId: undefined, savedVariants: undefined };
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
    });
  };
  const removeRow = (key: string) => {
    pushUndo();
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };
  const clearRow = (key: string) => {
    pushUndo();
    setRows((prev) => prev.map((r) => (r.key === key ? { ...newRow(), key: r.key } : r)));
  };

  // ---- keyboard grid nav ----
  const focusCell = (r: number, c: number) => {
    const rr = Math.max(0, Math.min(rows.length - 1, r));
    const cc = Math.max(0, Math.min(COLS - 1, c));
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${rr}-${cc}"]`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    }
  };
  const coordsOf = (): [number, number] | null => {
    const dc = (document.activeElement as HTMLElement | null)?.getAttribute?.("data-cell");
    if (!dc) return null;
    const [r, c] = dc.split("-").map(Number);
    return Number.isFinite(r) && Number.isFinite(c) ? [r, c] : null;
  };

  // Focus a cell; if the target row is past the end, append a row first.
  const move = (tr: number, tc: number) => {
    const c = Math.max(0, Math.min(COLS - 1, tc));
    if (tr > rows.length - 1) {
      pendingFocus.current = { r: rows.length, c };
      addRow();
      return;
    }
    focusCell(Math.max(0, tr), c);
  };

  // After a row is auto-appended, focus the queued cell.
  useEffect(() => {
    if (pendingFocus.current) {
      const { r, c } = pendingFocus.current;
      pendingFocus.current = null;
      focusCell(r, c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === "s" || e.key === "S" || e.key === "Enter")) {
      e.preventDefault();
      save();
      return;
    }
    const coords = coordsOf();
    if (mod && (e.key === "d" || e.key === "D")) {
      e.preventDefault();
      if (coords) duplicateRowAt(coords[0]);
      return;
    }
    if (mod && (e.key === "z" || e.key === "Z")) {
      if ((document.activeElement as HTMLElement)?.tagName === "INPUT") return; // native text undo
      e.preventDefault();
      doUndo();
      return;
    }
    if (!coords) return;
    const [r, c] = coords;
    switch (e.key) {
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (c > 0) focusCell(r, c - 1);
          else focusCell(r - 1, COLS - 1);
        } else {
          if (c < COLS - 1) move(r, c + 1);
          else move(r + 1, 0); // wraps to next row, creating one if needed
        }
        break;
      case "Enter":
        e.preventDefault();
        if (e.shiftKey) focusCell(r - 1, c);
        else move(r + 1, c); // down → new row at the end
        break;
      case "ArrowDown":
        e.preventDefault();
        move(r + 1, c); // down on last row → new row
        break;
      case "ArrowUp":
        e.preventDefault();
        focusCell(r - 1, c);
        break;
      case "ArrowLeft": // RTL: next cell
        e.preventDefault();
        focusCell(r, c + 1);
        break;
      case "ArrowRight": // RTL: previous cell
        e.preventDefault();
        focusCell(r, c - 1);
        break;
    }
  };

  // ---- validation + save ----
  const validate = (r: Row): string | undefined => {
    if (r.title.trim().length < 2) return "عنوان حداقل ۲ نویسه باشد.";
    if (!r.categoryId) return "دسته‌بندی را انتخاب کنید.";
    if (toInt(r.basePriceToman) < 1) return "قیمت پایه را وارد کنید.";
    if (r.weightIds.length === 0) return "حداقل یک وزن انتخاب کنید.";
    return undefined;
  };

  const save = () => {
    const toSubmit = rowsRef.current.filter((r) => !r.savedId);
    let hasError = false;
    const validated = rowsRef.current.map((r) => {
      if (r.savedId) return r;
      const error = validate(r);
      if (error) hasError = true;
      return { ...r, error };
    });
    setRows(validated);
    if (hasError || toSubmit.length === 0) return;

    const payload = toSubmit.map((r) => ({
      title: r.title.trim(),
      categoryId: r.categoryId,
      basePriceToman: toInt(r.basePriceToman),
      basePriceUnit: r.basePriceUnit,
      weightPresetIds: r.weightIds,
      packagingOptionIds: r.packagingIds,
      stock: toInt(r.stock),
      isActive: r.isActive,
    }));

    startSaving(async () => {
      const results: QuickAddResult[] = await quickAddProducts(payload);
      setRows((prev) =>
        prev.map((r) => {
          const idx = toSubmit.findIndex((s) => s.key === r.key);
          if (idx === -1) return r;
          const res = results[idx];
          if (!res) return r;
          return res.ok
            ? { ...r, savedId: res.id, savedVariants: res.variants, error: undefined }
            : { ...r, error: res.error };
        }),
      );
      if (results.every((x) => x.ok)) router.refresh();
    });
  };

  // ---- paste (TSV) into the grid, starting at the pasted row ----
  const onPasteTitle = (rowIndex: number, e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\n") && !text.includes("\t")) return; // normal paste
    e.preventDefault();
    pushUndo();
    const catByTitle = new Map(categories.map((c) => [c.title.trim(), c.id]));
    const unitByLabel = new Map(BASE_UNIT_OPTIONS.map((o) => [o.label, o.value]));
    const wByTitle = new Map(weights.map((w) => [w.title.trim(), w.id]));
    const pByTitle = new Map(packagings.map((p) => [p.title.trim(), p.id]));
    const lines = text.split(/\r?\n/).filter((l) => l.length);
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      lines.forEach((line, i) => {
        const cols = line.split("\t");
        const idx = rowIndex + i;
        while (next.length <= idx) next.push(newRow());
        const row = next[idx];
        if (cols[0] != null) row.title = cols[0].trim();
        if (cols[1]) row.categoryId = catByTitle.get(cols[1].trim()) ?? row.categoryId;
        if (cols[2]) row.basePriceToman = cols[2].trim();
        if (cols[3]) row.basePriceUnit = unitByLabel.get(cols[3].trim()) ?? row.basePriceUnit;
        if (cols[4]) row.weightIds = cols[4].split(/[،,]/).map((s) => wByTitle.get(s.trim())).filter(Boolean) as string[];
        if (cols[5]) row.packagingIds = cols[5].split(/[،,]/).map((s) => pByTitle.get(s.trim())).filter(Boolean) as string[];
        if (cols[6]) row.stock = cols[6].trim();
        if (cols[7]) row.isActive = /^(۱|1|بله|true|فعال)$/i.test(cols[7].trim());
        row.error = undefined;
      });
      return next;
    });
  };

  const cellInput =
    "w-full rounded-md border border-dz-primary-200 px-2 py-1.5 text-xs text-dz-primary-900 outline-none transition-colors focus:relative focus:z-20 focus:border-dz-primary-500 focus:bg-dz-primary-50/60 focus:ring-2 focus:ring-dz-primary-500/35 disabled:bg-dz-primary-50/40 disabled:text-dz-primary-400 dark:border-dz-night-border dark:text-dz-night-fg dark:placeholder:text-dz-night-faint dark:focus:border-dz-primary-400 dark:focus:bg-dz-primary-400/10 dark:focus:ring-dz-primary-400/40 dark:disabled:bg-white/5 dark:disabled:text-dz-night-faint";
  const th = "sticky top-0 z-10 border-b border-dz-primary-100 bg-dz-primary-50/90 px-2 py-2.5 text-start text-[11px] font-bold text-dz-primary-500 backdrop-blur dark:border-dz-night-border dark:bg-dz-night-elevated/95 dark:text-dz-night-muted";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dz-primary-100 bg-white px-2.5 py-1.5 text-xs text-dz-primary-600 shadow-xs dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-primary-300">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="size-3.5 accent-dz-primary-600" />
          نمایش همه گزینه‌ها (بدون فیلتر دسته)
        </label>
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-dz-primary-400 dark:text-dz-night-faint">
          <Kbd>جهت‌ها/Tab/Enter</Kbd> حرکت
          <span className="mx-0.5 text-dz-primary-200 dark:text-dz-night-border">·</span>
          <Kbd>⌘/Ctrl+S</Kbd> ذخیره
          <span className="mx-0.5 text-dz-primary-200 dark:text-dz-night-border">·</span>
          <Kbd>⌘/Ctrl+D</Kbd> تکرار
          <span className="mx-0.5 text-dz-primary-200 dark:text-dz-night-border">·</span>
          <Kbd>Esc</Kbd> بستن
        </div>
      </div>

      <div ref={gridRef} onKeyDown={onKeyDown} className="overflow-x-auto rounded-2xl border border-dz-primary-100 bg-white shadow-xs dark:border-dz-night-border dark:bg-dz-night-card">
        <table className="w-full min-w-[1040px] border-collapse text-xs">
          <thead>
            <tr>
              <th className={`${th} w-8 text-center`}>#</th>
              <th className={th}>عنوان محصول</th>
              <th className={`${th} w-36`}>دسته</th>
              <th className={`${th} w-24 text-center`}>قیمت (ت)</th>
              <th className={`${th} w-20`}>واحد</th>
              <th className={`${th} w-40`}>وزن‌ها</th>
              <th className={`${th} w-40`}>بسته‌بندی‌ها</th>
              <th className={`${th} w-16 text-center`}>موجودی</th>
              <th className={`${th} w-16 text-center`}>وضعیت</th>
              <th className={`${th} w-48`}>خطا / نتیجه</th>
              <th className={`${th} w-16`}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const locked = !!r.savedId;
              return (
                <tr key={r.key} className={`border-t border-dz-primary-50 dark:border-dz-night-line ${locked ? "bg-dz-success/5 dark:bg-dz-success/10" : ""} ${r.error ? "bg-dz-error/5 dark:bg-dz-error/10" : ""}`}>
                  <td className="px-2 py-1.5 text-center text-[11px] text-dz-primary-400 dark:text-dz-night-faint">{toPersianNumbers(i + 1)}</td>
                  {/* title */}
                  <td className="px-1.5 py-1.5">
                    <input data-cell={`${i}-0`} value={r.title} disabled={locked} onChange={(e) => patch(r.key, { title: e.target.value })} onPaste={(e) => onPasteTitle(i, e)} placeholder="عنوان فارسی" className={cellInput} />
                  </td>
                  {/* category */}
                  <td className="px-1.5 py-1.5">
                    <SelectCell dataCell={`${i}-1`} ariaLabel="دسته" value={r.categoryId} options={categoryOptions} onChange={(v) => patchUndoable(r.key, { categoryId: v })} placeholder="انتخاب دسته" />
                  </td>
                  {/* price */}
                  <td className="px-1.5 py-1.5">
                    <input data-cell={`${i}-2`} value={r.basePriceToman} disabled={locked} dir="ltr" onChange={(e) => patch(r.key, { basePriceToman: e.target.value })} className={`${cellInput} text-center`} />
                  </td>
                  {/* unit */}
                  <td className="px-1.5 py-1.5">
                    <SelectCell dataCell={`${i}-3`} ariaLabel="واحد" value={r.basePriceUnit} options={BASE_UNIT_OPTIONS} searchable={false} onChange={(v) => patchUndoable(r.key, { basePriceUnit: v })} placeholder="واحد" />
                  </td>
                  {/* weights */}
                  <td className="px-1.5 py-1.5">
                    <MultiChipCell
                      dataCell={`${i}-4`}
                      ariaLabel="وزن‌ها"
                      placeholder="انتخاب وزن"
                      options={buildOptions(weights, r.weightIds, r.categoryId, true)}
                      selectedIds={r.weightIds}
                      onChange={(ids) => patchUndoable(r.key, { weightIds: ids })}
                      popoverHeader={!r.categoryId ? <p className="mb-1 px-1 text-[11px] text-dz-primary-400 dark:text-dz-night-faint">اول دسته‌بندی را انتخاب کنید تا گزینه‌های مناسب فیلتر شوند.</p> : undefined}
                    />
                  </td>
                  {/* packaging */}
                  <td className="px-1.5 py-1.5">
                    <MultiChipCell
                      dataCell={`${i}-5`}
                      ariaLabel="بسته‌بندی‌ها"
                      placeholder="بدون / انتخاب"
                      options={buildOptions(packagings, r.packagingIds, r.categoryId, false)}
                      selectedIds={r.packagingIds}
                      onChange={(ids) => patchUndoable(r.key, { packagingIds: ids })}
                    />
                  </td>
                  {/* stock */}
                  <td className="px-1.5 py-1.5">
                    <input data-cell={`${i}-6`} value={r.stock} disabled={locked} dir="ltr" onChange={(e) => patch(r.key, { stock: e.target.value })} className={`${cellInput} text-center`} />
                  </td>
                  {/* active toggle */}
                  <td className="px-1.5 py-1.5 text-center">
                    <button
                      type="button"
                      data-cell={`${i}-7`}
                      disabled={locked}
                      onClick={() => patchUndoable(r.key, { isActive: !r.isActive })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          patchUndoable(r.key, { isActive: !r.isActive });
                        } else if (e.key === "Backspace" || e.key === "Delete") {
                          e.preventDefault();
                          e.stopPropagation();
                          patchUndoable(r.key, { isActive: false });
                        }
                      }}
                      className={`rounded-md border px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-dz-primary-400 ${r.isActive ? "border-dz-primary-200 bg-dz-primary-50 text-dz-primary-700 dark:border-dz-primary-400/30 dark:bg-dz-primary-400/15 dark:text-dz-primary-200" : "border-dz-primary-200 text-dz-primary-400 dark:border-dz-night-border dark:text-dz-night-faint"}`}
                    >
                      {r.isActive ? "فعال" : "غیرفعال"}
                    </button>
                  </td>
                  {/* error / result */}
                  <td className="px-2 py-1.5">
                    {r.savedId ? (
                      <Link href={`/admin/collections/products/${r.savedId}`} className="inline-flex items-center gap-1 text-[11px] text-dz-primary-600 hover:underline dark:text-dz-primary-300">
                        <CheckCircle2 className="size-3.5 text-dz-success dark:text-dz-success-300" /> ویرایش کامل ({toPersianNumbers(r.savedVariants ?? 0)} مدل)
                      </Link>
                    ) : r.error ? (
                      <span className="text-[11px] text-dz-error dark:text-dz-error-300">{r.error}</span>
                    ) : (
                      <span className="text-[11px] text-dz-primary-300 dark:text-dz-night-faint">—</span>
                    )}
                  </td>
                  {/* row actions */}
                  <td className="px-1.5 py-1.5">
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => duplicateRowAt(i)} title="تکرار ردیف" aria-label="تکرار ردیف" className="focus-ring rounded p-1 text-dz-primary-400 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:text-dz-night-faint dark:hover:bg-white/5 dark:hover:text-dz-night-fg"><Copy className="size-3.5" /></button>
                      <button type="button" onClick={() => clearRow(r.key)} title="پاک کردن ردیف" aria-label="پاک کردن ردیف" className="focus-ring rounded p-1 text-dz-primary-400 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:text-dz-night-faint dark:hover:bg-white/5 dark:hover:text-dz-night-fg"><Eraser className="size-3.5" /></button>
                      <button type="button" onClick={() => removeRow(r.key)} title="حذف ردیف" aria-label="حذف ردیف" className="focus-ring rounded p-1 text-dz-error/70 transition-colors hover:bg-dz-error/10 hover:text-dz-error dark:text-dz-error-300/80 dark:hover:bg-dz-error/15 dark:hover:text-dz-error-300"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={addRow} className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-primary-200 px-3 py-2 text-sm text-dz-primary-700 transition-colors hover:border-dz-primary-300 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg dark:hover:border-dz-primary-500/50 dark:hover:bg-white/5"><Plus className="size-4" /> افزودن ردیف</button>
          <button type="button" onClick={addFive} className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-primary-200 px-3 py-2 text-sm text-dz-primary-700 transition-colors hover:border-dz-primary-300 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg dark:hover:border-dz-primary-500/50 dark:hover:bg-white/5"><ListPlus className="size-4" /> ۵ ردیف</button>
        </div>
        <button type="button" onClick={save} disabled={saving} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800">
          <Save className="size-4" />
          {saving ? "در حال ذخیره…" : "ذخیره‌ی همه"}
        </button>
      </div>
    </div>
  );
}
