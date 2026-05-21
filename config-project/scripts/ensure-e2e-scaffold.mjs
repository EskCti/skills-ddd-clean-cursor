#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(scriptDir, '..', 'assets', 'e2e-scaffold');

function usage() {
  console.log(`Usage:
  node ensure-e2e-scaffold.mjs [options]

Options:
  --root=<path>              Project root (default: cwd)
  --backend-path=<path>      Backend app path (default: apps/backend)
  --frontend-path=<path>     Frontend app path (default: apps/web)
  --backend-port=<port>      Backend port (default: 4000)
  --frontend-port=<port>     Frontend port (default: 3000)
  --skip-playwright          Skip Playwright scaffold at root`);
}

function parseCliArgs(argv) {
  const options = {
    root: process.cwd(),
    backendPath: 'apps/backend',
    frontendPath: 'apps/web',
    backendPort: 4000,
    frontendPort: 3000,
    skipPlaywright: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }
    if (arg === '--skip-playwright') {
      options.skipPlaywright = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value === undefined) {
        throw new Error(`Missing value for --${key}`);
      }
      switch (key) {
        case 'root':
          options.root = path.resolve(value);
          break;
        case 'backend-path':
          options.backendPath = value.replace(/\\/g, '/');
          break;
        case 'frontend-path':
          options.frontendPath = value.replace(/\\/g, '/');
          break;
        case 'backend-port':
          options.backendPort = Number(value);
          break;
        case 'frontend-port':
          options.frontendPort = Number(value);
          break;
        default:
          throw new Error(`Unknown option: --${key}`);
      }
    }
  }

  return options;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function hasDependency(pkg, depName) {
  const groups = [pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, pkg.peerDependencies];
  return groups.some((group) => group && typeof group === 'object' && depName in group);
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed (${code}): ${cmd} ${args.join(' ')}`));
    });
  });
}

async function ensureDependency({ packageJsonPath, depName, installArgs, cwd }) {
  if (!(await pathExists(packageJsonPath))) return false;
  const pkg = await readJson(packageJsonPath);
  if (hasDependency(pkg, depName)) return false;
  await runCommand('npm', installArgs, cwd);
  return true;
}

async function writeFileIfMissing(filePath, content) {
  if (await pathExists(filePath)) {
    return { created: false, path: filePath };
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
  return { created: true, path: filePath };
}

async function readTemplate(relativePath) {
  return fs.readFile(path.join(assetsDir, relativePath), 'utf8');
}

async function detectFrontendType(frontendDir) {
  const packageJsonPath = path.join(frontendDir, 'package.json');
  if (!(await pathExists(packageJsonPath))) return 'unknown';

  const pkg = await readJson(packageJsonPath);
  if (hasDependency(pkg, 'next')) return 'next';
  if (hasDependency(pkg, '@angular/core')) return 'angular';
  if (hasDependency(pkg, 'vue')) return 'vue';
  return 'unknown';
}

function buildDevCommands({ backendPath, frontendPath, frontendType, frontendPort }) {
  const backendDevCommand = `npm run dev --workspace=${backendPath}`;

  let frontendDevCommand = `npm run dev --workspace=${frontendPath}`;
  if (frontendType === 'angular') {
    frontendDevCommand = `npm run start --workspace=${frontendPath} -- --port ${frontendPort}`;
  }

  return { backendDevCommand, frontendDevCommand };
}

async function patchBackendPackageJson(backendDir) {
  const packagePath = path.join(backendDir, 'package.json');
  if (!(await pathExists(packagePath))) {
    return { updated: false, skipped: true };
  }

  const pkg = await readJson(packagePath);
  const original = JSON.stringify(pkg);

  pkg.scripts = pkg.scripts ?? {};
  if (!pkg.scripts['test:e2e']) {
    pkg.scripts['test:e2e'] = 'jest --config ./test/jest-e2e.json --runInBand';
  }
  if (!pkg.scripts.test) {
    pkg.scripts.test = 'jest';
  }

  const next = JSON.stringify(pkg);
  if (next === original) {
    return { updated: false, skipped: false };
  }

  await writeJson(packagePath, pkg);
  return { updated: true, skipped: false };
}

async function patchRootPackageJson({ rootDir, backendPath }) {
  const packagePath = path.join(rootDir, 'package.json');
  if (!(await pathExists(packagePath))) {
    return { updated: false, skipped: true };
  }

  const pkg = await readJson(packagePath);
  const original = JSON.stringify(pkg);

  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts['test:e2e'] =
    pkg.scripts['test:e2e'] ?? `npm run test:e2e --workspace=${backendPath}`;
  pkg.scripts['test:e2e:web'] = pkg.scripts['test:e2e:web'] ?? 'playwright test';

  const next = JSON.stringify(pkg);
  if (next === original) {
    return { updated: false, skipped: false };
  }

  await writeJson(packagePath, pkg);
  return { updated: true, skipped: false };
}

async function patchTurboJson(rootDir) {
  const turboPath = path.join(rootDir, 'turbo.json');
  if (!(await pathExists(turboPath))) return { updated: false };

  const turbo = await readJson(turboPath);
  turbo.tasks = turbo.tasks ?? {};
  if (turbo.tasks['test:e2e']) {
    return { updated: false };
  }

  turbo.tasks['test:e2e'] = {
    cache: false,
  };

  await writeJson(turboPath, turbo);
  return { updated: true };
}

async function upsertGitignorePlaywright(rootDir) {
  const gitignorePath = path.join(rootDir, '.gitignore');
  const entries = ['playwright-report/', 'test-results/', 'blob-report/'];
  const previous = (await pathExists(gitignorePath)) ? await fs.readFile(gitignorePath, 'utf8') : '';
  const lines = previous.split(/\r?\n/).filter(Boolean);
  let changed = false;

  for (const entry of entries) {
    if (!lines.some((line) => line.trim() === entry)) {
      lines.push(entry);
      changed = true;
    }
  }

  if (!changed) return false;

  const next = `${lines.join('\n')}\n`;
  await fs.writeFile(gitignorePath, next, 'utf8');
  return true;
}

/**
 * @param {object} params
 * @param {string} params.rootDir
 * @param {string} params.backendPath
 * @param {string} params.frontendPath
 * @param {number} params.backendPort
 * @param {number} params.frontendPort
 * @param {boolean} [params.skipPlaywright]
 * @param {{ log?: (msg: string) => void }} [params.logger]
 */
export async function ensureE2eScaffold({
  rootDir,
  backendPath,
  frontendPath,
  backendPort,
  frontendPort,
  skipPlaywright = false,
  logger = { log: console.log },
}) {
  const backendDir = path.join(rootDir, backendPath);
  const frontendDir = path.join(rootDir, frontendPath);
  const created = [];

  const jestE2eTemplate = await readTemplate('backend/test/jest-e2e.json');
  const appE2eTemplate = await readTemplate('backend/test/app.e2e-spec.ts');

  const jestResult = await writeFileIfMissing(path.join(backendDir, 'test/jest-e2e.json'), jestE2eTemplate);
  if (jestResult.created) created.push(path.join(backendPath, 'test/jest-e2e.json'));

  const appResult = await writeFileIfMissing(path.join(backendDir, 'test/app.e2e-spec.ts'), appE2eTemplate);
  if (appResult.created) created.push(path.join(backendPath, 'test/app.e2e-spec.ts'));

  await ensureDependency({
    packageJsonPath: path.join(backendDir, 'package.json'),
    depName: 'supertest',
    installArgs: ['install', '-D', 'supertest@^7.0.0', '@types/supertest@^6.0.2'],
    cwd: backendDir,
  });

  const backendPkgPatch = await patchBackendPackageJson(backendDir);
  const rootPkgPatch = await patchRootPackageJson({ rootDir, backendPath });
  const turboPatch = await patchTurboJson(rootDir);
  const gitignorePatch = await upsertGitignorePlaywright(rootDir);

  if (!skipPlaywright) {
    const frontendType = await detectFrontendType(frontendDir);
    const { backendDevCommand, frontendDevCommand } = buildDevCommands({
      backendPath,
      frontendPath,
      frontendType,
      frontendPort,
    });

    let playwrightTemplate = await readTemplate('root/playwright.config.ts');
    playwrightTemplate = playwrightTemplate
      .replaceAll('{{frontendPort}}', String(frontendPort))
      .replaceAll('{{backendPort}}', String(backendPort))
      .replaceAll('{{backendDevCommand}}', backendDevCommand)
      .replaceAll('{{frontendDevCommand}}', frontendDevCommand);

    const smokeTemplate = await readTemplate('root/e2e/smoke.spec.ts');

    const playwrightResult = await writeFileIfMissing(
      path.join(rootDir, 'playwright.config.ts'),
      playwrightTemplate,
    );
    if (playwrightResult.created) created.push('playwright.config.ts');

    const smokeResult = await writeFileIfMissing(path.join(rootDir, 'e2e/smoke.spec.ts'), smokeTemplate);
    if (smokeResult.created) created.push('e2e/smoke.spec.ts');

    await ensureDependency({
      packageJsonPath: path.join(rootDir, 'package.json'),
      depName: '@playwright/test',
      installArgs: ['install', '-D', '@playwright/test@^1.49.0'],
      cwd: rootDir,
    });
  }

  logger.log(
    `E2E scaffold: created ${created.length} file(s)${created.length ? ` (${created.join(', ')})` : ''}.`,
  );
  if (backendPkgPatch.updated) logger.log(`Updated ${backendPath}/package.json (test:e2e).`);
  if (rootPkgPatch.updated) logger.log('Updated root package.json (test:e2e, test:e2e:web).');
  if (turboPatch.updated) logger.log('Updated turbo.json (test:e2e task).');
  if (gitignorePatch) logger.log('Updated .gitignore (Playwright artifacts).');

  return { created, backendPkgPatch, rootPkgPatch, turboPatch, gitignorePatch };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  ensureE2eScaffold(parseCliArgs(process.argv.slice(2)))
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message || error);
      process.exit(1);
    });
}
