#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';
import { resolveNamespace } from '../../utils/resolve-skill-config.mjs';

function usage() {
  console.log(`Usage:
  node init-config-auth-backend-basic.mjs [--apply] [--install] [--run-build] [--scope @namespace]

Options:
  --apply        Apply changes (default is dry-run)
  --dry-run      Simulate changes without writing
  --install      Run npm install for apps/backend workspace
  --run-build    Run prisma generate and backend build after applying
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
  const result = await options.ops.writeTextFile(filePath, normalized, {
    ensureNewline: false,
  });
  if (!result.changed) {
    return false;
  }

  options.changes.push(
    `${result.created ? 'create' : 'update'} ${toPosix(path.relative(options.rootDir, filePath))}`,
  );

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
      `Template placeholders missing in assets/config-auth-backend-basic-template: ${missingTokens.join(', ')}`,
    );
  }
}

async function ensureDbInfrastructureCompatibility(rootDir) {
  const prismaServicePath = path.join(rootDir, 'apps', 'backend', 'src', 'db', 'prisma.service.ts');
  const dbModulePath = path.join(rootDir, 'apps', 'backend', 'src', 'db', 'db.module.ts');

  await assertRequiredPathsExist([prismaServicePath, dbModulePath]);

  const prismaServiceContent = await fs.readFile(prismaServicePath, 'utf8');
  const hasTransactionManagerContract = prismaServiceContent.includes('TransactionManager');
  const hasRunInTransaction = prismaServiceContent.includes('runInTransaction');

  if (!hasTransactionManagerContract || !hasRunInTransaction) {
    throw new Error(
      'apps/backend/src/db/prisma.service.ts is not compatible with TransactionManager/runInTransaction. Run config-prisma before config-auth-backend-basic.',
    );
  }
}

async function ensureBackendDependencies(backendPackageJsonPath, authPackageName, options) {
  const pkg = await readJson(backendPackageJsonPath);

  const dependencies = {
    ...(pkg.dependencies ?? {}),
    [authPackageName]: '*',
    '@nestjs/jwt': '^11.0.1',
    '@nestjs/passport': '^11.0.5',
    bcrypt: '^6.0.0',
    passport: '^0.7.0',
    'passport-jwt': '^4.0.1',
  };

  const devDependencies = {
    ...(pkg.devDependencies ?? {}),
    '@types/bcrypt': '^6.0.0',
    '@types/passport': '^1.0.17',
    '@types/passport-jwt': '^4.0.1',
  };

  const dependenciesChanged = JSON.stringify(pkg.dependencies ?? {}) !== JSON.stringify(dependencies);
  const devDependenciesChanged = JSON.stringify(pkg.devDependencies ?? {}) !== JSON.stringify(devDependencies);

  if (!dependenciesChanged && !devDependenciesChanged) {
    return;
  }

  const next = {
    ...pkg,
    dependencies,
    devDependencies,
  };

  await writeJson(backendPackageJsonPath, next, options);
}

async function ensureAuthModuleImported(appModulePath, options) {
  let content = await fs.readFile(appModulePath, 'utf8');
  let next = content;

  const importPath = './modules/auth/auth.module';
  const importLine = `import { AuthModule } from '${importPath}';`;

  const hasImport = next.includes(`from '${importPath}'`) || next.includes(`from \"${importPath}\"`);

  if (!hasImport) {
    const importBlockMatch = next.match(/^(import[^\n]*\n)+/m);
    if (importBlockMatch) {
      next = `${importBlockMatch[0]}${importLine}\n${next.slice(importBlockMatch[0].length)}`;
    } else {
      next = `${importLine}\n${next}`;
    }
  }

  const importsRegex = /imports:\s*\[([\s\S]*?)\],/m;
  const importsMatch = next.match(importsRegex);
  if (importsMatch && !/\bAuthModule\b/.test(importsMatch[1])) {
    const inner = importsMatch[1];
    const replacement = inner.trim().length === 0 ? '\n    AuthModule,\n  ' : `\n    AuthModule,${inner}`;

    next = next.replace(importsRegex, `imports: [${replacement}],`);
  }

  if (next !== content) {
    await writeText(appModulePath, next, options);
  }
}

async function ensureSeedMain(seedMainPath, options) {
  let content = await fs.readFile(seedMainPath, 'utf8');
  let next = content;

  const importLine = "import { seedAuthDefaultUsers } from './tasks/auth.seed';";

  if (!next.includes(importLine)) {
    const prismaImportRegex = /import \{ PrismaClient \} from '@prisma\/client';\n/;
    if (prismaImportRegex.test(next)) {
      next = next.replace(prismaImportRegex, `import { PrismaClient } from '@prisma/client';\n${importLine}\n`);
    } else {
      next = `${importLine}\n${next}`;
    }
  }

  const seedTasksRegex = /const seedTasks: SeedTask\[] = \[([\s\S]*?)\];/m;
  const seedTasksMatch = next.match(seedTasksRegex);

  if (seedTasksMatch) {
    if (!seedTasksMatch[1].includes('seedAuthDefaultUsers')) {
      const updatedContent =
        seedTasksMatch[1].trim().length === 0
          ? '\n  seedAuthDefaultUsers,\n'
          : `\n  seedAuthDefaultUsers,${seedTasksMatch[1]}`;

      next = next.replace(seedTasksRegex, `const seedTasks: SeedTask[] = [${updatedContent}];`);
    }
  } else {
    next = `${next.trimEnd()}\n\nconst seedTasks: SeedTask[] = [\n  seedAuthDefaultUsers,\n];\n`;
  }

  if (next !== content) {
    await writeText(seedMainPath, next, options);
  }
}

async function removeBootstrapModel(bootstrapPath, options) {
  const removed = await options.ops.removePath(bootstrapPath, {
    force: true,
    markRisk: true,
  });
  if (!removed) {
    return;
  }

  options.changes.push(`delete ${toPosix(path.relative(options.rootDir, bootstrapPath))}`);
}

async function removeLegacyAuthFiles(rootDir, options) {
  const legacyRelativePaths = [
    'apps/backend/src/modules/auth/auth.service.ts',
    'apps/backend/src/modules/auth/decorators/current-user.decorator.ts',
    'apps/backend/src/modules/auth/dto/change-password.dto.ts',
    'apps/backend/src/modules/auth/dto/index.ts',
    'apps/backend/src/modules/auth/dto/login.dto.ts',
    'apps/backend/src/modules/auth/dto/register.dto.ts',
    'apps/backend/src/modules/auth/guards/jwt-auth.guard.ts',
    'apps/backend/src/modules/auth/interfaces/jwt-payload.interface.ts',
    'apps/backend/src/modules/auth/providers/bcrypt-password-crypto.provider.ts',
    'apps/backend/src/modules/auth/providers/index.ts',
    'apps/backend/src/modules/auth/providers/prisma-auth-password.repository.ts',
    'apps/backend/src/modules/auth/providers/prisma-auth-user.repository.ts',
    'apps/backend/src/modules/auth/providers/prisma-find-password-hash.query.ts',
    'apps/backend/src/modules/auth/providers/prisma-find-user-by-email.query.ts',
    'apps/backend/src/modules/auth/providers/prisma-find-user-by-id.query.ts',
    'apps/backend/src/modules/auth/providers/prisma-user-exists.query.ts',
    'apps/backend/src/modules/auth/strategies/jwt.strategy.ts',
    'apps/backend/prisma/migrations/0001_auth_basic_init/migration.sql',
  ];

  for (const relativePath of legacyRelativePaths) {
    const absolutePath = path.join(rootDir, relativePath);
    if (!(await pathExists(absolutePath))) {
      continue;
    }

    options.changes.push(`delete ${toPosix(relativePath)}`);

    await options.ops.removePath(absolutePath, { force: true, markRisk: true });
  }
}

function runCommand(cmd, args, cwd, ops) {
  return ops.runCommand(cmd, args, cwd);
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
  const templateDir = path.join(skillDir, 'assets', 'config-auth-backend-basic-template');
  const rootDir = path.resolve(skillDir, '../../..');
  const args = parseArgs(process.argv.slice(2));

  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-auth-backend-basic',
    commandArgs: process.argv.slice(2),
  });
  const ops = createSkillRunOps({
    rootDir,
    logger,
    dryRun: args.dryRun,
  });

  const options = {
    rootDir,
    dryRun: args.dryRun,
    changes: [],
    ops,
  };

  try {
    const backendPackageJsonPath = path.join(rootDir, 'apps', 'backend', 'package.json');
    await assertRequiredPathsExist([backendPackageJsonPath]);

    if (!(await pathExists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    await validateTemplateTokens(templateDir);
    await ensureDbInfrastructureCompatibility(rootDir);

    const authPackageName = await resolveAuthPackageName(rootDir, args.scope);
    const sharedPackageName = resolveSharedPackageNameFromAuth(authPackageName);
    const scopeSlug = resolveScopeSlugFromPackageName(authPackageName);
    logger.step(`Pacote auth resolvido: ${authPackageName}.`);
    logger.step(`Pacote shared resolvido: ${sharedPackageName}.`);
    logger.step(`Slug de escopo resolvido para RestClient: ${scopeSlug}.`);

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

    await ensureBackendDependencies(backendPackageJsonPath, authPackageName, options);

    await ensureAuthModuleImported(path.join(rootDir, 'apps', 'backend', 'src', 'app.module.ts'), options);

    await ensureSeedMain(path.join(rootDir, 'apps', 'backend', 'prisma', 'seed', 'main.ts'), options);

    await removeBootstrapModel(
      path.join(rootDir, 'apps', 'backend', 'prisma', 'models', 'bootstrap.model.prisma'),
      options,
    );

    await removeLegacyAuthFiles(rootDir, options);

    if (options.changes.length === 0) {
      logger.step('Nenhuma alteração necessária (estado já convergente).');
    } else {
      logger.step(`Arquivos alterados: ${options.changes.length}.`);
      for (const change of options.changes) {
        logger.step(change);
      }
    }

    if (args.install && !args.dryRun) {
      await runCommand('npm', ['install', '--workspace', 'apps/backend'], rootDir, ops);
    } else if (args.install && args.dryRun) {
      logger.step('Instalação ignorada em dry-run.');
    }

    if (args.runBuild && !args.dryRun) {
      await runCommand('npm', ['run', 'prisma:generate', '--workspace', 'apps/backend'], rootDir, ops);
      await runCommand('npm', ['run', 'build', '--workspace', 'apps/backend'], rootDir, ops);
    } else if (args.runBuild && args.dryRun) {
      logger.step('Build ignorado em dry-run.');
    }

    if (args.dryRun) {
      console.log('Dry-run complete. Use --apply to persist changes.');
    } else {
      console.log('Config auth backend basic setup applied.');
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
