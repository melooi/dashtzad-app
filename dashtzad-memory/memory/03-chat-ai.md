# 03 — Chat + AI
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 CP-A تأیید، CP-B تأییدنشده

## هدف
زیرساخت AI (OpenAI Responses API) + موتور چت‌بات مشتری storefront + مرکز چت اپراتور admin + handoff. کلید فقط سمت سرور.

## تصمیم‌های قفل‌شده
- همهٔ فراخوانی‌های AI فقط از `src/lib/ai/openai-client.ts`.
- جداول `ai_*` جدا از جداول commerce (scalar id، نه FK مستقیم به User/Session).
- مدل پیش‌فرض از env — hardcode نکن.
- چت storefront: موبایل=نوار پایین، دسکتاپ=راست.
- تمام streaming از `src/lib/ai/sse.ts`.
- کلید OpenAI هرگز به client نرسد.

## فایل‌های کلیدی

### زیرساخت CP-A (تأیید‌شده)
- `src/lib/ai/openai-client.ts` — کلاینت مرکزی
- `src/lib/ai/env.ts` — خواندن کلیدها
- `src/lib/ai/sse.ts` — streaming
- `src/lib/ai/moderation.ts` — مودریشن
- `src/lib/ai/structured-output.ts` — خروجی ساختاریافته
- `src/lib/ai/usage-logger.ts` — لاگ مصرف
- `src/lib/ai/prompts/` — prompt های سیستم
- `src/lib/ai/tools/` + `tool-registry.ts` — ابزارها

### موتور چت CP-B (تأییدنشده)
- `src/lib/ai/chat-engine.ts` — موتور اصلی
- `src/lib/ai/intent.ts` — تشخیص نیت
- `src/lib/ai/handoff.ts` — ارجاع به اپراتور
- `src/lib/ai/guardrails.ts` — محدودیت‌ها
- `src/lib/ai/errors.ts` — مدیریت خطا
- `src/lib/ai/route-helpers.ts` — Route helpers
- `src/lib/ai/chat-center.ts` — نمای اپراتور
- `src/lib/ai/chat-session.ts` — session management
- `src/lib/ai/availability.ts` — در دسترس بودن اپراتور
- `src/lib/ai/admin-conversations.ts` — مکالمات ادمین

### Storefront Chat
- `src/lib/chat/ai.ts`, `service.ts`, `types.ts`, `public-actions.ts`, `sound.ts`, `upload-client.ts`
- `src/components/storefront/chat/` — کامپوننت‌ها
- `src/app/api/chat/` — API routes

### Admin Chat Center
- `src/app/admin/chat/page.tsx`, `[id]/`, `departments/`, `settings/`, `actions.ts`
- `src/components/admin/chat/`
- `src/app/api/admin-ai/` — Admin AI API

## وضعیت فعلی
- ✅ CP-A زیرساخت AI — با کلید واقعی تست زنده (stream، moderation، embeddings)
- ✅ جداول `ai_*` (۱۵ جدول) — `add_ai_foundation` + `add_ai_conversation_management` migrate شد
- 🟡 CP-B موتور چت — فایل‌ها ساخته، end-to-end تست نشده
- 🟡 مرکز چت ادمین — فایل‌ها موجود، تأییدنشده
- 🟡 چت‌بات storefront — فایل‌ها موجود، تأییدنشده
- ⏳ Admin AI analyst — `admin-ai/` route موجود، وضعیت نامعلوم

## threadهای باز
- CP-B: تست end-to-end (مشتری پیام → AI جواب → handoff اپراتور).
- مرکز چت ادمین با داده‌های واقعی بررسی شود.
- مدل پیش‌فرض env متغیر چیست؟ (`src/lib/ai/env.ts` بررسی شود)

## Gotchas
- اگه `OPENAI_API_KEY` در env خالیه، تمام AI/chat fail بدون خطای واضح.
- `src/lib/ai/` و `src/lib/chat/` جدا هستند — AI logic در `ai/`، storefront bridge در `chat/`.
- جداول `ai_*` scalar id دارند به User/Session — این تصمیم قفل است، FK مستقیم نزن.
- CP-A کلیدش موقتاً حذف شده بود — اگه `.env` ندارد، confirm کن قبل از تست.
