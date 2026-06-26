import type { ReactNode } from "react";
import {
  MARKETING_BADGE_LABELS,
  type MarketingBadgeKey,
} from "@/lib/admin/product-variant";

type Tone = "brand" | "olive" | "gold" | "success" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  // Warm olive fill — the default premium Dashtzad pill.
  brand: "bg-dz-primary-600 text-white",
  olive: "bg-dz-primary-50 text-dz-primary-700 ring-1 ring-inset ring-dz-primary-200",
  gold: "bg-dz-warning/12 text-dz-warning ring-1 ring-inset ring-dz-warning/30",
  success: "bg-dz-success/12 text-dz-success ring-1 ring-inset ring-dz-success/25",
  danger: "bg-dz-error text-white",
  neutral: "bg-white/85 text-dz-primary-700 ring-1 ring-inset ring-dz-primary-200 backdrop-blur",
};

// Each marketing badge gets a deliberate tone so the storefront reads
// intentionally, not like a random tag soup.
const BADGE_TONE: Record<MarketingBadgeKey, Tone> = {
  BESTSELLER: "brand",
  DASHTZAD_PICK: "olive",
  ECONOMICAL: "success",
  GIFT: "gold",
  DAILY: "olive",
  HOSTING: "olive",
  LIMITED: "danger",
  NEW: "gold",
};

export function StoreBadge({
  children,
  tone = "olive",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold leading-none ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Convenience: render a marketing badge from its enum key with the right tone. */
export function MarketingBadgePill({
  badge,
  className = "",
}: {
  badge: MarketingBadgeKey;
  className?: string;
}) {
  return (
    <StoreBadge tone={BADGE_TONE[badge]} className={className}>
      {MARKETING_BADGE_LABELS[badge]}
    </StoreBadge>
  );
}
