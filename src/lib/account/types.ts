// Shared DTOs for the customer account area (client + API). All values are REAL
// data; sections with no data return empty arrays/nulls (no fakes — SKILL §H3).
import type { StoreProductCardData } from "@/components/storefront/product-card/types";
import type {
  OrderStatus,
  PaymentStatus,
  Role,
  ReviewStatus,
  QuestionStatus,
  ConversationStatus,
  StoreCreditType,
} from "@/generated/prisma/enums";

/* ----------------------------- profile ----------------------------- */

export type AccountProfile = {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  nationalId: string | null;
  birthDateISO: string | null; // Gregorian ISO; UI renders Jalali
  role: Role;
  createdAtISO: string;
};

/* ----------------------------- orders ------------------------------ */

export type OrderThumb = { title: string; image: string | null };

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  createdAtISO: string;
  totalRial: number;
  itemCount: number;
  thumbs: OrderThumb[];
  trackingCode: string | null;
};

export type OrderTimelineStep = {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  atISO: string | null;
};

export type OrderDetailLine = {
  title: string;
  image: string | null;
  variantLabel: string | null;
  quantity: number;
  unitPriceRial: number;
  lineTotalRial: number;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAtISO: string;
  trackingCode: string | null;
  subtotalRial: number;
  discountRial: number;
  shippingRial: number;
  totalRial: number;
  note: string | null;
  payment: {
    status: PaymentStatus;
    provider: string;
    refId: string | null;
    cardPan: string | null;
    paidAtISO: string | null;
  } | null;
  address: AddressDTO | null;
  lines: OrderDetailLine[];
  timeline: OrderTimelineStep[];
  // Enough to repopulate the (localStorage) cart; only still-active products.
  reorder: {
    productId: string;
    slug: string;
    title: string;
    image: string | null;
    priceRial: number;
    basePriceRial: number;
    quantity: number;
  }[];
};

/* ---------------------------- addresses ---------------------------- */

export type AddressDTO = {
  id: string;
  title: string | null;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line: string;
  plaque: string | null;
  unit: string | null;
  deliveryNote: string | null;
  isDefault: boolean;
};

/* ------------------------------ credit ----------------------------- */

export type CreditEntry = {
  id: string;
  amountRial: number; // positive; sign from direction
  direction: "IN" | "OUT";
  type: StoreCreditType;
  reason: string | null;
  createdAtISO: string;
  expiresAtISO: string | null;
};

export type CreditSummary = { balanceRial: number; entries: CreditEntry[] };

/* ----------------------------- messages ---------------------------- */

export type ConversationListItemDTO = {
  id: string;
  subject: string | null;
  status: ConversationStatus;
  lastMessagePreview: string | null;
  lastMessageAtISO: string;
  unread: number;
};

export type MessageDTO = {
  id: string;
  role: "VISITOR" | "OPERATOR" | "SYSTEM";
  body: string;
  createdAtISO: string;
};

export type ConversationThreadDTO = {
  id: string;
  token: string;
  subject: string | null;
  status: ConversationStatus;
  messages: MessageDTO[];
};

/* ------------------------ reviews & questions ---------------------- */

export type MyReviewDTO = {
  id: string;
  productSlug: string;
  productTitle: string;
  productImage: string | null;
  rating: number;
  title: string | null;
  text: string;
  status: ReviewStatus;
  createdAtISO: string;
};

export type MyQuestionDTO = {
  id: string;
  productSlug: string;
  productTitle: string;
  productImage: string | null;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  createdAtISO: string;
};

/* -------------------- product cards (wishlist/recent) -------------- */

export type AccountProductCard = StoreProductCardData & { productId: string };

/* ----------------------------- overview ---------------------------- */

export type AccountOverview = {
  activeOrder: OrderListItem | null;
  latestOrder: OrderListItem | null;
  defaultAddress: AddressDTO | null;
  creditRial: number;
  profileCompletion: number; // 0..100
  lastLoginISO: string | null;
  counts: {
    orders: number;
    onTheWay: number;
    wishlist: number;
    addresses: number;
    pendingReviews: number; // pending reviews + questions
    unreadMessages: number;
    recent: number;
  };
};

/* --------------------------- query keys ---------------------------- */

export const ACCOUNT_QUERY_KEYS = {
  overview: ["account", "overview"] as const,
  orders: ["account", "orders"] as const,
  addresses: ["account", "addresses"] as const,
  wishlist: ["account", "wishlist"] as const,
  recent: ["account", "recent"] as const,
  credit: ["account", "credit"] as const,
  messages: ["account", "messages"] as const,
  reviews: ["account", "reviews"] as const,
  questions: ["account", "questions"] as const,
};
