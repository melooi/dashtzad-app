# AI Chatbot — CP-A Foundation — Completion Report

Status: **DONE & verified.** Checkpoint A of the phased build (see
`AI-CHATBOT-PHASE0-REPORT.md`). No existing models/code were altered destructively.
Date: 2026-06-26 · App: `dashtzad-app`

---

## What CP-A delivers

The secure, observable server-side **foundation** every later checkpoint builds on:
the central OpenAI service (Responses API + embeddings + moderation), the full
`ai_*` data model, usage/error/guardrail logging, structured-output + moderation +
guardrail + tool-registry machinery, the prompt/tone system, and an admin-gated
health endpoint to verify it live.

All OpenAI access is funnelled through **one** module (`openai-client.ts`); feature
code must never call OpenAI directly. The API key is read only in `env.ts`, never
returned, logged, or written to any report/seed.

---

## Files created

**Database**
- `prisma/migrations/20260626090422_add_ai_foundation/migration.sql` — 15 tables + 17 enums.

**AI core (`src/lib/ai/`)**
- `errors.ts` — typed `AiError` (codes: not_configured, openai_http, timeout, parse_error, moderation_blocked, …) + `toAiError`.
- `env.ts` — **server-only** config; reads `OPENAI_API_KEY` (here and nowhere else); model/dimension/limit tuning; `isAiConfigured`, `requireApiKey`, non-reversible `keyFingerprint`.
- `types.ts` — Responses API request/response/stream/usage/embedding/moderation TS shapes.
- `openai-client.ts` — central client: `createResponse`, `streamResponse` (SSE), `createEmbeddings`, `moderate`. Raw fetch, timeout/abort, error mapping, request-id capture.
- `structured-output.ts` — `createStructured` + `zodToStrictJsonSchema` (Zod 4 native) + `buildJsonSchemaFormat` for strict Structured Outputs.
- `moderation.ts` — `screenText` input/output gate with usage + guardrail logging (fails open on provider outage).
- `usage-logger.ts` — `logUsage` / `logError` / `logGuardrail` (best-effort, never throws) + micro-USD cost estimator.
- `guardrails.ts` — PII masking (phone/email/national-id/card), non-PII `safetyIdentifier`, `hashIp`, in-memory sliding-window rate limiter.
- `tool-registry.ts` — `ToolRegistry`: register / permission-check / `toOpenAITools` / `syncToDb`. Destructive tools blocked unless explicitly enabled **and** human-approved. (Concrete tools land in CP-B/CP-E.)
- `prompts/brand.ts`, `prompts/index.ts` — brand facts + Persian tone + safety rails; support / shopping / recipe / order-tracking / admin-analyst / safety-classifier / handoff-summarizer / product-recommendation prompts.

**API**
- `src/app/api/admin-ai/health/route.ts` — admin-only (`runtime=nodejs`); reports config (no key), AI table counts, registry size; `?live=1` exercises Responses/embeddings/moderation when a key is set.

## Files modified (additive only)
- `prisma/schema.prisma` — **added** 15 `Ai*` models + 17 `Ai*` enums. **No existing model/field/index changed.** Cross-domain refs to `User`/`Conversation` are scalar IDs (no FK), so the live-chat system is untouched.
- `.env.example` — documented the AI vars block.

## Migration
- `20260626090422_add_ai_foundation` applied via `prisma migrate deploy` (NOT `migrate dev`, to avoid a destructive reset triggered by a pre-existing `Product.latinTitle/pdpContent` drift). Verified: all 15 `ai_*` tables created empty; `Product=5, User=3, Conversation=2` intact.
- Tables: ai_conversations, ai_messages, ai_sessions, ai_tools, ai_tool_calls, ai_handoffs, ai_feedback, ai_knowledge_sources, ai_vector_documents, ai_vector_chunks, ai_admin_reports, ai_admin_findings, ai_guardrail_events, ai_usage_logs, ai_error_logs.

## Env variables
`OPENAI_API_KEY` (already existed — **must be set on server for live AI**), plus new:
`OPENAI_BASE_URL`, `OPENAI_CHAT_MODEL` (default `gpt-5.5`), `OPENAI_FAST_MODEL`,
`OPENAI_ANALYST_MODEL`, `OPENAI_MODERATION_MODEL` (`omni-moderation-latest`),
`OPENAI_MODERATION_ENABLED`, `OPENAI_EMBEDDING_MODEL` (`text-embedding-3-small`),
`OPENAI_EMBEDDING_DIMENSIONS` (1536), `OPENAI_MAX_OUTPUT_TOKENS`, `OPENAI_TIMEOUT_MS`,
`OPENAI_ORG_ID`, `OPENAI_PROJECT_ID`, `AI_SAFETY_ID_SALT`.

---

## Test results (real, not claimed)

| Check | Result |
|---|---|
| `tsc --noEmit` (whole project) | **0 errors** |
| Integration suite (tsx, live DB): config, PII masking, safety-id, rate limiter, Zod→strict-JSON-schema, cost estimator, error mapping, **real DB round-trip** for usage/error/guardrail logs (written + read back + cleaned up) | **34/34 passed** |
| SSE stream parser (mock OpenAI events, cross-chunk buffering, tool-call accumulation, usage extraction) | **7/7 passed** |
| `GET /api/admin-ai/health` unauthenticated | **HTTP 401** (admin gate enforced, real curl) |

**Live OpenAI — VERIFIED** (key now set; tested against the real API on a fresh dev server):
- `GET /api/admin-ai/health?live=1` (admin cookie) → `responses.ok`, `embeddings.ok` (1536 dims), `moderation.ok` all true; sample reply `"سلام"`; usage rows written to `ai_usage_logs`.
- Model `gpt-5.5` resolves to snapshot `gpt-5.5-2026-04-23`.
- Structured Outputs verified live: input "سفارشم سه هفته‌ست نرسیده، خیلی عصبانی‌ام!" → `{"intent":"order_status","priority":"high","angry":true}`.

**Finding + fix — reasoning models:** `gpt-5.5` is a reasoning model that spends
output tokens *thinking* before emitting text; an early test with a 16/400-token
cap returned empty text (budget consumed by reasoning). Fixed by adding
**reasoning-effort control** to the central client (`reasoningEffort`, default
`low`, env `OPENAI_REASONING_EFFORT`; supported by gpt-5.5: `none|low|medium|high|xhigh`).
With `none`/`low` the client returns proper Persian text. CP-B will set per-task
effort (e.g. `none`/`low` for chat, higher for the admin analyst).

---

## Re-verify the live OpenAI path anytime
Sign in as admin (seed phone `09120000000`, OTP shown on screen in test mode) to get the `dz_session` cookie, then:
`curl -s --cookie "dz_session=…" "http://localhost:3000/api/admin-ai/health?live=1" | jq`
Expect `live.responses.ok` (sample text), `live.embeddings.ok` (dimensions 1536), `live.moderation.ok` all true, and rows appearing in `ai_usage_logs`.
> After a schema/migration change, restart `next dev` first (stale-client gotcha).

---

## Remaining risks / notes
- **Stale Prisma client:** the currently-running dev server predates the migration; it must be restarted before any `ai_*` route works (the health route's auth gate still returns 401 first, which is why the curl above passed).
- **Model id:** default `gpt-5.5` matches the current OpenAI flagship (verified against the docs). If the account lacks it, set `OPENAI_CHAT_MODEL` to an available id.
- **pgvector:** `AiVectorChunk.embedding` is `Float[]` for now (portable). CP-C will detect pgvector and, if available, maintain a `vector(1536)` column + ANN index; otherwise in-app cosine. Embedding dim is pinned to 1536 to match.
- **Rate limiter** is per-process/in-memory — fine for a single Node instance; needs a shared store when scaled horizontally (noted in code).
- **Pre-existing drift:** `Product.latinTitle/pdpContent` exist in the DB without a migration. Left as-is (out of scope, not destructive). A future `migrate dev` will still want a reset unless this is reconciled separately.

## Next: CP-B — Customer chatbot backend
Chat session/message(**SSE streaming**)/conversations/handoff/feedback/close APIs,
the concrete read-only tool registry (product/order/knowledge/customer/support),
moderation in-loop, per-visitor rate limiting, intent/priority/angry-customer
detection via Structured Outputs, and the chat-engine + handoff modules.

*Stopping here for review as agreed (checkpoint-by-checkpoint).*
