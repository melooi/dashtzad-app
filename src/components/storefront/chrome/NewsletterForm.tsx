"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-store-primary-tint px-3 py-3 text-sm text-store-primary">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>ممنون! به‌زودی اخبار و تخفیف‌های دشت‌زاد رو دریافت می‌کنید.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-store-border bg-store-surface-soft px-4 py-4">
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-store-primary-tint">
          <Mail className="size-4 text-store-primary" />
        </span>
        <div>
          <p className="text-sm font-bold text-store-text">خبرنامه دشت‌زاد</p>
          <p className="text-xs leading-relaxed text-store-text-muted">
            از تخفیف‌ها و محصولات جدید زودتر باخبر شو
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-2"
        aria-label="خبرنامه دشت‌زاد"
      >
        <input
          type="email"
          required
          placeholder="آدرس ایمیل"
          dir="ltr"
          className="w-full rounded-lg border border-store-border bg-store-surface px-3 py-2.5 text-sm text-store-text placeholder:text-store-text-faint focus:border-store-primary focus:outline-none focus:ring-1 focus:ring-store-primary/20"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-store-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-store-primary-hover active:scale-[0.98]"
        >
          عضویت در خبرنامه
        </button>
      </form>

      <p className="text-[0.65rem] leading-relaxed text-store-text-faint">
        اسپم نمی‌فرستیم. هر موقع خواستی لغو عضویت کن.
      </p>
    </div>
  );
}
