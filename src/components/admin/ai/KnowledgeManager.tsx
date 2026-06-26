"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadKnowledgeFileAction,
  deleteKnowledgeSourceAction,
  reindexKnowledgeSourceAction,
  updateTopicAnswerAction,
  type KnowledgeActionResult,
} from "@/app/admin/ai/knowledge/actions";
import {
  FileText,
  Trash2,
  RefreshCw,
  Upload,
  ChevronDown,
  Pencil,
  Check,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SourceRow = {
  id: string;
  title: string;
  status: string;
  documentCount: number;
  lastIndexedAt: string | null;
  createdAt: string;
  chunkCount: number;
};

type TopicRow = {
  id: string;
  slug: string;
  topic: string;
  answer: string | null;
  hitCount: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatPersianDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: {
      label: "فعال",
      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    STALE: {
      label: "قدیمی",
      cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    DISABLED: {
      label: "غیرفعال",
      cls: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-dz-a-night-muted",
    },
  };
  const { label, cls } = map[status] ?? map.DISABLED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function Toast({
  result,
  onClose,
}: {
  result: KnowledgeActionResult;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm shadow-lg ${
        result.ok
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      }`}
      role="alert"
    >
      <span>{result.message}</span>
      <button
        onClick={onClose}
        className="opacity-60 hover:opacity-100"
        aria-label="بستن"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload zone
// ---------------------------------------------------------------------------
function UploadZone({ onDone }: { onDone: (r: KnowledgeActionResult) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".md")) {
      onDone({ ok: false, message: "فقط فایل‌های .md مجاز هستند." });
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFileChange(file);
  }

  function handleSubmit() {
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append("file", selectedFile);
    startTransition(async () => {
      const result = await uploadKnowledgeFileAction(fd);
      onDone(result);
      if (result.ok) setSelectedFile(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragging
            ? "border-dz-a-primary-400 bg-dz-a-primary-50 dark:border-dz-a-primary-500 dark:bg-dz-a-primary-900/20"
            : "border-dz-a-primary-200 bg-dz-a-primary-50/40 hover:border-dz-a-primary-300 dark:border-dz-a-night-border dark:bg-white/[0.02] dark:hover:border-dz-a-primary-600"
        }`}
      >
        <Upload className="size-8 text-dz-a-primary-400 dark:text-dz-a-primary-500" />
        <p className="text-sm text-dz-a-primary-600 dark:text-dz-a-night-muted">
          فایل .md را اینجا رها کنید یا کلیک کنید
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".md"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Selected file info */}
      {selectedFile && (
        <div className="flex items-center justify-between rounded-xl border border-dz-a-primary-200 bg-white px-4 py-3 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div className="flex items-center gap-3">
            <FileText className="size-5 shrink-0 text-dz-a-primary-500" />
            <div>
              <p className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                {selectedFile.name}
              </p>
              <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
                {(selectedFile.size / 1024).toFixed(1)} کیلوبایت
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
            }}
            className="text-dz-a-primary-400 hover:text-dz-a-error dark:text-dz-a-night-muted"
            aria-label="حذف انتخاب"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        disabled={!selectedFile || isPending}
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? (
          <>
            <RefreshCw className="size-4 animate-spin" />
            در حال ایندکس‌گذاری…
          </>
        ) : (
          <>
            <Upload className="size-4" />
            بارگذاری و ایندکس
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Source row
// ---------------------------------------------------------------------------
function SourceItem({
  source,
  onDone,
}: {
  source: SourceRow;
  onDone: (r: KnowledgeActionResult) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [isReindexing, startReindex] = useTransition();

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteKnowledgeSourceAction(source.id);
      onDone(result);
    });
  }

  function handleReindex() {
    startReindex(async () => {
      const result = await reindexKnowledgeSourceAction(source.id);
      onDone(result);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dz-a-primary-100 bg-white px-5 py-4 shadow-xs transition-shadow hover:shadow-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-primary-500" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            {source.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
            <span>{source.chunkCount} بخش</span>
            <span className="opacity-40">·</span>
            {source.lastIndexedAt ? (
              <span>ایندکس: {formatPersianDate(source.lastIndexedAt)}</span>
            ) : (
              <span>هنوز ایندکس نشده</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={source.status} />

        {/* Reindex */}
        <button
          onClick={handleReindex}
          disabled={isReindexing || isDeleting}
          title="ایندکس‌گذاری مجدد"
          className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-600 transition-colors hover:bg-dz-a-primary-50 disabled:opacity-40 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
        >
          <RefreshCw className={`size-3.5 ${isReindexing ? "animate-spin" : ""}`} />
          {isReindexing ? "در حال ایندکس…" : "ایندکس مجدد"}
        </button>

        {/* Delete with confirmation */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 rounded-xl bg-dz-a-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              <Check className="size-3.5" />
              تأیید
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            >
              انصراف
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleting || isReindexing}
            title="حذف"
            className="rounded-xl border border-dz-a-primary-100 p-1.5 text-dz-a-primary-400 transition-colors hover:border-dz-a-error/30 hover:bg-red-50 hover:text-dz-a-error disabled:opacity-40 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:bg-red-950/20"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topic row
// ---------------------------------------------------------------------------
function TopicItem({
  topic,
  onDone,
}: {
  topic: TopicRow;
  onDone: (r: KnowledgeActionResult) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topic.answer ?? "");
  const [isSaving, startSave] = useTransition();

  function handleSave() {
    startSave(async () => {
      const result = await updateTopicAnswerAction(topic.id, draft);
      onDone(result);
      if (result.ok) setEditing(false);
    });
  }

  return (
    <tr className="border-b border-dz-a-primary-50 last:border-0 dark:border-dz-a-night-border">
      {/* Topic */}
      <td className="px-6 py-3 align-top">
        <p className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
          {topic.topic}
        </p>
        <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
          {topic.slug}
        </p>
      </td>

      {/* Hit count */}
      <td className="px-4 py-3 align-top">
        <span className="inline-flex items-center rounded-full bg-dz-a-primary-100 px-2.5 py-0.5 text-xs font-semibold text-dz-a-primary-700 dark:bg-dz-a-primary-900/30 dark:text-dz-a-primary-300">
          {topic.hitCount.toLocaleString("fa-IR")}
        </span>
      </td>

      {/* Answer */}
      <td className="px-4 py-3 align-top">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-dz-a-primary-300 bg-white px-3 py-2 text-sm text-dz-a-primary-800 focus:border-dz-a-primary-500 focus:outline-none dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
          />
        ) : (
          <p className="max-w-sm truncate text-sm text-dz-a-primary-600 dark:text-dz-a-night-muted">
            {topic.answer ? topic.answer : <span className="italic opacity-50">پاسخ ثبت نشده</span>}
          </p>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1.5">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 rounded-xl bg-dz-a-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-dz-a-primary-700 disabled:opacity-40"
              >
                <Check className="size-3.5" />
                {isSaving ? "ذخیره…" : "ذخیره"}
              </button>
              <button
                onClick={() => {
                  setDraft(topic.answer ?? "");
                  setEditing(false);
                }}
                className="rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
              >
                انصراف
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs text-dz-a-primary-600 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            >
              <Pencil className="size-3.5" />
              ویرایش
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function KnowledgeManager({
  sources,
  topics,
}: {
  sources: SourceRow[];
  topics: TopicRow[];
}) {
  type Tab = "docs" | "topics";
  const [activeTab, setActiveTab] = useState<Tab>("docs");
  const [toast, setToast] = useState<KnowledgeActionResult | null>(null);

  function showToast(result: KnowledgeActionResult) {
    setToast(result);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tab switcher */}
      <div
        dir="rtl"
        className="flex gap-1 rounded-2xl border border-dz-a-primary-100 bg-dz-a-primary-50/60 p-1 dark:border-dz-a-night-border dark:bg-white/[0.03]"
        style={{ width: "fit-content" }}
      >
        {(
          [
            { id: "docs", label: "اسناد دانش" },
            { id: "topics", label: "موضوعات رایج" },
          ] as { id: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-dz-a-primary-800 shadow-sm dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                : "text-dz-a-primary-500 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:text-dz-a-night-fg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---------- TAB 1: Docs ---------- */}
      {activeTab === "docs" && (
        <div className="flex flex-col gap-5">
          {/* Upload card */}
          <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-6 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                بارگذاری فایل دانش
              </h2>
              <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
                فایل‌های .md برای دانش پایه‌ی دستیار هوش مصنوعی. هر فایل به بخش‌های کوچک تقسیم و ایندکس می‌شود.
              </p>
            </div>
            <UploadZone onDone={showToast} />
          </div>

          {/* Sources list */}
          <div className="rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <div className="border-b border-dz-a-primary-50 px-6 py-4 dark:border-dz-a-night-border">
              <h2 className="text-base font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                اسناد بارگذاری‌شده
              </h2>
              <p className="mt-0.5 text-sm text-dz-a-primary-400 dark:text-dz-a-night-muted">
                {sources.length} سند
              </p>
            </div>

            <div className="p-4">
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <FileText className="size-10 text-dz-a-primary-200 dark:text-dz-a-night-muted" />
                  <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-muted">
                    هنوز فایلی بارگذاری نشده است.
                  </p>
                  <p className="text-xs text-dz-a-primary-300 dark:text-dz-a-night-muted/60">
                    اولین فایل .md خود را از بالا بارگذاری کنید.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {sources.map((source) => (
                    <SourceItem key={source.id} source={source} onDone={showToast} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- TAB 2: Topics ---------- */}
      {activeTab === "topics" && (
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div className="border-b border-dz-a-primary-50 px-6 py-4 dark:border-dz-a-night-border">
            <h2 className="text-base font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
              موضوعات رایج
            </h2>
            <p className="mt-1 text-sm text-dz-a-primary-400 dark:text-dz-a-night-muted">
              سوالاتی که کاربران بیش از ۸ بار پرسیده‌اند. پاسخ‌های ذخیره‌شده در پاسخ‌های آینده استفاده می‌شوند.
            </p>
          </div>

          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <ChevronDown className="size-10 text-dz-a-primary-200 dark:text-dz-a-night-muted" />
              <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-muted">
                هنوز موضوع رایجی ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead>
                  <tr className="border-b border-dz-a-primary-50 dark:border-dz-a-night-border">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-dz-a-primary-400 dark:text-dz-a-night-muted">
                      موضوع
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-dz-a-primary-400 dark:text-dz-a-night-muted">
                      تکرار
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-dz-a-primary-400 dark:text-dz-a-night-muted">
                      پاسخ
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-dz-a-primary-400 dark:text-dz-a-night-muted">
                      ویرایش
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
                  {topics.map((topic) => (
                    <TopicItem key={topic.id} topic={topic} onDone={showToast} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast result={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
