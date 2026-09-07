#!/usr/bin/env node

/**
 * config-auth-backend-basic-cs — scaffold auth infrastructure in Backend project
 *
 * Usage: node config-auth-backend-basic-cs/scripts/init-auth-backend-cs.mjs [options]
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
const assetsDir = path.resolve(new URL('.', import.meta.url).pathname, '..', 'assets', 'auth-backend-basic-template-cs');
const backendDir = path.join(target, 'src', `${projectName}.Backend`, 'Modules', 'Auth');

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
  content = content.replace(/Project\.Auth\.Domain\.Services/g, `${projectName}.Core.Domain.Services`);
  content = content.replace(/Project\.Auth\.Application\.UseCases\.Auth/g, `${projectName}.Core.Application.UseCases.Auth`);
  content = content.replace(/Project\.Auth\.Backend/g, `${projectName}.Backend.Modules.Auth`);
  content = content.replace(/Project\.Auth\.Infrastructure/g, `${projectName}.Infrastructure.Auth`);
  content = content.replace(/Project\.Auth\.Application/g, `${projectName}.Core.Application`);
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

console.log(`\n=== config-auth-backend-basic-cs ===`);
console.log(`Project: ${projectName}`);
console.log(`Dest:    ${path.relative(target, backendDir)}\n`);

for (const srcFile of walkDir(assetsDir)) {
  if (srcFile.endsWith('README.md')) continue;
  const rel = path.relative(assetsDir, srcFile);
  copyAndReplace(srcFile, path.join(backendDir, rel));
}

console.log(`\n[next steps]`);
console.log(`  dotnet add src/${projectName}.Backend package BCrypt.Net-Next`);
console.log(`  dotnet add src/${projectName}.Backend package Microsoft.AspNetCore.Authentication.JwtBearer`);
console.log(`  dotnet add src/${projectName}.Backend package System.IdentityModel.Tokens.Jwt`);
console.log(`  dotnet add src/${projectName}.Backend package Microsoft.IdentityModel.Tokens`);
console.log(`  Configure JWT in Program.cs`);
console.log(`  dotnet build\n`);
