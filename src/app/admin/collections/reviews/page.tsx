import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import {
  feedbackCounts,
  listAdminQuestions,
  listAdminReviews,
} from "@/lib/admin/product-feedback";
import { FeedbackWorkspace } from "@/components/admin/feedback/FeedbackModeration";
import type { ReviewStatus, QuestionStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Tab = "all" | "pending" | "approved" | "rejected" | "questions";

const REVIEW_TAB_STATUS: Partial<Record<Tab, ReviewStatus>> = {
  pending:  "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const raw = sp.tab ?? "all";
  const tab: Tab = (["all", "pending", "approved", "rejected", "questions"] as Tab[]).includes(raw as Tab)
    ? (raw as Tab)
    : "all";

  const [counts, reviews, questions] = await Promise.all([
    feedbackCounts(),
    tab !== "questions"
      ? listAdminReviews({ status: REVIEW_TAB_STATUS[tab], newestFirst: tab === "all" })
      : Promise.resolve([]),
    tab === "questions"
      ? listAdminQuestions({ newestFirst: true })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="دیدگاه‌ها و پرسش‌های محصول"
        description="بررسی، تأیید/رد دیدگاه‌ها و پاسخ به پرسش‌های مشتریان"
        breadcrumbs={[
          { label: "مجموعه‌ها", href: "/admin/collections" },
          { label: "دیدگاه‌ها" },
        ]}
      />
      <FeedbackWorkspace
        tab={tab}
        reviews={reviews}
        questions={questions}
        counts={counts}
      />
    </div>
  );
}
