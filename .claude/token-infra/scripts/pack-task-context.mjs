#!/usr/bin/env node
// pack-task-context.mjs — builds a compact context pack for a given task
// Usage: node pack-task-context.mjs "admin lint stabilization"
// Zero external dependencies — Node builtins only.

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(__dirname, '..');
const OUT = join(OUT_DIR, 'prompt-pack.md');

const task = process.argv.slice(2).join(' ').trim();
if (!task) {
  console.error('Usage: node pack-task-context.mjs "<task description>"');
  process.exit(1);
}

// --- domain detection ---
const DOMAIN_RULES = [
  { keywords: ['admin', 'ادمین', 'dashboard', 'panel', 'pricing', 'قیمت', 'product-list', 'media-library', 'slug', 'quick-add'], domain: 'admin', memoryFile: '01-admin-panel.md' },
  { keywords: ['storefront', 'store', 'shop', 'pdp', 'product-detail', 'cart', 'سبد', 'wishlist', 'header', 'footer', 'صفحهٔ محصول'], domain: 'storefront', memoryFile: '02-storefront.md' },
  { keywords: ['chat', 'ai', 'bot', 'openai', 'analyst', 'chatbot', 'responses-api', 'assistant'], domain: 'chat-ai', memoryFile: '03-chat-ai.md' },
  { keywords: ['article', 'recipe', 'cms', 'content', 'blog', 'دستورپخت', 'مقاله', 'media', 'upload'], domain: 'content-cms', memoryFile: '04-content-cms.md' },
  { keywords: ['order', 'payment', 'zarinpal', 'تسویه', 'سفارش', 'checkout', 'idpay'], domain: 'commerce', memoryFile: '05-commerce.md' },
  { keywords: ['kavenegar', 'sms', 'otp', 'webhook', 'integration', 'shipping', 'hesabfa'], domain: 'integrations', memoryFile: '06-integrations.md' },
  { keywords: ['design', 'token', 'color', 'font', 'tailwind', 'dz-', 'theme', 'dark', 'night', 'rtl', 'vazirmatn'], domain: 'design-system', memoryFile: '07-design-system.md' },
  { keywords: ['prisma', 'schema', 'migration', 'model', 'database', 'db', 'seed', 'relation'], domain: 'data-model', memoryFile: '08-data-model.md' },
];

// secondary: lint/stabilization implies admin if no other match
const TASK_TYPE_RULES = [
  { keywords: ['lint', 'stabilization', 'tsc', 'typecheck', 'eslint', 'build', 'خطا'], hint: 'check all domains — start with failing domain' },
];

const taskLower = task.toLowerCase();

let detected = null;
for (const rule of DOMAIN_RULES) {
  if (rule.keywords.some(k => taskLower.includes(k.toLowerCase()))) {
    detected = rule;
    break;
  }
}

// lint/stabilization without explicit domain → try to infer from "admin", "storefront" etc. in task
const isLintTask = TASK_TYPE_RULES[0].keywords.some(k => taskLower.includes(k));
if (!detected && isLintTask) {
  // default to admin if nothing else
  detected = DOMAIN_RULES[0];
}

// --- source files by domain ---
const DOMAIN_FILES = {
  admin: [
    'src/app/(admin)/',
    'src/components/admin/',
    'src/lib/admin/',
  ],
  storefront: [
    'src/app/(public)/',
    'src/components/storefront/',
    'src/lib/account/',
  ],
  'chat-ai': [
    'src/app/api/admin-ai/',
    'src/app/api/chat/',
    'src/lib/ai/',
    'src/components/chat/',
  ],
  'content-cms': [
    'src/app/(admin)/content/',
    'src/app/(public)/articles/',
    'src/app/(public)/recipes/',
    'src/components/admin/media/',
    'src/lib/content/',
  ],
  commerce: [
    'src/app/(public)/checkout/',
    'src/app/api/orders/',
    'src/lib/commerce/',
  ],
  integrations: [
    'src/lib/integrations/',
    'src/app/api/webhooks/',
  ],
  'design-system': [
    'src/components/ui/',
    'src/components/admin/ui/',
    'public/dz-design/',
  ],
  'data-model': [
    'prisma/schema.prisma',
    'prisma/migrations/',
  ],
};

const REQUIRED_TESTS = {
  admin: ['npx tsc --noEmit', 'npm run lint -- src/app/(admin) src/components/admin'],
  storefront: ['npx tsc --noEmit', 'npm run lint -- src/app/(public) src/components/storefront'],
  'chat-ai': ['npx tsc --noEmit'],
  'content-cms': ['npx tsc --noEmit'],
  commerce: ['npx tsc --noEmit'],
  integrations: ['npx tsc --noEmit'],
  'design-system': ['npx tsc --noEmit'],
  'data-model': ['npx tsc --noEmit', 'npx prisma validate'],
};

const now = new Date().toISOString().slice(0, 10);
const checkpointName = task
  .toUpperCase()
  .replace(/[^A-Z0-9؀-ۿ ]/g, '')
  .replace(/\s+/g, '-')
  .slice(0, 40);

let content;

if (!detected) {
  content = `# Context Pack — ${task}
**تاریخ:** ${now}

## ⚠️ دامنه نامشخص

نتوانستم از روی task یک دامنه تشخیص بدم.
لطفاً یکی از این‌ها را مشخص کن:

- admin
- storefront
- chat-ai
- content-cms
- commerce
- integrations
- design-system
- data-model

سپس دوباره اجرا کن:
\`\`\`
npm run claude:pack -- "<task> for <domain>"
\`\`\`
`;
} else {
  const files = DOMAIN_FILES[detected.domain] || [];
  const tests = REQUIRED_TESTS[detected.domain] || ['npx tsc --noEmit'];

  const readFirst = [
    '.claude/skills/dashtzad-memory/PROJECT-MAP.md',
    `.claude/skills/dashtzad-memory/memory/${detected.memoryFile}`,
  ];

  content = `# Context Pack — ${task}
**دامنه:** ${detected.domain}
**Memory:** \`${detected.memoryFile}\`
**تاریخ:** ${now}

## Task
${task}

## Files to Read First
${readFirst.map(f => `- \`${f}\``).join('\n')}

## Allowed Inspect Scope
${files.map(f => `- \`${f}\``).join('\n')}

## Forbidden Actions
- کل پروژه scan نشود — فقط scope بالا
- dependency جدید نصب نشود
- commit/push بدون اجازهٔ صریح ملو ممنوع
- schema یا migration بدون تأیید نساز
- تصمیم قفل‌شده در 00-architecture.md را بدون تأیید باز نکن

## Required Tests
${tests.map(t => `- \`${t}\``).join('\n')}

## QA Report Name
\`${checkpointName}-QA.md\`

## Output Format
- patch/diff، نه full-file rewrite
- لاگ خام را خلاصه کن (فرمت: \`.claude/token-infra/log-summary-format.md\`)
- نتیجهٔ واقعی tsc را گزارش بده، نه «احتمالاً»
`;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, content, 'utf8');

if (!detected) {
  console.log(`⚠️  Domain unclear — prompt-pack.md created with clarification request`);
} else {
  console.log(`✅ prompt-pack.md — domain: ${detected.domain} · checkpoint: ${checkpointName}`);
}
