"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareText, Star, Store } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { PanelEmpty, PanelError, PanelLoading, Stars, TonePill } from "../ui";
import { QUESTION_STATUS, REVIEW_STATUS } from "../labels";
import { jsonGet } from "../fetcher";
import {
  ACCOUNT_QUERY_KEYS,
  type MyQuestionDTO,
  type MyReviewDTO,
} from "@/lib/account/types";
import { formatJalali } from "@/lib/date";

type Tab = "reviews" | "questions";

function ProductThumb({ image, title, slug }: { image: string | null; title: string; slug: string }) {
  return (
    <Link href={`/products/${slug}`} className="flex items-center gap-2.5">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-store-border bg-store-surface-warm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="size-full object-contain p-1" />
        ) : (
          <Star className="size-4 text-store-text-faint" />
        )}
      </span>
      <span className="text-sm font-bold text-store-text hover:text-store-primary">{title}</span>
    </Link>
  );
}

function ReviewsTab() {
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.reviews,
    queryFn: () => jsonGet<{ reviews: MyReviewDTO[] }>("/api/account/reviews"),
  });
  if (q.isLoading) return <PanelLoading />;
  if (q.isError) return <PanelError onRetry={() => q.refetch()} />;
  const reviews = q.data?.reviews ?? [];
  if (reviews.length === 0)
    return (
      <PanelEmpty
        icon={<Star className="size-7" />}
        title="هنوز دیدگاهی ثبت نکرده‌ای"
        desc="بعد از خرید، در صفحهٔ هر محصول می‌توانی دیدگاهت را ثبت کنی."
        action={
          <Link href="/products" className="store-btn store-btn-primary">
            <Store className="size-4" /> رفتن به فروشگاه
          </Link>
        }
      />
    );
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
          <div className="flex flex-wrap items-center gap-2">
            <ProductThumb image={r.productImage} title={r.productTitle} slug={r.productSlug} />
            <span className="ms-auto">
              <TonePill tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</TonePill>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Stars value={r.rating} />
            {r.title && <span className="text-sm font-bold text-store-text">{r.title}</span>}
            <span className="ms-auto text-xs text-store-text-faint">{formatJalali(r.createdAtISO)}</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-store-text-muted">{r.text}</p>
        </div>
      ))}
    </div>
  );
}

function QuestionsTab() {
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.questions,
    queryFn: () => jsonGet<{ questions: MyQuestionDTO[] }>("/api/account/questions"),
  });
  if (q.isLoading) return <PanelLoading />;
  if (q.isError) return <PanelError onRetry={() => q.refetch()} />;
  const questions = q.data?.questions ?? [];
  if (questions.length === 0)
    return (
      <PanelEmpty
        icon={<MessageSquareText className="size-7" />}
        title="هنوز پرسشی نپرسیده‌ای"
        desc="در صفحهٔ هر محصول می‌توانی پرسشت را مطرح کنی تا کارشناسان دشت‌زاد پاسخ دهند."
        action={
          <Link href="/products" className="store-btn store-btn-primary">
            <Store className="size-4" /> رفتن به فروشگاه
          </Link>
        }
      />
    );
  return (
    <div className="flex flex-col gap-3">
      {questions.map((qq) => (
        <div key={qq.id} className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
          <div className="flex flex-wrap items-center gap-2">
            <ProductThumb image={qq.productImage} title={qq.productTitle} slug={qq.productSlug} />
            <span className="ms-auto">
              <TonePill tone={QUESTION_STATUS[qq.status].tone}>
                {QUESTION_STATUS[qq.status].label}
              </TonePill>
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-store-text">پرسش: {qq.question}</p>
          {qq.answer ? (
            <p className="mt-2 rounded-xl bg-store-primary-soft px-3.5 py-2.5 text-sm leading-7 text-store-text">
              پاسخ: {qq.answer}
            </p>
          ) : (
            <p className="mt-2 text-xs text-store-text-faint">در انتظار پاسخ کارشناسان</p>
          )}
          <div className="mt-2 text-xs text-store-text-faint">{formatJalali(qq.createdAtISO)}</div>
        </div>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const [tab, setTab] = useState<Tab>("reviews");
  return (
    <div>
      <SectionHead
        title="دیدگاه‌ها و پرسش‌ها"
        sub="دیدگاه‌ها و پرسش‌های تو دربارهٔ محصولات"
        action={
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setTab("reviews")} className={`store-chip ${tab === "reviews" ? "is-on" : ""}`}>
              دیدگاه‌های محصول
            </button>
            <button type="button" onClick={() => setTab("questions")} className={`store-chip ${tab === "questions" ? "is-on" : ""}`}>
              پرسش‌های محصول
            </button>
          </div>
        }
      />
      {tab === "reviews" ? <ReviewsTab /> : <QuestionsTab />}
    </div>
  );
}
