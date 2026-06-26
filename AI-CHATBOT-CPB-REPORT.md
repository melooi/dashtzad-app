# AI Chatbot — CP-B (Chat Center backend) — Completion Report

Status: **DONE & verified in degraded mode.** Builds on CP-A foundation.
Date: 2026-06-26 · App: `dashtzad-app`
Mode: **AI degraded (no `OPENAI_API_KEY`)** — by request. AI happy-path is a blocker (below).

---

## Scope delivered
A professional Chat Center backend = admin-configurable settings + customer AI
chatbot engine + conversation management + human handoff, with the existing
human live-chat fully preserved and graceful **AI_UNAVAILABLE** behaviour.

---

## Files CREATED

**AI engine (`src/lib/ai/`)**
- `availability.ts` — AI_UNAVAILABLE contract + admin kill-switch (`AI_ENABLED`).
- `chat-session.ts` — AiSession/AiConversation/AiMessage persistence, per-session access control, rate limit.
- `chat-engine.ts` — turn orchestrator: input moderation → triage → streamed Responses + tool loop → output moderation → persistence. Never 500s.
- `chat-center.ts` — resolves admin settings → runtime chatbot config + public widget config.
- `intent.ts` — Structured-Outputs triage (intent/priority/angry/needsHuman), ticket classification; neutral fallback in degraded mode.
- `handoff.ts` — bridges an AI conversation into the existing operator inbox (`Conversation` + SYSTEM summary message) + `AiHandoff`.
- `sse.ts` — SSE wire protocol + `sseResponse`.
- `route-helpers.ts` — session cookie, client IP, actor resolution.
- `admin-conversations.ts` — admin list/detail/update for AI conversations.
- `tools/` — `tool-registry` consumers: `product-tools.ts` (8), `order-tools.ts` (4), `knowledge-tools.ts` (5), `customer-tools.ts` (3), `support-tools.ts` (6), `helpers.ts`, `index.ts` (registers all 26).

**Customer chat API routes (`src/app/api/chat/`)**
- `session/route.ts` (POST) · `message/route.ts` (POST, **SSE**) · `widget-config/route.ts` (GET)
- `conversations/route.ts` (GET) · `conversations/[id]/route.ts` (GET)
- `conversations/[id]/handoff/route.ts` (POST) · `…/feedback/route.ts` (POST) · `…/close/route.ts` (POST)

**Admin Chat Center API routes (`src/app/api/admin-ai/`)**
- `conversations/route.ts` (GET) · `conversations/[id]/route.ts` (GET, PATCH) · `tools/route.ts` (GET, POST sync)

**Migration**
- `prisma/migrations/20260626102619_ai_conversation_management/` — adds `AiConversation.tags`, `AiConversation.operatorNote` (additive only).

## Files MODIFIED (additive, existing behaviour preserved)
- `prisma/schema.prisma` — added `tags`/`operatorNote` to `AiConversation`.
- `src/lib/admin/globals.ts` — extended `chatSettingsSchema` + the (schema-driven) admin chat-settings page with an AI-chatbot section: `aiChatbotEnabled`, `aiChatbotPersona`, `aiChatbotWelcome`, `aiHandoffEnabled`, `aiUnavailableMessage`, `aiRateLimitPerMinute`, `aiTools{Product,Order,Knowledge,Customer,Support}` + `AI_CHATBOT_PERSONA_OPTIONS`.
- `src/lib/ai/moderation.ts` — skip cleanly when AI unconfigured.
- `src/lib/ai/tool-registry.ts` — `internal` flag, `availableInCategories`, `renderTools`.
- `src/lib/ai/chat-engine.ts`/`chat-session.ts` — settings-driven availability + configurable rate limit.

---

## Tests (real, degraded mode)

| Check | Result |
|---|---|
| `tsc` errors in CP-B/AI code | **0** (total project: 1 pre-existing, see blockers) |
| `GET /api/chat/widget-config` | 200; `ai.available=false`, reason exposed; no secrets |
| `POST /api/chat/session` | 200; httpOnly cookie set; `reason:"no_key"` |
| `POST /api/chat/message` (SSE) | streams `meta(aiAvailable:false)→triage→delta(AI_UNAVAILABLE)→done(aiUnavailable,suggestHandoff)→[DONE]`; user+assistant persisted; **no 500** |
| `GET /conversations` + `/[id]` | caller-scoped list + history |
| `POST /…/handoff` | creates operator-inbox `Conversation` (source `ai-handoff`, unread, **SYSTEM summary**); AI conv → `AWAITING_HUMAN` |
| `POST /…/feedback`, `/…/close` | persisted; close respects in-progress handoff |
| Human live-chat | **2 existing conversations intact**; live-chat models untouched |
| Admin `GET/POST /api/admin-ai/tools` | **26 tools** (P8/O4/K5/C3/S6), 3 internal hidden from model; DB sync = 26 |
| Admin `GET/PATCH /api/admin-ai/conversations[/:id]` | list + status/priority/tags/note update persisted; 401 without admin |
| Tool unit tests (tsx) | 11/11: registry strict schemas, internal-tool exclusion, product/knowledge tools, permission gates |
| **Order-auth scoping** (temp order) | 5/5: owner sees own order; **stranger blocked**; customer-orders list scoped |

## Security / safety verified
- OpenAI key server-only (never in widget-config, SSE, or any response).
- Order/customer tools `requiresAuth` + scoped strictly to `ctx.actor.customerId` (stranger blocked — tested).
- Destructive tools: none registered; registry blocks destructive/approval tools unless human-approved.
- Input+output moderation wired (skips cleanly without a key).
- Per-session rate limiting; PII masking + non-PII `safety_identifier` available.

---

## Blockers / notes
1. **AI happy-path not live-tested** — no `OPENAI_API_KEY` available (per request). The streamed tool-loop / real triage / live tool calls are exercised by mocked-transport tests (CP-A SSE parser) + structural tests, but not against the live API. Set the key + restart `next dev`, then re-run the message SSE to verify end-to-end. The CP-A live test already proved Responses/Embeddings/Moderation/Structured-Outputs work with a key.
2. **Pre-existing tsc error (not mine):** `src/lib/account/cards.ts` ↔ `src/lib/storefront/product-card.ts` `CardVariantLite` mismatch, surfaced via the in-progress storefront/blog refactor (`blog/[slug]/page.tsx` was already modified before this session; `cards.ts`/`product-card.ts` unchanged vs HEAD). **0 errors in AI code.** Left untouched (out of scope).
3. **`aiChatbotEnabled` was turned ON** in `chatSettings` during testing (degrades safely to AI_UNAVAILABLE without a key). Flip off in `/admin/chat/settings` if undesired.
4. **Frontend not built** — CP-B is backend only. The widget UI (streaming bubbles, cards, handoff CTA) is CP-D; the SSE/widget-config contracts are ready for it.
5. **Knowledge tools** use keyword search now; CP-C upgrades them to semantic retrieval (same tool contract).
6. **Rate limiter** is in-memory/per-process (fine for single instance; needs shared store when scaled).

## Next: CP-C (retrieval/embeddings) or CP-D (frontend widget) — your call.
*Stopping here for review as agreed.*
