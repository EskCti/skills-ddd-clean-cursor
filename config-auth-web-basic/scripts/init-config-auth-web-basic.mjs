#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { resolveNamespace } from '../../utils/resolve-skill-config.mjs';

function usage() {
  console.log(`Usage:
  node init-config-auth-web-basic.mjs [--apply] [--install] [--run-build] [--scope @namespace]

Options:
  --apply        Apply changes (default is dry-run)
  --dry-run      Simulate changes without writing
  --install      Run npm install for apps/web workspace
  --run-build    Run web build after applying
  --scope        Namespace fallback when auth package cannot be detected
  --help         Show this help
`);
}

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: false,
    install: false,
    runBuild: false,
    scope: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

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

    if (arg === '--run-build') {
      args.runBuild = true;
      continue;
    }

    if (arg === '--scope') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --scope');
      }
      args.scope = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!args.apply) {
    args.dryRun = true;
  }

  return args;
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

async function writeJson(filePath, value, options) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`, options);
}

async function writeText(filePath, content, options) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  let current = null;

  try {
    current = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (!error || error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (current === normalized) {
    return false;
  }

  options.changes.push(
    `${current === null ? 'create' : 'update'} ${toPosix(path.relative(options.rootDir, filePath))}`,
  );

  if (!options.dryRun) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, normalized, 'utf8');
  }

  return true;
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

async function* walkFiles(baseDir) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
      continue;
    }

    yield fullPath;
  }
}

async function copyTemplate(templateDir, rootDir, replacements, options) {
  for await (const sourcePath of walkFiles(templateDir)) {
    const relativePath = path.relative(templateDir, sourcePath);
    const targetPath = path.join(rootDir, relativePath);

    let content = await fs.readFile(sourcePath, 'utf8');
    for (const [token, replacement] of Object.entries(replacements)) {
      content = content.split(token).join(replacement);
    }

    await writeText(targetPath, content, options);
  }
}

async function assertRequiredPathsExist(paths) {
  for (const targetPath of paths) {
    if (!(await pathExists(targetPath))) {
      throw new Error(`Required file not found: ${targetPath}`);
    }
  }
}

async function validateTemplateTokens(templateDir) {
  const requiredTokens = [
    '__AUTH_PACKAGE_NAME__',
    '__SHARED_PACKAGE_NAME__',
    '__PROJECT_SCOPE_SLUG__',
  ];

  const tokenHits = Object.fromEntries(requiredTokens.map((token) => [token, 0]));

  for await (const sourcePath of walkFiles(templateDir)) {
    const content = await fs.readFile(sourcePath, 'utf8');
    for (const token of requiredTokens) {
      if (content.includes(token)) {
        tokenHits[token] += 1;
      }
    }
  }

  const missingTokens = requiredTokens.filter((token) => tokenHits[token] === 0);
  if (missingTokens.length > 0) {
    throw new Error(
      `Template placeholders missing in assets/config-auth-web-basic-template: ${missingTokens.join(', ')}`,
    );
  }
}

async function ensureSharedWebInfrastructureCompatibility(rootDir) {
  const requiredPaths = [
    path.join(rootDir, 'apps', 'web', 'src', 'shared', 'index.ts'),
    path.join(rootDir, 'apps', 'web', 'src', 'shared', 'i18n', 'index.ts'),
    path.join(rootDir, 'apps', 'web', 'src', 'shared', 'components', 'form', 'validator', 'index.ts'),
    path.join(rootDir, 'apps', 'web', 'src', 'modules', 'dashboard', 'components', 'empty-dashboard-state.component.tsx'),
    path.join(rootDir, 'apps', 'web', 'src', 'modules', 'examples', 'components', 'example-navigation.component.tsx'),
  ];

  await assertRequiredPathsExist(requiredPaths);
}

async function ensureFrontendDependencies(frontendPackageJsonPath, authPackageName, sharedPackageName, options) {
  const pkg = await readJson(frontendPackageJsonPath);

  const dependencies = {
    ...(pkg.dependencies ?? {}),
    [authPackageName]: '*',
    [sharedPackageName]: '*',
    'lucide-react': '^0.577.0',
    'react-hook-form': '^7.66.0',
    sonner: '^2.0.7',
  };

  const dependenciesChanged = JSON.stringify(pkg.dependencies ?? {}) !== JSON.stringify(dependencies);

  if (!dependenciesChanged) {
    return;
  }

  const next = {
    ...pkg,
    dependencies,
  };

  await writeJson(frontendPackageJsonPath, next, options);
}

function runCommand(cmd, args, cwd, logger) {
  logger.command(cmd, args);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
    });

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

async function resolveAuthPackageName(rootDir, fallbackScope) {
  const candidates = [
    path.join(rootDir, 'packages', 'auth', 'package.json'),
    path.join(rootDir, 'packages', 'auth', 'core', 'package.json'),
  ];

  for (const candidate of candidates) {
    if (!(await pathExists(candidate))) {
      continue;
    }

    try {
      const pkg = await readJson(candidate);
      if (typeof pkg.name === 'string' && pkg.name.includes('/')) {
        return pkg.name;
      }
    } catch {
      // noop
    }
  }

  const { scope } = await resolveNamespace({
    rootDir,
    cliScope: fallbackScope,
    fallbackScope: '@namespace',
  });

  return `${scope}/auth`;
}

function resolveSharedPackageNameFromAuth(authPackageName) {
  if (typeof authPackageName !== 'string') {
    return '@namespace/shared';
  }

  const slashIndex = authPackageName.indexOf('/');
  if (slashIndex <= 0) {
    return '@namespace/shared';
  }

  const scope = authPackageName.slice(0, slashIndex);
  return `${scope}/shared`;
}

function resolveScopeSlugFromPackageName(packageName) {
  if (typeof packageName !== 'string') {
    return 'namespace';
  }

  const slashIndex = packageName.indexOf('/');
  const scope = slashIndex > 0 ? packageName.slice(0, slashIndex) : packageName;
  const slug = scope.replace(/^@/, '').trim();
  return slug || 'namespace';
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, '..');
  const templateDir = path.join(skillDir, 'assets', 'config-auth-web-basic-template');
  const rootDir = path.resolve(skillDir, '../../..');
  const args = parseArgs(process.argv.slice(2));

  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-auth-web-basic',
    commandArgs: process.argv.slice(2),
  });

  const options = {
    rootDir,
    dryRun: args.dryRun,
    changes: [],
  };

  try {
    const webPackagePath = path.join(rootDir, 'apps', 'web', 'package.json');
    await assertRequiredPathsExist([webPackagePath]);

    if (!(await pathExists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    await validateTemplateTokens(templateDir);
    await ensureSharedWebInfrastructureCompatibility(rootDir);

    const authPackageName = await resolveAuthPackageName(rootDir, args.scope);
    const sharedPackageName = resolveSharedPackageNameFromAuth(authPackageName);
    const scopeSlug = resolveScopeSlugFromPackageName(authPackageName);

    logger.step(`Pacote auth resolvido: ${authPackageName}.`);
    logger.step(`Pacote shared resolvido: ${sharedPackageName}.`);
    logger.step(`Slug de escopo resolvido para storage/email: ${scopeSlug}.`);

    await copyTemplate(
      templateDir,
      rootDir,
      {
        __AUTH_PACKAGE_NAME__: authPackageName,
        __SHARED_PACKAGE_NAME__: sharedPackageName,
        __PROJECT_SCOPE_SLUG__: scopeSlug,
      },
      options,
    );

    await ensureFrontendDependencies(webPackagePath, authPackageName, sharedPackageName, options);

    if (options.changes.length === 0) {
      logger.step('Nenhuma alteracao necessaria (estado ja convergente).');
    } else {
      logger.step(`Arquivos alterados: ${options.changes.length}.`);
      for (const change of options.changes) {
        logger.step(change);
      }
    }

    if (args.install && !args.dryRun) {
      await runCommand('npm', ['install', '--workspace', 'apps/web'], rootDir, logger);
    } else if (args.install && args.dryRun) {
      logger.step('Instalacao ignorada em dry-run.');
    }

    if (args.runBuild && !args.dryRun) {
      await runCommand('npm', ['run', 'build', '--workspace', 'apps/web'], rootDir, logger);
    } else if (args.runBuild && args.dryRun) {
      logger.step('Build ignorado em dry-run.');
    }

    if (args.dryRun) {
      console.log('Dry-run complete. Use --apply to persist changes.');
    } else {
      console.log('Config auth web basic setup applied.');
    }

    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
