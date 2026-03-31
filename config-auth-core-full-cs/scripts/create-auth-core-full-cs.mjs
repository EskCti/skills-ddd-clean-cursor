#!/usr/bin/env node

/**
 * config-auth-core-full-cs — scaffold RBAC (Role + Permission) in Core project
 * Depends on config-auth-core-basic-cs being applied first.
 *
 * Usage: node config-auth-core-full-cs/scripts/create-auth-core-full-cs.mjs [options]
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
const assetsDir = path.resolve(new URL('.', import.meta.url).pathname, '..', 'assets', 'auth-core-full-template-cs');
const coreDir = path.join(target, 'src', `${projectName}.Core`, 'Auth');

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
  content = content.replace(/Project\.Auth/g, `${projectName}.Core.Auth`);
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

console.log(`\n=== config-auth-core-full-cs (RBAC) ===`);
console.log(`Project: ${projectName}`);
console.log(`Dest:    ${path.relative(target, coreDir)}\n`);

const basicCheck = path.join(coreDir, 'Domain', 'Entities', 'User.cs');
if (!fs.existsSync(basicCheck)) {
  console.warn(`  [warn] User.cs not found — run config-auth-core-basic-cs first.`);
}

for (const srcFile of walkDir(assetsDir)) {
  if (srcFile.endsWith('README.md')) continue;
  const rel = path.relative(assetsDir, srcFile);
  copyAndReplace(srcFile, path.join(coreDir, rel));
}

console.log(`\n[done] Auth core full (RBAC) scaffolded.\n`);
