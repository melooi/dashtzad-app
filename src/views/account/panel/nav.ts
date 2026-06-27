import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Package,
  Wallet,
  MessageSquareText,
  Bell,
  History,
  MapPin,
  Heart,
  User,
} from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/client";

export type ViewId =
  | "dashboard"
  | "orders"
  | "wallet"
  | "reviews"
  | "messages"
  | "recent"
  | "addresses"
  | "wishlist"
  | "account";

type IconType = ComponentType<{ className?: string }>;

export type NavItem = { id: ViewId; label: string; icon: IconType; ready: boolean };

// `ready: true` sections render an honest "به‌زودی" placeholder until their
// phase lands (see USER-PANEL-PLAN.md). Order matches the source design.
export const NAV: NavItem[] = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard, ready: true },
  { id: "orders", label: "سفارش‌های من", icon: Package, ready: true },
  { id: "wallet", label: "کیف پول من", icon: Wallet, ready: true },
  { id: "reviews", label: "دیدگاه‌ها و پرسش‌ها", icon: MessageSquareText, ready: true },
  { id: "messages", label: "پیام‌ها", icon: Bell, ready: true },
  { id: "recent", label: "بازدیدهای اخیر", icon: History, ready: true },
  { id: "addresses", label: "آدرس‌های من", icon: MapPin, ready: true },
  { id: "wishlist", label: "علاقه‌مندی‌ها", icon: Heart, ready: true },
  { id: "account", label: "اطلاعات حساب", icon: User, ready: true },
];

export function navItem(id: ViewId): NavItem {
  return NAV.find((n) => n.id === id) ?? NAV[0];
}

export type Tone = "green" | "gold" | "clay" | "muted";

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار پرداخت", tone: "gold" },
  PAID: { label: "پرداخت‌شده", tone: "green" },
  PROCESSING: { label: "در حال پردازش", tone: "gold" },
  SHIPPED: { label: "ارسال‌شده", tone: "clay" },
  DELIVERED: { label: "تحویل‌شده", tone: "green" },
  CANCELLED: { label: "لغو‌شده", tone: "muted" },
  REFUNDED: { label: "مرجوع‌شده", tone: "muted" },
};

// Copy for sections whose backend isn't built yet (Phase 1+).
export const PLACEHOLDER_COPY: Record<string, { desc: string }> = {
  orders: { desc: "سفارش‌های جاری و تاریخچه خریدهایت به‌زودی اینجا نمایش داده می‌شوند." },
  wallet: { desc: "کیف پول دشت‌زاد، شارژ و گردش حساب به‌زودی در این بخش فعال می‌شود." },
  reviews: { desc: "دیدگاه‌ها و پرسش‌وپاسخ محصولات به‌زودی اینجا در دسترس خواهد بود." },
  messages: { desc: "صندوق پیام‌ها و اعلان‌های حساب به‌زودی فعال می‌شود." },
  recent: { desc: "محصولاتی که اخیراً دیده‌ای به‌زودی اینجا فهرست می‌شوند." },
  addresses: { desc: "مدیریت آدرس‌های تحویل به‌زودی در این بخش فعال می‌شود." },
  wishlist: { desc: "فهرست علاقه‌مندی‌های تو به‌زودی اینجا نمایش داده می‌شود." },
};
