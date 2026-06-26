# dz-context — Token-Efficient Task Kickoff

## Trigger
این skill را وقتی کاربر گفت فعال کن:
- `/dz-context`
- «بر اساس سورس»
- «پرامپت کم‌توکن بده»
- «Claude رو کم‌توکن جلو ببر»
- «یه checkpoint بساز»
- «context بساز برای ...»

## Workflow اجباری

### ۱. تشخیص دامنه
از روی کلمات کلیدی task، دامنه را تشخیص بده:

| کلمات | دامنه |
|---|---|
| admin, ادمین, dashboard, panel, قیمت, product, media | admin |
| store, shop, storefront, صفحهٔ محصول, cart, سبد, pdp | storefront |
| chat, ai, bot, openai, analyst, chatbot | chat-ai |
| article, recipe, cms, content, blog, دستورپخت, مقاله | content-cms |
| order, payment, zarinpal, تسویه, سفارش | commerce |
| kavenegar, sms, otp, webhook, integration | integrations |
| design, token, color, font, tailwind, dz- | design-system |
| prisma, schema, migration, model, database | data-model |

اگر دامنه نامشخص بود، **یک سؤال کوتاه** بپرس — کل پروژه را scan نکن.

### ۲. خواندن context (فقط این‌ها)
```
1. .claude/skills/dashtzad-memory/PROJECT-MAP.md   ← همیشه
2. .claude/skills/dashtzad-memory/memory/NN-domain.md  ← فقط دامنهٔ مرتبط
3. .claude/token-infra/repo-map.generated.md  ← اگر نیاز به فایل‌یابی بود
```

**هرگز** بیشتر از این نخوان مگر task صریحاً فایل خاصی را نام ببرد.

### ۳. ساخت context pack
فایل `.claude/token-infra/prompt-pack.md` را بساز با این بخش‌ها:

```markdown
# Context Pack — <task>
**دامنه:** <domain>
**تاریخ:** <date>

## Task
<توضیح کوتاه task>

## Files to Read First
- <path> — <نقش>

## Allowed Inspect Scope
- <پوشه یا فایل>

## Forbidden Actions
- کل پروژه scan نشود
- dependency جدید نصب نشود
- commit/push بدون اجازه

## Required Tests
- npx tsc --noEmit
- <تست اختصاصی اگر هست>

## QA Report Name
<checkpoint-name>-QA.md
```

### ۴. دستورالعمل به Claude
- خروجی patch/diff بده، نه full-file rewrite
- لاگ خام بلند را خلاصه کن
- بعد از کد: tsc را اجرا کن و نتیجه را گزارش بده
- memory دامنه را بعد از task به‌روز کن
