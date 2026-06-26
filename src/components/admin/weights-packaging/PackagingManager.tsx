"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  packagingSchema,
  emptyPackaging,
  PACKAGING_TYPE_OPTIONS,
  PACKAGING_TYPE_LABELS,
  type PackagingInput,
  type PackagingValues,
} from "@/lib/admin/products";
import { toPersianNumbers, toPersianNumbersWithComma } from "@/lib/price";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { MultiChipCell, type ChipOption } from "@/components/admin/products/cells/MultiChipCell";
import { savePackaging, deletePackaging } from "@/app/admin/collections/weights-packaging/actions";
import type { CompatCategory } from "@/components/admin/weights-packaging/WeightsManager";

export type PackagingRow = {
  id: string;
  title: string;
  type: string;
  capacityGram: number;
  cost_rial: number;
  compatibility: string[];
  sortOrder: number;
  isActive: boolean;
};

export function PackagingManager({ options, categories }: { options: PackagingRow[]; categories: CompatCategory[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [compatIds, setCompatIds] = useState<string[]>([]);

  const categoryOptions: ChipOption[] = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.title, chip: c.title, sub: c.parentTitle ?? undefined })),
    [categories],
  );
  const titleById = useMemo(() => new Map(categories.map((c) => [c.id, c.title])), [categories]);

  const form = useForm<PackagingInput, unknown, PackagingValues>({
    resolver: zodResolver(packagingSchema),
    defaultValues: emptyPackaging,
  });

  const startEdit = (r: PackagingRow) => {
    setEditingId(r.id);
    setServerError(null);
    setCompatIds(r.compatibility);
    form.reset({
      title: r.title,
      type: r.type as PackagingInput["type"],
      capacityGram: String(r.capacityGram),
      costToman: String(Math.round(r.cost_rial / 10)),
      compatibility: r.compatibility,
      sortOrder: String(r.sortOrder),
      isActive: r.isActive,
    });
  };
  const startNew = () => {
    setEditingId(null);
    setServerError(null);
    setCompatIds([]);
    form.reset(emptyPackaging);
  };

  const submit = () => {
    setServerError(null);
    setNotice(null);
    const raw = { ...form.getValues(), compatibility: compatIds };
    startTransition(async () => {
      const res = await savePackaging(editingId, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      setNotice(editingId ? "بسته‌بندی ویرایش شد." : "بسته‌بندی جدید افزوده شد.");
      startNew();
    });
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    const id = confirmId;
    setNotice(null);
    setServerError(null);
    startTransition(async () => {
      const res = await deletePackaging(id);
      if (!res.ok) setServerError(res.error);
      else setNotice("بسته‌بندی حذف شد.");
      setConfirmId(null);
    });
  };

  const columns: TableColumn<PackagingRow>[] = [
    { key: "title", header: "عنوان", render: (r) => <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.title}</span> },
    { key: "type", header: "نوع", align: "center", render: (r) => <AdminStatusBadge tone="blue">{PACKAGING_TYPE_LABELS[r.type] ?? r.type}</AdminStatusBadge> },
    { key: "cost", header: "هزینه (تومان)", align: "center", render: (r) => <span className="text-dz-a-primary-700 dark:text-dz-a-night-fg">{toPersianNumbersWithComma(Math.round(r.cost_rial / 10))}</span> },
    {
      key: "compat",
      header: "سازگار با دسته‌ها",
      render: (r) =>
        r.compatibility.length ? (
          <span className="text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300">{r.compatibility.map((id) => titleById.get(id) ?? "؟").join("، ")}</span>
        ) : (
          <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">همه‌ی دسته‌ها</span>
        ),
    },
    { key: "active", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => startEdit(r)} title="ویرایش" aria-label={`ویرایش ${r.title}`} className="focus-ring rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={() => setConfirmId(r.id)} title="حذف" aria-label={`حذف ${r.title}`} className="focus-ring rounded-lg p-1.5 text-dz-a-error/70 dark:text-dz-a-error-300 transition-colors hover:bg-dz-a-error/10 hover:text-dz-a-error dark:hover:text-dz-a-error-300">
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="h-fit rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-5 shadow-xs lg:sticky lg:top-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            <span className="h-4 w-1 rounded-full bg-dz-a-primary-300 dark:bg-dz-a-primary-500" aria-hidden />
            {editingId ? "ویرایش بسته‌بندی" : "افزودن بسته‌بندی"}
          </h2>
          {editingId && (
            <button type="button" onClick={startNew} className="focus-ring flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
              <Plus className="size-3.5" /> جدید
            </button>
          )}
        </div>
        {serverError && <div className="mb-3"><AdminFormError message={serverError} /></div>}
        {notice && <div className="mb-3"><AdminSuccessNotice message={notice} onDismiss={() => setNotice(null)} /></div>}
        <AdminFormShell form={form} onSubmit={submit}>
          <AdminTextField name="title" label="عنوان" required placeholder="پاکت ۵۰۰ گرمی" />
          <AdminSelectField name="type" label="نوع بسته‌بندی" required options={PACKAGING_TYPE_OPTIONS} />
          <AdminTextField name="capacityGram" label="ظرفیت (گرم)" required dir="ltr" inputMode="decimal" />
          <AdminTextField name="costToman" label="هزینه (تومان)" required dir="ltr" inputMode="numeric" hint="در دیتابیس به ریال ذخیره می‌شود." />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">سازگار با دسته‌ها</label>
            <MultiChipCell options={categoryOptions} selectedIds={compatIds} onChange={setCompatIds} placeholder="همه‌ی دسته‌ها (سراسری)" dataCell="pcompat" ariaLabel="سازگار با دسته‌ها" />
            <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">خالی = برای همه‌ی دسته‌ها قابل استفاده.</span>
          </div>
          <AdminTextField name="sortOrder" label="ترتیب" dir="ltr" inputMode="numeric" />
          <AdminCheckboxField name="isActive" label="فعال" />
          <button type="submit" disabled={pending} className="focus-ring mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-a-primary-700 active:bg-dz-a-primary-800 disabled:bg-dz-a-primary-300 dark:disabled:bg-dz-a-primary-800">
            {pending ? "در حال ذخیره…" : editingId ? "ذخیره" : "افزودن"}
          </button>
        </AdminFormShell>
      </div>

      <AdminDataTable columns={columns} rows={options} getRowId={(r) => r.id} empty={<div className="flex flex-col items-center gap-2 p-10 text-center"><div className="flex size-11 items-center justify-center rounded-xl bg-dz-a-primary-50 dark:bg-white/5 text-dz-a-primary-400 dark:text-dz-a-night-faint ring-1 ring-dz-a-primary-100 dark:ring-dz-a-night-border"><Plus className="size-5" /></div><p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">هنوز بسته‌بندی‌ای تعریف نشده. از فرم کنار، اولین بسته‌بندی را اضافه کنید.</p></div>} />

      <AdminConfirmDialog
        open={confirmId !== null}
        title="حذف بسته‌بندی"
        description="اگر این بسته‌بندی در مدل‌های فروش استفاده شده باشد، حذف نمی‌شود."
        confirmLabel="حذف"
        danger
        loading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
