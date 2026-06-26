"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Save,
  Loader2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import {
  HOMEPAGE_BLOCK_TYPES,
  HOMEPAGE_BLOCK_LABELS,
  HOMEPAGE_BLOCK_FIELDS,
  emptyHomepageBlock,
  type HomepageBlock,
  type HomepageBlockType,
} from "@/lib/admin/globals";
import { toPersianNumbers } from "@/lib/price";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { GlobalFieldInput, type FieldContext } from "./GlobalFieldInput";
import { saveGlobal } from "@/app/admin/globals/actions";

let counter = 0;
function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    counter += 1;
    return `block-${counter}-${String(Date.now?.() ?? counter)}`;
  }
}

function summary(block: HomepageBlock): string {
  const title = typeof block.title === "string" && block.title ? block.title : "";
  if (title) return title;
  const eyebrow = typeof block.eyebrow === "string" ? block.eyebrow : "";
  return eyebrow || "—";
}

export function HomepageBuilder({
  initialBlocks,
  ctx,
}: {
  initialBlocks: HomepageBlock[];
  ctx: FieldContext;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<HomepageBlock[]>(initialBlocks);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState<HomepageBlockType>("Hero");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const touch = () => {
    setDirty(true);
    setSuccess(null);
  };

  const addBlock = () => {
    const block = emptyHomepageBlock(adding, newId());
    setBlocks((b) => [...b, block]);
    setOpenId(block.id);
    touch();
  };

  const updateBlock = (id: string, patch: Record<string, unknown>) => {
    setBlocks((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    touch();
  };

  const removeBlock = (id: string) => {
    setBlocks((b) => b.filter((x) => x.id !== id));
    touch();
  };

  const duplicateBlock = (id: string) => {
    setBlocks((b) => {
      const i = b.findIndex((x) => x.id === id);
      if (i < 0) return b;
      const clone = { ...b[i], id: newId() };
      const next = [...b];
      next.splice(i + 1, 0, clone);
      return next;
    });
    touch();
  };

  const move = (id: string, dir: -1 | 1) => {
    setBlocks((b) => {
      const i = b.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= b.length) return b;
      const next = [...b];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    touch();
  };

  const save = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await saveGlobal("homepage", { blocks });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("صفحه‌ی خانه ذخیره شد.");
      setDirty(false);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <AdminFormError message={error} />
      <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

      {/* Add block */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-3 shadow-xs">
        <span className="ps-1 text-sm font-medium text-dz-primary-600 dark:text-dz-primary-300">افزودن بخش جدید:</span>
        <select
          value={adding}
          onChange={(e) => setAdding(e.target.value as HomepageBlockType)}
          className="focus-ring flex-1 cursor-pointer rounded-xl border border-dz-primary-200 dark:border-dz-night-border bg-white dark:bg-dz-night-elevated px-3 py-2.5 text-sm text-dz-primary-800 dark:text-dz-night-fg shadow-xs outline-none transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 focus:border-dz-primary-500"
        >
          {HOMEPAGE_BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {HOMEPAGE_BLOCK_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addBlock}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800"
        >
          <Plus className="size-4" /> افزودن بلوک
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-dz-primary-200 dark:border-dz-night-border bg-dz-primary-50/30 dark:bg-white/5 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white dark:bg-dz-night-card text-dz-primary-300 dark:text-dz-night-faint shadow-xs ring-1 ring-dz-primary-100 dark:ring-dz-night-border">
            <Plus className="size-6" />
          </div>
          <p className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">صفحه‌ی خانه‌ی شما خالی است</p>
          <p className="max-w-sm text-sm leading-6 text-dz-primary-400 dark:text-dz-night-faint">
            بخش‌های صفحه‌ی خانه را مثل قطعات بساز: هیرو، محصولات منتخب، روایت برند، سوالات متداول و… . از بالا یک بخش اضافه کنید.
          </p>
        </div>
      )}

      {/* Block list */}
      <div className="flex flex-col gap-3">
        {blocks.map((block, i) => {
          const open = openId === block.id;
          const fields = HOMEPAGE_BLOCK_FIELDS[block.type as HomepageBlockType] ?? [];
          const active = block.isActive !== false;
          return (
            <div
              key={block.id}
              className={`rounded-2xl border bg-white dark:bg-dz-night-card shadow-xs transition-shadow hover:shadow-card ${
                open ? "border-dz-primary-300 dark:border-dz-primary-500/50 ring-1 ring-dz-primary-200 dark:ring-dz-night-border" : "border-dz-primary-100 dark:border-dz-night-border"
              } ${active ? "" : "opacity-70"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-dz-primary-50 dark:bg-white/5 font-heading text-xs font-bold text-dz-primary-500 dark:text-dz-night-muted">
                    {toPersianNumbers(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-dz-primary-100 dark:bg-dz-night-border px-2 py-0.5 text-xs font-medium text-dz-primary-700 dark:text-dz-night-fg">
                        <span className={`size-1.5 rounded-full ${active ? "bg-dz-success" : "bg-dz-primary-300 dark:bg-dz-primary-500"}`} aria-hidden />
                        {HOMEPAGE_BLOCK_LABELS[block.type as HomepageBlockType] ?? block.type}
                      </span>
                      {!active && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">غیرفعال</span>}
                    </div>
                    <p className="mt-1 truncate text-sm text-dz-primary-600 dark:text-dz-primary-300">{summary(block)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => move(block.id, -1)} disabled={i === 0} title="انتقال به بالا" aria-label="انتقال به بالا" className="focus-ring rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
                    <ChevronUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(block.id, 1)} disabled={i === blocks.length - 1} title="انتقال به پایین" aria-label="انتقال به پایین" className="focus-ring rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 disabled:opacity-30">
                    <ChevronDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => updateBlock(block.id, { isActive: !active })} title={active ? "غیرفعال‌سازی" : "فعال‌سازی"} aria-label={active ? "غیرفعال‌سازی" : "فعال‌سازی"} aria-pressed={active} className={`focus-ring rounded-lg p-1.5 transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 ${active ? "text-dz-success" : "text-dz-primary-400 dark:text-dz-night-faint"}`}>
                    {active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button type="button" onClick={() => duplicateBlock(block.id)} title="تکثیر" aria-label="تکثیر بلوک" className="focus-ring rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5">
                    <Copy className="size-4" />
                  </button>
                  <button type="button" onClick={() => setOpenId(open ? null : block.id)} title="ویرایش" aria-label="ویرایش بلوک" aria-expanded={open} className={`focus-ring rounded-lg p-1.5 transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 ${open ? "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-700 dark:text-dz-night-fg" : "text-dz-primary-500 dark:text-dz-night-muted"}`}>
                    <Pencil className="size-4" />
                  </button>
                  <span className="mx-0.5 h-5 w-px bg-dz-primary-100 dark:bg-dz-night-border" aria-hidden />
                  <button type="button" onClick={() => removeBlock(block.id)} title="حذف" aria-label="حذف بلوک" className="focus-ring rounded-lg p-1.5 text-dz-error/70 dark:text-dz-error-300/70 transition-colors hover:bg-dz-error/10 hover:text-dz-error dark:hover:text-dz-error-300">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {open && (
                <div className="@container border-t border-dz-primary-50 dark:border-dz-night-line p-4">
                  <div className="grid gap-4 @md:grid-cols-2">
                    {fields.map((f) => (
                      <div key={f.name} className={["textarea", "objectList", "products", "categories", "image"].includes(f.type) ? "@md:col-span-2" : ""}>
                        {f.type !== "checkbox" && (
                          <label className="mb-1.5 block text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg">{f.label}</label>
                        )}
                        <GlobalFieldInput
                          def={f}
                          value={block[f.name]}
                          ctx={ctx}
                          onChange={(v) => updateBlock(block.id, { [f.name]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 z-10 -mx-1 mt-2 flex items-center justify-between gap-3 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white/95 dark:bg-dz-night-elevated/85 px-4 py-3 shadow-xs backdrop-blur">
        <span className="flex items-center gap-2 text-xs text-dz-primary-400 dark:text-dz-night-faint">
          <span className={`size-1.5 rounded-full ${dirty ? "bg-dz-warning" : "bg-dz-success"}`} aria-hidden />
          {dirty ? "تغییرات ذخیره‌نشده دارید." : "همه‌ی تغییرات ذخیره شده است."}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "در حال ذخیره…" : "ذخیره‌ی صفحه‌ی خانه"}
        </button>
      </div>
    </div>
  );
}
