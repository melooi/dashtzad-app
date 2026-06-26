# AI Chatbot + Admin Analyst Engine — Phase 0 Inspection Report

> Mandatory pre-build inspection. **No application code has been modified.** This
> report is the only artifact produced so far.
> Date: 2026-06-26 · App: `dashtzad-app`

---

## 1. Framework & runtime

| Aspect | Value |
|---|---|
| Framework | **Next.js 16.2.9** (App Router) |
| React | **19.2.4** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS 4** (`@theme` directive, no config file) |
| ORM / DB | **Prisma 7.8.0** + `@prisma/adapter-pg` → **PostgreSQL** |
| Data fetching | **TanStack Query v5** (`staleTime: 30s`, `retry: 1`) |
| Forms | react-hook-form + `@hookform/resolvers` + **Zod 4** |
| Auth | Custom **OTP (Kavenegar)** + **opaque DB-backed sessions** (cookie `dz_session`) |
| Icons | `lucide-react` |
| Dates | `dayjs` + `jalaliday` |
| Node | 24 LTS (`.nvmrc`) |
| Runtime note | API routes default to Edge unless `export const runtime = "nodejs"`. OpenAI calls **must** run on `nodejs`. |

No OpenAI / Anthropic / Vercel-AI **SDK is installed** — the existing copilot uses raw `fetch()`.

---

## 2. Existing chat / widget files (the most important context)

The repo **already has a full human-operator live-chat system** ("CHAT-CP1" base + "CHAT-CP2" AI copilot). It is **not** an AI chatbot — a human operator answers from an admin inbox; AI only drafts *suggested replies* for the operator.

**Library — `src/lib/chat/`**
- `types.ts` — shared vocabulary (`ChatPublicConfig`, `ConversationView`, `MessageView`, enums re-export).
- `service.ts` — server-only Prisma data layer (visitor + admin ops, presence, departments). Polled, not realtime.
- `public-actions.ts` — visitor server actions (`startConversation`, `sendVisitorMessage`, `fetchConversation`, `rateConversation`); gated by master `enabled` flag.
- `ai.ts` — **operator "suggested reply" copilot.** Raw `fetch()` to Anthropic *messages* / OpenAI *chat completions* / Google. Provider auto-derived from model id. `max_tokens: 1024`. Server-side only.
- `sound.ts`, `upload-client.ts` — chime + attachment upload helper.

**Frontend**
- Storefront widget: `src/components/storefront/chat/ChatWidget.tsx` (+ `chat-store.ts` Zustand, `chat-local.ts` localStorage). Desktop floating launcher + mobile bottom-sheet, 5s/30s polling, pre-chat form, CSAT rating, sound.
- **Mount point:** `src/app/(public)/layout.tsx:31` → `{chat.enabled && <ChatWidget config={chat} />}` (config from `getChatPublicConfig()`).
- Admin inbox: `src/components/admin/chat/AdminChatWorkspace.tsx`, `ChatConversationDetail.tsx` (+ header actions, presence toggle, time, departments manager).

**API routes (chat):** only `POST /api/chat/upload` (attachments). Everything else is **Next.js Server Actions**, not REST.

**Existing chat features:** attachments, CSAT, proactive greeting, pre-chat form, sound, canned replies, internal notes, operator presence (2-min TTL), department routing, dual unread counters.
**Absent:** streaming, moderation, embeddings/RAG, tool-calling, customer-facing AI, usage/cost logging.

---

## 3. Existing support / ticket / conversation modules

- **Live-chat conversations:** Prisma `Conversation` / `ChatMessage` / `Department` (see §6).
- **Customer "messages" (ticket-like):** `src/lib/account/messages.ts` + `GET/POST /api/account/messages[/:id]` — a logged-in customer thread view built on the same `Conversation` model.
- **Contact form:** `ContactMessage` model + `POST /api/contact` (honeypot `dz_hp`).
- No dedicated "ticket" entity separate from `Conversation`.

---

## 4. Auth / session / customer system

- **Sessions:** opaque 32-byte token in `httpOnly` cookie `dz_session`; DB stores `sha256(token)` in `Session`. TTL 30d. `src/lib/auth/session.ts`.
- **Current user in a route:** `import { getCurrentUser } from "@/lib/auth/session"` → `User | null`.
- **Guards (server components):** `requireAuth()`, `requireAdmin()` in `src/lib/auth/guards.ts` (redirect on failure). In route handlers the convention is inline: `if (!user || user.role !== "ADMIN") return 403`.
- **Roles:** `User.role` enum `USER | ADMIN` (no granular permissions table).
- **OTP login:** `POST /api/auth/get-otp` (rate-limited 5/10min/phone, code hashed HMAC-SHA256, `OTP_TESTING_MODE` returns code in response) → `POST /api/auth/verify-otp` (≤5 attempts, constant-time compare, find-or-create user, `createSession`).
- **Guest visitors:** chat uses `Conversation.publicToken` (uuid) + localStorage; no auth required.

---

## 5. Product / order APIs

- **Route conventions:** `route.ts` handlers parse with `zodSchema.safeParse(await req.json())`, return `NextResponse.json({ ok, ... })` or `{ error }` with Persian messages + proper status (400/401/403/429/500). **Never trust client prices — re-fetch from DB.** `prisma.$transaction()` for multi-table writes.
- **Products:** no public catalog/search REST route yet — products are queried via direct Prisma + admin services (`src/lib/admin/product-service.ts`, `products.ts`, `product-pricing.ts`). Storefront reads happen in server components / `src/lib/storefront`.
- **Orders:** `POST /api/orders` (create). Customer reads via `src/lib/account/orders.ts` (`listOrders`, `getOrderDetail`, `getActiveOrder`). Admin: `listAdminOrders`, `updateOrderStatus`, `setOrderTracking`. Status enum `PENDING|PAID|PROCESSING|SHIPPED|DELIVERED|CANCELLED|REFUNDED`.
- **Customer:** profile (`PATCH /api/account/profile`), addresses CRUD, credit, wishlist, reviews, questions, overview, recent.

> **Implication for tools:** AI tools should call **internal lib functions** (`src/lib/account/*`, `src/lib/admin/*`, `src/lib/storefront/*`) directly, not HTTP — they run server-side in the same process.

---

## 6. Database schema & ORM

- **48 models, 22 enums, 18 migrations.** Provider PostgreSQL; client generated to **`src/generated/prisma`**; singleton at **`src/lib/prisma.ts`** → `import { prisma } from "@/lib/prisma"`.
- **Conventions:** PK `String @id @default(uuid())`; timestamps `createdAt`/`updatedAt` (camelCase); money `Int` with `_rial` suffix; enums extensively used.
- **Commerce:** `Product` (`price_rial`, `offPrice_rial`, `countInStock`, `slug`, `categoryId`, `pdpContent Json?`), `Order`/`OrderItem`/`OrderStatusHistory`/`Payment`, `Category`, `Cart`/`CartItem`, `Coupon`, `ProductReview`/`ProductQuestion`, `ProductVariant`.
- **Chat (existing):** `Conversation` (`publicToken`, `status NEW|OPEN|PENDING|RESOLVED`, `userId?`, `guestName/Phone`, `assignedToId`, `departmentId`, unread counters, rating), `ChatMessage` (`senderRole VISITOR|OPERATOR|SYSTEM`, `body`, `authorId?`, attachment fields, `isInternalNote`), `Department`.
- **Settings:** `GlobalSetting` (key → JSON). Chat + AI-copilot settings already live here (`chatSettings`: `aiCopilotEnabled`, `aiModel`, `aiContext`, …) via `src/lib/admin/globals.ts` (Zod) + `global-service.ts`.
- **No** `ai_*` analytics/usage/vector/report models exist yet.

> ⚠ **Gotcha (from project memory):** after editing `schema.prisma` + `prisma generate`, you must **restart `next dev`** or new-model APIs 500 on a stale `globalThis` client.

---

## 7. Admin layout & UI conventions

- **Shell:** `src/app/admin/layout.tsx` → `requireAdmin()` → `AdminShell` (`AdminSidebar` + `AdminHeader` + `max-w-7xl` content). Flash-free dark mode via `AdminThemeScript`.
- **Primitives (`src/components/admin/ui/`):** `AdminPageHeader`, `AdminDataTable` (generic columns/rows + bulk select), `AdminStatusBadge` (5 tones), `AdminFormSection` (accent bar), `AdminTextField/SelectField/CheckboxField/TextareaField/SlugField`, `AdminFilterBar`, `AdminSearchInput`, `AdminTablePagination`, `AdminConfirmDialog`, `AdminSubmitBar`, `AdminDangerZone`, `AdminFormError`, `AdminListEmptyState`, `DashboardCard`. **Card-based, search/filter/badge driven — explicitly not raw CRUD.**
- **Base primitives (`src/common/`):** `Button`, `TextField`, `Loading`, `EmptyState`.

---

## 8. Styling system & RTL conventions

- **Root:** `src/app/layout.tsx` → `<html lang="fa" dir="rtl" suppressHydrationWarning>`. RTL via **logical properties** (`ps-/pe-`, `ms-/me-`, `start-/end-`, `text-start/text-end`).
- **Tokens (`globals.css` `@theme`):** `--color-dz-primary-50..900` (base `#4a6340`), `--color-dz-canvas/cream`, `--color-dz-success/warning/error`, admin dark `--color-dz-night-*`, storefront `store-*` (green `#15803d`, kept isolated from admin). Radii/shadow/duration tokens `--radius-dz-*`, `--shadow-dz-*`, `--duration-dz-*`. Utilities `focus-ring`, `shadow-card`.
- **Fonts:** body **IRANYekanX**, headings **Kalameh** (`@font-face` from `/public/fonts/...`).
- **Dark mode:** **admin-scoped** `.dark` class on `<html>` (key `dz-admin-theme`, light/dark/system); storefront stays light.
- **Persian numbers:** `toPersianNumbers` / `toPersianNumbersWithComma` / `formatToman` in `src/lib/price.ts`.

---

## 9. Env var pattern

- `.env` (gitignored) + committed `.env.example`. Already present: `DATABASE_URL`, `SESSION_*`, `OTP_*`, `KAVENEGAR_*`, `ZARINPAL_*`, `GOOGLE_SITE_VERIFICATION`, and **`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_API_KEY`** (CHAT-CP2). No central env-validation module yet (keys read ad-hoc via `process.env`).

---

## 10. Logging / error handling

- **No centralized logger.** Pattern: `try/catch` + throw in business logic; routes return Persian `{ error }` + status; UI shows `AdminFormError` / inline field errors. No DB-backed error/usage log. → The task's `ai_usage_logs` / `ai_error_logs` will be **net-new** infrastructure.

---

## 11. Where the chatbot should be mounted

- **Customer chatbot:** the existing storefront `ChatWidget` is the surface. Per the task ("do not blindly replace"), build an **adapter** so the same widget (or a tabbed variant) can talk to the new AI backend. Mount stays `src/app/(public)/layout.tsx:31`.
- **Admin analyst + AI dashboards:** new sections under `src/app/admin/` (e.g. `/admin/ai-chat`, `/admin/admin-analyst`), reusing `AdminShell` + `ui/` primitives, added to `AdminSidebar`.

---

## 12. Risks & blockers

1. **Two chat paradigms collide.** Existing = human live-chat (operator answers). Task = AI chatbot (model answers, optional human handoff). `ChatMessage.senderRole` has no `ASSISTANT`/`TOOL` role and `Conversation` has no `intent/priority/channel`. **Decision needed (see plan):** separate `ai_*` tables (task's explicit list) vs. extend existing chat models. Recommended: **separate `ai_*` schema**, with **handoff bridging** an `AiConversation` into the existing `Conversation` inbox so operators keep one workflow.
2. **Responses API + streaming on Node runtime.** Routes must `export const runtime = "nodejs"`; Edge default would break SSE + secret usage. Frontend currently **polls** — streaming needs SSE/ReadableStream plumbing the widget doesn't have yet.
3. **Embeddings need pgvector.** Postgres has no vector column today. Either add the `pgvector` extension (preferred, needs DB privilege) or store embeddings as `Float[]` + in-app cosine (works, slower). **Confirm DB can enable `pgvector`.**
4. **No public product-search lib.** Tools like `search_products` will need a new `src/lib/storefront` search function (semantic via retrieval + keyword fallback).
5. **Order-lookup authorization.** `get_order_status` etc. must scope to the authenticated `customer_id`; for guests, require order-number + phone match. Must not leak other customers' orders.
6. **Cost / abuse.** No global rate-limit middleware. AI chat needs per-visitor/session rate limiting + token-budget guards beyond the OTP limiter.
7. **Moderation latency.** Input+output moderation on every message adds round-trips; need to pipeline (moderate input in parallel with retrieval) to keep streaming snappy.
8. **OpenAI key validity / model availability.** `.env` key is currently empty in example; real key + chosen model (`gpt-*`) must be provisioned. Build must degrade gracefully (fallback message) when key missing — mirroring how the copilot hides itself today.
9. **Dev client restart gotcha** (§6) will bite every schema change.
10. **Scope.** This is a 12-phase, ~15-model, ~40-tool, ~10-screen build — far beyond one sitting. Must be delivered in reviewable checkpoints (this project already works in CP1/CP2 increments).

---

## 13. Files to CREATE (high level)

- `src/lib/ai/` — `openai-client.ts`, `chat-engine.ts`, `tool-registry.ts`, `tools/*`, `guardrails.ts`, `moderation.ts`, `retrieval.ts`, `structured-output.ts`, `usage-logger.ts`, `admin-analyst.ts`, `handoff.ts`, `prompts/*`, `env.ts`.
- API: `src/app/api/chat/*` (session, message[SSE], conversations, handoff, feedback, close), `src/app/api/knowledge/*` (sync/search), `src/app/api/admin-ai/*` (reports, findings).
- Prisma: extend `schema.prisma` with `Ai*` models + migration.
- Frontend: `src/components/storefront/chat/ai/*` (adapter + cards: Product/Order/Recipe/Handoff/Feedback, streaming bubble, typing) reusing existing widget shell.
- Admin: `src/app/admin/ai-chat/*`, `src/app/admin/admin-analyst/*`, `src/components/admin/ai/*`, sidebar entries.
- Tests: `src/lib/ai/__tests__/*` (+ test runner — none configured yet).

## 14. Files to MODIFY (minimal, additive only)

- `prisma/schema.prisma` — **add** models only (project rule: extend, never remove fields/indexes).
- `src/app/(public)/layout.tsx` — wire AI widget/adapter alongside existing widget.
- `src/components/storefront/chat/ChatWidget.tsx` — adapter hook (preserve existing behavior).
- `src/components/admin/AdminSidebar.tsx` — add AI sections.
- `.env.example` — document new AI vars.
- `src/lib/admin/globals.ts` — extend settings (AI chatbot toggle/model/limits).

---

*End of Phase 0 report. Awaiting plan approval before any code is written.*
