#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'assets', 'auth-core-full-template-kt');
const BASIC_TEMPLATE_DIR = path.join(__dirname, '..', '..', 'config-auth-core-basic-kt', 'assets', 'auth-core-basic-template-kt');

function usage() {
  console.log(`Usage:
  node create-auth-core-full-kt.mjs [--group com.example] [--force] [--run-tests]`);
}

function parseArgs(argv) {
  let group = '';
  let force = false;
  let runTests = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { usage(); process.exit(0); }
    if (arg === '--force') { force = true; continue; }
    if (arg === '--run-tests') { runTests = true; continue; }
    if (arg === '--group') { group = argv[++i] || ''; continue; }
    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
  }
  return { group, force, runTests };
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

async function detectTargetDir(rootDir) {
  const nested = path.join(rootDir, 'packages', 'auth', 'core');
  const direct = path.join(rootDir, 'packages', 'auth');
  if (await pathExists(nested)) return nested;
  const settingsPath = path.join(rootDir, 'settings.gradle.kts');
  if (await pathExists(settingsPath)) {
    const content = await fs.readFile(settingsPath, 'utf8');
    if (content.includes('packages:auth:core')) return nested;
  }
  return direct;
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

async function main() {
  const rootDir = path.resolve(__dirname, '../../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-auth-core-full-kt',
    commandArgs: process.argv.slice(2),
  });

  try {
    const ops = createSkillRunOps({ rootDir, logger, dryRun: false });
    const { group: cliGroup, force, runTests } = parseArgs(process.argv.slice(2));
    const group = await resolveGroup(rootDir, cliGroup);
    const targetDir = await detectTargetDir(rootDir);
    const groupPrefix = group.split('.').slice(0, 2).join('.') || 'com.example';
    const replacements = { 'com.example': groupPrefix };

    logger.step(`Target: ${targetDir}, Group: ${group}`);

    if (await pathExists(targetDir)) {
      if (!force) throw new Error(`Directory exists: ${targetDir}. Use --force.`);
      await ops.removePath(targetDir, { recursive: true, force: true, markRisk: true });
      logger.step(`Removed existing directory: ${targetDir}`);
    }

    await ops.ensureDir(targetDir);

    if (await pathExists(BASIC_TEMPLATE_DIR)) {
      await copyDir(BASIC_TEMPLATE_DIR, targetDir, ops, replacements);
      logger.step('Basic template (user/password/application) copied.');
    }

    if (await pathExists(TEMPLATE_DIR)) {
      await copyDir(TEMPLATE_DIR, targetDir, ops, replacements);
      logger.step('Full template (role/permission/oauth) copied.');
    } else {
      logger.warn('Full template directory not found. Only basic modules available.');
    }

    const settingsPath = path.join(rootDir, 'settings.gradle.kts');
    if (await pathExists(settingsPath)) {
      const relativePath = path.relative(rootDir, targetDir).replace(/\\/g, '/').replace(/\//g, ':');
      const includeStr = `include("${relativePath}")`;
      const content = await fs.readFile(settingsPath, 'utf8');
      if (!content.includes(includeStr)) {
        await ops.writeTextFile(settingsPath, content.trimEnd() + `\n${includeStr}\n`);
        logger.step(`Updated settings.gradle.kts with ${includeStr}`);
      }
    }

    if (runTests) {
      const { execSync } = await import('node:child_process');
      try {
        logger.step('Running tests...');
        execSync('gradle :packages:auth:test', { cwd: rootDir, stdio: 'inherit' });
        logger.step('Tests passed.');
      } catch {
        logger.warn('Tests failed or Gradle not available.');
      }
    }

    console.log(`\n  Auth core full (Kotlin) created at: ${targetDir}\n`);
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
