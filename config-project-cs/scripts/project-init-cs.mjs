#!/usr/bin/env node

/**
 * config-project-cs — bootstrap a .NET Clean Architecture solution
 *
 * Usage: node config-project-cs/scripts/project-init-cs.mjs [options]
 *   --project-name=<name>   Project name (default: MyApp)
 *   --target=<path>         Target directory (default: cwd)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; })
);

const projectName = args['project-name'] || 'MyApp';
const target = path.resolve(args['target'] || process.cwd());

const assetsDir = path.resolve(
  new URL('.', import.meta.url).pathname,
  '..', 'assets', 'project-template-cs'
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

console.log(`\n=== config-project-cs ===`);
console.log(`Project: ${projectName}`);
console.log(`Target:  ${target}\n`);

const templateFiles = walkDir(assetsDir);

for (const srcFile of templateFiles) {
  const relativePath = path.relative(assetsDir, srcFile);
  const destRelative = relativePath.replace(/ProjectName/g, projectName);
  const destFile = path.join(target, destRelative);
  copyAndReplace(srcFile, destFile);
}

const gitignorePath = path.join(target, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, `[Aa]bin/
[Oo]bj/
*.user
*.userosscache
*.sln.docstates
.vs/
.vscode/
.env
!.env.example
`, 'utf-8');
  console.log(`  [created] .gitignore`);
}

const envExamplePath = path.join(target, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, `ConnectionStrings__DefaultConnection=Host=localhost;Database=appdb;Username=postgres;Password=postgres
Jwt__Secret=change-me-to-a-very-long-secret-key
PORT=5000
`, 'utf-8');
  console.log(`  [created] .env.example`);
}

const dockerComposePath = path.join(target, 'docker-compose.yml');
if (!fs.existsSync(dockerComposePath)) {
  fs.writeFileSync(dockerComposePath, `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`, 'utf-8');
  console.log(`  [created] docker-compose.yml`);
}

console.log(`\n[next steps]`);
console.log(`  cd ${path.relative(process.cwd(), target)}`);
console.log(`  dotnet restore`);
console.log(`  dotnet build`);
console.log(`  cp .env.example .env`);
console.log(`  docker compose up -d\n`);
