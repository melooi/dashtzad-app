#!/usr/bin/env node
// summarize-log.mjs — summarizes lint/tsc/build logs into structured markdown
// Input: file path as argv[2], or stdin
// Zero external dependencies — Node builtins only.

import { readFileSync, createReadStream } from 'fs';
import { createInterface } from 'readline';

async function readInput() {
  const filePath = process.argv[2];
  if (filePath && filePath !== '-') {
    return readFileSync(filePath, 'utf8');
  }
  // read from stdin
  const rl = createInterface({ input: process.stdin });
  const lines = [];
  for await (const line of rl) lines.push(line);
  return lines.join('\n');
}

function detectLogType(raw) {
  if (/error TS\d+/i.test(raw)) return 'tsc';
  if (/\d+ (error|warning)\(s\)/i.test(raw) || /no-unused-vars|no-console|@typescript-eslint/i.test(raw)) return 'lint';
  if (/failed to compile|build failed|webpack|turbopack/i.test(raw)) return 'build';
  return 'generic';
}

function summarize(raw) {
  const lines = raw.split('\n').filter(l => l.trim());
  const type = detectLogType(raw);

  // --- collect failing files ---
  const fileErrors = {};
  const errorTypes = {};
  const firstActionable = { line: null, file: null };

  const fileLineRegex = /^([^\s:]+\.[tj]sx?):(\d+)(?::(\d+))?(?:\s*[-–])?\s*(.*)/;
  const eslintRegex = /^\s+(\d+):(\d+)\s+(error|warning)\s+(.*?)\s+([\w@/-]+)\s*$/;

  let currentFile = null;

  for (const line of lines) {
    // Next.js / tsc style: src/foo/bar.ts(12,4): error TS...
    const tsMatch = line.match(/^(.+\.tsx?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)/);
    if (tsMatch) {
      const [, file, , , , code, msg] = tsMatch;
      const rel = file.replace(/^.*dashtzad-app\//, '');
      fileErrors[rel] = (fileErrors[rel] || 0) + 1;
      errorTypes[code] = (errorTypes[code] || 0) + 1;
      if (!firstActionable.line) {
        firstActionable.line = `\`${rel}:${tsMatch[2]}:${tsMatch[3]}\` — ${code}: ${msg.trim()}`;
        firstActionable.file = rel;
      }
      continue;
    }

    // ESLint style: /abs/path/file.ts
    if (line.match(/^\/.*\.[tj]sx?$/)) {
      currentFile = line.replace(/^.*dashtzad-app\//, '').trim();
      continue;
    }
    // ESLint error line: "  12:4  error  no-unused-vars  eslint"
    const esMatch = line.match(/^\s+(\d+):(\d+)\s+(error|warning)\s+(.*?)\s+([\w@/.-]+)\s*$/);
    if (esMatch && currentFile) {
      const [, row, col, , msg, rule] = esMatch;
      fileErrors[currentFile] = (fileErrors[currentFile] || 0) + 1;
      const key = rule.trim();
      errorTypes[key] = (errorTypes[key] || 0) + 1;
      if (!firstActionable.line) {
        firstActionable.line = `\`${currentFile}:${row}:${col}\` — ${msg.trim()} (${key})`;
        firstActionable.file = currentFile;
      }
      continue;
    }

    // simple "path:line:col text" pattern
    const simpleMatch = line.match(/^([^\s:]+\.[tj]sx?):(\d+):(\d+)\s+(.*)/);
    if (simpleMatch) {
      const [, file, row, col, msg] = simpleMatch;
      const rel = file.replace(/^.*dashtzad-app\//, '');
      fileErrors[rel] = (fileErrors[rel] || 0) + 1;
      const rule = (msg.match(/\s([\w@/.-]+)\s*$/) || [])[1] || 'error';
      errorTypes[rule] = (errorTypes[rule] || 0) + 1;
      if (!firstActionable.line) {
        firstActionable.line = `\`${rel}:${row}:${col}\` — ${msg.trim()}`;
        firstActionable.file = rel;
      }
    }
  }

  const totalErrors = Object.values(fileErrors).reduce((a, b) => a + b, 0);
  const sortedFiles = Object.entries(fileErrors).sort((a, b) => b[1] - a[1]);
  const sortedTypes = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);

  const out = [];
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  out.push(`## Log Summary — ${type} — ${now} UTC`);
  out.push('');

  if (sortedFiles.length === 0) {
    out.push('### Result');
    out.push(totalErrors === 0 ? '✅ No errors detected.' : '⚠️ Could not parse structured errors from input.');
    const sample = lines.slice(0, 5).join('\n');
    if (sample.trim()) { out.push(''); out.push('```'); out.push(sample); out.push('```'); }
  } else {
    out.push('### Failing Files');
    for (const [file, count] of sortedFiles.slice(0, 15)) {
      out.push(`- \`${file}\` — ${count} error${count > 1 ? 's' : ''}`);
    }
    if (sortedFiles.length > 15) out.push(`- ... و ${sortedFiles.length - 15} فایل دیگر`);

    out.push('');
    out.push('### Error Breakdown');
    out.push('| نوع | تعداد |');
    out.push('|---|---|');
    for (const [rule, cnt] of sortedTypes.slice(0, 12)) {
      out.push(`| \`${rule}\` | ${cnt} |`);
    }

    out.push('');
    out.push('### First Actionable Line');
    out.push(firstActionable.line || '_(not found)_');

    const topRepeated = sortedTypes.filter(([, c]) => c > 1);
    if (topRepeated.length) {
      out.push('');
      out.push('### Repeated Errors');
      for (const [rule, cnt] of topRepeated.slice(0, 5)) {
        const files = sortedFiles.filter(() => true).length;
        out.push(`- \`${rule}\`: ${cnt} بار`);
      }
    }

    const suggested = sortedFiles.slice(0, 5).map(([f]) => `- \`${f}\``);
    out.push('');
    out.push('### Suggested Next Inspect');
    out.push(...suggested);

    out.push('');
    out.push('### Summary');
    out.push(`${totalErrors} خطا در ${sortedFiles.length} فایل. نوع غالب: \`${sortedTypes[0]?.[0] || '—'}\`. از \`${firstActionable.file || sortedFiles[0]?.[0] || '—'}\` شروع کن.`);
  }

  return out.join('\n');
}

const raw = await readInput();
const result = summarize(raw);
console.log(result);
