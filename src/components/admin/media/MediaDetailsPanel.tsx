"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useTransition } from "react";
import {
  X,
  Copy,
  Check,
  Trash2,
  Loader2,
  Save,
  Link2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import type { MediaAssetDTO } from "@/lib/admin/media";
import { fieldClass, AdminField } from "@/components/admin/ui/AdminField";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { formatBytes, mimeLabel, MEDIA_USAGE_OPTIONS } from "@/lib/media/shared";
import { updateMediaMeta, deleteMediaAsset } from "@/lib/admin/media-actions";
import type { MediaUsage } from "@/generated/prisma/client";

export function MediaDetailsPanel({
  asset,
  onClose,
  onUpdated,
  onDeleted,
}: {
  asset: MediaAssetDTO | null;
  onClose: () => void;
  onUpdated: (asset: MediaAssetDTO) => void;
  onDeleted: (id: string) => void;
}) {
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [usage, setUsage] = useState<MediaUsage | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  // Reset the form whenever a different asset is opened.
  useEffect(() => {
    if (!asset) return;
    setAlt(asset.alt ?? "");
    setTitle(asset.title ?? "");
    setCaption(asset.caption ?? "");
    setUsage(asset.usage ?? "");
    setTags(asset.tags ?? []);
    setTagDraft("");
    setError(null);
    setSaved(false);
    setCopied(false);
  }, [asset]);

  if (!asset) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("کپی نشانی ناموفق بود.");
    }
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (t && !tags.includes(t) && tags.length < 20) setTags([...tags, t]);
    setTagDraft("");
  };

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateMediaMeta(asset.id, {
        alt,
        title,
        caption,
        usage: usage || null,
        tags,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      onUpdated(res.asset);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const remove = () => {
    startDelete(async () => {
      const res = await deleteMediaAsset(asset.id);
      setConfirmOpen(false);
      if (!res.ok) {
        setError(res.error);
        // The DB row may already be gone; still drop it from the UI.
        onDeleted(asset.id);
        return;
      }
      onDeleted(asset.id);
    });
  };

  return (
    <>
      <aside className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b border-dz-primary-100 px-4 py-3 dark:border-dz-night-border">
          <h2 className="font-heading text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">جزئیات رسانه</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="focus-ring rounded-lg p-1.5 text-dz-primary-400 hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:text-dz-night-faint dark:hover:bg-white/5 dark:hover:text-dz-night-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-dz-primary-100 bg-dz-primary-50/60 dark:border-dz-night-border dark:bg-white/5">
            <img src={asset.url} alt={asset.alt ?? asset.originalName} className="mx-auto max-h-56 w-full object-contain" />
          </div>

          {/* URL + copy */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dz-primary-700 dark:text-dz-night-fg">نشانی فایل</label>
            <div className="flex items-stretch gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-dz-primary-200 bg-dz-primary-50/40 px-3 py-2 dark:border-dz-night-border dark:bg-white/5">
                <Link2 className="size-3.5 shrink-0 text-dz-primary-400 dark:text-dz-night-faint" />
                <span dir="ltr" className="truncate font-mono text-xs text-dz-primary-700 dark:text-dz-night-muted" title={asset.url}>
                  {asset.url}
                </span>
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dz-primary-200 px-3 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg dark:hover:bg-white/5"
              >
                {copied ? <Check className="size-3.5 text-dz-success dark:text-dz-success-300" /> : <Copy className="size-3.5" />}
                {copied ? "کپی شد" : "کپی"}
              </button>
            </div>
          </div>

          {/* Read-only facts */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-dz-primary-100 bg-white p-3 text-xs dark:border-dz-night-border dark:bg-dz-night-card">
            <Fact label="نام اصلی" value={asset.originalName} dir="ltr" />
            <Fact label="فرمت" value={mimeLabel(asset.mimeType)} />
            <Fact label="حجم" value={formatBytes(asset.sizeBytes)} />
            <Fact
              label="ابعاد"
              value={asset.width && asset.height ? `${asset.width}×${asset.height}` : "نامشخص"}
              dir="ltr"
            />
            <Fact label="تاریخ" value={new Date(asset.createdAt).toLocaleDateString("fa-IR")} />
            <Fact label="حافظه" value={asset.storage === "LOCAL" ? "محلی" : asset.storage} />
          </dl>

          {/* Editable metadata */}
          <AdminField label="متن جایگزین (Alt)" hint="برای دسترس‌پذیری و سئو مهم است.">
            <input value={alt} onChange={(e) => setAlt(e.target.value)} className={fieldClass()} />
          </AdminField>
          <AdminField label="عنوان">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass()} />
          </AdminField>
          <AdminField label="توضیح (Caption)">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} className={`${fieldClass()} resize-y leading-7`} />
          </AdminField>
          <AdminField label="کاربرد">
            <select value={usage} onChange={(e) => setUsage(e.target.value as MediaUsage | "")} className={fieldClass()}>
              <option value="">— بدون دسته —</option>
              {MEDIA_USAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </AdminField>

          {/* Tags */}
          <AdminField label="برچسب‌ها">
            <div className="flex flex-col gap-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-dz-primary-50 px-2 py-1 text-xs text-dz-primary-700 ring-1 ring-dz-primary-100 dark:bg-white/5 dark:text-dz-primary-300 dark:ring-dz-night-border">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`حذف ${t}`} className="text-dz-primary-400 hover:text-dz-error dark:text-dz-night-faint">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="افزودن برچسب و Enter"
                  className={fieldClass()}
                />
                <button type="button" onClick={addTag} aria-label="افزودن برچسب" className="focus-ring shrink-0 rounded-xl border border-dz-primary-200 px-3 text-dz-primary-600 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-primary-300 dark:hover:bg-white/5">
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </AdminField>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg border border-dz-error/30 bg-dz-error/5 px-3 py-2 text-xs text-dz-error dark:text-dz-error-300">
              <AlertTriangle className="size-3.5 shrink-0" /> {error}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {pending ? "در حال ذخیره…" : saved ? "ذخیره شد" : "ذخیره‌ی تغییرات"}
          </button>

          {/* Danger */}
          <div className="mt-1 rounded-xl border border-dz-error/25 bg-dz-error/5 p-3 dark:bg-dz-error/10">
            <p className="flex items-start gap-1.5 text-xs leading-5 text-dz-error dark:text-dz-error-300">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              حذف، فایل و رکورد را پاک می‌کند. اگر این نشانی در محصول، بنر یا سئو استفاده شده باشد، آن‌جا خراب می‌شود.
            </p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="focus-ring mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-dz-error/40 px-3 py-1.5 text-xs font-medium text-dz-error transition-colors hover:bg-dz-error/10 dark:text-dz-error-300"
            >
              <Trash2 className="size-3.5" /> حذف رسانه
            </button>
          </div>
        </div>
      </aside>

      <AdminConfirmDialog
        open={confirmOpen}
        title="حذف رسانه"
        description="این عمل قابل بازگشت نیست. مطمئن هستید؟"
        confirmLabel="حذف"
        danger
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function Fact({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-dz-primary-400 dark:text-dz-night-faint">{label}</dt>
      <dd dir={dir} className="truncate font-medium text-dz-primary-800 dark:text-dz-night-fg" title={value}>
        {value}
      </dd>
    </div>
  );
}
