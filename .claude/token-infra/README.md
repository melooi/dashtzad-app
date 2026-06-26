# Token-Infra — زیرساخت مصرف‌بهینهٔ توکن Claude

این پوشه ابزارهای سبک برای کمک به Claude جهت کار با حداقل توکن را نگه می‌دارد.
**هیچ dependency خارجی ندارد.** همه اسکریپت‌ها با Node builtins کار می‌کنند.

## ساختار
```
token-infra/
  README.md                   ← این فایل
  repo-map.generated.md       ← خروجی claude:map (خودکار بازنویسی می‌شود)
  prompt-pack.md              ← خروجی claude:pack (خودکار بازنویسی می‌شود)
  log-summary-format.md       ← فرمت مرجع برای خلاصه لاگ
  qa-report-format.md         ← فرمت مرجع برای QA report
  scripts/
    generate-repo-map.mjs     ← npm run claude:map
    summarize-log.mjs         ← npm run claude:log
    pack-task-context.mjs     ← npm run claude:pack -- "<task>"
```

## دستورات
```bash
# رفرش نقشهٔ repo (فایل‌ها با domain/role)
npm run claude:map

# ساخت context pack برای یک task
npm run claude:pack -- "admin pricing stabilization"

# خلاصه‌سازی لاگ
npm run claude:log -- path/to/build.log
# یا از stdin:
cat build.log | npm run claude:log
```

## قوانین این infra
- فایل‌های generated (`repo-map.generated.md`, `prompt-pack.md`) را دستی ویرایش نکن.
- هیچ dependency جدید نصب نشود.
- اسکریپت‌ها runtime اپ را تغییر نمی‌دهند.
- CP1: زیرساخت پایه. CP2 می‌تواند caching یا domain-specific scanning اضافه کند.
