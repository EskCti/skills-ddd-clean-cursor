#!/usr/bin/env node

/**
 * config-efcore-cs — scaffold EF Core infrastructure
 *
 * Usage: node config-efcore-cs/scripts/init-efcore-cs.mjs [options]
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
const assetsDir = path.resolve(new URL('.', import.meta.url).pathname, '..', 'assets', 'efcore-template-cs');

const infraDir = path.join(target, 'src', `${projectName}.Infrastructure`);
const backendDir = path.join(target, 'src', `${projectName}.Backend`);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(target, dir)}/`);
  }
}

function writeIfAbsent(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] ${path.relative(target, filePath)}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  [created] ${path.relative(target, filePath)}`);
}

console.log(`\n=== config-efcore-cs ===`);
console.log(`Project: ${projectName}\n`);

const dbContextSrc = fs.readFileSync(path.join(assetsDir, 'Persistence', 'Contexts', 'AppDbContext.cs'), 'utf-8');
const dbContextDest = dbContextSrc.replace(/Project\.Infrastructure/g, `${projectName}.Infrastructure`);
writeIfAbsent(
  path.join(infraDir, 'Persistence', 'Contexts', 'AppDbContext.cs'),
  dbContextDest
);

ensureDir(path.join(infraDir, 'Persistence', 'Configurations'));
ensureDir(path.join(infraDir, 'Persistence', 'Migrations'));

const appsettingsPath = path.join(backendDir, 'appsettings.json');
if (!fs.existsSync(appsettingsPath)) {
  writeIfAbsent(appsettingsPath, JSON.stringify({
    ConnectionStrings: {
      DefaultConnection: "Host=localhost;Database=appdb;Username=postgres;Password=postgres"
    },
    Logging: { LogLevel: { Default: "Information" } }
  }, null, 2));
}

console.log(`\n[next steps]`);
console.log(`  cd src/${projectName}.Infrastructure`);
console.log(`  dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`);
console.log(`  dotnet add package Microsoft.EntityFrameworkCore.Design`);
console.log(`  dotnet ef migrations add InitialCreate --project src/${projectName}.Infrastructure --startup-project src/${projectName}.Backend\n`);
