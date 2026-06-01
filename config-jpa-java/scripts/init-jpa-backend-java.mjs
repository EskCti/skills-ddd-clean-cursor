#!/usr/bin/env node

/**
 * config-jpa-java — JPA/Flyway setup for apps/backend-java
 *
 * Usage:
 *   node init-jpa-backend-java.mjs --apply [--module customers] [--backend-path apps/backend-java]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const dryRun = !apply;
const backendPath = argv.find((a) => a.startsWith('--backend-path='))?.split('=')[1] || 'apps/backend-java';
const modules = argv.filter((a) => a.startsWith('--module=')).map((a) => a.split('=')[1]);

const root = process.cwd();
const backendRoot = path.join(root, backendPath);
const migrationDir = path.join(backendRoot, 'src/main/resources/db/migration');

function log(msg) {
  console.log(dryRun ? `[dry-run] ${msg}` : msg);
}

function ensureMigration(name, sql) {
  const file = path.join(migrationDir, name);
  if (fs.existsSync(file)) {
    log(`  [skip] ${path.relative(root, file)}`);
    return;
  }
  if (!dryRun) {
    fs.mkdirSync(migrationDir, { recursive: true });
    fs.writeFileSync(file, sql, 'utf-8');
  }
  log(`  [created] ${path.relative(root, file)}`);
}

console.log(`\n=== config-jpa-java (${dryRun ? 'dry-run' : 'apply'}) ===\n`);

ensureMigration('V1__bootstrap.sql', '-- Bootstrap\nSELECT 1;\n');

let version = 2;
for (const mod of modules) {
  const table = mod.replace(/-/g, '_');
  ensureMigration(
    `V${version}__create_${table}.sql`,
    `CREATE TABLE IF NOT EXISTS ${table} (\n  id UUID PRIMARY KEY\n);\n`,
  );
  version++;
}

console.log('\nEnsure application.yml has datasource + flyway (see references/jpa-init-checklist-java.md)\n');
