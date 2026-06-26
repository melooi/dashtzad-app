# QA Report — CLAUDE-TOKEN-INFRA-CP1
**تاریخ:** 2026-06-26
**دامنه:** infra (cross-cutting — no runtime app change)
**وضعیت کلی:** ✅

## فایل‌های ساخته/تغییرشده
| فایل | عملیات | توضیح |
|---|---|---|
| `.claude/CLAUDE.md` | ساخته شد | قوانین token-efficient Claude Code |
| `.claude/skills/dz-context/SKILL.md` | ساخته شد | skill تشخیص دامنه + ساخت context pack |
| `.claude/token-infra/README.md` | ساخته شد | مستندات infra |
| `.claude/token-infra/log-summary-format.md` | ساخته شد | فرمت مرجع خلاصه لاگ |
| `.claude/token-infra/qa-report-format.md` | ساخته شد | فرمت مرجع QA report |
| `.claude/token-infra/scripts/generate-repo-map.mjs` | ساخته شد | اسکریپت نقشه repo |
| `.claude/token-infra/scripts/summarize-log.mjs` | ساخته شد | اسکریپت خلاصه‌ساز لاگ |
| `.claude/token-infra/scripts/pack-task-context.mjs` | ساخته شد | اسکریپت context pack |
| `.claude/token-infra/repo-map.generated.md` | generated | 519 فایل، فقط path+type+domain+role |
| `.claude/token-infra/prompt-pack.md` | generated | context pack برای admin |
| `package.json` | تغییر کرد | فقط ۳ script اضافه شد |

## Dependency جدید
نصب شد: **خیر**

## Runtime اپ دشت‌زاد
دست‌نخورد: ✅ — هیچ فایل زیر `src/`, `prisma/`, `public/` تغییر نکرد

## نتایج تست
| دستور | نتیجه |
|---|---|
| `npm run claude:map` | ✅ 519 files |
| `npm run claude:pack -- "admin lint stabilization"` | ✅ domain: admin |
| `printf "..." \| npm run claude:log` | ✅ 2 خطا در 1 فایل، خلاصه ساختاریافته |
| `git status --short` | ✅ فقط `package.json` + `.claude/` جدید |

## خروجی‌های کلیدی

### claude:map
```
✅ repo-map.generated.md — 519 files
```
فرمت: `| path | ext | domain | role |` — بدون محتوای فایل

### claude:pack
```
✅ prompt-pack.md — domain: admin · checkpoint: ADMIN-LINT-STABILIZATION
```
شامل: task · domain · files to read · inspect scope · forbidden · tests · QA name

### claude:log (stdin test)
```
## Log Summary — lint — 2026-06-26 UTC
### Failing Files: src/app/test.ts — 2 errors
### Error Breakdown: no-unused-vars | no-console
### Summary: 2 خطا در 1 فایل — از src/app/test.ts شروع کن
```
لاگ خام دوباره چاپ نشد ✅

## محدودیت‌های CP1
- `repo-map.generated.md` role از روی path/name حدس می‌زند، نه AST
- domain detection از keyword matching است، نه static analysis
- `summarize-log.mjs` با ESLint JSON format کار نمی‌کند (فقط text output)
- اگر task چنددامنه‌ای بود، pack فقط اولین دامنه match را می‌گیرد

## پیشنهاد CP2
اضافه کردن `--domain` flag به `pack-task-context.mjs` و support برای ESLint JSON output در `summarize-log.mjs`.
