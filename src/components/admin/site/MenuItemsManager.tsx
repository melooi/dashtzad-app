"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown, CornerDownLeft } from "lucide-react";
import {
  menuItemSchema,
  emptyMenuItem,
  MENU_LINK_TYPE_OPTIONS,
  LINK_TARGET_OPTIONS,
  type MenuItemInput,
} from "@/lib/admin/site-experience";
import { AdminFormShell } from "@/components/admin/ui/AdminFormShell";
import { AdminTextField } from "@/components/admin/ui/AdminTextField";
import { AdminSelectField } from "@/components/admin/ui/AdminSelectField";
import { AdminRelationSelect } from "@/components/admin/ui/AdminRelationSelect";
import { AdminCheckboxField } from "@/components/admin/ui/AdminCheckboxField";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { AutoIconField } from "@/components/admin/site/AutoIconField";
import { saveMenuItem, deleteMenuItem, moveMenuItem } from "@/app/admin/collections/menus/actions";

export type MenuItemRow = {
  id: string;
  parentId: string | null;
  label: string;
  href: string;
  linkType: string;
  target: string;
  icon: string | null;
  badge: string | null;
  description: string | null;
  desktopVisible: boolean;
  mobileVisible: boolean;
  isActive: boolean;
  sortOrder: number;
};

const LINK_TYPE_LABELS = Object.fromEntries(MENU_LINK_TYPE_OPTIONS.map((o) => [o.value, o.label]));

export function MenuItemsManager({ menuId, items }: { menuId: string; items: MenuItemRow[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const form = useForm<MenuItemInput>({ resolver: zodResolver(menuItemSchema), defaultValues: emptyMenuItem });
  const icon = (form.watch("icon") as string) ?? "";

  // Parent options: only top-level items (no nested-under-nested), excluding self.
  const parentOptions = useMemo(
    () =>
      items
        .filter((it) => !it.parentId && it.id !== editingId)
        .map((it) => ({ value: it.id, label: it.label })),
    [items, editingId],
  );

  // Build a top-level → children view.
  const tree = useMemo(() => {
    const roots = items.filter((it) => !it.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const childrenOf = (pid: string) =>
      items.filter((it) => it.parentId === pid).sort((a, b) => a.sortOrder - b.sortOrder);
    return roots.map((r) => ({ row: r, children: childrenOf(r.id) }));
  }, [items]);

  const startEdit = (r: MenuItemRow) => {
    setEditingId(r.id);
    setServerError(null);
    form.reset({
      label: r.label,
      href: r.href,
      linkType: r.linkType as MenuItemInput["linkType"],
      target: r.target as MenuItemInput["target"],
      parentId: r.parentId ?? "",
      icon: r.icon ?? "",
      badge: r.badge ?? "",
      description: r.description ?? "",
      desktopVisible: r.desktopVisible,
      mobileVisible: r.mobileVisible,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
    });
  };
  const startNew = () => {
    setEditingId(null);
    setServerError(null);
    form.reset(emptyMenuItem);
  };

  const submit = () => {
    setServerError(null);
    setNotice(null);
    const raw = form.getValues();
    startTransition(async () => {
      const res = await saveMenuItem(menuId, editingId, raw);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      setNotice(editingId ? "مورد ویرایش شد." : "مورد افزوده شد.");
      startNew();
    });
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    const id = confirmId;
    startTransition(async () => {
      const res = await deleteMenuItem(id);
      if (!res.ok) setServerError(res.error);
      else setNotice("مورد حذف شد.");
      setConfirmId(null);
    });
  };

  const move = (id: string, dir: "up" | "down") =>
    startTransition(async () => {
      await moveMenuItem(id, dir);
    });

  const renderRow = (r: MenuItemRow, i: number, count: number, nested: boolean) => (
    <div
      key={r.id}
      className={`flex items-center justify-between gap-2 rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-3 ${nested ? "me-6" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {nested && <CornerDownLeft className="size-3.5 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.label}</span>
            <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge>
            {r.badge && <AdminStatusBadge tone="amber">{r.badge}</AdminStatusBadge>}
            {!r.desktopVisible && <span className="text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">بدون دسکتاپ</span>}
            {!r.mobileVisible && <span className="text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">بدون موبایل</span>}
          </div>
          <span dir="ltr" className="block truncate text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
            {r.href} · {LINK_TYPE_LABELS[r.linkType] ?? r.linkType}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={() => move(r.id, "up")} disabled={i === 0 || pending} title="بالا" className="rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
          <ChevronUp className="size-4" />
        </button>
        <button type="button" onClick={() => move(r.id, "down")} disabled={i === count - 1 || pending} title="پایین" className="rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
          <ChevronDown className="size-4" />
        </button>
        <button type="button" onClick={() => startEdit(r)} title="ویرایش" className="rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
          <Pencil className="size-4" />
        </button>
        <button type="button" onClick={() => setConfirmId(r.id)} title="حذف" className="rounded-lg p-1.5 text-dz-a-error/70 dark:text-dz-a-error-300 hover:bg-dz-a-error/10 hover:text-dz-a-error dark:hover:text-dz-a-error-300">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            {editingId ? "ویرایش مورد" : "افزودن مورد"}
          </h2>
          {editingId && (
            <button type="button" onClick={startNew} className="flex items-center gap-1 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
              <Plus className="size-3.5" /> جدید
            </button>
          )}
        </div>
        {serverError && <div className="mb-3"><AdminFormError message={serverError} /></div>}
        {notice && <div className="mb-3"><AdminSuccessNotice message={notice} onDismiss={() => setNotice(null)} /></div>}
        <AdminFormShell form={form} onSubmit={submit}>
          <AdminTextField name="label" label="برچسب" required />
          <AdminTextField name="href" label="نشانی (href)" required dir="ltr" placeholder="/products یا https://…" />
          <AdminSelectField name="linkType" label="نوع لینک" options={MENU_LINK_TYPE_OPTIONS} />
          <AdminSelectField name="target" label="باز شدن در" options={LINK_TARGET_OPTIONS} />
          <AdminRelationSelect name="parentId" label="والد (اختیاری)" options={parentOptions} emptyLabel="— بدون والد (سطح اول) —" />
          <AutoIconField value={icon} onChange={(v) => form.setValue("icon", v, { shouldDirty: true })} />
          <AdminTextField name="badge" label="نشان (اختیاری)" placeholder="مثلاً: جدید / تخفیف" />
          <AdminTextField name="description" label="توضیح کوتاه (اختیاری)" placeholder="زیرعنوان در مگامنو/فوتر" />
          <div className="grid grid-cols-2 gap-3">
            <AdminCheckboxField name="desktopVisible" label="نمایش در دسکتاپ" />
            <AdminCheckboxField name="mobileVisible" label="نمایش در موبایل" />
          </div>
          <AdminCheckboxField name="isActive" label="فعال" />
          <button type="submit" disabled={pending} className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700 disabled:bg-dz-a-primary-300 dark:disabled:bg-dz-a-primary-800">
            {pending ? "در حال ذخیره…" : editingId ? "ذخیره" : "افزودن"}
          </button>
        </AdminFormShell>
      </div>

      <div className="flex flex-col gap-2">
        {tree.length === 0 && (
          <p className="rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-8 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
            هنوز موردی در این منو نیست.
          </p>
        )}
        {tree.map(({ row, children }, i) => (
          <div key={row.id} className="flex flex-col gap-2">
            {renderRow(row, i, tree.length, false)}
            {children.map((c, j) => renderRow(c, j, children.length, true))}
          </div>
        ))}
      </div>

      <AdminConfirmDialog
        open={confirmId !== null}
        title="حذف مورد منو"
        description="با حذف یک مورد، زیرمنوهای آن نیز حذف می‌شوند."
        confirmLabel="حذف"
        danger
        loading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
