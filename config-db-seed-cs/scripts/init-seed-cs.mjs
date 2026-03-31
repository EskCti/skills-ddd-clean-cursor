#!/usr/bin/env node

/**
 * config-db-seed-cs — scaffold seed infrastructure for EF Core project
 *
 * Usage: node config-db-seed-cs/scripts/init-seed-cs.mjs [options]
 *   --project-name=<name>   Project name (default: Project)
 *   --infra-path=<path>     Infrastructure project path (auto-detected from .sln)
 */

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; })
);

const projectName = args['project-name'] || 'Project';
const cwd = process.cwd();

function resolveInfraPath() {
  if (args['infra-path']) return path.resolve(cwd, args['infra-path']);
  const srcDir = path.join(cwd, 'src');
  if (fs.existsSync(srcDir)) {
    const dirs = fs.readdirSync(srcDir).filter(d => d.includes('Infrastructure'));
    if (dirs.length > 0) return path.join(srcDir, dirs[0]);
  }
  return path.join(cwd, 'src', `${projectName}.Infrastructure`);
}

const infraPath = resolveInfraPath();
const seedDir = path.join(infraPath, 'Persistence', 'Seed');
const modulesDir = path.join(seedDir, 'Modules');

const assetsDir = path.resolve(
  new URL('.', import.meta.url).pathname,
  '..', 'assets', 'seed-template-cs'
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(cwd, dir)}/`);
  }
}

function copyTemplate(srcFile, destFile, namespace) {
  if (fs.existsSync(destFile)) {
    console.log(`  [skip] ${path.relative(cwd, destFile)} (already exists)`);
    return;
  }
  let content = fs.readFileSync(srcFile, 'utf-8');
  content = content.replace(/Project\.Infrastructure\.Persistence/g, `${namespace}`);
  fs.writeFileSync(destFile, content, 'utf-8');
  console.log(`  [created] ${path.relative(cwd, destFile)}`);
}

console.log(`\n=== config-db-seed-cs ===`);
console.log(`Infrastructure path: ${path.relative(cwd, infraPath)}`);

const ns = `${projectName}.Infrastructure.Persistence`;

ensureDir(seedDir);
ensureDir(modulesDir);

copyTemplate(
  path.join(assetsDir, 'DataSeeder.cs'),
  path.join(seedDir, 'DataSeeder.cs'),
  ns
);

copyTemplate(
  path.join(assetsDir, 'Modules', 'UserSeed.cs'),
  path.join(modulesDir, 'UserSeed.cs'),
  ns
);

console.log(`\n[next steps]`);
console.log(`  1. Register DataSeeder in Program.cs for Dev environment`);
console.log(`  2. Add DbSet<T> references in your AppDbContext`);
console.log(`  3. Implement actual entity creation in seed modules`);
console.log(`  4. Run: dotnet run -- --seed\n`);
