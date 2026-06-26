"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Plus, Trash2, HelpCircle } from "lucide-react";

type Item = { q: string; a: string };

const inputCls =
  "w-full rounded-lg border border-dz-a-primary-200 bg-white px-2.5 py-1.5 text-sm text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg";

/** In-editor view for the FAQ block (dz-faq). */
export function FaqView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const items: Item[] = Array.isArray(node.attrs.items) ? node.attrs.items : [];
  const editable = editor.isEditable;
  const set = (next: Item[]) => updateAttributes({ items: next });
  const update = (i: number, patch: Partial<Item>) => set(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const add = () => set([...items, { q: "", a: "" }]);
  const remove = (i: number) => set(items.filter((_, idx) => idx !== i));

  return (
    <NodeViewWrapper
      as="div"
      className="dz-faq dz-faq--editing my-4 rounded-xl border border-dz-a-primary-200 bg-dz-a-primary-50/30 p-3 dark:border-dz-a-night-border dark:bg-white/2"
      contentEditable={false}
      dir="rtl"
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">
        <HelpCircle className="size-3.5" /> پرسش‌های پرتکرار
        <button
          type="button"
          onClick={deleteNode}
          title="حذف بلوک پرسش‌ها"
          aria-label="حذف بلوک پرسش‌ها"
          className="focus-ring ms-auto inline-flex size-7 items-center justify-center rounded-lg text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="px-1 py-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">هنوز پرسشی اضافه نشده.</p>
        )}
        {items.map((it, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-dz-a-primary-100 bg-white p-2 dark:border-dz-a-night-line dark:bg-dz-a-night-card">
            <div className="flex items-start gap-1.5">
              <input
                value={it.q}
                disabled={!editable}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder="پرسش…"
                aria-label="پرسش"
                className={`${inputCls} font-medium`}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                title="حذف پرسش"
                aria-label="حذف پرسش"
                className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <textarea
              value={it.a}
              disabled={!editable}
              onChange={(e) => update(i, { a: e.target.value })}
              placeholder="پاسخ…"
              aria-label="پاسخ"
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </div>
        ))}
      </div>

      {editable && (
        <button
          type="button"
          onClick={add}
          className="focus-ring mt-2 inline-flex items-center gap-1 rounded-lg border border-dashed border-dz-a-primary-300 px-2.5 py-1.5 text-xs text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
        >
          <Plus className="size-3.5" /> افزودن پرسش
        </button>
      )}
    </NodeViewWrapper>
  );
}
