"use client";

import { useState, useTransition } from "react";
import { Zap, Package, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { SeoSection, SeoNote } from "@/components/admin/seo/SeoUi";
import { toPersianNumbers } from "@/lib/price";
import { submitAllProductsAction, submitAllPostsAction, submitCustomUrlsAction } from "./actions";

type Result = { ok: boolean; error?: string; count?: number } | null;

function ResultBadge({ result }: { result: Result }) {
  if (!result) return null;
  if (result.ok) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        {result.count ? `${toPersianNumbers(result.count)} URL ارسال شد` : "ارسال شد"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertCircle className="size-3.5" />
      {result.error ?? "خطا"}
    </span>
  );
}

export function IndexNowClient({ configured }: { configured: boolean }) {
  const [pending, startTransition] = useTransition();
  const [productResult, setProductResult] = useState<Result>(null);
  const [postResult, setPostResult] = useState<Result>(null);
  const [customResult, setCustomResult] = useState<Result>(null);
  const [customUrls, setCustomUrls] = useState("");

  if (!configured) {
    return (
      <SeoNote tone="warn">
        <span>
          متغیر محیطی <code className="font-mono">INDEXNOW_API_KEY</code> تنظیم نشده است. مقدار را در فایل{" "}
          <code className="font-mono">.env.local</code> اضافه کنید.
        </span>
      </SeoNote>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SeoSection title="ارسال سریع" description="URLها را به Bing و سایر موتورهای جستجوی پشتیبان IndexNow اطلاع می‌دهد">
        <div className="flex flex-wrap gap-3">
          {/* All products */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                startTransition(async () => {
                  const r = await submitAllProductsAction();
                  setProductResult(r);
                })
              }
              disabled={pending}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-4 py-2 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-50"
            >
              <Package className="size-4" />
              همه‌ی محصولات فعال
            </button>
            <ResultBadge result={productResult} />
          </div>

          {/* All posts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                startTransition(async () => {
                  const r = await submitAllPostsAction();
                  setPostResult(r);
                })
              }
              disabled={pending}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-4 py-2 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-50"
            >
              <FileText className="size-4" />
              همه‌ی مقالات منتشرشده
            </button>
            <ResultBadge result={postResult} />
          </div>
        </div>
      </SeoSection>

      <SeoSection title="ارسال دستی" description="هر URL را در یک خط بنویسید (باید با http شروع شود)">
        <div className="flex flex-col gap-3">
          <textarea
            value={customUrls}
            onChange={(e) => setCustomUrls(e.target.value)}
            dir="ltr"
            rows={6}
            placeholder={"https://dashtzad.ir/products/...\nhttps://dashtzad.ir/blog/..."}
            className="w-full rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-input px-3 py-2 font-mono text-sm text-dz-a-primary-800 dark:text-dz-a-night-fg placeholder-dz-a-primary-300 dark:placeholder-dz-a-night-faint focus:outline-none focus:ring-2 focus:ring-dz-a-primary-500"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                startTransition(async () => {
                  const r = await submitCustomUrlsAction(customUrls);
                  setCustomResult(r);
                  if (r.ok) setCustomUrls("");
                })
              }
              disabled={pending || !customUrls.trim()}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dz-a-primary-700 disabled:opacity-50"
            >
              <Send className="size-4" />
              ارسال
            </button>
            <ResultBadge result={customResult} />
          </div>
        </div>
      </SeoSection>
    </div>
  );
}
