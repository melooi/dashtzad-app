"use client";

import { useState, useTransition } from "react";
import { Tag, Pencil, Trash2, Check, X, Search } from "lucide-react";
import { renameTag, deleteTag } from "@/app/admin/content/tags/actions";
import { useRouter } from "next/navigation";

type TagRow = { name: string; count: number };

export function TagsManager({ initialTags }: { initialTags: TagRow[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [q, setQ] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = q.trim() ? tags.filter((t) => t.name.includes(q.trim())) : tags;

  const startEdit = (name: string) => {
    setEditingTag(name);
    setEditVal(name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setEditVal("");
    setError(null);
  };

  const commitRename = (oldName: string) => {
    const n = editVal.trim();
    if (!n) return;
    startTransition(async () => {
      const res = await renameTag(oldName, n);
      if (!res.ok) { setError(res.error ?? "خطا"); return; }
      setTags((prev) =>
        prev.map((t) => (t.name === oldName ? { ...t, name: n } : t)).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fa")),
      );
      setEditingTag(null);
      router.refresh();
    });
  };

  const handleDelete = (name: string) => {
    if (!confirm(`برچسب «${name}» از همهٔ مقالات حذف می‌شود. ادامه می‌دهید؟`)) return;
    startTransition(async () => {
      const res = await deleteTag(name);
      if (!res.ok) { setError(res.error ?? "خطا"); return; }
      setTags((prev) => prev.filter((t) => t.name !== name));
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی برچسب…"
          className="w-full rounded-xl border border-dz-a-primary-200 bg-white py-2 ps-3 pe-9 text-sm text-dz-a-primary-900 outline-none transition-colors focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-dz-a-error/10 px-4 py-2 text-sm text-dz-a-error">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Tag className="size-8 text-dz-a-primary-200 dark:text-dz-a-night-faint" />
            <p className="text-sm font-medium text-dz-a-primary-600 dark:text-dz-a-night-muted">
              {q ? "نتیجه‌ای یافت نشد." : "هنوز برچسبی ثبت نشده."}
            </p>
            <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
              برچسب‌ها را از طریق فرم ویرایش مقاله وارد کنید.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dz-a-primary-100 dark:border-dz-a-night-border">
                <th className="px-4 py-3 text-start text-xs font-semibold text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  برچسب
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  مقالات
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
              {filtered.map((t) => (
                <tr key={t.name} className="group">
                  <td className="px-4 py-3">
                    {editingTag === t.name ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(t.name);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full rounded-lg border border-dz-a-primary-300 bg-white px-2 py-1 text-sm outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-base dark:text-dz-a-night-fg"
                        disabled={pending}
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="size-3.5 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
                        <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{t.name}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-dz-a-primary-100 text-xs font-semibold text-dz-a-primary-700 dark:bg-white/10 dark:text-dz-a-night-muted">
                      {t.count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {editingTag === t.name ? (
                        <>
                          <button
                            type="button"
                            onClick={() => commitRename(t.name)}
                            disabled={pending}
                            title="تأیید"
                            className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-success hover:bg-dz-a-success/10 disabled:opacity-50"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            title="لغو"
                            className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-primary-500 hover:bg-dz-a-primary-50 dark:hover:bg-white/5"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(t.name)}
                            title="تغییر نام"
                            className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-primary-500 hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.name)}
                            disabled={pending}
                            title="حذف برچسب"
                            className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-primary-400 hover:bg-dz-a-error/10 hover:text-dz-a-error disabled:opacity-50"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
