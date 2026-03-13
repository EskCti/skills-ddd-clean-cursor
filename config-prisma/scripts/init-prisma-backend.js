#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');

const DEFAULT_PRISMA_VERSION = '7.4.2';
const DEFAULT_TSX_VERSION = '4.21.0';
const BACKEND_WORKSPACE = 'apps/backend';
const DEFAULT_DB = {
  host: 'localhost',
  port: '5432',
  user: 'docker',
  password: 'docker',
  database: 'docker',
  schema: 'public',
};
let createSkillRunLogger = null;
let createSkillRunOps = null;

async function loadSkillLoggingUtils() {
  if (createSkillRunLogger && createSkillRunOps) return;

  const [loggerModule, opsModule] = await Promise.all([
    import('../../utils/skill-run-log.mjs'),
    import('../../utils/skill-run-ops.mjs'),
  ]);

  createSkillRunLogger = loggerModule.createSkillRunLogger;
  createSkillRunOps = opsModule.createSkillRunOps;
}

function printHelp() {
  console.log(`Prisma init (Genérico)

Usage:
  node .agents/skills/config-prisma/scripts/init-prisma-backend.js [options]

Options:
  --apply                      Apply file changes (default is dry-run)
  --dry-run                    Simulate changes without writing
  --install                    Run npm install for backend workspace after file changes
  --start-db                   Run docker compose up -d postgres in apps/backend
  --module <name>              Create prisma/models/<name>.model.prisma (repeatable)
  --prisma-version <semver>    Prisma version for prisma/@prisma/client/@prisma/adapter-pg (default: detect from package.json, fallback ${DEFAULT_PRISMA_VERSION})
  --help                       Show this help
`);
}

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: false,
    install: false,
    startDb: false,
    modules: [],
    prismaVersion: '',
    customPrismaVersion: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--apply') {
      args.apply = true;
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--install') {
      args.install = true;
      continue;
    }

    if (arg === '--start-db') {
      args.startDb = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }

    if (arg === '--module') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --module');
      }
      args.modules.push(normalizeAndValidateModuleName(value));
      i += 1;
      continue;
    }

    if (arg === '--prisma-version') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --prisma-version');
      }
      args.prismaVersion = value.trim();
      args.customPrismaVersion = true;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.apply) {
    args.dryRun = true;
  }

  return args;
}

function normalizeModuleName(rawName) {
  return rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isValidModuleName(name) {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

function normalizeAndValidateModuleName(rawName) {
  const normalized = normalizeModuleName(rawName);
  if (!isValidModuleName(normalized)) {
    throw new Error(
      `Invalid module name "${rawName}". Use lowercase letters, numbers and hyphens.`,
    );
  }
  return normalized;
}

async function readBackendPackageJson(backendDir) {
  const backendPackageJsonPath = path.join(backendDir, 'package.json');
  const raw = await fsp.readFile(backendPackageJsonPath, 'utf8');
  return JSON.parse(raw);
}

function detectProjectRoot(startDir) {
  const rootPath = path.parse(startDir).root;
  let currentDir = path.resolve(startDir);

  while (true) {
    const backendPackageJson = path.join(currentDir, 'apps', 'backend', 'package.json');
    if (fs.existsSync(backendPackageJson)) {
      return currentDir;
    }

    if (currentDir === rootPath) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find project root containing apps/backend/package.json');
}

function upsertValue(target, key, value) {
  if (target[key] === value) {
    return false;
  }

  target[key] = value;
  return true;
}

function toVersionRange(version) {
  const trimmed = String(version || '').trim();
  if (!trimmed) {
    return '';
  }

  if (/^[~^]/.test(trimmed) || /[<>=*]/.test(trimmed)) {
    return trimmed;
  }

  return `^${trimmed}`;
}

function resolvePrismaVersionRange(input) {
  const explicitRange = toVersionRange(input.explicitVersion);
  if (explicitRange) {
    return explicitRange;
  }

  const existingRange =
    input.dependencies['@prisma/client'] ||
    input.dependencies['@prisma/adapter-pg'] ||
    input.devDependencies.prisma ||
    '';

  return toVersionRange(existingRange) || `^${DEFAULT_PRISMA_VERSION}`;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function ensureTrailingLineBreak(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function normalizeEnvValue(rawValue) {
  const value = rawValue.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseEnvContent(content) {
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key) {
      continue;
    }

    const value = line.slice(separatorIndex + 1);
    result[key] = normalizeEnvValue(value);
  }

  return result;
}

function serializeEnvContent(values) {
  const preferredOrder = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DATABASE_URL',
  ];

  const keys = Object.keys(values);
  const remaining = keys.filter((key) => !preferredOrder.includes(key));
  const ordered = [...preferredOrder.filter((key) => key in values), ...remaining];

  const lines = ordered.map((key) => {
    const value = String(values[key]);
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${key}="${escaped}"`;
  });

  return `${lines.join('\n')}\n`;
}

function parseDatabaseUrl(databaseUrl) {
  try {
    const normalized = databaseUrl.replace(/^postgres:\/\//, 'postgresql://');
    const parsed = new URL(normalized);
    const dbName = parsed.pathname.replace(/^\//, '') || DEFAULT_DB.database;

    return {
      host: parsed.hostname || DEFAULT_DB.host,
      port: parsed.port || DEFAULT_DB.port,
      user: decodeURIComponent(parsed.username || DEFAULT_DB.user),
      password: decodeURIComponent(parsed.password || DEFAULT_DB.password),
      database: decodeURIComponent(dbName),
      schema: parsed.searchParams.get('schema') || DEFAULT_DB.schema,
    };
  } catch {
    return { ...DEFAULT_DB };
  }
}

function buildDatabaseUrl(config) {
  const username = encodeURIComponent(config.user);
  const password = encodeURIComponent(config.password);
  const database = encodeURIComponent(config.database);
  const schema = encodeURIComponent(config.schema);

  return `postgresql://${username}:${password}@${config.host}:${config.port}/${database}?schema=${schema}`;
}

async function readEnvFile(envFilePath) {
  try {
    const raw = await fsp.readFile(envFilePath, 'utf8');
    return parseEnvContent(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function resolveDatabaseConfig(backendDir) {
  const envPath = path.join(backendDir, '.env');
  const envExamplePath = path.join(backendDir, '.env.example');

  const envVars = await readEnvFile(envPath);
  const envExampleVars = await readEnvFile(envExamplePath);
  const source = envVars || envExampleVars || {};

  const base = {
    host: source.DB_HOST || DEFAULT_DB.host,
    port: source.DB_PORT || DEFAULT_DB.port,
    user: source.DB_USER || DEFAULT_DB.user,
    password: source.DB_PASSWORD || DEFAULT_DB.password,
    database: source.DB_NAME || DEFAULT_DB.database,
    schema: DEFAULT_DB.schema,
  };

  const fromUrl = source.DATABASE_URL ? parseDatabaseUrl(source.DATABASE_URL) : null;
  const resolved = fromUrl ? { ...base, ...fromUrl } : base;
  const databaseUrl = buildDatabaseUrl(resolved);

  return {
    ...resolved,
    databaseUrl,
    envPath,
    envExamplePath,
  };
}

async function writeFileIfChanged(filePath, content, ctx) {
  const normalized = ensureTrailingLineBreak(content);
  const result = await ctx.ops.writeTextFile(filePath, normalized, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
  });
  if (!result.changed) {
    return false;
  }

  ctx.changes.push(`${result.created ? 'create' : 'update'} ${toPosix(path.relative(ctx.rootDir, filePath))}`);

  return true;
}

async function ensureDir(dirPath, ctx) {
  const created = await ctx.ops.ensureDir(dirPath, {
    note: 'preparacao de infraestrutura prisma',
  });
  if (!created) {
    return;
  }

  ctx.changes.push(`mkdir ${toPosix(path.relative(ctx.rootDir, dirPath))}`);
}

async function moveFileIfExists(fromPath, toPath, ctx) {
  if (!fs.existsSync(fromPath) || fs.existsSync(toPath)) {
    return false;
  }

  ctx.changes.push(
    `rename ${toPosix(path.relative(ctx.rootDir, fromPath))} -> ${toPosix(path.relative(ctx.rootDir, toPath))}`,
  );
  await ctx.ops.renamePath(fromPath, toPath, {
    markRisk: true,
    note: 'migracao de nome legado',
  });

  return true;
}

async function hasDomainModelFiles(prismaModelsDir) {
  let entries = [];
  try {
    entries = await fsp.readdir(prismaModelsDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }

  return entries.some((entry) => {
    if (!entry.isFile()) return false;
    const fileName = entry.name;
    if (!fileName.endsWith('.model.prisma')) return false;
    return fileName !== 'bootstrap.model.prisma';
  });
}

function renderPrismaConfig() {
  return `// This file was generated by Prisma and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed/main.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});`;
}

function renderSchemaPrisma() {
  return `// Prisma schema root (modular mode)
// Add per-module models under prisma/models/*.model.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}`;
}

function renderSeedMainTs() {
  return `import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

type SeedTask = (prisma: PrismaClient) => Promise<void>;

const seedTasks: SeedTask[] = [];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run prisma/seed/main.ts');
  }

  for (const task of seedTasks) {
    await task(prisma);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`;
}

function shouldReplaceLegacySeedMain(content) {
  return (
    content.includes("from '../generated/client'") ||
    content.includes('from "../generated/client"') ||
    content.includes("from '../generated/prisma/client'") ||
    content.includes('from "../generated/prisma/client"') ||
    content.includes("from '../../generated/prisma/client'") ||
    content.includes('from "../../generated/prisma/client"') ||
    content.includes('type CidLoader =') ||
    content.includes('const loaders: CidLoader[]')
  );
}

function renderPrismaService() {
  return `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { TransactionContext, TransactionManager } from '@poupig/shared';
import { Prisma, PrismaClient } from '@prisma/client';

export interface PrismaTransactionContext extends TransactionContext {
  client: Prisma.TransactionClient;
}

@Injectable()
export class PrismaService
  implements
    OnModuleInit,
    OnModuleDestroy,
    TransactionManager<PrismaTransactionContext>
{
  readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  async runInTransaction<T>(
    operation: (context: PrismaTransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.client.$transaction(async (tx) => {
      return operation({ client: tx });
    });
  }
}`;
}

function renderDbModule() {
  return `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DbModule {}`;
}

function renderModulePrismaFile(moduleName) {
  return `// Prisma models for module: ${moduleName}
// Keep one file per module in prisma/models, using <module-name>.model.prisma.
// Add concrete models below.
`;
}

function renderBootstrapModelPrismaFile() {
  return `// Temporary bootstrap model to keep initial Prisma setup operational.
// Remove this file once real domain models/migrations are in place.
model PrismaBootstrap {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

function renderDockerCompose(dbConfig) {
  return `services:
  postgres:
    image: postgres:16-alpine
    container_name: erp-farmacia-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${dbConfig.user}
      POSTGRES_PASSWORD: ${dbConfig.password}
      POSTGRES_DB: ${dbConfig.database}
    ports:
      - '${dbConfig.port}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${dbConfig.user}']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local`;
}

async function ensureBackendPackageJson(backendDir, args, ctx) {
  const packageJsonPath = path.join(backendDir, 'package.json');
  const raw = await fsp.readFile(packageJsonPath, 'utf8');
  const parsed = JSON.parse(raw);

  const dependencies = parsed.dependencies || {};
  const devDependencies = parsed.devDependencies || {};
  const scripts = parsed.scripts || {};

  parsed.dependencies = dependencies;
  parsed.devDependencies = devDependencies;
  parsed.scripts = scripts;

  const targetVersion = resolvePrismaVersionRange({
    dependencies,
    devDependencies,
    explicitVersion: args.customPrismaVersion ? args.prismaVersion : '',
  });

  upsertValue(dependencies, '@prisma/client', targetVersion);
  upsertValue(dependencies, '@prisma/adapter-pg', targetVersion);
  upsertValue(dependencies, 'pg', dependencies.pg || '^8.16.3');
  upsertValue(dependencies, 'dotenv', dependencies.dotenv || '^16.0.3');

  upsertValue(devDependencies, 'prisma', targetVersion);
  upsertValue(devDependencies, 'tsx', devDependencies.tsx || `^${DEFAULT_TSX_VERSION}`);

  upsertValue(scripts, 'db:start', 'docker compose up -d postgres');
  upsertValue(scripts, 'db:stop', 'docker compose down');
  upsertValue(scripts, 'db:logs', 'docker compose logs -f postgres');
  upsertValue(scripts, 'prisma:generate', 'npx prisma generate');
  upsertValue(scripts, 'prisma:migrate:dev', 'npx prisma migrate dev');
  upsertValue(scripts, 'prisma:migrate:deploy', 'npx prisma migrate deploy');
  upsertValue(scripts, 'prisma:seed', 'npx prisma db seed');
  upsertValue(scripts, 'prisma:studio', 'npx prisma studio');
  if ('prisma:cid' in scripts) {
    delete scripts['prisma:cid'];
  }

  const nextRaw = `${JSON.stringify(parsed, null, 2)}\n`;
  if (nextRaw !== raw) {
    await writeFileIfChanged(packageJsonPath, nextRaw, ctx);
  }
}

async function ensureDbModuleImportedInAppModule(backendDir, ctx) {
  const appModulePath = path.join(backendDir, 'src', 'app.module.ts');

  if (!fs.existsSync(appModulePath)) {
    return;
  }

  const content = await fsp.readFile(appModulePath, 'utf8');
  let updated = content;

  const hasDbImport = /from ['"]\.\/db\/db\.module['"]/.test(updated);
  const dbImportLine = "import { DbModule } from './db/db.module';";

  if (!hasDbImport) {
    const importBlockMatch = updated.match(/^(import[^\n]*\n)+/m);
    if (importBlockMatch) {
      updated = `${importBlockMatch[0]}${dbImportLine}\n${updated.slice(importBlockMatch[0].length)}`;
    } else {
      updated = `${dbImportLine}\n${updated}`;
    }
  }

  const importsArrayRegex = /imports:\s*\[([\s\S]*?)\],/m;
  const importsArrayMatch = updated.match(importsArrayRegex);

  if (importsArrayMatch && !/\bDbModule\b/.test(importsArrayMatch[1])) {
    const inner = importsArrayMatch[1];
    const replacement = inner.trim().length === 0 ? '\n    DbModule,\n  ' : `\n    DbModule,${inner}`;
    updated = updated.replace(importsArrayRegex, `imports: [${replacement}],`);
  }

  if (updated !== content) {
    await writeFileIfChanged(appModulePath, updated, ctx);
  }
}

async function ensureEnvFiles(dbConfig, ctx) {
  const envPaths = [dbConfig.envExamplePath, dbConfig.envPath];

  for (const envFilePath of envPaths) {
    const existing = (await readEnvFile(envFilePath)) || {};
    const nextValues = {
      ...existing,
      DB_HOST: dbConfig.host,
      DB_PORT: dbConfig.port,
      DB_USER: dbConfig.user,
      DB_PASSWORD: dbConfig.password,
      DB_NAME: dbConfig.database,
      DATABASE_URL: dbConfig.databaseUrl,
    };

    const rendered = serializeEnvContent(nextValues);
    await writeFileIfChanged(envFilePath, rendered, ctx);
  }
}

async function runInstall(rootDir, backendWorkspace, ops) {
  await ops.runCommand('npm', ['install', '--workspace', backendWorkspace], rootDir);
}

async function runStartDb(backendDir, ops) {
  await ops.runCommand('docker', ['compose', 'up', '-d', 'postgres'], backendDir);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  await loadSkillLoggingUtils();

  const rootDir = detectProjectRoot(process.cwd());
  const backendDir = path.join(rootDir, 'apps', 'backend');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-prisma',
    commandArgs: process.argv.slice(2),
  });
  const ops = createSkillRunOps({
    rootDir,
    logger,
    dryRun: args.dryRun,
  });

  try {
    const backendPackageJson = await readBackendPackageJson(backendDir);
    const backendWorkspace = backendPackageJson.name || BACKEND_WORKSPACE;
    const dbConfig = await resolveDatabaseConfig(backendDir);

    const ctx = {
      rootDir,
      dryRun: args.dryRun,
      changes: [],
      ops,
    };

    const prismaDir = path.join(backendDir, 'prisma');
    const prismaModelsDir = path.join(prismaDir, 'models');
    const prismaMigrationsDir = path.join(prismaDir, 'migrations');
    const prismaSeedDir = path.join(prismaDir, 'seed');
    const dbDir = path.join(backendDir, 'src', 'db');

    await ensureDir(prismaDir, ctx);
    await ensureDir(prismaModelsDir, ctx);
    await ensureDir(prismaMigrationsDir, ctx);
    await ensureDir(prismaSeedDir, ctx);
    await ensureDir(dbDir, ctx);
    await ensureBackendPackageJson(backendDir, args, ctx);
    await ensureEnvFiles(dbConfig, ctx);

    await writeFileIfChanged(path.join(backendDir, 'prisma.config.ts'), renderPrismaConfig(), ctx);
    await writeFileIfChanged(path.join(prismaDir, 'schema.prisma'), renderSchemaPrisma(), ctx);
    await writeFileIfChanged(path.join(backendDir, 'docker-compose.yml'), renderDockerCompose(dbConfig), ctx);
    await writeFileIfChanged(path.join(dbDir, 'prisma.service.ts'), renderPrismaService(), ctx);
    await writeFileIfChanged(path.join(dbDir, 'db.module.ts'), renderDbModule(), ctx);

    const seedMainPath = path.join(prismaSeedDir, 'main.ts');
    if (!fs.existsSync(seedMainPath)) {
      await writeFileIfChanged(seedMainPath, renderSeedMainTs(), ctx);
    } else {
      const seedMainContent = await fsp.readFile(seedMainPath, 'utf8');
      if (shouldReplaceLegacySeedMain(seedMainContent)) {
        logger.risk(`seed legado sera sobrescrito: ${toPosix(path.relative(rootDir, seedMainPath))}`);
        await writeFileIfChanged(seedMainPath, renderSeedMainTs(), ctx);
      }
    }

    const moduleSet = new Set(args.modules.filter(Boolean));
    for (const moduleName of moduleSet) {
      const moduleFilePath = path.join(prismaModelsDir, `${moduleName}.model.prisma`);
      const legacyModuleFilePath = path.join(prismaModelsDir, `${moduleName}.prisma`);

      if (await moveFileIfExists(legacyModuleFilePath, moduleFilePath, ctx)) {
        continue;
      }

      if (fs.existsSync(moduleFilePath)) {
        continue;
      }
      await writeFileIfChanged(moduleFilePath, renderModulePrismaFile(moduleName), ctx);
    }

    const bootstrapModelFilePath = path.join(prismaModelsDir, 'bootstrap.model.prisma');
    const legacyBootstrapModelFilePath = path.join(prismaModelsDir, 'bootstrap.prisma');
    const hasDomainModels = await hasDomainModelFiles(prismaModelsDir);
    if (!hasDomainModels) {
      const bootstrapRenamed = await moveFileIfExists(
        legacyBootstrapModelFilePath,
        bootstrapModelFilePath,
        ctx,
      );
      if (!bootstrapRenamed && !fs.existsSync(bootstrapModelFilePath)) {
        await writeFileIfChanged(bootstrapModelFilePath, renderBootstrapModelPrismaFile(), ctx);
      }
    }

    await ensureDbModuleImportedInAppModule(backendDir, ctx);

    if (ctx.changes.length === 0) {
      console.log('No changes required. Prisma init is already up to date.');
      logger.step('Nenhuma alteracao necessaria (estado convergente).');
    } else {
      const modeLabel = args.dryRun ? 'Dry-run changes' : 'Applied changes';
      console.log(`\n${modeLabel}:`);
      logger.step(`${modeLabel}: ${ctx.changes.length} alteracoes.`);
      for (const change of ctx.changes) {
        console.log(`- ${change}`);
        logger.step(change, 'CHANGE');
      }
    }

    if (args.install) {
      if (args.dryRun) {
        console.log('\nDry-run: skipped dependency installation.');
        logger.step('Instalacao ignorada em dry-run.');
      } else {
        console.log('\nInstalling backend dependencies...');
        await runInstall(rootDir, backendWorkspace, ops);
        console.log('Backend dependencies installed successfully.');
      }
    }

    if (args.startDb) {
      if (args.dryRun) {
        console.log('\nDry-run: skipped docker compose up.');
        logger.step('Subida de banco ignorada em dry-run.');
      } else {
        console.log('\nStarting postgres with docker compose...');
        await runStartDb(backendDir, ops);
        console.log('Postgres started successfully.');
      }
    }

    if (args.dryRun) {
      console.log('\nRun again with --apply to persist these changes.');
      logger.step('Dry-run concluido. Execute com --apply para persistir.');
    }

    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  }
}

main().catch((error) => {
  console.error(`Bootstrap failed: ${error.message}`);
  process.exit(1);
});
