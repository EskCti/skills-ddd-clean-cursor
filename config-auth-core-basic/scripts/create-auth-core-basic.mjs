#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { resolveNamespace, resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';

let activeRunLogger = null;
const REQUIRED_TEMPLATE_FILES = [
  'package.json',
  'tsconfig.json',
  'jest.config.ts',
  'src/application/provider/user-exists.query.ts',
  'src/application/usecase/create-user.usecase.ts',
  'src/password/provider/password.repository.ts',
  'src/password/usecase/change-password.usecase.ts',
  'src/user/provider/user.repository.ts',
  'test/root/create-user.usecase.test.ts',
];

function usage() {
  console.log(`Usage:
  node create-auth-core-basic.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>] [--skip-apps-sync] [--skip-install]

Examples:
  node create-auth-core-basic.mjs
  node create-auth-core-basic.mjs --scope @namespace
  node create-auth-core-basic.mjs --force
  node create-auth-core-basic.mjs --force --run-tests
  node create-auth-core-basic.mjs --target /tmp/auth-core-basic-template-test
  node create-auth-core-basic.mjs --skip-install`);
}

function parseArgs(argv) {
  let scope = '';
  let force = false;
  let runTests = false;
  let target = '';
  let skipAppsSync = false;
  let skipInstall = false;

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

    if (arg === '--skip-apps-sync') {
      skipAppsSync = true;
      continue;
    }

    if (arg === '--skip-install') {
      skipInstall = true;
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

  return {
    scope,
    force,
    runTests,
    target,
    skipAppsSync,
    skipInstall,
  };
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
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

function normalizeWorkspacePatterns(workspaces) {
  if (Array.isArray(workspaces)) return workspaces;
  if (workspaces && typeof workspaces === 'object' && Array.isArray(workspaces.packages)) {
    return workspaces.packages;
  }
  return [];
}

function normalizePattern(pattern) {
  if (typeof pattern !== 'string') return '';
  const normalized = pattern.trim().replace(/\\/g, '/');
  if (!normalized) return '';
  return normalized.replace(/^\.\//, '').replace(/\/+$/, '');
}

async function resolveWorkspacePatterns(rootDir) {
  const rootPackageJsonPath = path.join(rootDir, 'package.json');
  if (!(await exists(rootPackageJsonPath))) return [];

  try {
    const rootPkg = await readJson(rootPackageJsonPath);
    return normalizeWorkspacePatterns(rootPkg.workspaces)
      .map((pattern) => normalizePattern(pattern))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function resolveDefaultAuthCoreTarget({ rootDir, packagesDir, packagesDirRelative }) {
  const relativePackagesDir = normalizePattern(packagesDirRelative || path.relative(rootDir, packagesDir));
  const workspaceBase = relativePackagesDir || '.';
  const directPattern = normalizePattern(path.posix.join(workspaceBase, '*'));
  const nestedPattern = normalizePattern(path.posix.join(workspaceBase, '*/*'));

  const [workspacePatterns, directPackageExists, nestedPackageExists] = await Promise.all([
    resolveWorkspacePatterns(rootDir),
    exists(path.join(packagesDir, 'auth', 'package.json')),
    exists(path.join(packagesDir, 'auth', 'core', 'package.json')),
  ]);

  const hasDirectWorkspace = workspacePatterns.includes(directPattern);
  const hasNestedWorkspace = workspacePatterns.includes(nestedPattern);

  if (hasDirectWorkspace && !hasNestedWorkspace) {
    return path.join(packagesDir, 'auth');
  }

  if (hasNestedWorkspace && !hasDirectWorkspace) {
    return path.join(packagesDir, 'auth', 'core');
  }

  if (directPackageExists && !nestedPackageExists) {
    return path.join(packagesDir, 'auth');
  }

  if (nestedPackageExists && !directPackageExists) {
    return path.join(packagesDir, 'auth', 'core');
  }

  return path.join(packagesDir, 'auth');
}

function runCommand(cmd, args, cwd) {
  activeRunLogger?.command(cmd, args);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (exit ${code})`));
    });
  });
}

async function ensureDependencyInApp({ packageJsonPath, dependencyName, loggerLabel }) {
  if (!(await exists(packageJsonPath))) {
    activeRunLogger?.step(`${loggerLabel} não encontrado: ${packageJsonPath}.`);
    return false;
  }

  const packageJson = await readJson(packageJsonPath);
  const dependencies = {
    ...(packageJson.dependencies ?? {}),
  };

  if (dependencies[dependencyName] === '*') {
    activeRunLogger?.step(`${loggerLabel} já possui dependência ${dependencyName}@*.`);
    return false;
  }

  dependencies[dependencyName] = '*';
  packageJson.dependencies = dependencies;
  await writeJson(packageJsonPath, packageJson);

  activeRunLogger?.step(`${loggerLabel} atualizado com dependência ${dependencyName}@*.`);
  return true;
}

async function replaceTokenRecursively({ targetDir, token, replacement }) {
  const stack = [targetDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      const ext = path.extname(entry.name);
      if (!['.ts', '.json', '.md'].includes(ext)) {
        continue;
      }

      const content = await fs.readFile(fullPath, 'utf8');
      if (!content.includes(token)) {
        continue;
      }

      await fs.writeFile(fullPath, content.split(token).join(replacement), 'utf8');
    }
  }
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
      `Auth core basic template contract broken. Missing required files: ${missingFiles.join(', ')}`,
    );
  }
}

function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}

async function updateTsConfigExtends({ targetDir, packagesDir }) {
  const tsconfigPath = path.join(targetDir, 'tsconfig.json');
  if (!(await exists(tsconfigPath))) return null;

  const tsconfig = await readJson(tsconfigPath);
  const typescriptBasePath = path.join(packagesDir, 'typescript-config', 'base.json');
  let extendsPath = toPosixPath(path.relative(targetDir, typescriptBasePath));

  if (!extendsPath.startsWith('.')) {
    extendsPath = `./${extendsPath}`;
  }

  tsconfig.extends = extendsPath;
  await writeJson(tsconfigPath, tsconfig);
  return extendsPath;
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, '..');
  const templateDir = path.join(skillDir, 'assets', 'auth-core-basic-template');
  const rootDir = path.resolve(skillDir, '../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-auth-core-basic',
    commandArgs: process.argv.slice(2),
  });

  try {
    activeRunLogger = logger;

    const { scope: scopeArg, force, runTests, target, skipAppsSync, skipInstall } = parseArgs(process.argv.slice(2));

    const { packagesDir, packagesDirRelative, sharedModule, sharedPackageJsonPath, config } =
      await resolveSkillPaths(rootDir);
    const defaultTargetDir = await resolveDefaultAuthCoreTarget({
      rootDir,
      packagesDir,
      packagesDirRelative,
    });
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
      await fs.rm(targetDir, { recursive: true, force: true });
      logger.step(`Diretório existente removido com --force: ${targetDir}.`);
    }

    await fs.mkdir(path.dirname(targetDir), { recursive: true });
    await fs.cp(templateDir, targetDir, { recursive: true });
    logger.step('Template do módulo auth básico copiado para o diretório alvo.');

    const tsconfigExtendsPath = await updateTsConfigExtends({
      targetDir,
      packagesDir,
    });
    if (tsconfigExtendsPath) {
      logger.step(`tsconfig.extends ajustado para ${tsconfigExtendsPath}.`);
    }

    const pkg = await readJson(targetPackageJsonPath);
    const templateScope =
      typeof pkg.name === 'string' && pkg.name.includes('/') ? pkg.name.split('/')[0] : '@namespace';

    const { scope } = await resolveNamespace({
      rootDir,
      cliScope: scopeArg,
      fallbackScope: templateScope,
    });
    logger.step(`Namespace resolvido: ${scope}.`);

    pkg.name = `${scope}/auth`;
    const dependencies = {
      ...(pkg.dependencies ?? {}),
    };

    let sharedPackageLeaf = sharedModule;
    if (await exists(sharedPackageJsonPath)) {
      const sharedPkg = await readJson(sharedPackageJsonPath);
      if (typeof sharedPkg?.name === 'string' && sharedPkg.name.includes('/')) {
        sharedPackageLeaf = sharedPkg.name.split('/')[1];
      }
    }

    delete dependencies.__SHARED_PACKAGE_NAME__;
    dependencies[`${scope}/${sharedPackageLeaf}`] = '*';
    pkg.dependencies = dependencies;

    await writeJson(targetPackageJsonPath, pkg);

    const sharedPackageName = `${scope}/${sharedPackageLeaf}`;
    await replaceTokenRecursively({
      targetDir,
      token: '__SHARED_PACKAGE_NAME__',
      replacement: sharedPackageName,
    });

    logger.step(`Nome do pacote atualizado para ${pkg.name}.`);
    logger.step(`Dependência shared configurada para ${sharedPackageName}.`);

    let appsUpdated = false;
    if (!skipAppsSync) {
      const authDependencyName = pkg.name;
      const backendPackageJsonPath = path.join(rootDir, config.defaults.backendAppPath, 'package.json');
      const frontendPackageJsonPath = path.join(rootDir, config.defaults.frontendAppPath, 'package.json');

      const [backendChanged, frontendChanged] = await Promise.all([
        ensureDependencyInApp({
          packageJsonPath: backendPackageJsonPath,
          dependencyName: authDependencyName,
          loggerLabel: 'Backend',
        }),
        ensureDependencyInApp({
          packageJsonPath: frontendPackageJsonPath,
          dependencyName: authDependencyName,
          loggerLabel: 'Frontend',
        }),
      ]);

      appsUpdated = backendChanged || frontendChanged;
      if (!appsUpdated) {
        logger.step('Dependências backend/frontend já estavam convergentes.');
      }
    } else {
      logger.step('Sincronização de apps ignorada por --skip-apps-sync.');
    }

    console.log(`Auth core basic module created at: ${targetDir}`);
    console.log(`Package name: ${pkg.name}`);

    const shouldRunWorkspaceTests = isSamePath(targetDir, defaultTargetDir);
    if (runTests) {
      console.log(`Running tests for ${pkg.name}...`);
      if (shouldRunWorkspaceTests) {
        await runCommand('npm', ['run', 'test', '-w', pkg.name], rootDir);
        logger.step(`Testes executados para ${pkg.name}.`);
      } else {
        console.log(
          `Skipping tests for custom target ${targetDir} (workspace test execution is supported only on the default target).`,
        );
        logger.step(
          `Testes ignorados para target customizado (${targetDir}); execução suportada apenas no alvo padrão do workspace.`,
        );
      }
    } else {
      logger.step('Execução de testes não solicitada.');
    }

    if (!skipInstall) {
      console.log('Running npm install at repository root...');
      await runCommand('npm', ['install'], rootDir);
      logger.step('npm install executado no root para atualizar lock/dependências.');
    } else {
      logger.step('Instalação de dependências ignorada por --skip-install.');
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
