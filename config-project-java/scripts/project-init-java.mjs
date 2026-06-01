#!/usr/bin/env node

/**
 * config-project-java — bootstrap Java Gradle multi-module (Spring Boot 3 + JPA)
 *
 * Usage: node config-project-java/scripts/project-init-java.mjs [options]
 *   --group=<group>       Maven group (default: com.example)
 *   --target=<path>       Target directory (default: cwd)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split('=');
      return [k, v ?? 'true'];
    }),
);

const group = args.group || 'com.example';
const target = path.resolve(args.target || process.cwd());

const assetsDir = path.resolve(__dirname, '..', 'assets', 'project-template-java');

function groupPath(g) {
  return g.replace(/\./g, '/');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(target, dir)}/`);
  }
}

function applyReplacements(content) {
  return content.replace(/__GROUP__/g, group);
}

function copyAndReplace(src, dest) {
  if (fs.existsSync(dest)) {
    console.log(`  [skip] ${path.relative(target, dest)}`);
    return;
  }
  let content = fs.readFileSync(src, 'utf-8');
  content = applyReplacements(content);
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

console.log('\n=== config-project-java ===');
console.log(`Group:  ${group}`);
console.log(`Target: ${target}\n`);

for (const srcFile of walkDir(assetsDir)) {
  const relativePath = path.relative(assetsDir, srcFile);
  // Rewrite __GROUP__ path segments in directory structure
  const destRelative = relativePath
    .split(path.sep)
    .map((seg) => seg.replace(/__GROUP__/g, groupPath(group)))
    .join(path.sep);
  copyAndReplace(srcFile, path.join(target, destRelative));
}

const gitignorePath = path.join(target, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(
    gitignorePath,
    `.gradle/
build/
.env
!.env.example
.idea/
.vscode/
*.iml
`,
    'utf-8',
  );
  console.log('  [created] .gitignore');
}

console.log('\nNext steps:');
console.log('  cp .env.example .env');
console.log('  docker compose up -d');
console.log('  ./gradlew build');
console.log('  ./gradlew :apps:backend-java:bootRun\n');
