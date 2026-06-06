#!/usr/bin/env node

/**
 * config-project-leptos — bootstrap Leptos SSR crate in existing Cargo workspace
 *
 * Usage: node config-project-leptos/scripts/project-init-leptos.mjs [options]
 *   --frontend-path=<path>   Crate path (default: crates/web-leptos)
 *   --api-url=<url>          API base URL (default: http://localhost:4000)
 *   --target=<path>          Workspace root (default: cwd)
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

const frontendPath = args['frontend-path'] || 'crates/web-leptos';
const apiUrl = args['api-url'] || 'http://localhost:4000';
const target = path.resolve(args.target || process.cwd());

const assetsDir = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'assets',
  'project-template-leptos',
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(target, dir)}/`);
  }
}

function copyAndReplace(src, dest, replacements = {}) {
  if (fs.existsSync(dest)) {
    console.log(`  [skip] ${path.relative(target, dest)}`);
    return;
  }
  let content = fs.readFileSync(src, 'utf-8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(key, value);
  }
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

function addWorkspaceMember(workspaceRoot, member) {
  const cargoPath = path.join(workspaceRoot, 'Cargo.toml');
  if (!fs.existsSync(cargoPath)) {
    console.log('  [warn] Cargo.toml not found — run config-project-rs first');
    return;
  }
  const content = fs.readFileSync(cargoPath, 'utf-8');
  if (content.includes(`"${member}"`)) {
    console.log(`  [skip] workspace member "${member}" already present`);
    return;
  }
  const updated = content.replace(
    /members\s*=\s*\[([^\]]*)\]/,
    (match, members) => {
      const trimmed = members.trim();
      const suffix = trimmed.endsWith(',') || trimmed === '' ? '' : ',';
      return `members = [${trimmed}${suffix} "${member}"]`;
    },
  );
  fs.writeFileSync(cargoPath, updated, 'utf-8');
  console.log(`  [updated] Cargo.toml — added member "${member}"`);
}

function appendEnvExample(workspaceRoot) {
  const envPath = path.join(workspaceRoot, '.env.example');
  const block = `
# Leptos SSR (config-project-leptos)
LEPTOS_SITE_ADDR=127.0.0.1:3000
LEPTOS_RELOAD_PORT=3001
API_BASE_URL=${apiUrl}
`;
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    if (content.includes('LEPTOS_SITE_ADDR')) {
      console.log('  [skip] .env.example already has Leptos vars');
      return;
    }
    fs.appendFileSync(envPath, block, 'utf-8');
    console.log('  [updated] .env.example — Leptos vars appended');
  } else {
    fs.writeFileSync(envPath, block.trim() + '\n', 'utf-8');
    console.log('  [created] .env.example');
  }
}

console.log('\n=== config-project-leptos ===');
console.log(`Frontend: ${frontendPath}`);
console.log(`API URL:  ${apiUrl}`);
console.log(`Target:   ${target}\n`);

const crateDest = path.join(target, frontendPath);
const replacements = {
  __API_BASE_URL__: apiUrl,
};

for (const srcFile of walkDir(assetsDir)) {
  const relativePath = path.relative(assetsDir, srcFile);
  copyAndReplace(srcFile, path.join(crateDest, relativePath), replacements);
}

addWorkspaceMember(target, frontendPath);
appendEnvExample(target);

console.log('\nDone. Next steps:');
console.log('  1. cargo install cargo-leptos');
console.log('  2. npm install -D tailwindcss @tailwindcss/cli  (see references/tailwind-setup.md)');
console.log('  3. config-shared-web-leptos for admin shell');
console.log('  4. cargo leptos watch\n');
