# CHANGELOG — لاگ پروژهٔ دشت‌زاد
append-only · جدیدترین بالا. هر entry: چه شد، فایل‌ها، تأیید (tsc/build)، وضعیت بعد، نکتهٔ جدید.

---

## 2026-06-26 — meta — BOOTSTRAP واقعی (git+tsc+scan)
- چه شد: اولین bootstrap با داده‌های واقعی. همهٔ ❓ها تأیید/اصلاح شدند. memory فایل‌های 01-07 پر شدند.
- فایل‌های تغییر: dashtzad-memory/memory/01..07.md، PROJECT-MAP.md
- تأیید: tsc=FAIL (3 خطا در CardVariantLite — cards.ts + blog/[slug]), build=نشد
- وضعیت بعد: 🟡 map واقعی، بدهی‌ها شناخته‌شده
- نکتهٔ جدید: همهٔ کارهای بعد از commit 4d48b86 هنوز uncommitted هستند — بزرگ‌ترین ریسک از دست رفتن کار. ❓ در PROJECT-MAP به ✅/🟡/⏳/⚠️ تبدیل شدند.

---

## 2026-06-26 — meta — ساخت skill حافظهٔ مرکزی (seed)
- چه شد: skill `dashtzad-memory` ساخته شد؛ PROJECT-MAP و memoryها seed شدند از روی آرشیو چت‌ها.
- فایل‌های ساخت: SKILL.md, PROJECT-MAP.md, memory/00..08, logs/CHANGELOG.md
- تأیید: tsc=نشد build=نشد (این seed بیرون از repo ساخته شد)
- وضعیت بعد: 🟡 منتظر اولین bootstrap داخل پروژهٔ واقعی
- نکتهٔ جدید برای memory: ❓ها در PROJECT-MAP باید در اولین run با کد واقعی تأیید شوند.
