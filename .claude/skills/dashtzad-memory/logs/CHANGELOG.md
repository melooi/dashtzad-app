## 2026-06-26 — all — LINT-STABILIZATION-GATE

- چه شد: رفع ۲۲ خطای ESLint. lint/tsc/build همه سبز شدند.
- فایل‌های تغییر/ساخت: 11 فایل + LINT-STABILIZATION-GATE-QA.md
- تأیید: lint=pass(0 error) tsc=pass build=pass
- وضعیت بعد: ✅ پروژه کاملاً سبز
- نکتهٔ جدید: set-state-in-effect → رفع با queueMicrotask(() => setState(v)); refs during render → rowsRef.current = rows را به useEffect منتقل کن؛ برای reset state when prop changes → inner component با key={prop.id}

## 2026-06-26 — admin-panel + chat-ai — ADMIN-STABILIZATION-GATE

- چه شد: رفع ۵ خطای TypeScript در ماژول AI analyst که با commit de17bf8 وارد main شده بودند. RouteContext از next/server حذف، inline param typing جایگزین شد. prisma.aiFeedback.aggregate با score فیلد موهوم → count() ساده شد.
- فایل‌های تغییر/ساخت: `src/app/api/admin-ai/reports/[id]/route.ts`, `src/app/api/admin-ai/reports/[id]/findings/[fid]/route.ts`, `src/lib/ai/analyst/scan-tools.ts`
- تأیید: tsc=pass build=pass (40 صفحه) lint=fail(pre-existing, خارج از scope)
- وضعیت بعد: ✅ (admin panel stable, 0 placeholder nav routes)
- نکتهٔ جدید: RouteContext از next/server اصلاً export نمی‌شود — همیشه inline `{ params: Promise<{...}> }` استفاده کن. AiFeedback مدل فقط rating enum (UP/DOWN) دارد، نه فیلد عددی score.
