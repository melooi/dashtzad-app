#!/usr/bin/env node
// generate-repo-map.mjs — builds .claude/token-infra/repo-map.generated.md
// Zero external dependencies — Node builtins only.

import { readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '../../..');  // dashtzad-app/
const OUT = join(__dirname, '../repo-map.generated.md');

const SCAN_DIRS = ['src/app', 'src/components', 'src/lib', 'prisma', 'public'];

const IGNORE = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', 'coverage',
  'uploads', 'generated', '.turbo', '.cache',
]);

const IGNORE_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store',
]);

const IGNORE_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mp3', '.wav',
  '.zip', '.gz', '.tar',
]);

function detectDomain(relPath) {
  const p = relPath.toLowerCase();
  if (p.includes('/admin') || p.includes('admin/')) return 'admin';
  if (p.includes('/ai') || p.includes('chat') || p.includes('analyst') || p.includes('openai')) return 'chat-ai';
  if (p.includes('/account') || p.includes('/auth') || p.includes('/login') || p.includes('/otp')) return 'storefront';
  if (p.includes('/product') || p.includes('/pdp') || p.includes('storefront') || p.includes('/shop') || p.includes('/cart') || p.includes('/wishlist')) return 'storefront';
  if (p.includes('/article') || p.includes('/recipe') || p.includes('/content') || p.includes('/cms') || p.includes('/blog') || p.includes('/media')) return 'content';
  if (p.includes('/order') || p.includes('/payment') || p.includes('/checkout') || p.includes('/zarinpal')) return 'commerce';
  if (p.includes('/kavenegar') || p.includes('/sms') || p.includes('/webhook') || p.includes('integrations')) return 'integrations';
  if (p.includes('/design') || p.includes('token') || p.includes('theme') || p.startsWith('public/')) return 'design';
  if (p.startsWith('prisma/')) return 'data-model';
  if (p.includes('/lib/')) return 'lib';
  if (p.includes('/components/ui/')) return 'design';
  if (p.includes('/app/')) return 'storefront';
  return 'misc';
}

function detectRole(relPath) {
  const p = relPath.toLowerCase();
  const name = basename(p, extname(p)).toLowerCase();
  if (p.includes('/api/') || p.includes('route.ts')) return 'API route';
  if (name === 'page') return 'page';
  if (name === 'layout') return 'layout';
  if (name === 'loading' || name === 'error' || name === 'not-found') return 'Next.js special';
  if (name.endsWith('context') || name.endsWith('provider')) return 'context/provider';
  if (name.endsWith('hook') || name.startsWith('use-') || name.startsWith('use')) return 'hook';
  if (name.endsWith('store') || name.endsWith('state')) return 'state store';
  if (name.endsWith('schema')) return 'Zod schema';
  if (name === 'schema' || p.endsWith('.prisma')) return 'Prisma schema';
  if (name.endsWith('action') || name.endsWith('actions')) return 'server action';
  if (name.endsWith('client')) return 'client';
  if (name.endsWith('utils') || name.endsWith('helpers') || name.endsWith('lib')) return 'utility';
  if (name.endsWith('types') || name.endsWith('type')) return 'types';
  if (name.endsWith('config')) return 'config';
  if (p.includes('/components/')) return 'component';
  return 'module';
}

function walk(dir, results = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }

  for (const entry of entries) {
    if (IGNORE_FILES.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }

    if (stat.isDirectory()) {
      if (IGNORE.has(entry)) continue;
      // skip public/uploads specifically
      const rel = relative(ROOT, full);
      if (rel === 'public/uploads' || rel === 'src/generated') continue;
      walk(full, results);
    } else {
      const ext = extname(entry).toLowerCase();
      if (IGNORE_EXT.has(ext)) continue;
      if (stat.size > 500_000) continue; // skip very large files
      results.push(full);
    }
  }
  return results;
}

const lines = [
  '# Repo Map — dashtzad-app',
  `> Generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC — do not edit manually`,
  '',
  '| Path | Type | Domain | Role |',
  '|---|---|---|---|',
];

let count = 0;
for (const dir of SCAN_DIRS) {
  const absDir = join(ROOT, dir);
  const files = walk(absDir);
  for (const f of files) {
    const rel = relative(ROOT, f);
    const ext = extname(f).slice(1) || 'file';
    const domain = detectDomain(rel);
    const role = detectRole(rel);
    lines.push(`| \`${rel}\` | ${ext} | ${domain} | ${role} |`);
    count++;
  }
}

lines.push('');
lines.push(`> Total: ${count} files across ${SCAN_DIRS.join(', ')}`);

mkdirSync(join(__dirname, '..'), { recursive: true });
writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`✅ repo-map.generated.md — ${count} files`);
