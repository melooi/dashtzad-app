"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/common/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <AlertTriangle className="size-12 text-dz-error" />
      <h1 className="font-heading text-2xl font-bold text-dz-primary-800">
        خطایی رخ داد
      </h1>
      <p className="max-w-md text-sm text-dz-primary-600">
        متأسفیم؛ مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      {error.digest && (
        <code className="rounded bg-dz-primary-50 px-2 py-1 text-xs text-dz-primary-500">
          {error.digest}
        </code>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>تلاش مجدد</Button>
        <Link href="/">
          <Button variant="outline">بازگشت به خانه</Button>
        </Link>
      </div>
    </main>
  );
}
