# Context Pack — admin lint stabilization
**دامنه:** admin
**Memory:** `01-admin-panel.md`
**تاریخ:** 2026-06-26

## Task
admin lint stabilization

## Files to Read First
- `.claude/skills/dashtzad-memory/PROJECT-MAP.md`
- `.claude/skills/dashtzad-memory/memory/01-admin-panel.md`

## Allowed Inspect Scope
- `src/app/(admin)/`
- `src/components/admin/`
- `src/lib/admin/`

## Forbidden Actions
- کل پروژه scan نشود — فقط scope بالا
- dependency جدید نصب نشود
- commit/push بدون اجازهٔ صریح ملو ممنوع
- schema یا migration بدون تأیید نساز
- تصمیم قفل‌شده در 00-architecture.md را بدون تأیید باز نکن

## Required Tests
- `npx tsc --noEmit`
- `npm run lint -- src/app/(admin) src/components/admin`

## QA Report Name
`ADMIN-LINT-STABILIZATION-QA.md`

## Output Format
- patch/diff، نه full-file rewrite
- لاگ خام را خلاصه کن (فرمت: `.claude/token-infra/log-summary-format.md`)
- نتیجهٔ واقعی tsc را گزارش بده، نه «احتمالاً»
