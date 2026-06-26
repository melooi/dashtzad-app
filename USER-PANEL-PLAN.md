# USER PANEL — Master Plan (پنل کاربری)

Source design: Claude Design project `966a03a8…` → `wp/preview/account.html` (+ `css/account.css`).
Decisions locked with user (2026-06-25): **(C) full build incl. new backends** · **SPA (single client component, view state in localStorage)**.
Palette = storefront green `store-*` (`#15803d`). Fonts → IRANYekanX (body) + Kalameh (headings). Toman icon = `toman.svg`. Numbers via `toPersianNumbers`.

---

## 0. Architecture  (refined with user 2026-06-25)

- **Site chrome reused:** the panel lives under the existing `(public)` layout, so the **site `Header` + `Footer` + `BottomNav` are reused as-is**. We do NOT build the design's custom panel header (back-to-shop / bell / cart already exist in the site Header). We build **only the panel body** (sidebar + section content).
- **Host route:** `/account` (server component) → `requireAuth()` → renders `<AccountPanel user={…} />` (client), wrapped in a `StoreContainer` so it lines up with header/footer.
- **SPA:** one client tree. `state.view` persisted in `localStorage` (`dz_acct_view`), like the design. Sections + modals + toast are React components.
- **Data:** TanStack Query v5 (already a dep) → **add** a `QueryClientProvider` (`src/app/providers.tsx`, wired in root layout). Queries hit new `/api/account/*` route handlers (Zod + `getCurrentUser()` guard, prices/totals always recomputed server-side — follow `api/orders/route.ts`).
- **Styling — REUSE existing system, no new colors/styles (user constraint):** do **NOT** port `account.css`. The design was already built on the storefront `store-*` system, so rebuild the panel with the **existing `store-*` tokens + existing classes**: `store-btn[-primary/-secondary/-soft]`, `store-chip` (tabs), `store-eyebrow`, `store-section-bar`, `store-toman`, card = `rounded-2xl border border-store-border bg-store-surface shadow-store-xs`, `StoreContainer`/`StoreSection`, `formatToman`/`toPersianNumbers`. Pick the closest existing primitive for every design element. (Note: the `common/` Button/TextField/EmptyState are the **olive `dz-*`** system used by admin — NOT used here; the panel is storefront-green.)
- **Honesty rule (H3/H4):** any section whose data isn't live yet ships a clear empty/«به‌زودی» state, never fake data.

## 1. Backend additions (all **additive** — no existing field/index removed, per H7)

| Change | Detail |
|---|---|
| extend `User` | `nationalId String?`, `birthDate DateTime?` (account-info section) |
| extend `Address` | `title String?`, `icon String?`, `plaque String?`, `unit String?` (richer cards/form) |
| new `Wallet` + `WalletTransaction` | `Wallet{userId @unique, balance_rial}`; `WalletTransaction{walletId, type CREDIT/DEBIT, amount_rial, title, orderId?, createdAt}` + enum |
| new `LoyaltyAccount` + `PointsTransaction` | points + tier (tier derived from points/spend); enum `LoyaltyTier` |
| new `UserMessage` | `{userId, icon, title, body, isRead, createdAt}` (notifications/inbox) |
| new `ProductQuestion` | `{productId, userId, question, answer?, answeredAt?, status}` — also surfaces on PDP |
| new `Favorite` | `{userId, productId, createdAt}`; migrate `FavButton` `dz_fav` → server for logged-in, localStorage fallback for guests |
| recent views | **localStorage** (recommended, honest, no write-amplification) — or optional `RecentView` model if you insist on server-side |

## 2. API surface (`/api/account/*`, session-guarded, Zod)

overview · orders (+[id] tracking) · addresses CRUD + set-default · wallet (+ ZarinPal top-up in **Rial** + verify) · loyalty · messages (+ mark-read) · reviews (pending/mine + POST) · questions (GET/POST) · favorites (GET/POST/DELETE) · profile PATCH · recent.

## 3. Items that don't map to the app (need a product call)

- **«تغییر رمز عبور» modal / 2FA toggle:** app is OTP-only, no passwords. → Recommend: replace with OTP-based phone-change, **defer 2FA**. (design feature dropped unless you want a new auth system).
- **Wishlist:** today localStorage-only across storefront cards → recommend hybrid `Favorite` model + localStorage guest fallback.
- **Recent views:** recommend localStorage.

## 4. Phasing (each phase = page-lock + QA doc, build must pass — H1)

- **Phase 0 — Foundation & shell.** `QueryClientProvider`; port `account.css` + panel tokens; SPA shell (header, collapsible sidebar nav, view router, toast + modal infra); **Dashboard** wired to real orders/addresses/wishlist counts; **Account-info** section (real `User` + profile edit). Prisma migration for `User` fields. → first lock.
- **Phase 1 — Orders + Tracking** (real `Order/OrderItem/OrderStatusHistory/Payment`), **Addresses** full CRUD (extend `Address` + modals), **Wishlist** → `Favorite` model.
- **Phase 2 — Wallet** (model + ZarinPal top-up + tx list + dashboard stat) + **Loyalty** (points/tier).
- **Phase 3 — Messages** (inbox) + **Reviews & Q&A** (ProductReview + ProductQuestion incl. PDP surface) + **Recent views**.
- **Phase 4 — Admin** surfaces for new systems (wallet adjust, send message, answer Q&A, loyalty config) + responsive/RTL QA pass.

---

Proceeding order: get approval → **Phase 0** first.
