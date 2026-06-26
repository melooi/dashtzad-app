// Persian label + tone maps for the account panel.
import type {
  PaymentStatus,
  ReviewStatus,
  QuestionStatus,
  ConversationStatus,
  StoreCreditType,
} from "@/generated/prisma/enums";
import type { Tone } from "./nav";

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار پرداخت", tone: "gold" },
  SUCCESS: { label: "پرداخت موفق", tone: "green" },
  FAILED: { label: "ناموفق", tone: "clay" },
};

export const REVIEW_STATUS: Record<ReviewStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار تأیید", tone: "gold" },
  APPROVED: { label: "منتشر شده", tone: "green" },
  REJECTED: { label: "رد شده", tone: "muted" },
};

export const QUESTION_STATUS: Record<QuestionStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار پاسخ", tone: "gold" },
  ANSWERED: { label: "پاسخ داده شده", tone: "green" },
  REJECTED: { label: "رد شده", tone: "muted" },
};

export const CONVERSATION_STATUS: Record<ConversationStatus, { label: string; tone: Tone }> = {
  NEW: { label: "جدید", tone: "gold" },
  OPEN: { label: "باز", tone: "green" },
  PENDING: { label: "در انتظار پاسخ شما", tone: "clay" },
  RESOLVED: { label: "بسته‌شده", tone: "muted" },
};

export const CREDIT_TYPE: Record<StoreCreditType, string> = {
  GIFT: "هدیه",
  RETURN: "بازگشت وجه",
  COMPENSATION: "جبران خسارت",
  MANUAL_ADJUSTMENT: "اصلاح دستی",
  CAMPAIGN: "کمپین",
};
