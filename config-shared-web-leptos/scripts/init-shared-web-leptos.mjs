#!/usr/bin/env node

/**
 * config-shared-web-leptos — bootstrap admin shell in Leptos crate
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
const theme = args.theme || 'fuchsia';
const mode = args.mode || 'dark';
const dryRun = args['dry-run'] === 'true';
const target = path.resolve(process.cwd());
const crateRoot = path.join(target, frontendPath);

const THEME_MAP = {
  fuchsia: '#d946ef',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  emerald: '#10b981',
};

const primaryColor = THEME_MAP[theme] || theme;
const skillRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const templateDir = path.join(skillRoot, 'templates', 'base');

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

function copyTemplates() {
  if (!fs.existsSync(templateDir)) {
    console.error(`Template dir not found: ${templateDir}`);
    process.exit(1);
  }
  for (const srcFile of walkDir(templateDir)) {
    const rel = path.relative(templateDir, srcFile);
    const dest = path.join(crateRoot, rel);
    if (fs.existsSync(dest)) {
      console.log(`  [skip] ${rel}`);
      continue;
    }
    if (dryRun) {
      console.log(`  [dry-run] would copy ${rel}`);
      continue;
    }
    let content = fs.readFileSync(srcFile, 'utf-8');
    content = content
      .replaceAll('__PRIMARY_COLOR__', primaryColor)
      .replaceAll('__BODY_MODE_CLASS__', mode === 'dark' ? 'dark' : '');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, 'utf-8');
    console.log(`  [created] ${rel}`);
  }
}

console.log('\n=== config-shared-web-leptos ===');
console.log(`Frontend: ${frontendPath}`);
console.log(`Theme:    ${theme} (${primaryColor})`);
console.log(`Mode:     ${mode}\n`);

if (!fs.existsSync(path.join(crateRoot, 'Cargo.toml'))) {
  console.error('Error: run config-project-leptos first.');
  process.exit(1);
}

copyTemplates();

console.log('\nDone. Integrate AdminShell in app.rs — see references/integrate-shell.md\n');
