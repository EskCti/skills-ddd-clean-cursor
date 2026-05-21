#!/usr/bin/env node
/**
 * Valida cobertura mínima em paths de domain/application.
 *
 * Usage:
 *   node scripts/check-coverage.mjs [minPercent] [pathSegment...]
 *
 * Examples:
 *   node scripts/check-coverage.mjs 95 domain application
 *   node scripts/check-coverage.mjs 95 domain application entity vo use-case queries
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const min = Number(process.argv[2] ?? 95);
const segments = process.argv.slice(3).length
  ? process.argv.slice(3)
  : ['domain', 'application', 'entity', 'vo', 'use-case', 'use-cases', 'queries'];

const candidates = [
  resolve('coverage/coverage-summary.json'),
  resolve('coverage/coverage-final.json'),
];

const summaryPath = candidates.find((p) => existsSync(p));

if (!summaryPath) {
  console.error('Missing coverage summary. Run tests with --coverage first.');
  console.error('Expected one of:', candidates.join(', '));
  process.exit(1);
}

const raw = JSON.parse(readFileSync(summaryPath, 'utf8'));

/** @type {Record<string, { lines: { covered: number, total: number } }>} */
const entries = summaryPath.endsWith('coverage-final.json')
  ? Object.fromEntries(
      Object.entries(raw).map(([file, data]) => [
        file,
        {
          lines: {
            covered: Object.values(data.s ?? {}).filter((v) => v > 0).length,
            total: Object.keys(data.statementMap ?? {}).length,
          },
        },
      ]),
    )
  : raw;

let covered = 0;
let total = 0;
let matched = 0;

for (const [file, data] of Object.entries(entries)) {
  if (file === 'total' || !data?.lines) continue;
  const normalized = file.replace(/\\/g, '/');
  const hit = segments.some(
    (s) =>
      normalized.includes(`/${s}/`) ||
      normalized.includes(`/${s}.`) ||
      normalized.includes(`.${s}.`),
  );
  if (!hit) continue;
  matched++;
  covered += data.lines.covered ?? 0;
  total += data.lines.total ?? 0;
}

const pct = total > 0 ? (covered / total) * 100 : 100;

console.log(`Coverage gate: ${pct.toFixed(1)}% (${covered}/${total} lines)`);
console.log(`Scope segments: ${segments.join(', ')}`);
console.log(`Matched files: ${matched}`);
console.log(`Minimum required: ${min}%`);

if (pct < min) {
  console.error(`FAIL: coverage ${pct.toFixed(1)}% is below ${min}%`);
  process.exit(1);
}

console.log('PASS: coverage threshold met');
