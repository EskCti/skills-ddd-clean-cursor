#!/usr/bin/env node

/**
 * config-project-rs — bootstrap Rust workspace (Axum + sqlx + shared-kernel)
 *
 * Usage: node config-project-rs/scripts/project-init-rs.mjs [options]
 *   --project-name=<name>   Crate prefix (default: app)
 *   --target=<path>         Target directory (default: cwd)
 */

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k, v ?? 'true'];
    }),
);

const projectName = args['project-name'] || 'app';
const target = path.resolve(args.target || process.cwd());

const assetsDir = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'assets',
  'project-template-rs',
);

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
  content = content.replace(/ProjectName/g, projectName);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content, 'utf-8');
  console.log(`  [created] ${path.relative(target, dest)}`);
}

function walkDir(dir) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...walkDir(fullPath));
    } else {
      entries.push(fullPath);
    }
  }
  return entries;
}

console.log('\n=== config-project-rs ===');
console.log(`Project: ${projectName}`);
console.log(`Target:  ${target}\n`);

for (const srcFile of walkDir(assetsDir)) {
  const relativePath = path.relative(assetsDir, srcFile);
  copyAndReplace(srcFile, path.join(target, relativePath));
}

const gitignorePath = path.join(target, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(
    gitignorePath,
    `/target/
**/*.rs.bk
.env
!.env.example
.idea/
.vscode/
`,
    'utf-8',
  );
  console.log('  [created] .gitignore');
}

const migrationsDir = path.join(target, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.writeFileSync(path.join(migrationsDir, '.gitkeep'), '', 'utf-8');
  console.log('  [created] migrations/.gitkeep');
}

console.log('\nNext steps:');
console.log('  cp .env.example .env');
console.log('  docker compose up -d');
console.log('  cargo build');
console.log('  cargo run -p api\n');
