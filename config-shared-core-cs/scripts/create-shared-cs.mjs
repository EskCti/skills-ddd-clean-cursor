#!/usr/bin/env node

/**
 * config-shared-core-cs — scaffold Shared.Kernel project
 *
 * Usage: node config-shared-core-cs/scripts/create-shared-cs.mjs [options]
 *   --project-name=<name>   Project name (default: Project)
 *   --target=<path>         Target directory (default: cwd)
 */

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; })
);

const projectName = args['project-name'] || 'Project';
const target = path.resolve(args['target'] || process.cwd());
const assetsDir = path.resolve(new URL('.', import.meta.url).pathname, '..', 'assets', 'shared-template-cs');

const destBase = path.join(target, 'src', `${projectName}.Shared.Kernel`);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(target, dir)}/`);
  }
}

function copyAndReplace(src, dest) {
  if (fs.existsSync(dest)) {
    console.log(`  [skip] ${path.relative(target, dest)}`);
    return;
  }
  let content = fs.readFileSync(src, 'utf-8');
  content = content.replace(/Project\.Shared\.Kernel/g, `${projectName}.Shared.Kernel`);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content, 'utf-8');
  console.log(`  [created] ${path.relative(target, dest)}`);
}

function walkDir(dir) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) entries.push(...walkDir(fullPath));
    else entries.push(fullPath);
  }
  return entries;
}

console.log(`\n=== config-shared-core-cs ===`);
console.log(`Project: ${projectName}`);
console.log(`Dest:    ${path.relative(target, destBase)}\n`);

const templateFiles = walkDir(assetsDir);
for (const srcFile of templateFiles) {
  if (srcFile.endsWith('README.md')) continue;
  const rel = path.relative(assetsDir, srcFile);
  copyAndReplace(srcFile, path.join(destBase, rel));
}

console.log(`\n[done] Shared.Kernel scaffolded.`);
console.log(`  dotnet build to verify.\n`);
