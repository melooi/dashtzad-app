import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import {
  feedbackCounts,
  listAdminQuestions,
  listAdminReviews,
} from "@/lib/admin/product-feedback";
import { QuestionRow, ReviewRow } from "@/components/admin/feedback/FeedbackModeration";
import { toPersianNumbers } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab === "questions" ? "questions" : "reviews";
  const counts = await feedbackCounts();

  const tabs = [
    { id: "reviews", label: "دیدگاه‌ها", n: counts.pendingReviews },
    { id: "questions", label: "پرسش‌ها", n: counts.pendingQuestions },
  ];

  return (
    <div>
      <AdminPageHeader
        title="دیدگاه‌ها و پرسش‌های محصول"
        description="بررسی، تأیید/رد دیدگاه‌ها و پاسخ به پرسش‌های مشتریان"
      />

      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/collections/reviews?tab=${t.id}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-dz-primary-600 text-white"
                : "border border-dz-primary-200 text-dz-primary-700 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg"
            }`}
          >
            {t.label}
            {t.n > 0 && (
              <span className={`rounded-full px-1.5 text-xs ${tab === t.id ? "bg-white/20" : "bg-dz-warning/15 text-dz-warning"}`}>
                {toPersianNumbers(t.n)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {tab === "reviews" ? (
        <ReviewsList />
      ) : (
        <QuestionsList />
      )}
    </div>
  );
}

async function ReviewsList() {
  const reviews = await listAdminReviews();
  if (reviews.length === 0)
    return (
      <AdminListEmptyState
        mode="empty"
        icon={<Star className="size-7" />}
        title="هنوز دیدگاهی ثبت نشده است"
        description="دیدگاه‌هایی که مشتریان برای محصولات می‌نویسند این‌جا برای بررسی و تأیید نمایش داده می‌شوند."
      />
    );
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <ReviewRow key={r.id} review={r} />
      ))}
    </div>
  );
}

async function QuestionsList() {
  const questions = await listAdminQuestions();
  if (questions.length === 0)
    return (
      <AdminListEmptyState
        mode="empty"
        icon={<MessageSquare className="size-7" />}
        title="هنوز پرسشی ثبت نشده است"
        description="پرسش‌هایی که مشتریان دربارهٔ محصولات می‌پرسند این‌جا برای پاسخ‌دهی نمایش داده می‌شوند."
      />
    );
  return (
    <div className="flex flex-col gap-3">
      {questions.map((q) => (
        <QuestionRow key={q.id} question={q} />
      ))}
    </div>
  );
}
