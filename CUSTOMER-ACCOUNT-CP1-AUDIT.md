# CUSTOMER-ACCOUNT-CP1 — Audit & Implementation Plan

Date: 2026-06-25 · Scope: full customer account area + backend + admin (no payment gateway, no checkout changes).
Convention note: the account UI is a **client SPA at `/account`** (view state in localStorage, chosen in Phase 0). Per spec ("keep existing convention but document it") we keep the SPA and map each spec route to a panel view; deep order detail stays at the existing `/orders/[id]` page.

---

## 1. What already EXISTS (real, backend-connected)

| Area | State | Files |
|---|---|---|
| Auth/session | ✅ OTP + opaque DB session; `requireAuth/requireAdmin/getCurrentUser` | `src/lib/auth/{guards,session,phone,otp}.ts` |
| Account host + SPA shell | ✅ Phase 0 — sidebar, dashboard, profile sections; other views placeholder | `src/app/(public)/account/page.tsx`, `src/views/account/*` |
| Profile read/edit | ✅ `GET /api/account/overview`, `PATCH /api/account/profile` (name/email/nationalId/birthDate) | `src/app/api/account/*` |
| Orders (data) | ✅ `Order/OrderItem/OrderStatusHistory/Payment`; create at `POST /api/orders` | schema + `src/app/api/orders/route.ts` |
| Order detail page | ✅ `/orders/[id]` with **ownership check** (`order.userId===user.id \|\| ADMIN` → else `notFound()`) | `src/app/(public)/orders/[id]/page.tsx` |
| Addresses (data) | ✅ `Address` model; ownership-checked in order creation. **No CRUD UI/API yet.** | schema |
| Reviews (data + PDP) | ✅ `ProductReview`; PDP shows APPROVED reviews. **No submit UI, no API, admin = placeholder.** | PDP `products/[slug]` |
| Chat (full) | ✅ CHAT-CP1/CP2: `Conversation`+`ChatMessage`, storefront `ChatWidget` + `public-actions` (polling), admin `/admin/chat` + `src/lib/chat/service.ts`. Logged-in convos link to `userId`. | `src/components/storefront/chat/*`, `src/lib/chat/*`, `src/app/admin/chat/*` |
| Cart (client) | ✅ localStorage `lib/cart.ts` (`addItem` etc.) → **reorder is feasible client-side** | `src/lib/cart.ts` |
| Admin UI kit | ✅ `AdminPageHeader, AdminDataTable, AdminStatusBadge, AdminToolbar, AdminSearchInput, AdminFilterBar, AdminField/TextField/SelectField, AdminFormSection, AdminSubmitBar, AdminConfirmDialog, AdminEmptyState` | `src/components/admin/ui/*` |
| Admin nav | ✅ `ADMIN_NAV` groups; **orders/users links exist but routes NOT built** | `src/lib/admin/nav.ts` |

## 2. What is UI-only / placeholder

- Account SPA views: **orders, wallet, reviews, messages, recent, addresses, wishlist** → currently "به‌زودی" placeholders (Phase 0, honest).
- Wishlist: **localStorage only** (`dz_fav` = product slugs), `FavButton` + `useFavCount`. No server model.
- Admin: `/admin/collections/orders`, `/admin/collections/users`, `/admin/collections/reviews`, `/admin/collections/comments` → fall through to generic `[collection]` placeholder.

## 3. What is MISSING in backend

- Orders **list** endpoint for a customer (only single-order fetch + create exist).
- Addresses **CRUD** API (+ set-default).
- **Wishlist** model + API (currently localStorage).
- **Recent views** — nothing at all (no model, no recording).
- **Store credit / اعتبار دشت‌زاد** — nothing.
- **Product questions (پرسش)** — nothing (only reviews).
- **Review submit** API + customer "my reviews/questions" lists.
- **Admin**: order management, customer 360, review/question moderation, credit adjustment.
- **Customer messages** view (data exists via Conversation; needs a customer-side "my conversations" reader).
- Internal **customer notes** for admin 360.

## 4. Additive schema changes (NO existing field/index removed — SKILL §H7)

New models / enums:
- `WishlistItem { id, userId, productId, createdAt, @@unique([userId,productId]) }`
- `RecentProductView { id, userId, productId, viewedAt, @@unique([userId,productId]) }` (upsert → keep latest)
- `StoreCreditTransaction { id, userId, amount_rial Int, type StoreCreditType, direction StoreCreditDirection, reason String?, expiresAt DateTime?, createdByAdminId String?, createdAt }` — balance = Σ(IN) − Σ(OUT)
  - `enum StoreCreditType { GIFT RETURN COMPENSATION MANUAL_ADJUSTMENT CAMPAIGN }`
  - `enum StoreCreditDirection { IN OUT }`
- `ProductQuestion { id, userId, productId, question, answer String?, answeredById String?, answeredAt DateTime?, status QuestionStatus, createdAt, updatedAt }`
  - `enum QuestionStatus { PENDING ANSWERED REJECTED }`
- `CustomerNote { id, userId, authorId, body, createdAt }` (admin internal notes)

Additive fields:
- `Address`: `title String?` (label خانه/کار/سفارشی), `plaque String?`, `unit String?`, `deliveryNote String?`.
- `Order`: `trackingCode String?` (admin sets, customer reads).
- (User profile fields `nationalId`,`birthDate` already added in Phase 0.)

Migration name: `add_customer_account_cp1`.

## 5. Deferred (documented, not built here)

- **Credit redemption at checkout** → CHECKOUT-CREDIT-CP (checkout/payment untouched per spec).
- **Realtime** chat/messages → keep polling/refresh (CHAT already polls).
- **Invoice/receipt download** → no backend generator; hidden (no fake button).
- **Phone-number change** → no OTP-change flow exists → show «غیرقابل تغییر» (no fake verification).
- **Admin impersonation** → explicitly excluded this checkpoint.
- Server-side **cart** → stays localStorage; reorder pushes into client cart.

## 6. Exact implementation plan (phased; build must pass each phase — SKILL §H1)

**P1 — Schema + data layer.** Add models/fields above → `prisma migrate dev` → generate. Add `src/lib/account/*` services (ownership-checked queries) + `src/lib/credit/service.ts`.

**P2 — Customer API/actions** (all `getCurrentUser()` + ownership + Zod + Persian errors):
`/api/account/orders` (list) · `/api/account/addresses` CRUD + set-default · `/api/account/wishlist` GET/POST/DELETE · `/api/account/recent` GET (+ record helper) · `/api/account/credit` GET · `/api/account/messages` GET (reuse chat service, filter `userId`) · `/api/account/reviews` GET+POST · `/api/account/questions` GET+POST. Expand `/api/account/overview` (credit, unread msgs, default address, wishlist count, pending reviews/questions, recent).

**P3 — Customer SPA sections** (store-* system, mobile-ready): dashboard summary cards (real) · orders list → links `/orders/[id]` · upgrade `/orders/[id]` (timeline, items w/ image/variant/packaging, payment, address, tracking, reorder) · addresses CRUD (modals) · wallet/credit (balance+ledger) · messages (my conversations + thread, reuse chat) · reviews/questions (tabs+statuses) · recent (product grid) · wishlist (server-backed grid; migrate `FavButton`) · profile completion %.

**P4 — Admin**: `/admin/collections/orders` list+`[id]` detail (status update, tracking, history) · `/admin/customers` list + `/admin/customers/[id]` 360 (profile, orders, addresses, conversations, reviews/questions, recent, wishlist, credit + manual adjust, internal notes) · `/admin/collections/reviews` moderation (approve/reject + answer questions). Register nav. `requireAdmin()` + Zod + audit via existing activity log if present.

**P5 — Verify**: prisma validate/generate, migration, `tsc --noEmit`, `next build`, smoke + security (logged-out redirect; cross-user 403/404; admin 360 ok; public pages intact). Final report.

Recent-view recording: record on PDP server render for logged-in users (fire-and-forget upsert) — real, not localStorage.

---

## ✅ DELIVERED (CUSTOMER-ACCOUNT-CP1)

Migration: `20260625172246_add_customer_account_cp1` (+ Phase-0 `add_user_profile_fields`).
New models: `WishlistItem`, `RecentProductView`, `StoreCreditTransaction`, `ProductQuestion`, `CustomerNote` (+ enums `StoreCreditType/Direction`, `QuestionStatus`). Additive fields: `Address.{title,plaque,unit,deliveryNote}`, `Order.trackingCode`.

Customer (SPA `/account` views + `/orders/[id]`): dashboard (real summary + completion), orders+detail (timeline/items/payment/address/tracking/reorder), addresses CRUD, اعتبار دشت‌زاد (balance+ledger), messages (chat threads + reply), reviews+questions (tabs), recent, wishlist (server + FavButton sync). APIs under `/api/account/*` (Zod + `getCurrentUser` + ownership + Persian errors).

Admin: `/admin/collections/orders` (+`[id]` status/tracking), `/admin/customers` (+`[id]` 360: profile, orders, addresses, conversations, reviews/questions, recent, wishlist, اعتبار + manual adjust, internal notes), `/admin/collections/reviews` (approve/reject + answer questions). Server actions guard `requireAdmin()`. Credit adjust: admin enters Toman → ×10 Rial (SKILL §D).

Verified: prisma validate/generate/migrate · tsc 0 · eslint clean · `next build` 0. Smoke: all account APIs + admin pages 200. Security: logged-out→auth redirect; APIs 401; non-admin→`/`; **cross-user PATCH/DELETE/thread → 404**. All test data removed.

Deferred (unchanged): credit redemption at checkout (CHECKOUT-CREDIT-CP), realtime (polling kept), invoice download, phone-change/2FA, admin impersonation.

---

## ⚠️ Browser-QA fix round — CP1 NOT closed (2026-06-25, later)

User browser QA found wishlist/likes + cart "do not appear correctly". Reproduced and fixed:

- **Root cause #1 (the blocker):** the long-running `next dev` process was started *before* `prisma generate` added the CP1 models, so its cached `globalThis.prisma` singleton had **`prisma.wishlistItem` (and every CP1 model) = undefined**. Every CP1 account API (`wishlist`, `overview`, `recent`, `credit`, `reviews`, `questions`) returned **500**; pre-CP1 models (`orders`, `addresses`) returned 200. Confirmed via dev log: `TypeError: Cannot read properties of undefined (reading 'findMany')`. Fix: **restart the dev server** (fresh client has the models — proven by direct service call + post-restart smoke). Production `next build` is unaffected (fresh client each build).
- **Root cause #2 (wishlist coherence):** two code paths wrote `dz_fav` localStorage and the server→local sync was **destructive** (`syncFavSlugs(server)` overwrote local) with **no guest→login migration** → guest/old localStorage likes were wiped on first `/account` visit; storefront hearts only synced on `/account`. Fix: single store (`useFav`) owns `dz_fav`; `FavButton` uses it; server write-through gated to logged-in; new global `<WishlistSync/>` reconciles **non-destructively** (migrates local-only → server via new bulk `POST {slugs}`, then adopts union) on every page.
- **Root cause #3 (minor):** `countWishlist`/`listWishlistSlugs` lacked the `isActive` filter that `listWishlist` has → badge/list could disagree. Fixed.
- **Cart:** audited, **no bug found** — single source of truth (localStorage `dz_cart`), Header + BottomNav badges wired via `useSyncExternalStore`+events, reducer math + add payloads verified. The DB `Cart`/`CartItem` model is read only by admin delete-guards, never written by the storefront (no second source). The cart "not appearing" was the overview-500 cascade. **Cart left unchanged.**

Verified: all account APIs 200 post-restart; wishlist add/list/remove + bulk-migrate + idempotency + count==list all green via HTTP; test data cleaned. `tsc`: my 7 files clean (2 remaining errors were concurrent product-card WIP — `ProductCard BanCircle`, `ProductForm tel` — since resolved by the user; `next build` exit 0).

**✅ APPROVED & CLOSED for wishlist/cart (2026-06-26):** 12/12 real-browser QA passed (headless Chrome over CDP, logged-in USER, actual clicks) — favorite ↔ wishlist panel ↔ remove ↔ server/local sync; cart quick-add → desktop header + mobile bottom-nav counts → /cart shows item; no page JS errors; test data cleaned. **Deferred open decision:** whether `/account/<section>` become real deep-link routes (`/account/wishlist` currently 404s; panel stays in-page for now).
