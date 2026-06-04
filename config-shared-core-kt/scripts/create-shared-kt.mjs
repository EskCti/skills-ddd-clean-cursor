#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNamespace, resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.resolve(__dirname, '../assets/shared-template-kt');

let logger = null;
let ops = null;

function usage() {
  console.log(`Usage:
  node create-shared-kt.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>]

Examples:
  node create-shared-kt.mjs
  node create-shared-kt.mjs --scope @myorg
  node create-shared-kt.mjs --force
  node create-shared-kt.mjs --force --run-tests`);
}

function parseArgs(argv) {
  const args = { scope: '', force: false, runTests: false, target: '', help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--scope') { args.scope = argv[++i] || ''; continue; }
    if (arg === '--force') { args.force = true; continue; }
    if (arg === '--run-tests') { args.runTests = true; continue; }
    if (arg === '--target') { args.target = argv[++i] || ''; continue; }
    if (arg === '--help' || arg === '-h') { args.help = true; continue; }
  }
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

async function copyDir(src, dest, ops, replacements = {}) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await ops.ensureDir(destPath);
      await copyDir(srcPath, destPath, ops, replacements);
    } else {
      let content = await fs.readFile(srcPath, 'utf8');
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      }
      await ops.writeTextFile(destPath, content);
    }
  }
}

async function validateTemplate() {
  const required = [
    'build.gradle.kts',
    'src/main/kotlin/com/example/shared/domain/base/Entity.kt',
    'src/main/kotlin/com/example/shared/domain/result/DomainResult.kt',
    'src/main/kotlin/com/example/shared/domain/vo/Id.kt',
    'src/main/kotlin/com/example/shared/domain/vo/Name.kt',
    'src/main/kotlin/com/example/shared/domain/vo/Email.kt',
    'src/main/kotlin/com/example/shared/domain/vo/HashPassword.kt',
    'src/main/kotlin/com/example/shared/application/UseCase.kt',
    'src/main/kotlin/com/example/shared/application/dto/PagedResult.kt',
    'src/main/kotlin/com/example/shared/infrastructure/TransactionManager.kt',
    'src/test/kotlin/com/example/shared/domain/vo/IdTest.kt',
    'src/test/kotlin/com/example/shared/domain/vo/NameTest.kt',
    'src/test/kotlin/com/example/shared/domain/vo/EmailTest.kt',
    'src/test/kotlin/com/example/shared/domain/vo/HashPasswordTest.kt',
  ];

  const missing = [];
  for (const file of required) {
    if (!(await pathExists(path.join(TEMPLATE_DIR, file)))) {
      missing.push(file);
    }
  }
  return missing;
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); process.exit(0); }

  const rootDir = await findRepoRoot();
  const ns = await resolveNamespace({ rootDir, cliScope: args.scope });
  const scope = ns.scope;
  const group = scope.replace('@', '').replace(/[^a-z0-9]/g, '.');

  const targetDir = args.target
    ? path.resolve(args.target)
    : path.join(rootDir, 'packages/shared');

  logger = await createSkillRunLogger({ rootDir, skillName: 'config-shared-core-kt' });
  ops = createSkillRunOps({ rootDir, logger, dryRun: false });

  console.log(`\n  Scope:   ${scope} (${ns.source})`);
  console.log(`  Target:  ${targetDir}`);
  console.log(`  Force:   ${args.force}`);
  console.log(`  Tests:   ${args.runTests}\n`);

  // Validate template
  const missingFiles = await validateTemplate();
  if (missingFiles.length > 0) {
    console.log(`  ⚠ Template missing ${missingFiles.length} files:`);
    missingFiles.forEach(f => console.log(`    - ${f}`));
    console.log('  Template will be created with available files.\n');
  }

  // Force remove existing
  if (args.force && (await pathExists(targetDir))) {
    if (targetDir === rootDir || targetDir === '/') {
      throw new Error('Refusing to remove repository root or system root.');
    }
    logger.risk(`Removing existing directory: ${targetDir}`);
    await fs.rm(targetDir, { recursive: true, force: true });
  }

  // Copy template
  if (await pathExists(TEMPLATE_DIR)) {
    const replacements = {
      'com.example': `com.${group.split('.')[0] || 'example'}`,
    };
    await ops.ensureDir(targetDir);
    await copyDir(TEMPLATE_DIR, targetDir, ops, replacements);
    logger.step('Template copied to target.');
  } else {
    logger.warn('Template directory not found. Creating minimal structure.');
    await ops.ensureDir(targetDir);
    await ops.writeTextFile(path.join(targetDir, 'build.gradle.kts'), `plugins {
    kotlin("jvm")
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
}

tasks.test {
    useJUnitPlatform()
}
`);
  }

  // Run tests
  if (args.runTests) {
    const gradlew = path.join(rootDir, 'gradlew');
    if (await pathExists(gradlew)) {
      logger.command('./gradlew', [':packages:shared:test']);
      console.log('  Running tests...');
      const { spawn } = await import('node:child_process');
      await new Promise((resolve, reject) => {
        const child = spawn('./gradlew', [':packages:shared:test'], { cwd: rootDir, stdio: 'inherit' });
        child.on('error', reject);
        child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Tests failed (exit ${code})`)));
      });
    } else {
      logger.warn('gradlew not found — skipping tests.');
      console.log('  ⚠ gradlew not found. Skipping tests.');
    }
  }

  await logger.success();
  console.log('\n  ✓ config-shared-core-kt complete.\n');
}

main().catch(async (err) => {
  console.error('\n  ✗ Error:', err.message);
  if (logger) await logger.failure(err);
  process.exit(1);
});
