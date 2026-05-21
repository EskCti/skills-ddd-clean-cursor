#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { loadSkillConfig, resolveNamespace } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';
import { ensureE2eScaffold } from './ensure-e2e-scaffold.mjs';

let activeRunLogger = null;
let activeRunOps = null;

const DEFAULT_PRETTIER_CONFIG = {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 120,
  arrowParens: 'always',
  bracketSpacing: true,
};

function usage() {
  console.log(`Usage:
  node project-init.mjs [--frontend-path apps/web] [--backend-path apps/backend] [--frontend-port 3000] [--backend-port 4000] [--scope @namespace] [--skip-global-nest]

Examples:
  node project-init.mjs
  node project-init.mjs --frontend-path apps/frontend --backend-path apps/api
  node project-init.mjs --frontend-path apps/web --backend-path services/backend
  node project-init.mjs --frontend-port 3100 --backend-port 4100
  node project-init.mjs --scope @namespace
  node project-init.mjs --skip-global-nest`);
}

function normalizeRelativeDir(value, fieldName) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid value for --${fieldName}.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing value for --${fieldName}`);
  }

  if (path.isAbsolute(trimmed)) {
    throw new Error(`Invalid value for --${fieldName}: must be a relative path.`);
  }

  const normalized = path.normalize(trimmed).replace(/\\/g, '/');
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`Invalid value for --${fieldName}: cannot point outside repository root.`);
  }

  return normalized;
}

function normalizePathLeaf(value, fieldName) {
  const leaf = path.basename(value);
  if (!/^[a-z][a-z0-9-]*$/.test(leaf)) {
    throw new Error(`Invalid value for --${fieldName}: last segment "${leaf}" must match /^[a-z][a-z0-9-]*$/.`);
  }
}

function normalizeProjectPath(value, fieldName) {
  const normalized = normalizeRelativeDir(value, fieldName);
  normalizePathLeaf(normalized, fieldName);
  return normalized;
}

function normalizePort(value, fieldName) {
  if (!value) throw new Error(`Missing value for --${fieldName}`);
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid value for --${fieldName}: "${value}" must be an integer between 1 and 65535.`);
  }

  return parsed;
}

function normalizeEnvVarName(value, fieldName) {
  if (!value) throw new Error(`Missing value for --${fieldName}`);
  const trimmed = value.trim();

  if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
    throw new Error(`Invalid value for --${fieldName}: "${trimmed}" must match /^[A-Z][A-Z0-9_]*$/.`);
  }

  return trimmed;
}

function parseArgs(argv, defaults) {
  let frontendPath = defaults.frontendAppPath;
  let backendPath = defaults.backendAppPath;
  let frontendPort = defaults.frontendPort;
  let backendPort = defaults.backendPort;
  let frontendApiUrlEnvVar = defaults.frontendApiUrlEnvVar;
  let backendPortEnvVar = defaults.backendPortEnvVar;
  let scope = '';
  let skipGlobalNest = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

    if (arg === '--skip-global-nest') {
      skipGlobalNest = true;
      continue;
    }

    if (arg === '--frontend-path') {
      frontendPath = normalizeProjectPath(argv[i + 1], 'frontend-path');
      i += 1;
      continue;
    }

    if (arg === '--backend-path') {
      backendPath = normalizeProjectPath(argv[i + 1], 'backend-path');
      i += 1;
      continue;
    }

    // Backward-compatible aliases.
    if (arg === '--apps-dir') {
      const appsDir = normalizeRelativeDir(argv[i + 1], 'apps-dir');
      frontendPath = path.join(appsDir, path.basename(frontendPath)).replace(/\\/g, '/');
      backendPath = path.join(appsDir, path.basename(backendPath)).replace(/\\/g, '/');
      i += 1;
      continue;
    }

    if (arg === '--next-name' || arg === '--frontend-name') {
      const value = argv[i + 1];
      if (!value) throw new Error(`Missing value for ${arg}`);
      const name = value.trim();
      normalizePathLeaf(name, arg.slice(2));
      frontendPath = path.join(path.dirname(frontendPath), name).replace(/\\/g, '/');
      i += 1;
      continue;
    }

    if (arg === '--backend-name') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --backend-name');
      const name = value.trim();
      normalizePathLeaf(name, 'backend-name');
      backendPath = path.join(path.dirname(backendPath), name).replace(/\\/g, '/');
      i += 1;
      continue;
    }

    if (arg === '--frontend-port') {
      frontendPort = normalizePort(argv[i + 1], 'frontend-port');
      i += 1;
      continue;
    }

    if (arg === '--backend-port') {
      backendPort = normalizePort(argv[i + 1], 'backend-port');
      i += 1;
      continue;
    }

    if (arg === '--frontend-api-env-var') {
      frontendApiUrlEnvVar = normalizeEnvVarName(argv[i + 1], 'frontend-api-env-var');
      i += 1;
      continue;
    }

    if (arg === '--backend-port-env-var') {
      backendPortEnvVar = normalizeEnvVarName(argv[i + 1], 'backend-port-env-var');
      i += 1;
      continue;
    }

    if (arg === '--scope') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --scope');
      scope = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (frontendPath === backendPath) {
    throw new Error('Frontend and backend paths must be different.');
  }

  return {
    frontendPath,
    backendPath,
    frontendPort,
    backendPort,
    frontendApiUrlEnvVar,
    backendPortEnvVar,
    scope,
    skipGlobalNest,
  };
}

function runCommand(cmd, args, cwd) {
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }

  return activeRunOps.runCommand(cmd, args, cwd);
}

function commandExists(cmd, args = ['--version']) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('exit', (code) => resolve(code === 0));
  });
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

function ensureArrayValue(arr, value) {
  if (!Array.isArray(arr)) return [value];
  return arr.includes(value) ? arr : [...arr, value];
}

function ensureWorkspacePatterns(workspaces) {
  if (Array.isArray(workspaces)) {
    return ensureArrayValue(
      ensureArrayValue(ensureArrayValue(workspaces, 'apps/*'), 'packages/*'),
      'packages/config/*',
    );
  }

  if (workspaces && typeof workspaces === 'object' && Array.isArray(workspaces.packages)) {
    return {
      ...workspaces,
      packages: ensureArrayValue(
        ensureArrayValue(ensureArrayValue(workspaces.packages, 'apps/*'), 'packages/*'),
        'packages/config/*',
      ),
    };
  }

  return ['apps/*', 'packages/*', 'packages/config/*'];
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function mergeTreeWithoutOverwrite(srcPath, destPath, relativePath = '') {
  const copied = [];
  const skipped = [];
  const sourceStat = await fs.stat(srcPath);
  const destinationExists = await pathExists(destPath);

  if (!destinationExists) {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.cp(srcPath, destPath, { recursive: sourceStat.isDirectory() });
    if (relativePath) copied.push(relativePath);
    return { copied, skipped };
  }

  const destinationStat = await fs.stat(destPath);
  if (sourceStat.isDirectory() && destinationStat.isDirectory()) {
    const entries = await fs.readdir(srcPath);
    for (const entry of entries) {
      if (entry === '.git') continue;
      const childRelativePath = relativePath ? path.join(relativePath, entry) : entry;
      const childResult = await mergeTreeWithoutOverwrite(
        path.join(srcPath, entry),
        path.join(destPath, entry),
        childRelativePath,
      );
      copied.push(...childResult.copied);
      skipped.push(...childResult.skipped);
    }
    return { copied, skipped };
  }

  if (relativePath) skipped.push(relativePath);
  return { copied, skipped };
}

async function scaffoldTurboStructureWithCreateTurbo(rootDir) {
  const hasRootGit = await pathExists(path.join(rootDir, '.git'));
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'config-project-'));
  const tempProjectName = 'turbo-template';
  const tempProjectDir = path.join(tempRoot, tempProjectName);
  const args = ['--yes', 'create-turbo@latest', tempProjectName, '--package-manager', 'npm', '--skip-install'];
  if (hasRootGit) {
    args.push('--no-git');
  }

  try {
    await runCommand('npx', args, tempRoot);

    const mergeResult = await mergeTreeWithoutOverwrite(tempProjectDir, rootDir);
    return {
      hasRootGit,
      copiedPaths: mergeResult.copied,
      skippedPaths: mergeResult.skipped,
    };
  } finally {
    if (activeRunOps) {
      await activeRunOps.removePath(tempRoot, {
        recursive: true,
        force: true,
        markRisk: false,
        note: 'cleanup temp scaffold',
      });
    } else {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  }
}

async function ensureTurboRoot(rootDir, scope) {
  const packagePath = path.join(rootDir, 'package.json');
  const turboPath = path.join(rootDir, 'turbo.json');
  const repoName = `${scope || '@namespace'}/workspace`;
  const requiredTurboPaths = [
    '.gitignore',
    '.npmrc',
    'packages/eslint-config/package.json',
    'packages/typescript-config/package.json',
  ];
  const missingTurboPaths = [];
  for (const relativePath of requiredTurboPaths) {
    const absolutePath = path.join(rootDir, relativePath);
    if (!(await pathExists(absolutePath))) {
      missingTurboPaths.push(relativePath);
    }
  }
  const turboPathExists = await pathExists(turboPath);
  const shouldScaffoldFromTurbo = !turboPathExists || missingTurboPaths.length > 0;
  let scaffoldResult = null;
  if (shouldScaffoldFromTurbo) {
    scaffoldResult = await scaffoldTurboStructureWithCreateTurbo(rootDir);
  }

  let rootPkg = {};
  let pkgExists = false;
  if (await pathExists(packagePath)) {
    rootPkg = await readJson(packagePath);
    pkgExists = true;
  }

  const nextPkg = {
    ...rootPkg,
    name: typeof rootPkg.name === 'string' && rootPkg.name.trim() ? rootPkg.name : repoName,
    private: true,
    scripts: {
      ...(rootPkg.scripts ?? {}),
    },
    workspaces: ensureWorkspacePatterns(rootPkg.workspaces),
  };
  nextPkg.scripts.dev = nextPkg.scripts.dev ?? 'turbo run dev';
  nextPkg.scripts.build = nextPkg.scripts.build ?? 'turbo run build';
  nextPkg.scripts.lint = nextPkg.scripts.lint ?? 'turbo run lint';
  nextPkg.scripts.test = 'turbo run test';
  nextPkg.packageManager = nextPkg.packageManager ?? 'npm@latest';

  const turboExists = await pathExists(turboPath);
  if (!turboExists) {
    await writeJson(turboPath, {
      $schema: 'https://turbo.build/schema.json',
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['.next/**', 'dist/**'],
        },
        lint: {
          dependsOn: ['^lint'],
        },
        test: {
          dependsOn: ['^test'],
          cache: false,
        },
        dev: {
          cache: false,
          persistent: true,
        },
      },
    });
  }

  const pkgChanged = JSON.stringify(rootPkg) !== JSON.stringify(nextPkg);
  if (!pkgExists || pkgChanged) {
    await writeJson(packagePath, nextPkg);
  }

  return {
    createdTurbo: !turboExists,
    createdPackageJson: !pkgExists,
    scaffoldedWithCreateTurbo: shouldScaffoldFromTurbo,
    missingTurboPathsBefore: missingTurboPaths,
    copiedScaffoldPaths: scaffoldResult ? scaffoldResult.copiedPaths : [],
    skippedScaffoldPaths: scaffoldResult ? scaffoldResult.skippedPaths : [],
  };
}

function hasDependency(pkg, depName) {
  const groups = [pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, pkg.peerDependencies];

  return groups.some((group) => group && typeof group === 'object' && depName in group);
}

async function ensureDependency({ packageJsonPath, depName, installCommand, installArgs, cwd }) {
  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`Missing package.json: ${packageJsonPath}`);
  }

  const pkg = await readJson(packageJsonPath);
  if (hasDependency(pkg, depName)) {
    return false;
  }

  console.log(`Installing dependency "${depName}" in ${cwd}...`);
  await runCommand(installCommand, installArgs, cwd);
  return true;
}

async function readPackageName(packageJsonPath) {
  if (!(await pathExists(packageJsonPath))) return '';
  const pkg = await readJson(packageJsonPath);
  return typeof pkg.name === 'string' ? pkg.name : '';
}

async function ensurePackageName(packageJsonPath, expectedName) {
  if (!(await pathExists(packageJsonPath))) {
    return false;
  }

  const pkg = await readJson(packageJsonPath);
  if (pkg.name === expectedName) {
    return false;
  }

  pkg.name = expectedName;
  await writeJson(packageJsonPath, pkg);
  return true;
}

function buildScopedPackageName(scope, packageName) {
  if (typeof packageName === 'string' && packageName.includes('/')) {
    const [, leaf = ''] = packageName.split('/');
    if (leaf) return `${scope}/${leaf}`;
  }
  return `${scope}/${packageName}`;
}

function rewriteMappedDependencyGroup(group, renameMap) {
  if (!group || typeof group !== 'object') return { changed: false, value: group };
  let changed = false;
  const next = {};

  for (const [depName, depVersion] of Object.entries(group)) {
    const mappedName = renameMap.get(depName) ?? depName;
    if (mappedName !== depName) changed = true;
    next[mappedName] = depVersion;
  }

  return { changed, value: next };
}

async function listWorkspacePackageJsonPaths(rootDir) {
  const roots = ['apps', 'packages'];
  const results = [];

  for (const root of roots) {
    const rootPath = path.join(rootDir, root);
    if (!(await pathExists(rootPath))) continue;

    const topLevel = await fs.readdir(rootPath, { withFileTypes: true });
    for (const entry of topLevel) {
      if (!entry.isDirectory()) continue;
      const packageJsonPath = path.join(rootPath, entry.name, 'package.json');
      if (await pathExists(packageJsonPath)) {
        results.push(packageJsonPath);
      }
    }
  }

  return results;
}

async function applyNamespaceToWorkspacePackages({ rootDir, scope }) {
  const packageJsonPaths = await listWorkspacePackageJsonPaths(rootDir);
  const packageFiles = [];
  const renameMap = new Map();

  for (const packageJsonPath of packageJsonPaths) {
    const pkg = await readJson(packageJsonPath);
    const currentName =
      typeof pkg.name === 'string' && pkg.name.trim() ? pkg.name : path.basename(path.dirname(packageJsonPath));
    const scopedName = buildScopedPackageName(scope, currentName);

    packageFiles.push({
      path: packageJsonPath,
      pkg,
      currentName,
      scopedName,
    });

    renameMap.set(currentName, scopedName);
  }

  const changedPackageNames = [];
  const changedPackageJsonPaths = [];

  for (const packageFile of packageFiles) {
    const { path: packageJsonPath, pkg, currentName, scopedName } = packageFile;
    let changed = false;

    if (pkg.name !== scopedName) {
      pkg.name = scopedName;
      changed = true;
      changedPackageNames.push(scopedName);
    }

    const groups = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

    for (const groupName of groups) {
      const rewriteResult = rewriteMappedDependencyGroup(pkg[groupName], renameMap);
      if (rewriteResult.changed) {
        pkg[groupName] = rewriteResult.value;
        changed = true;
      }
    }

    if (changed) {
      await writeJson(packageJsonPath, pkg);
      changedPackageJsonPaths.push(packageJsonPath);
    }
  }

  return {
    changedPackageNames,
    changedPackageJsonPaths,
    packageCount: packageFiles.length,
  };
}

async function isNestAppDirectory(backendDir) {
  const packageJsonPath = path.join(backendDir, 'package.json');
  const mainPath = path.join(backendDir, 'src', 'main.ts');
  if (!(await pathExists(packageJsonPath))) return false;
  if (!(await pathExists(mainPath))) return false;

  const pkg = await readJson(packageJsonPath);
  return hasDependency(pkg, '@nestjs/core');
}

async function isNextAppDirectory(frontendDir) {
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (!(await pathExists(packageJsonPath))) return false;
  const pkg = await readJson(packageJsonPath);
  return hasDependency(pkg, 'next');
}

async function isDirectoryEmpty(targetPath) {
  if (!(await pathExists(targetPath))) return true;
  const entries = await fs.readdir(targetPath);
  return entries.length === 0;
}

function hasDependencySuffix(group, suffix) {
  if (!group || typeof group !== 'object') return false;
  return Object.keys(group).some((depName) => depName.endsWith(suffix));
}

function isLikelyTurboDefaultAppPackage(pkg, appLeaf) {
  if (!pkg || typeof pkg !== 'object') return false;
  if (!pkg.scripts || typeof pkg.scripts !== 'object') return false;
  if (!('check-types' in pkg.scripts)) return false;

  const hasUiDependency = hasDependencySuffix(pkg.dependencies, '/ui');
  const hasEslintConfig = hasDependencySuffix(pkg.devDependencies, '/eslint-config');
  const hasTsConfig = hasDependencySuffix(pkg.devDependencies, '/typescript-config');
  if (!hasUiDependency || !hasEslintConfig || !hasTsConfig) return false;

  const name = typeof pkg.name === 'string' ? pkg.name : '';
  return name.endsWith(`/${appLeaf}`) || appLeaf === 'docs' || appLeaf === 'web';
}

function isLikelyTurboDefaultUiPackage(pkg) {
  if (!pkg || typeof pkg !== 'object') return false;
  if (!pkg.scripts || typeof pkg.scripts !== 'object') return false;
  if (!pkg.devDependencies || typeof pkg.devDependencies !== 'object') return false;
  if (!pkg.dependencies || typeof pkg.dependencies !== 'object') return false;

  const name = typeof pkg.name === 'string' ? pkg.name : '';
  const hasUiName = name.endsWith('/ui');
  const hasCheckTypesScript = 'check-types' in pkg.scripts;
  const hasGenerateComponentScript =
    typeof pkg.scripts['generate:component'] === 'string' &&
    pkg.scripts['generate:component'].includes('turbo gen react-component');
  const hasReactDeps = 'react' in pkg.dependencies && 'react-dom' in pkg.dependencies;
  const hasEslintConfig = hasDependencySuffix(pkg.devDependencies, '/eslint-config');
  const hasTsConfig = hasDependencySuffix(pkg.devDependencies, '/typescript-config');

  return (
    hasUiName && hasCheckTypesScript && hasGenerateComponentScript && hasReactDeps && hasEslintConfig && hasTsConfig
  );
}

async function removeDefaultTurboApps({ rootDir, frontendPath, backendPath }) {
  const candidates = ['apps/docs', 'apps/web'];
  const removed = [];

  for (const candidate of candidates) {
    if (candidate === backendPath) continue;

    const candidateDir = path.join(rootDir, candidate);
    const packageJsonPath = path.join(candidateDir, 'package.json');
    if (!(await pathExists(packageJsonPath))) continue;

    const pkg = await readJson(packageJsonPath);
    const appLeaf = path.basename(candidate);
    const isDefaultTemplate = isLikelyTurboDefaultAppPackage(pkg, appLeaf);
    if (!isDefaultTemplate) continue;

    if (candidate === frontendPath) {
      console.log(`Removing Turbo default app at ${candidate} before creating configured frontend.`);
    } else {
      console.log(`Removing unused Turbo default app at ${candidate}.`);
    }

    if (!activeRunOps) {
      throw new Error('Run operations are not initialized.');
    }
    await activeRunOps.removePath(candidateDir, {
      recursive: true,
      force: true,
      markRisk: true,
      note: 'remove default turbo app',
    });
    removed.push(candidate);
  }

  return removed;
}

async function removeDefaultTurboPackages({ rootDir }) {
  const candidate = 'packages/ui';
  const candidateDir = path.join(rootDir, candidate);
  const packageJsonPath = path.join(candidateDir, 'package.json');
  if (!(await pathExists(packageJsonPath))) return [];

  const pkg = await readJson(packageJsonPath);
  if (!isLikelyTurboDefaultUiPackage(pkg)) return [];

  console.log(`Removing unused Turbo default package at ${candidate}.`);
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.removePath(candidateDir, {
    recursive: true,
    force: true,
    markRisk: true,
    note: 'remove default turbo package',
  });
  return [candidate];
}

async function ensureFrontendApp({ rootDir, frontendPath, frontendName, frontendParentDir }) {
  const frontendDir = path.join(rootDir, frontendPath);
  const frontendExists = await pathExists(frontendDir);
  const isNextApp = frontendExists && (await isNextAppDirectory(frontendDir));

  if (isNextApp) {
    return false;
  }

  if (frontendExists && !(await isDirectoryEmpty(frontendDir))) {
    throw new Error(
      `Frontend directory already exists and is not a Next.js app: ${frontendPath}. Refusing to overwrite.`,
    );
  }

  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.ensureDir(frontendParentDir, {
    note: 'preparacao de diretorio frontend',
  });
  console.log(`Creating Next.js app: ${frontendName}`);
  await runCommand(
    'npx',
    ['create-next-app@latest', frontendName, '--yes', '--use-npm', '--src-dir'],
    frontendParentDir,
  );
  return true;
}

async function ensureBackendApp({ rootDir, backendPath, backendName, backendParentDir, skipGlobalNest }) {
  const backendDir = path.join(rootDir, backendPath);
  const backendExists = await pathExists(backendDir);
  const isNestApp = backendExists && (await isNestAppDirectory(backendDir));

  if (isNestApp) {
    return false;
  }

  if (backendExists && !(await isDirectoryEmpty(backendDir))) {
    throw new Error(`Backend directory already exists and is not a NestJS app: ${backendPath}. Refusing to overwrite.`);
  }

  if (!skipGlobalNest) {
    const hasNest = await commandExists('nest');
    if (!hasNest) {
      console.log('Installing @nestjs/cli globally...');
      await runCommand('npm', ['install', '-g', '@nestjs/cli'], rootDir);
    }
  }

  const nestCreateArgs = ['new', backendName, '--skip-git', '--package-manager', 'npm'];

  const hasNestCli = await commandExists('nest');
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.ensureDir(backendParentDir, {
    note: 'preparacao de diretorio backend',
  });
  if (hasNestCli) {
    console.log(`Creating NestJS app with nest CLI: ${backendName}`);
    await runCommand('nest', nestCreateArgs, backendParentDir);
  } else {
    console.log(`Creating NestJS app with npx: ${backendName}`);
    await runCommand('npx', ['--yes', '@nestjs/cli@latest', ...nestCreateArgs], backendParentDir);
  }

  return true;
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertEnvContent(content, entries) {
  const lines = content.split(/\r?\n/);
  const outputLines = [...lines];

  for (const [key, value] of Object.entries(entries)) {
    const keyMatcher = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=`);
    const existingIndex = outputLines.findIndex((line) => keyMatcher.test(line));
    const targetLine = `${key}=${value}`;

    if (existingIndex >= 0) {
      outputLines[existingIndex] = targetLine;
    } else {
      outputLines.push(targetLine);
    }
  }

  return `${outputLines.join('\n').replace(/\n+$/g, '')}\n`;
}

async function upsertEnvFile(filePath, entries) {
  const previous = (await pathExists(filePath)) ? await fs.readFile(filePath, 'utf8') : '';
  const next = upsertEnvContent(previous, entries);

  if (previous === next) {
    return false;
  }

  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.writeTextFile(filePath, next, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
    note: path.basename(filePath),
  });
  return true;
}

async function writeEnvFiles({
  rootDir,
  frontendPath,
  backendPath,
  frontendPort,
  backendPort,
  frontendApiUrlEnvVar,
  backendPortEnvVar,
}) {
  const webDir = path.join(rootDir, frontendPath);
  const backendDir = path.join(rootDir, backendPath);
  const frontendEntries = {
    [frontendApiUrlEnvVar]: `http://localhost:${backendPort}`,
    PORT: String(frontendPort),
  };
  const backendEntries = {
    [backendPortEnvVar]: String(backendPort),
    DATABASE_URL: '"postgresql://docker:docker@localhost:5432/docker?schema=public"',
    JWT_SECRET: '"YOUR_SECRET_HERE"',
  };

  const changedFiles = [];

  if (await upsertEnvFile(path.join(webDir, '.env.example'), frontendEntries)) {
    changedFiles.push(path.join(frontendPath, '.env.example'));
  }
  if (await upsertEnvFile(path.join(webDir, '.env'), frontendEntries)) {
    changedFiles.push(path.join(frontendPath, '.env'));
  }
  if (await upsertEnvFile(path.join(backendDir, '.env.example'), backendEntries)) {
    changedFiles.push(path.join(backendPath, '.env.example'));
  }
  if (await upsertEnvFile(path.join(backendDir, '.env'), backendEntries)) {
    changedFiles.push(path.join(backendPath, '.env'));
  }

  return changedFiles;
}

async function patchRootPackageJson(rootDir) {
  const packagePath = path.join(rootDir, 'package.json');
  const pkg = await readJson(packagePath);

  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.test = 'turbo run test';
  pkg.scripts.format = pkg.scripts.format ?? 'prettier --write "**/*.{ts,tsx,md}"';

  pkg.devDependencies = pkg.devDependencies ?? {};
  if (!pkg.devDependencies['ts-node']) {
    pkg.devDependencies['ts-node'] = '^10.9.2';
  }

  await writeJson(packagePath, pkg);
}

async function ensureRootPrettierConfig(rootDir) {
  const prettierConfigPath = path.join(rootDir, '.prettierrc');
  const expectedContent = `${JSON.stringify(DEFAULT_PRETTIER_CONFIG, null, 2)}\n`;
  const fileExists = await pathExists(prettierConfigPath);
  const previousContent = fileExists
    ? await fs.readFile(prettierConfigPath, 'utf8')
    : '';

  if (previousContent === expectedContent) {
    return { updated: false, created: false };
  }

  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.writeTextFile(prettierConfigPath, expectedContent, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
    note: '.prettierrc',
  });
  return { updated: true, created: !fileExists };
}

async function patchBackendPackageJson({ rootDir, backendPath }) {
  const packagePath = path.join(rootDir, backendPath, 'package.json');
  if (!(await pathExists(packagePath))) {
    return { updated: false, skipped: true };
  }

  const pkg = await readJson(packagePath);
  const original = JSON.stringify(pkg);

  pkg.scripts = pkg.scripts ?? {};
  if (!pkg.scripts.dev) {
    pkg.scripts.dev = pkg.scripts['start:dev'] ?? 'nest start --watch';
  }

  const next = JSON.stringify(pkg);
  if (next === original) {
    return { updated: false, skipped: false };
  }

  await writeJson(packagePath, pkg);
  return { updated: true, skipped: false };
}

async function patchTurboJson(rootDir) {
  const turboPath = path.join(rootDir, 'turbo.json');
  const turbo = await readJson(turboPath);

  turbo.tasks = turbo.tasks ?? {};
  turbo.tasks.build = turbo.tasks.build ?? {};
  turbo.tasks.build.outputs = ensureArrayValue(turbo.tasks.build.outputs, 'dist/**');

  turbo.tasks.test = {
    ...(turbo.tasks.test ?? {}),
    cache: false,
  };

  await writeJson(turboPath, turbo);
}

async function patchBackendMain({ rootDir, backendPath, backendPort, backendPortEnvVar }) {
  const mainPath = path.join(rootDir, backendPath, 'src', 'main.ts');
  if (!(await pathExists(mainPath))) {
    return { updated: false, skipped: true };
  }

  let content = await fs.readFile(mainPath, 'utf8');
  const original = content;

  if (content.includes('import "dotenv/config";')) {
    content = content.replace('import "dotenv/config";', "import 'dotenv/config';");
  }

  if (!content.includes("import 'dotenv/config';")) {
    content = `import 'dotenv/config';\n${content}`;
  }

  if (!content.includes('app.enableCors();')) {
    content = content.replace(
      /const app = await NestFactory\.create\(AppModule\);\s*/,
      'const app = await NestFactory.create(AppModule);\n  app.enableCors();\n',
    );
  }

  const portVariableName = `process.env.${backendPortEnvVar}`;
  const desiredPortLine = `const port = Number(${portVariableName} ?? ${backendPort});`;
  const portAssignmentRegex = /const\s+port\s*=\s*[^;]+;/;
  const listenCallRegex = /await app\.listen\(([^;]+)\);/;

  if (portAssignmentRegex.test(content)) {
    content = content.replace(portAssignmentRegex, desiredPortLine);
    content = content.replace(listenCallRegex, 'await app.listen(port);');
  } else if (listenCallRegex.test(content)) {
    content = content.replace(listenCallRegex, `${desiredPortLine}\n  await app.listen(port);`);
  }

  if (content === original) {
    return { updated: false, skipped: false };
  }

  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.writeTextFile(mainPath, content, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
    note: 'backend main.ts',
  });
  return { updated: true, skipped: false };
}

function findMatchingToken(content, startIndex, openToken, closeToken) {
  let depth = 0;
  for (let index = startIndex; index < content.length; index += 1) {
    const char = content[index];

    if (char === openToken) {
      depth += 1;
      continue;
    }

    if (char === closeToken) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function hasWildcardPatternForProtocol(patternContent, protocol) {
  const protocolMatcher = new RegExp(`protocol\\s*:\\s*["']${escapeRegExp(protocol)}["']`);
  const hostnameMatcher = /hostname\s*:\s*["']\*\*["']/;
  return protocolMatcher.test(patternContent) && hostnameMatcher.test(patternContent);
}

function buildRemotePatternItem(protocol, indent) {
  return [`${indent}{`, `${indent}  protocol: "${protocol}",`, `${indent}  hostname: "**",`, `${indent}}`].join('\n');
}

function ensureNextRemotePatterns(content) {
  const nextConfigDeclaration = /const\s+nextConfig(?:\s*:\s*NextConfig)?\s*=\s*\{/m;
  const declarationMatch = nextConfigDeclaration.exec(content);

  if (!declarationMatch || declarationMatch.index === undefined) {
    return { updated: false, nextContent: content, reason: 'unsupported-structure' };
  }

  const declarationStart = declarationMatch.index;
  const configObjectStart = declarationStart + declarationMatch[0].lastIndexOf('{');
  const configObjectEnd = findMatchingToken(content, configObjectStart, '{', '}');

  if (configObjectEnd < 0) {
    return { updated: false, nextContent: content, reason: 'unbalanced-config' };
  }

  const configBody = content.slice(configObjectStart + 1, configObjectEnd);
  const imagesBlockRegex = /\bimages\s*:\s*\{/m;
  const imagesMatch = imagesBlockRegex.exec(configBody);

  if (!imagesMatch) {
    const remotePatternsBlock = [
      '  images: {',
      '    remotePatterns: [',
      buildRemotePatternItem('https', '      ') + ',',
      buildRemotePatternItem('http', '      '),
      '    ],',
      '  },',
    ].join('\n');

    const injected = `${content.slice(
      0,
      configObjectStart + 1,
    )}\n${remotePatternsBlock}${content.slice(configObjectStart + 1)}`;
    return { updated: true, nextContent: injected, reason: 'inserted-images-block' };
  }

  const imagesAbsoluteStart = configObjectStart + 1 + imagesMatch.index + imagesMatch[0].lastIndexOf('{');
  const imagesAbsoluteEnd = findMatchingToken(content, imagesAbsoluteStart, '{', '}');

  if (imagesAbsoluteEnd < 0) {
    return { updated: false, nextContent: content, reason: 'unbalanced-images' };
  }

  const imagesBody = content.slice(imagesAbsoluteStart + 1, imagesAbsoluteEnd);
  const remotePatternsRegex = /\bremotePatterns\s*:\s*\[/m;
  const remotePatternsMatch = remotePatternsRegex.exec(imagesBody);

  if (!remotePatternsMatch) {
    const remotePatternsBlock = [
      '    remotePatterns: [',
      buildRemotePatternItem('https', '      ') + ',',
      buildRemotePatternItem('http', '      '),
      '    ],',
    ].join('\n');

    const injected = `${content.slice(
      0,
      imagesAbsoluteStart + 1,
    )}\n${remotePatternsBlock}${content.slice(imagesAbsoluteStart + 1)}`;
    return {
      updated: true,
      nextContent: injected,
      reason: 'inserted-remote-patterns',
    };
  }

  const remotePatternsAbsoluteStart =
    imagesAbsoluteStart + 1 + remotePatternsMatch.index + remotePatternsMatch[0].lastIndexOf('[');
  const remotePatternsAbsoluteEnd = findMatchingToken(content, remotePatternsAbsoluteStart, '[', ']');

  if (remotePatternsAbsoluteEnd < 0) {
    return {
      updated: false,
      nextContent: content,
      reason: 'unbalanced-remote-patterns',
    };
  }

  const remotePatternsBody = content.slice(remotePatternsAbsoluteStart + 1, remotePatternsAbsoluteEnd);
  const hasHttps = hasWildcardPatternForProtocol(remotePatternsBody, 'https');
  const hasHttp = hasWildcardPatternForProtocol(remotePatternsBody, 'http');

  if (hasHttps && hasHttp) {
    return { updated: false, nextContent: content, reason: 'already-configured' };
  }

  const missingItems = [];
  if (!hasHttps) {
    missingItems.push(buildRemotePatternItem('https', '      '));
  }
  if (!hasHttp) {
    missingItems.push(buildRemotePatternItem('http', '      '));
  }

  const trimmedPatternsBody = remotePatternsBody.trim();
  const prependComma = trimmedPatternsBody.length > 0 && !trimmedPatternsBody.endsWith(',');
  const addition = `${prependComma ? ',' : ''}\n${missingItems.join(',\n')}\n    `;

  const injected = `${content.slice(
    0,
    remotePatternsAbsoluteEnd,
  )}${addition}${content.slice(remotePatternsAbsoluteEnd)}`;
  return {
    updated: true,
    nextContent: injected,
    reason: 'appended-missing-patterns',
  };
}

async function patchFrontendNextConfig({ rootDir, frontendPath }) {
  const frontendDir = path.join(rootDir, frontendPath);
  const candidates = ['next.config.ts', 'next.config.mjs', 'next.config.js'];
  let configPath = '';

  for (const candidate of candidates) {
    const absolutePath = path.join(frontendDir, candidate);
    if (await pathExists(absolutePath)) {
      configPath = absolutePath;
      break;
    }
  }

  if (!configPath) {
    return { updated: false, skipped: true, reason: 'file-not-found', file: '' };
  }

  const content = await fs.readFile(configPath, 'utf8');
  const patchResult = ensureNextRemotePatterns(content);

  if (!patchResult.updated) {
    return {
      updated: false,
      skipped: false,
      reason: patchResult.reason,
      file: path.relative(rootDir, configPath).replace(/\\/g, '/'),
    };
  }

  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.writeTextFile(configPath, patchResult.nextContent, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
    note: path.basename(configPath),
  });
  return {
    updated: true,
    skipped: false,
    reason: patchResult.reason,
    file: path.relative(rootDir, configPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, '../../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-project',
    commandArgs: process.argv.slice(2),
    deferGitignoreEnsure: true,
    gitignoreCreateIfMissing: false,
  });

  try {
    activeRunLogger = logger;
    activeRunOps = createSkillRunOps({
      rootDir,
      logger,
      dryRun: false,
    });
    const skillConfig = await loadSkillConfig(rootDir);

    const {
      frontendPath,
      backendPath,
      frontendPort,
      backendPort,
      frontendApiUrlEnvVar,
      backendPortEnvVar,
      scope: scopeArg,
      skipGlobalNest,
    } = parseArgs(process.argv.slice(2), skillConfig.defaults);

    const { scope } = await resolveNamespace({
      rootDir,
      cliScope: scopeArg,
      fallbackScope: skillConfig.defaults.namespace,
    });

    const frontendDir = path.join(rootDir, frontendPath);
    const backendDir = path.join(rootDir, backendPath);
    const frontendParentDir = path.dirname(frontendDir);
    const backendParentDir = path.dirname(backendDir);
    const frontendName = path.basename(frontendPath);
    const backendName = path.basename(backendPath);
    const frontendPackageName = `${scope}/${frontendName}`;
    const backendPackageName = `${scope}/${backendName}`;

    console.log(
      `Bootstrap config: scope="${scope}", frontendPath="${frontendPath}:${frontendPort}", backendPath="${backendPath}:${backendPort}"`,
    );
    logger.step(
      `Configuração resolvida: scope=${scope}, frontend=${frontendPath}:${frontendPort}, backend=${backendPath}:${backendPort}.`,
    );

    const turboResult = await ensureTurboRoot(rootDir, scope);
    if (turboResult.scaffoldedWithCreateTurbo) {
      const copiedCount = turboResult.copiedScaffoldPaths.length;
      console.log(`TurboRepo base reconciled using create-turbo (copied missing paths: ${copiedCount}).`);
      logger.step(`Base do TurboRepo reconciliada com create-turbo (itens copiados: ${copiedCount}).`);
    } else if (turboResult.createdTurbo || turboResult.createdPackageJson) {
      const createdItems = [];
      if (turboResult.createdPackageJson) createdItems.push('package.json');
      if (turboResult.createdTurbo) createdItems.push('turbo.json');
      console.log(`TurboRepo base created/updated: ${createdItems.join(', ')}`);
      logger.step(`Base do TurboRepo criada/atualizada: ${createdItems.join(', ')}.`);
    } else {
      console.log('TurboRepo already detected at current directory.');
      logger.step('Estrutura TurboRepo já existente no diretório atual.');
    }

    const removedDefaultApps = await removeDefaultTurboApps({
      rootDir,
      frontendPath,
      backendPath,
    });
    const removedDefaultPackages = await removeDefaultTurboPackages({ rootDir });
    const removedDefaultProjects = [...removedDefaultApps, ...removedDefaultPackages];
    if (removedDefaultProjects.length > 0) {
      console.log(`Removed default Turbo template projects before app bootstrap: ${removedDefaultProjects.join(', ')}`);
      logger.step(`Projetos padrão do Turbo removidos antes do bootstrap: ${removedDefaultProjects.join(', ')}.`);
    } else {
      console.log('No default Turbo template projects needed removal.');
      logger.step('Nenhum projeto padrão do Turbo precisou ser removido.');
    }

    const frontendCreated = await ensureFrontendApp({
      rootDir,
      frontendPath,
      frontendName,
      frontendParentDir,
    });
    console.log(
      frontendCreated ? `Frontend app created at ${frontendPath}.` : `Frontend app already exists at ${frontendPath}.`,
    );
    logger.step(frontendCreated ? `Frontend criado em ${frontendPath}.` : `Frontend já existia em ${frontendPath}.`);

    const backendCreated = await ensureBackendApp({
      rootDir,
      backendPath,
      backendName,
      backendParentDir,
      skipGlobalNest,
    });
    console.log(
      backendCreated ? `Backend app created at ${backendPath}.` : `Backend app already exists at ${backendPath}.`,
    );
    logger.step(backendCreated ? `Backend criado em ${backendPath}.` : `Backend já existia em ${backendPath}.`);

    const frontendPackagePath = path.join(frontendDir, 'package.json');
    const backendPackagePath = path.join(backendDir, 'package.json');

    const workspaceNamespaceResult = await applyNamespaceToWorkspacePackages({
      rootDir,
      scope,
    });
    const frontendNameChanged = await ensurePackageName(frontendPackagePath, frontendPackageName);
    const backendNameChanged = await ensurePackageName(backendPackagePath, backendPackageName);

    const namespaceChanged =
      workspaceNamespaceResult.changedPackageJsonPaths.length > 0 || frontendNameChanged || backendNameChanged;
    if (namespaceChanged) {
      const nextFrontendName = await readPackageName(frontendPackagePath);
      const nextBackendName = await readPackageName(backendPackagePath);
      console.log(
        `Namespace synchronized (${workspaceNamespaceResult.packageCount} workspace packages): frontend="${nextFrontendName}", backend="${nextBackendName}"`,
      );
      logger.step(`Namespace sincronizado em ${workspaceNamespaceResult.packageCount} pacotes do workspace.`);
    } else {
      console.log('Namespace already applied to workspace/front-end/back-end packages.');
      logger.step('Namespace já estava aplicado no workspace/frontend/backend.');
    }

    const turboInstalled = await ensureDependency({
      packageJsonPath: path.join(rootDir, 'package.json'),
      depName: 'turbo',
      installCommand: 'npm',
      installArgs: ['install', '-D', 'turbo'],
      cwd: rootDir,
    });
    if (!turboInstalled) {
      console.log('Dependency already present at root: turbo');
      logger.step('Dependência turbo já presente na raiz.');
    } else {
      logger.step('Dependência turbo instalada na raiz.');
    }

    const tsNodeInstalled = await ensureDependency({
      packageJsonPath: path.join(rootDir, 'package.json'),
      depName: 'ts-node',
      installCommand: 'npm',
      installArgs: ['install', '-D', 'ts-node'],
      cwd: rootDir,
    });
    if (!tsNodeInstalled) {
      console.log('Dependency already present at root: ts-node');
      logger.step('Dependência ts-node já presente na raiz.');
    } else {
      logger.step('Dependência ts-node instalada na raiz.');
    }

    const prettierInstalled = await ensureDependency({
      packageJsonPath: path.join(rootDir, 'package.json'),
      depName: 'prettier',
      installCommand: 'npm',
      installArgs: ['install', '-D', 'prettier@^3.7.4'],
      cwd: rootDir,
    });
    if (!prettierInstalled) {
      console.log('Dependency already present at root: prettier');
      logger.step('Dependência prettier já presente na raiz.');
    } else {
      logger.step('Dependência prettier instalada na raiz.');
    }

    const dotenvInstalled = await ensureDependency({
      packageJsonPath: backendPackagePath,
      depName: 'dotenv',
      installCommand: 'npm',
      installArgs: ['install', 'dotenv'],
      cwd: backendDir,
    });
    if (!dotenvInstalled) {
      console.log(`Dependency already present in ${backendPath}: dotenv`);
      logger.step(`Dependência dotenv já presente em ${backendPath}.`);
    } else {
      logger.step(`Dependência dotenv instalada em ${backendPath}.`);
    }

    await patchRootPackageJson(rootDir);
    logger.step('package.json da raiz atualizado incrementalmente.');

    const prettierConfigResult = await ensureRootPrettierConfig(rootDir);
    if (prettierConfigResult.updated) {
      console.log(
        prettierConfigResult.created
          ? 'Created .prettierrc at repository root.'
          : 'Updated .prettierrc at repository root.',
      );
      logger.step(
        prettierConfigResult.created
          ? '.prettierrc criado na raiz do repositório.'
          : '.prettierrc atualizado na raiz do repositório.',
      );
    } else {
      console.log('.prettierrc already configured at repository root.');
      logger.step('.prettierrc já estava configurado na raiz do repositório.');
    }

    const backendPackagePatchResult = await patchBackendPackageJson({
      rootDir,
      backendPath,
    });
    if (backendPackagePatchResult.updated) {
      console.log(`Updated ${backendPath}/package.json`);
      logger.step(`${backendPath}/package.json atualizado.`);
    } else if (backendPackagePatchResult.skipped) {
      console.log(`Skipped ${backendPath}/package.json (file not found).`);
      logger.step(`${backendPath}/package.json ignorado (arquivo ausente).`);
    } else {
      console.log(`${backendPath}/package.json already configured.`);
      logger.step(`${backendPath}/package.json já estava configurado.`);
    }

    await patchTurboJson(rootDir);
    logger.step('turbo.json atualizado incrementalmente.');

    const frontendConfigPatchResult = await patchFrontendNextConfig({
      rootDir,
      frontendPath,
    });
    if (frontendConfigPatchResult.updated) {
      console.log(`Updated ${frontendConfigPatchResult.file} (images.remotePatterns liberado para http/https).`);
      logger.step(`${frontendConfigPatchResult.file} atualizado com images.remotePatterns para http/https.`);
    } else if (frontendConfigPatchResult.skipped) {
      console.log(`Skipped Next config patch at ${frontendPath} (${frontendConfigPatchResult.reason}).`);
      logger.step(`Configuração de imagens do Next ignorada em ${frontendPath} (${frontendConfigPatchResult.reason}).`);
    } else {
      console.log(
        `${frontendConfigPatchResult.file} already configured for remote images (${frontendConfigPatchResult.reason}).`,
      );
      logger.step(`${frontendConfigPatchResult.file} já estava configurado para imagens remotas.`);
    }

    const mainPatchResult = await patchBackendMain({
      rootDir,
      backendPath,
      backendPort,
      backendPortEnvVar,
    });
    if (mainPatchResult.updated) {
      console.log(`Updated ${backendPath}/src/main.ts`);
      logger.step(`${backendPath}/src/main.ts atualizado (dotenv/cors/porta).`);
    } else if (mainPatchResult.skipped) {
      console.log(`Skipped ${backendPath}/src/main.ts (file not found).`);
      logger.step(`${backendPath}/src/main.ts ignorado (arquivo ausente).`);
    } else {
      console.log(`${backendPath}/src/main.ts already configured.`);
      logger.step(`${backendPath}/src/main.ts já estava configurado.`);
    }

    const changedEnvFiles = await writeEnvFiles({
      rootDir,
      frontendPath,
      backendPath,
      frontendPort,
      backendPort,
      frontendApiUrlEnvVar,
      backendPortEnvVar,
    });
    if (changedEnvFiles.length > 0) {
      console.log(`Updated env files: ${changedEnvFiles.join(', ')}`);
      logger.step(`Arquivos de ambiente atualizados: ${changedEnvFiles.join(', ')}.`);
    } else {
      console.log('Env files already configured.');
      logger.step('Arquivos de ambiente já estavam configurados.');
    }

    await ensureE2eScaffold({
      rootDir,
      backendPath,
      frontendPath,
      backendPort,
      frontendPort,
      logger: {
        log: (message) => {
          console.log(message);
          logger.step(message);
        },
      },
    });

    console.log('TurboRepo initialization completed (idempotent mode).');
    logger.step('Inicialização do TurboRepo concluída em modo idempotente.');
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
