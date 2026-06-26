# 08 — Data Model (Prisma)
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (seed) · **وضعیت:** ⚠️ بدهی فعال

## هدف
schema، migrationها، و سلامت type. تغییر schema فقط با تأیید صریح.

## تصمیم‌های قفل‌شده
- Prisma 7 + `@prisma/adapter-pg`. client در `src/generated/prisma`.
- ارجاع بین‌دامنه‌ای به‌صورت scalar id (بدون FK) جایی که جداکردن دامنه لازم است (مثل جداول `ai_*` که به User/Conversation فقط با id وصل‌اند).

## فایل‌های کلیدی
- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/generated/prisma/`

## وضعیت فعلی
- ⚠️ **`src/lib/account/cards.ts` خطای TS دارد** (فیلد `id` و `gramValue` کم در نوع `CardProductLite`). تا حل نشود `npx tsc --noEmit` کل پروژه fail است. ← اولین بدهی که باید جدا حل شود.
- ⚠️ drift: `Product.latinTitle` و `Product.pdpContent` در DB هستند بدون migration متناظر → `migrate dev` می‌خواهد reset کند.
- ✅ migration `20260626090422_add_ai_foundation` (۱۵ جدول `ai_*` + enumها) با `migrate deploy` اعمال شد، داده‌ها سالم.

## threadهای باز
- اصلاح `cards.ts` تا tsc سبز شود (مستقل از کارهای UI/chat).
- آشتی‌دادن drift محصول با یک migration تمیز (با احتیاط، بدون reset).

## Gotchas
- هرگز `migrate dev` روی این DB بدون حل drift — reset مخرب است.
- بعد از هر تغییر schema: `prisma generate` + restart dev server.
