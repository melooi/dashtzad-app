# Dashtzad — Claude Code Rules

## Dashtzad Token-Efficient Workflow

### جهت‌گیری (هیچ‌وقت کل پروژه را نخوان)
1. اول `PROJECT-MAP.md` بخوان (در `.claude/skills/dashtzad-memory/PROJECT-MAP.md` یا ریشهٔ پروژه).
2. دامنهٔ task را تشخیص بده: `admin | storefront | chat-ai | content-cms | commerce | integrations | design-system | data-model`.
3. فقط memory فایل همان دامنه بخوان (`memory/NN-domain.md`). حداکثر ۲ دامنه اگر واقعاً چنددامنه‌ای بود.
4. هرگز `src/` را برای جهت‌گیری scan نکن.

### اجرا
- فقط فایل‌های scope همان checkpoint را inspect کن.
- خروجی را **patch/diff** بده، نه full-file rewrite — مگر فایل جدید باشد.
- لاگ خام طولانی را خلاصه کن (فرمت: `.claude/token-infra/log-summary-format.md`).
- بعد از تغییر کد: `npx tsc --noEmit` را اجرا کن و نتیجهٔ واقعی را گزارش بده.
- QA report را با فرمت `.claude/token-infra/qa-report-format.md` بساز.

### ممنوع
- commit/push بدون اجازهٔ صریح ملو ممنوع است.
- «done» بدون شواهد اجرای واقعی ممنوع است.
- dependency جدید نصب نکن.
- schema یا migration بدون تأیید نساز.
- تصمیم‌های قفل‌شده در `00-architecture.md` را خودسرانه باز نکن.

### ابزارهای token-infra
```bash
npm run claude:map    # رفرش repo-map
npm run claude:pack -- "<task>"  # context pack برای یک task
npm run claude:log    # خلاصهٔ لاگ از stdin یا فایل
```

فرمت‌های مرجع: `.claude/token-infra/log-summary-format.md` و `.claude/token-infra/qa-report-format.md`
