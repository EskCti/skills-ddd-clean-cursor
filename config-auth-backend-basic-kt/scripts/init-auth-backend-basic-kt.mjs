#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'assets', 'auth-backend-basic-template-kt');

function usage() {
  console.log(`Usage:
  node init-auth-backend-basic-kt.mjs --apply [--group com.example] [--run-build]`);
}

function parseArgs(argv) {
  let group = '';
  let apply = false;
  let runBuild = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { usage(); process.exit(0); }
    if (arg === '--apply') { apply = true; continue; }
    if (arg === '--run-build') { runBuild = true; continue; }
    if (arg === '--group') { group = argv[++i] || ''; continue; }
    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
  }
  return { group, apply, runBuild };
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function resolveGroup(rootDir, cliGroup) {
  if (cliGroup) return cliGroup;
  const envGroup = process.env.PROJECT_GROUP;
  if (envGroup) return envGroup;
  try {
    const configPaths = [
      path.join(rootDir, 'skills.config.local.json'),
      path.join(rootDir, 'skills.config.json'),
      path.join(rootDir, '.agents', 'skills', 'skills.config.local.json'),
      path.join(rootDir, '.agents', 'skills', 'skills.config.json'),
    ];
    for (const cp of configPaths) {
      if (await pathExists(cp)) {
        const raw = await fs.readFile(cp, 'utf8');
        const cfg = JSON.parse(raw);
        if (cfg.defaults?.group) return cfg.defaults.group;
      }
    }
  } catch { /* ignore */ }
  return 'com.example';
}

async function copyDir(src, dest, ops, replacements) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await ops.ensureDir(destPath);
      await copyDir(srcPath, destPath, ops, replacements);
    } else {
      let content = await fs.readFile(srcPath, 'utf8');
      for (const [from, to] of Object.entries(replacements)) {
        content = content.replaceAll(from, to);
      }
      await ops.writeTextFile(destPath, content);
    }
  }
}

async function findNextFlywayVersion(migrationDir) {
  if (!(await pathExists(migrationDir))) return 1;
  const files = await fs.readdir(migrationDir);
  const versions = files.map(f => f.match(/^V(\d+)__/)).filter(Boolean).map(m => parseInt(m[1], 10));
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

async function main() {
  const rootDir = path.resolve(__dirname, '../../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-auth-backend-basic-kt',
    commandArgs: process.argv.slice(2),
  });

  try {
    const ops = createSkillRunOps({ rootDir, logger, dryRun: false });
    const { group: cliGroup, apply, runBuild } = parseArgs(process.argv.slice(2));

    if (!apply) {
      console.log('Dry-run mode. Use --apply to write files.');
      await logger.success();
      return;
    }

    const group = await resolveGroup(rootDir, cliGroup);
    const backendPath = 'apps/backend';
    const backendDir = path.join(rootDir, backendPath);
    const groupPath = group.replace(/\./g, '/');
    const authModuleDir = path.join(backendDir, 'src', 'main', 'kotlin', groupPath, 'modules', 'auth');
    const migrationDir = path.join(backendDir, 'src', 'main', 'resources', 'db', 'migration');
    const groupPrefix = group.split('.').slice(0, 2).join('.') || 'com.example';
    const replacements = { 'com.example': groupPrefix };

    logger.step(`Backend: ${backendPath}, Group: ${group}`);

    if (await pathExists(TEMPLATE_DIR)) {
      await ops.ensureDir(authModuleDir);
      await copyDir(TEMPLATE_DIR, authModuleDir, ops, replacements);
      logger.step('Auth backend template copied.');
    } else {
      logger.warn('Template not found. Creating minimal structure.');
      await ops.ensureDir(authModuleDir);
    }

    await ops.ensureDir(migrationDir);
    const nextV = await findNextFlywayVersion(migrationDir);
    const usersFile = `V${nextV}__create_users.sql`;
    const passwordsFile = `V${nextV + 1}__create_passwords.sql`;

    if (!(await pathExists(path.join(migrationDir, usersFile)))) {
      const alreadyHasUsers = (await fs.readdir(migrationDir)).some(f => f.includes('create_users'));
      if (!alreadyHasUsers) {
        await ops.writeTextFile(path.join(migrationDir, usersFile), `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    admin BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
`);
        logger.step(`Created migration: ${usersFile}`);
      }
    }

    if (!(await pathExists(path.join(migrationDir, passwordsFile)))) {
      const alreadyHasPasswords = (await fs.readdir(migrationDir)).some(f => f.includes('create_passwords'));
      if (!alreadyHasPasswords) {
        await ops.writeTextFile(path.join(migrationDir, passwordsFile), `CREATE TABLE IF NOT EXISTS passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
`);
        logger.step(`Created migration: ${passwordsFile}`);
      }
    }

    const buildGradlePath = path.join(backendDir, 'build.gradle.kts');
    if (await pathExists(buildGradlePath)) {
      let content = await fs.readFile(buildGradlePath, 'utf8');
      const deps = [
        'implementation(project(":packages:auth"))',
        'implementation("org.springframework.boot:spring-boot-starter-security")',
        'implementation("io.jsonwebtoken:jjwt-api:0.12.5")',
        'runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")',
        'runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")',
      ];
      let modified = false;
      for (const dep of deps) {
        if (!content.includes(dep)) {
          const match = content.match(/(dependencies\s*\{)/);
          if (match) {
            content = content.replace(match[1], `${match[1]}\n    ${dep}`);
            modified = true;
          }
        }
      }
      if (modified) {
        await ops.writeTextFile(buildGradlePath, content);
        logger.step('Updated backend build.gradle.kts with auth dependencies.');
      }
    }

    if (runBuild) {
      const { execSync } = await import('node:child_process');
      try {
        logger.step('Running build...');
        execSync('gradle :apps:backend:build -x test', { cwd: rootDir, stdio: 'inherit' });
        logger.step('Build succeeded.');
      } catch {
        logger.warn('Build failed or Gradle not available.');
      }
    }

    console.log(`\n  Auth backend basic (Kotlin) applied at: ${authModuleDir}\n`);
    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
