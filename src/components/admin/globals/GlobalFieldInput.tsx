"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { GlobalFieldDef } from "@/lib/admin/globals";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { MultiChipCell, type ChipOption } from "@/components/admin/products/cells/MultiChipCell";
import { AutoIconField } from "@/components/admin/site/AutoIconField";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import type { MediaUsage } from "@/generated/prisma/client";

/** Best-effort usage bucket for an image field, inferred from its name so the
 *  picker can default its filter (e.g. og→SEO, logo→BRAND). */
function inferUsage(name: string): MediaUsage {
  const n = name.toLowerCase();
  if (n.includes("og") || n.includes("twitter")) return "SEO";
  if (n.includes("logo") || n.includes("favicon") || n.includes("icon")) return "BRAND";
  return "GENERAL";
}

export type RelOption = { id: string; title: string };

export type FieldContext = {
  menuOptions: { value: string; label: string }[];
  productOptions: RelOption[];
  categoryOptions: RelOption[];
  faqGroupOptions: RelOption[];
};

const EMPTY_CTX: FieldContext = {
  menuOptions: [],
  productOptions: [],
  categoryOptions: [],
  faqGroupOptions: [],
};

const toChips = (opts: RelOption[]): ChipOption[] =>
  opts.map((o) => ({ id: o.id, label: o.title, chip: o.title }));

/** Render one global/block field as a controlled input. */
export function GlobalFieldInput({
  def,
  value,
  onChange,
  ctx = EMPTY_CTX,
}: {
  def: GlobalFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx?: FieldContext;
}) {
  const id = `gf-${def.name}`;

  switch (def.type) {
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-dz-primary-800 dark:text-dz-night-fg">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="size-4 accent-dz-primary-600"
          />
          {def.label}
        </label>
      );

    case "textarea":
      return (
        <textarea
          id={id}
          rows={def.rows ?? 3}
          dir={def.dir}
          placeholder={def.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass()} resize-y leading-7`}
        />
      );

    case "number":
      return (
        <input
          id={id}
          type="text"
          inputMode="numeric"
          dir="ltr"
          placeholder={def.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ""))}
          className={fieldClass()}
        />
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(String(value ?? "")) ? String(value) : "#4a6340"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-dz-primary-200 dark:border-dz-night-border"
            aria-label={def.label}
          />
          <input
            type="text"
            dir="ltr"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#4a6340"
            className={`${fieldClass()} font-mono`}
          />
        </div>
      );

    case "select":
      return (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass()}
        >
          {(def.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "menu":
      return (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass()}
        >
          <option value="">— بدون منو —</option>
          {ctx.menuOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "product":
    case "category":
    case "faqGroup": {
      const opts =
        def.type === "product"
          ? ctx.productOptions
          : def.type === "category"
            ? ctx.categoryOptions
            : ctx.faqGroupOptions;
      return (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass()}
        >
          <option value="">— انتخاب —</option>
          {opts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      );
    }

    case "products":
    case "categories": {
      const opts = def.type === "products" ? ctx.productOptions : ctx.categoryOptions;
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <MultiChipCell
          options={toChips(opts)}
          selectedIds={selected}
          onChange={(ids) => onChange(ids)}
          placeholder="انتخاب…"
          dataCell={`rel-${def.name}`}
          ariaLabel={def.label}
          maxChips={6}
        />
      );
    }

    case "stringList": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-col gap-2">
          {list.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                dir={def.dir}
                value={item}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className={fieldClass()}
              />
              <button
                type="button"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                className="focus-ring shrink-0 rounded-lg border border-dz-error/30 px-2 text-dz-error dark:text-dz-error-300 transition-colors hover:bg-dz-error/10"
                aria-label="حذف"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...list, ""])}
            className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-3 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
          >
            <Plus className="size-3.5" /> افزودن
          </button>
        </div>
      );
    }

    case "objectList": {
      const list = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const itemFields = def.itemFields ?? [];
      const blank = () =>
        Object.fromEntries(
          itemFields.map((f) => [
            f.name,
            f.type === "checkbox" ? true : f.type === "number" ? 0 : "",
          ]),
        );
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= list.length) return;
        const next = [...list];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
      };
      return (
        <div className="flex flex-col gap-3">
          {list.map((item, i) => (
            <div key={i} className="rounded-xl border border-dz-primary-100 dark:border-dz-night-border bg-dz-primary-50/40 dark:bg-white/5 p-3 shadow-xs">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-dz-primary-500 dark:text-dz-night-muted">
                  <span className="flex size-5 items-center justify-center rounded-md bg-white dark:bg-dz-night-card font-heading text-[10px] font-bold text-dz-primary-500 dark:text-dz-night-muted ring-1 ring-dz-primary-100 dark:ring-dz-night-border">
                    {i + 1}
                  </span>
                  مورد
                </span>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="focus-ring rounded p-1 text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-100 dark:hover:bg-white/10 disabled:opacity-30" aria-label="انتقال به بالا">
                    <ChevronUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="focus-ring rounded p-1 text-dz-primary-500 dark:text-dz-night-muted transition-colors hover:bg-dz-primary-100 dark:hover:bg-white/10 disabled:opacity-30" aria-label="انتقال به پایین">
                    <ChevronDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="focus-ring rounded p-1 text-dz-error/70 dark:text-dz-error-300/70 transition-colors hover:bg-dz-error/10 hover:text-dz-error dark:hover:text-dz-error-300" aria-label="حذف مورد">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {itemFields.map((f) => (
                  <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    {f.type !== "checkbox" && (
                      <label className="mb-1 block text-xs font-medium text-dz-primary-700 dark:text-dz-night-fg">{f.label}</label>
                    )}
                    <GlobalFieldInput
                      def={f}
                      value={item[f.name]}
                      ctx={ctx}
                      onChange={(v) => {
                        const next = [...list];
                        next[i] = { ...item, [f.name]: v };
                        onChange(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...list, blank()])}
            className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-3 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
          >
            <Plus className="size-3.5" /> {def.itemLabel ?? "افزودن"}
          </button>
        </div>
      );
    }

    case "icon":
      return (
        <AutoIconField value={String(value ?? "")} onChange={(v) => onChange(v)} label={def.label} />
      );

    case "image":
      return (
        <MediaPicker
          value={String(value ?? "")}
          onChange={(v) => onChange(v)}
          usage={inferUsage(def.name)}
        />
      );

    // text | url | default
    default:
      return (
        <input
          id={id}
          type="text"
          dir={def.dir}
          placeholder={def.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={def.locked}
          className={`${fieldClass()} ${def.dir === "ltr" ? "font-mono" : ""}`}
        />
      );
  }
}
