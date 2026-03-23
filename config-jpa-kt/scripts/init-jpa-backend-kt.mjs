#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSkillConfig } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let logger = null;
let ops = null;

function usage() {
  console.log(`Usage:
  node init-jpa-backend-kt.mjs [--apply] [--dry-run] [--backend-path apps/backend-kt] [--module <name>]

Options:
  --apply                Apply file changes (default is dry-run)
  --dry-run              Simulate changes without writing
  --backend-path <path>  Path to Spring Boot backend (default: apps/backend-kt)
  --module <name>        Create Flyway migration scaffold for module (repeatable)
  --help                 Show this help

Examples:
  node init-jpa-backend-kt.mjs --dry-run
  node init-jpa-backend-kt.mjs --apply
  node init-jpa-backend-kt.mjs --apply --module auth --module product`);
}

function parseArgs(argv) {
  const args = { apply: false, dryRun: false, backendPath: '', modules: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--apply') { args.apply = true; continue; }
    if (arg === '--dry-run') { args.dryRun = true; continue; }
    if (arg === '--backend-path') { args.backendPath = argv[++i] || ''; continue; }
    if (arg === '--module') { args.modules.push(argv[++i] || ''); continue; }
    if (arg === '--help' || arg === '-h') { args.help = true; continue; }
  }
  if (!args.apply && !args.dryRun) args.dryRun = true;
  return args;
}

async function findRepoRoot() {
  let dir = process.cwd();
  while (true) {
    try { await fs.access(path.join(dir, '.git')); return dir; } catch { /* noop */ }
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

// --- Generators ---

function generateApplicationYml(port) {
  return `spring:
  datasource:
    url: \${DATABASE_URL:jdbc:postgresql://localhost:5432/appdb}
    username: \${DATABASE_USER:postgres}
    password: \${DATABASE_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: \${PORT:${port}}
`;
}

function generateDockerCompose() {
  return `services:
  postgres:
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
`;
}

function generateBootstrapMigration() {
  return `-- V1__bootstrap.sql
-- Bootstrap migration - replace with real domain tables
SELECT 1;
`;
}

function generateModuleMigration(moduleName, version) {
  const tableName = moduleName.replace(/-/g, '_') + 's';
  return `-- V${version}__create_${tableName}.sql
CREATE TABLE ${tableName} (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP
);
`;
}

function generateEnvFile(port) {
  return `DATABASE_URL=jdbc:postgresql://localhost:5432/appdb
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=change-me
PORT=${port}
`;
}

const JPA_DEPS = [
  'implementation("org.springframework.boot:spring-boot-starter-data-jpa")',
  'implementation("org.flywaydb:flyway-core")',
  'implementation("org.flywaydb:flyway-database-postgresql")',
  'runtimeOnly("org.postgresql:postgresql")',
];

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); process.exit(0); }

  const rootDir = await findRepoRoot();
  const config = await loadSkillConfig(rootDir);
  const backendPath = args.backendPath || 'apps/backend-kt';
  const backendPort = config.defaults.backendPort || 4000;
  const dryRun = args.dryRun;

  logger = await createSkillRunLogger({ rootDir, skillName: 'config-jpa-kt' });
  ops = createSkillRunOps({ rootDir, logger, dryRun });

  console.log(`\n  Backend: ${backendPath}`);
  console.log(`  Port:    ${backendPort}`);
  console.log(`  Modules: ${args.modules.length ? args.modules.join(', ') : '(none)'}`);
  console.log(`  Mode:    ${dryRun ? 'DRY-RUN' : 'APPLY'}\n`);

  const backendDir = path.join(rootDir, backendPath);
  const resDir = path.join(backendDir, 'src/main/resources');
  const migrationDir = path.join(resDir, 'db/migration');

  // Verify backend exists
  const buildGradlePath = path.join(backendDir, 'build.gradle.kts');
  if (!(await pathExists(buildGradlePath))) {
    console.log(`  ⚠ ${backendPath}/build.gradle.kts not found. Run config-project-kt first.`);
    logger.warn(`build.gradle.kts not found at ${backendPath}`);
  }

  // Check if JPA deps exist in build.gradle.kts
  if (await pathExists(buildGradlePath)) {
    const buildContent = await fs.readFile(buildGradlePath, 'utf8');
    const missingDeps = JPA_DEPS.filter(dep => !buildContent.includes(dep.replace(/"/g, '"')));
    if (missingDeps.length > 0) {
      logger.info(`${missingDeps.length} JPA dependencies may be missing from build.gradle.kts`);
      console.log(`  ⚠ Check build.gradle.kts for JPA dependencies — ${missingDeps.length} potentially missing.`);
    }
  }

  // application.yml
  const ymlPath = path.join(resDir, 'application.yml');
  if (!(await pathExists(ymlPath))) {
    await ops.writeTextFile(ymlPath, generateApplicationYml(backendPort));
  } else {
    logger.info('application.yml already exists — skipping.');
  }

  // Docker Compose
  const composePath = path.join(rootDir, 'docker-compose.yml');
  if (!(await pathExists(composePath))) {
    await ops.writeTextFile(composePath, generateDockerCompose());
  } else {
    logger.info('docker-compose.yml already exists — skipping.');
  }

  // .env
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  if (!(await pathExists(envExamplePath))) {
    await ops.writeTextFile(envExamplePath, generateEnvFile(backendPort));
  }
  if (!(await pathExists(envPath))) {
    await ops.writeTextFile(envPath, generateEnvFile(backendPort));
  }

  // Bootstrap migration
  await ops.ensureDir(migrationDir);
  const bootstrapPath = path.join(migrationDir, 'V1__bootstrap.sql');
  if (!(await pathExists(bootstrapPath))) {
    await ops.writeTextFile(bootstrapPath, generateBootstrapMigration());
  }

  // Module migrations
  if (args.modules.length > 0) {
    const existingMigrations = await fs.readdir(migrationDir).catch(() => []);
    let nextVersion = existingMigrations.length + 1;
    for (const mod of args.modules) {
      if (!mod) continue;
      const migrationFile = path.join(migrationDir, `V${nextVersion}__create_${mod.replace(/-/g, '_')}s.sql`);
      if (!(await pathExists(migrationFile))) {
        await ops.writeTextFile(migrationFile, generateModuleMigration(mod, nextVersion));
        nextVersion++;
      }
    }
  }

  await logger.success();
  console.log(`\n  ✓ config-jpa-kt complete (${dryRun ? 'dry-run' : 'applied'}).\n`);
}

main().catch(async (err) => {
  console.error('\n  ✗ Error:', err.message);
  if (logger) await logger.failure(err);
  process.exit(1);
});
