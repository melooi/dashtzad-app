# Log Summary Format

وقتی Claude یک لاگ طولانی (lint/tsc/build) دریافت کرد، باید با این فرمت خلاصه کند — لاگ خام را دوباره چاپ نکند.

## فرمت خروجی

```markdown
## Log Summary — <نوع: lint | tsc | build> — <تاریخ>

### Failing Files
- `path/to/file.ts` — <تعداد خطا> خطا

### Error Breakdown
| نوع خطا | تعداد |
|---|---|
| no-unused-vars | 12 |
| @typescript-eslint/... | 5 |

### First Actionable Line
`path/to/file.ts:LINE:COL — <پیام خطا>`

### Repeated Errors
- `no-unused-vars`: ۱۲ بار در ۵ فایل

### Suggested Next Inspect
- `src/components/admin/X.tsx`
- `src/lib/Y.ts`

### Summary
<یک جملهٔ کوتاه: چه مشکل کلی‌ای هست و از کجا شروع کنیم>
```

## قوانین
- لاگ خام را دوباره چاپ نکن.
- اگر لاگ کمتر از ۱۰ خط بود، می‌توانی کامل بیاوری.
- «Suggested Next Inspect» باید فایل‌های مشخص باشند، نه پوشهٔ کلی.
- خطاهای تکراری را aggregate کن، یک‌به‌یک لیست نکن.
