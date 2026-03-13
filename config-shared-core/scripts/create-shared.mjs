#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNamespace, resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

let activeRunLogger = null;
let activeRunOps = null;
const REQUIRED_TEMPLATE_FILES = [
  'package.json',
  'tsconfig.json',
  'jest.config.ts',
  'src/base/entity.ts',
  'src/base/index.ts',
  'src/base/result.ts',
  'src/base/result-validator.ts',
  'src/base/use-case.ts',
  'src/base/vo.ts',
  'src/db/create.repository.ts',
  'src/db/crud.repository.ts',
  'src/db/delete.repository.ts',
  'src/db/find-by-id.repository.ts',
  'src/db/index.ts',
  'src/db/transaction.manager.ts',
  'src/db/update.repository.ts',
  'src/dto/index.ts',
  'src/dto/pagination.dto.ts',
  'src/index.ts',
  'src/vo/description.vo.ts',
  'src/vo/email.vo.ts',
  'src/vo/hash-password.vo.ts',
  'src/vo/id.vo.ts',
  'src/vo/index.ts',
  'src/vo/person-name.vo.ts',
  'src/vo/short-description.vo.ts',
  'src/vo/strong-password.vo.ts',
  'src/vo/text.vo.ts',
  'src/vo/url.vo.ts',
  'test/base/entity.test.ts',
  'test/base/result.test.ts',
  'test/base/result-validator.test.ts',
  'test/base/vo.test.ts',
  'test/data/test.entity.ts',
  'test/vo/description.vo.test.ts',
  'test/vo/email.vo.test.ts',
  'test/vo/hash-password.vo.test.ts',
  'test/vo/id.vo.test.ts',
  'test/vo/person-name.vo.test.ts',
  'test/vo/short-description.vo.test.ts',
  'test/vo/strong-password.vo.test.ts',
  'test/vo/text.vo.test.ts',
  'test/vo/url.vo.test.ts',
];

function usage() {
  console.log(`Usage:
  node create-shared.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>]

Examples:
  node create-shared.mjs
  node create-shared.mjs --scope @namespace
  node create-shared.mjs --force
  node create-shared.mjs --force --run-tests
  node create-shared.mjs --target /tmp/shared-template-test`);
}

function parseArgs(argv) {
  let scope = '';
  let force = false;
  let runTests = false;
  let target = '';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

    if (arg === '--force') {
      force = true;
      continue;
    }

    if (arg === '--run-tests') {
      runTests = true;
      continue;
    }

    if (arg === '--scope') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --scope');
      }
      scope = value;
      i += 1;
      continue;
    }

    if (arg === '--target') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --target');
      }
      target = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { scope, force, runTests, target };
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  if (!activeRunOps) {
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    return;
  }

  await activeRunOps.writeJsonFile(filePath, data, {
    note: path.basename(filePath),
    markRiskOnOverwrite: true,
  });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveTarget(rootDir, targetArg) {
  return path.isAbsolute(targetArg) ? targetArg : path.resolve(rootDir, targetArg);
}

function isSamePath(a, b) {
  return path.resolve(a) === path.resolve(b);
}

function ensureSafeOverwriteTarget(rootDir, targetDir) {
  const resolvedTarget = path.resolve(targetDir);
  const resolvedRoot = path.resolve(rootDir);
  const rootBoundary = path.parse(resolvedTarget).root;

  if (resolvedTarget === rootBoundary) {
    throw new Error(`Refusing to overwrite filesystem root with --force: ${targetDir}`);
  }

  if (resolvedTarget === resolvedRoot) {
    throw new Error(`Refusing to overwrite repository root with --force: ${targetDir}`);
  }
}

function runCommand(cmd, args, cwd) {
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }

  return activeRunOps.runCommand(cmd, args, cwd);
}

async function installRootDependencies(rootDir) {
  const rootPackageJsonPath = path.join(rootDir, 'package.json');
  if (!(await exists(rootPackageJsonPath))) {
    throw new Error(`Root package.json not found at ${rootPackageJsonPath}. Cannot run npm install.`);
  }

  console.log('Installing root dependencies with npm install...');
  await runCommand('npm', ['install'], rootDir);
}

async function installTargetDependencies(targetDir) {
  const targetPackageJsonPath = path.join(targetDir, 'package.json');
  if (!(await exists(targetPackageJsonPath))) {
    throw new Error(`Target package.json not found at ${targetPackageJsonPath}. Cannot run npm install.`);
  }

  console.log(`Installing target dependencies with npm install at ${targetDir}...`);
  await runCommand('npm', ['install'], targetDir);
}

function resolveTargetTypescriptConfigPath(targetDir) {
  return path.resolve(targetDir, '../typescript-config/base.json');
}

async function ensureTemplateContract(templateDir) {
  const missingFiles = [];

  for (const relativePath of REQUIRED_TEMPLATE_FILES) {
    const absolutePath = path.join(templateDir, relativePath);
    if (!(await exists(absolutePath))) {
      missingFiles.push(relativePath);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `Shared template contract broken. Missing required files: ${missingFiles.join(', ')}`,
    );
  }
}

async function listFrontendAndBackendPackageJsonPaths({ rootDir, frontendAppPath, backendAppPath }) {
  const appPaths = [...new Set([frontendAppPath, backendAppPath])];
  const packageJsonPaths = [];

  for (const appPath of appPaths) {
    const packageJsonPath = path.join(rootDir, appPath, 'package.json');
    if (await exists(packageJsonPath)) {
      packageJsonPaths.push(packageJsonPath);
    }
  }

  return packageJsonPaths;
}

async function ensureSharedDependencyOnFrontendAndBackend({
  rootDir,
  sharedPackageName,
  frontendAppPath,
  backendAppPath,
}) {
  const targetPackageJsonPaths = await listFrontendAndBackendPackageJsonPaths({
    rootDir,
    frontendAppPath,
    backendAppPath,
  });

  let changedCount = 0;
  let upsertedCount = 0;

  for (const packageJsonPath of targetPackageJsonPaths) {
    const pkg = await readJson(packageJsonPath);
    if (pkg.name === sharedPackageName) continue;

    const deps = pkg.dependencies ?? {};
    if (deps[sharedPackageName] === '*') continue;

    pkg.dependencies = deps;
    pkg.dependencies[sharedPackageName] = '*';
    await writeJson(packageJsonPath, pkg);
    changedCount += 1;
    upsertedCount += 1;
  }

  return {
    changedCount,
    upsertedCount,
  };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, '..');
  const templateDir = path.join(skillDir, 'assets', 'shared-template');
  const rootDir = path.resolve(skillDir, '../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-shared-core',
    commandArgs: process.argv.slice(2),
  });

  try {
    activeRunLogger = logger;
    activeRunOps = createSkillRunOps({
      rootDir,
      logger,
      dryRun: false,
    });
    const { scope: scopeArg, force, runTests, target } = parseArgs(process.argv.slice(2));
    const { packagesDir, sharedModule, config } = await resolveSkillPaths(rootDir);
    const defaultTargetDir = path.join(packagesDir, sharedModule);
    const targetDir = target ? resolveTarget(rootDir, target) : defaultTargetDir;
    const targetPackageJsonPath = path.join(targetDir, 'package.json');

    logger.step(`Diretório alvo resolvido: ${targetDir}.`);

    if (!(await exists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }
    await ensureTemplateContract(templateDir);
    logger.step('Contrato mínimo do template validado com sucesso.');

    if (await exists(targetDir)) {
      if (!force) {
        throw new Error(`Target directory already exists: ${targetDir}. Use --force to overwrite.`);
      }
      ensureSafeOverwriteTarget(rootDir, targetDir);
      await activeRunOps.removePath(targetDir, { recursive: true, force: true, markRisk: true });
      logger.step(`Diretório existente removido com --force: ${targetDir}.`);
    }

    await activeRunOps.ensureDir(path.dirname(targetDir), {
      note: `preparacao de diretorio para ${path.basename(targetDir)}`,
    });
    await fs.cp(templateDir, targetDir, { recursive: true });
    logger.step('Template do módulo shared copiado para o diretório alvo.');

    const pkg = await readJson(targetPackageJsonPath);
    const templateScope =
      typeof pkg.name === 'string' && pkg.name.includes('/') ? pkg.name.split('/')[0] : '@namespace';
    const { scope } = await resolveNamespace({
      rootDir,
      cliScope: scopeArg,
      fallbackScope: templateScope,
    });
    logger.step(`Namespace resolvido: ${scope}.`);

    pkg.name = `${scope}/${sharedModule}`;
    await writeJson(targetPackageJsonPath, pkg);
    logger.step(`Nome do pacote atualizado para ${pkg.name}.`);

    console.log(`Shared module created at: ${targetDir}`);
    console.log(`Package name: ${pkg.name}`);

    const shouldInstallRoot = isSamePath(targetDir, defaultTargetDir);
    if (shouldInstallRoot) {
      const dependencyChanges = await ensureSharedDependencyOnFrontendAndBackend({
        rootDir,
        sharedPackageName: pkg.name,
        frontendAppPath: config.defaults.frontendAppPath,
        backendAppPath: config.defaults.backendAppPath,
      });
      if (dependencyChanges.changedCount > 0) {
        console.log(
          `Synchronized dependency "${pkg.name}: *" on frontend/backend (upserted: ${dependencyChanges.upsertedCount}).`,
        );
        logger.step(
          `Dependência "${pkg.name}: *" sincronizada em frontend/backend (upserted: ${dependencyChanges.upsertedCount}).`,
        );
      } else {
        console.log(`Frontend/backend dependencies already synchronized for "${pkg.name}: *".`);
        logger.step(`Dependência "${pkg.name}: *" já estava sincronizada para frontend/backend.`);
      }

      await installRootDependencies(rootDir);
      logger.step('npm install executado na raiz do projeto.');
    } else {
      console.log('Skipping root npm install because --target points to a custom directory.');
      logger.step('npm install da raiz foi ignorado por uso de --target customizado.');
    }

    if (runTests) {
      console.log(`Running tests for ${pkg.name}...`);
      if (shouldInstallRoot) {
        await runCommand('npm', ['run', 'test', '-w', pkg.name], rootDir);
        logger.step(`Testes executados para ${pkg.name}.`);
      } else {
        const targetTsConfigPath = resolveTargetTypescriptConfigPath(targetDir);
        if (!(await exists(targetTsConfigPath))) {
          console.log(
            `Skipping tests for custom target: missing TypeScript base config at ${targetTsConfigPath}.`,
          );
          logger.step(
            `Testes no target customizado foram ignorados (typescript-config ausente em ${targetTsConfigPath}).`,
          );
        } else {
          await installTargetDependencies(targetDir);
          await runCommand('npm', ['run', 'test'], targetDir);
          logger.step(`Testes executados no target customizado: ${targetDir}.`);
        }
      }
    } else {
      logger.step('Execução de testes não solicitada.');
    }

    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  } finally {
    activeRunLogger = null;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
