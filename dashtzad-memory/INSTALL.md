# نصب skill حافظهٔ مرکزی دشت‌زاد

این پرامپت کوتاه را به Claude Code بده تا skill را نصب و bootstrap کند.

---

پوشهٔ `dashtzad-memory/` (شامل SKILL.md, PROJECT-MAP.md, memory/, logs/) را داخل پروژه قرار بده.

**جای پیشنهادی:** ریشهٔ پروژه، یعنی:
`/Users/mim/Documents/dashtzad all/dashtzadpro/dashtzad-app/dashtzad-memory/`

سپس این کارها را بکن:

1. **اجباری‌سازی:** در `AGENTS.md` (یا `CLAUDE.md`) پروژه، در بالا این خط را اضافه کن تا هر session بخواندش:
   > در ابتدای هر session و قبل از هر تغییر کد، `dashtzad-memory/SKILL.md` را بخوان و حلقهٔ اجباری‌اش را اجرا کن. برای جهت‌گیری فقط `dashtzad-memory/PROJECT-MAP.md` + memory دامنهٔ مرتبط خوانده شود، نه کل کدبیس.

2. **Bootstrap (یک‌بار):** طبق بخش Bootstrap در SKILL.md:
   - `git log --oneline -20` و `git status --short` بگیر.
   - `npx tsc --noEmit` بزن و خطاها را در memory مربوط ثبت کن.
   - ساختار `src/` را در سطح بالا scan کن (فقط نام‌ها/کلیدی‌ها).
   - هر memory فایل `❓` را با وضعیت **واقعی** پر کن.
   - همهٔ `❓`های `PROJECT-MAP.md` را با کد واقعی تأیید و به ✅/🟡/⏳/⚠️ تبدیل کن.
   - یک entry «BOOTSTRAP» در `logs/CHANGELOG.md` بزن.

3. **از این به بعد:** هیچ‌وقت برای فهمیدن «کجای کاریم» کل پروژه را نخوان. فقط map + یک memory. بعد از هر کار: log بزن، memory دامنه را قوی‌تر کن، map را تازه کن. «done» فقط با tsc/build واقعی.

**قوانین:** Prisma/فرانت/معماری را خودسرانه تغییر نده؛ تصمیم قفل‌شده را flag کن؛ داده/کد جعلی نساز؛ commit نزن مگر بگویم.

گزارش کوتاه بده: چه memoryهایی پر شد، چه `❓`هایی تأیید/اصلاح شد، نتیجهٔ tsc.
