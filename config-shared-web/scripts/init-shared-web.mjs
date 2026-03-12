#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { getBaseScaffoldConfig } from './shared-web-base.mjs';
import { listUiLibraries, resolveUiLibrary } from './ui-libraries/index.mjs';

const THEME_MAP = {
  fuchsia: '#d946ef',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

function usage() {
  const libraries = listUiLibraries().join(', ');

  console.log(`Usage:
  node init-shared-web.mjs [--theme <name-or-hex>] [--mode dark|light] [--ui-library <name>] [--skip-install] [--dry-run]

Options:
  --theme         Cor primaria por nome (ex.: fuchsia) ou hexadecimal (ex.: #22c55e)
  --mode          Tema inicial do body (dark|light)
  --ui-library    Biblioteca de componentes (disponiveis: ${libraries})
  --skip-install  Nao instala dependencias
  --dry-run       Simula alteracoes sem persistir
  --help, -h      Exibe esta ajuda

Examples:
  node init-shared-web.mjs
  node init-shared-web.mjs --theme fuchsia --mode dark --ui-library shadcn
  node init-shared-web.mjs --theme '#22c55e' --mode light --skip-install
  node init-shared-web.mjs --dry-run`);
}

function parseArgs(argv) {
  const options = {
    theme: 'fuchsia',
    mode: 'dark',
    uiLibrary: 'shadcn',
    skipInstall: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

    if (arg === '--skip-install') {
      options.skipInstall = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--theme') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --theme');
      options.theme = value.trim();
      i += 1;
      continue;
    }

    if (arg === '--mode') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --mode');
      options.mode = value.trim().toLowerCase();
      i += 1;
      continue;
    }

    if (arg === '--ui-library') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --ui-library');
      options.uiLibrary = value.trim().toLowerCase();
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!['dark', 'light'].includes(options.mode)) {
    throw new Error(`Invalid mode "${options.mode}". Use "dark" or "light".`);
  }

  return options;
}

function normalizeThemeColor(themeInput) {
  const value = String(themeInput ?? '').trim();
  if (!value) return THEME_MAP.fuchsia;

  const lower = value.toLowerCase();
  if (THEME_MAP[lower]) return THEME_MAP[lower];

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return value;
  }

  if (/^[a-z][a-z0-9-]*$/i.test(value)) {
    return value;
  }

  throw new Error(`Invalid theme color "${themeInput}". Use a known color name or #RRGGBB.`);
}

function runCommand(cmd, args, cwd, logger) {
  logger.command(cmd, args);

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

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function shouldPreserveExternalModuleManagedAppFile({ relativePath, previousContent, nextContent }) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const isAppRouterFile = normalizedPath.includes('/src/app/');
  if (!isAppRouterFile) return false;

  const externalModuleImportPattern = /from\s+["']@\/modules\/(?!examples(?:\/|["']))[^"']+["']/;
  const authRoutePattern = /["'`]\/auth(?:\/[^"'`]*)?["'`]/;
  const appProvidersPattern = /\bAppProviders\b/;

  const previousUsesExternalModule =
    externalModuleImportPattern.test(previousContent) ||
    authRoutePattern.test(previousContent) ||
    appProvidersPattern.test(previousContent);
  const nextUsesExternalModule =
    externalModuleImportPattern.test(nextContent) ||
    authRoutePattern.test(nextContent) ||
    appProvidersPattern.test(nextContent);

  return previousUsesExternalModule && !nextUsesExternalModule;
}

async function writeManagedFile({ absolutePath, relativePath, content, dryRun, logger, stats }) {
  const exists = await fileExists(absolutePath);

  if (exists) {
    const previous = await fs.readFile(absolutePath, 'utf8');
    if (previous === content) {
      stats.unchanged += 1;
      return;
    }

    if (
      shouldPreserveExternalModuleManagedAppFile({
        relativePath,
        previousContent: previous,
        nextContent: content,
      })
    ) {
      stats.preserved += 1;
      logger.step(`${dryRun ? '[dry-run] ' : ''}arquivo preservado por integracao com modulo externo: ${relativePath}`);
      return;
    }

    stats.updated += 1;
    logger.step(`${dryRun ? '[dry-run] ' : ''}arquivo atualizado: ${relativePath}`);

    if (!dryRun) {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf8');
    }

    return;
  }

  stats.created += 1;
  logger.step(`${dryRun ? '[dry-run] ' : ''}arquivo criado: ${relativePath}`);

  if (!dryRun) {
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf8');
  }
}

async function removeLegacyFile({ absolutePath, relativePath, dryRun, logger }) {
  if (!(await fileExists(absolutePath))) return false;

  logger.step(`${dryRun ? '[dry-run] ' : ''}arquivo legado removido: ${relativePath}`);

  if (!dryRun) {
    await fs.rm(absolutePath, { force: true });
  }

  return true;
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

function applyReplacements(content, replacements = {}) {
  let next = content;

  for (const [token, replacement] of Object.entries(replacements)) {
    next = next.split(token).join(replacement);
  }

  return next;
}

async function readTemplateFiles({ templateDir, replacements }) {
  if (!(await fileExists(templateDir))) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const files = new Map();

  for await (const sourcePath of walkFiles(templateDir)) {
    const relativePath = path.relative(templateDir, sourcePath).replace(/\\/g, '/');

    const rawContent = await fs.readFile(sourcePath, 'utf8');
    const content = applyReplacements(rawContent, replacements);
    files.set(relativePath, content.endsWith('\n') ? content : `${content}\n`);
  }

  return files;
}

async function ensureTemplateLayerContract(layer) {
  const requiredFiles = Array.isArray(layer.requiredTemplateFiles) ? layer.requiredTemplateFiles : [];

  for (const templateDir of layer.templateDirs ?? []) {
    if (!(await fileExists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    for (const requiredRelativePath of requiredFiles) {
      const requiredAbsolutePath = path.join(templateDir, requiredRelativePath);
      if (!(await fileExists(requiredAbsolutePath))) {
        throw new Error(
          `Template contract broken for layer "${layer.name}". Missing required file: ${requiredRelativePath}`,
        );
      }
    }
  }
}

async function buildFileMap(layers, logger) {
  const files = new Map();

  for (const layer of layers) {
    for (const templateDir of layer.templateDirs) {
      const layerFiles = await readTemplateFiles({
        templateDir,
        replacements: layer.replacements,
      });

      for (const [relativePath, content] of layerFiles) {
        if (files.has(relativePath)) {
          logger.step(`camada "${layer.name}" sobrescreveu arquivo de camada anterior: ${relativePath}`);
        }

        files.set(relativePath, content);
      }
    }
  }

  return files;
}

function buildDependencyPlan(layers) {
  const runtimeSet = new Set();
  const devSet = new Set();
  const sources = [];

  for (const layer of layers) {
    const runtimeDeps = Array.from(new Set(layer.runtimeDependencies ?? []));
    const devDeps = Array.from(new Set(layer.devDependencies ?? []));

    for (const dependency of runtimeDeps) runtimeSet.add(dependency);
    for (const dependency of devDeps) devSet.add(dependency);

    if (runtimeDeps.length > 0 || devDeps.length > 0) {
      sources.push(layer.name);
    }
  }

  return {
    runtimeDeps: Array.from(runtimeSet),
    devDeps: Array.from(devSet),
    sources,
  };
}

async function installDependencies({ rootDir, frontendAppPath, dependencyPlan, logger, dryRun }) {
  const runtimeDeps = dependencyPlan.runtimeDeps;
  const devDeps = dependencyPlan.devDeps;

  if (runtimeDeps.length === 0 && devDeps.length === 0) {
    logger.step('Nenhuma dependencia adicional requerida pelas camadas selecionadas.');
    return;
  }

  if (dependencyPlan.sources.length > 0) {
    logger.step(`Dependencias agregadas a partir das camadas: ${dependencyPlan.sources.join(', ')}.`);
  }

  if (dryRun) {
    if (runtimeDeps.length > 0) {
      logger.step(`[dry-run] instalaria dependencias runtime no frontend: ${runtimeDeps.join(', ')}`);
    }

    if (devDeps.length > 0) {
      logger.step(`[dry-run] instalaria dependencias dev no frontend: ${devDeps.join(', ')}`);
    }

    return;
  }

  if (runtimeDeps.length > 0) {
    await runCommand('npm', ['--workspace', frontendAppPath, 'install', ...runtimeDeps], rootDir, logger);
  }

  if (devDeps.length > 0) {
    await runCommand('npm', ['--workspace', frontendAppPath, 'install', '-D', ...devDeps], rootDir, logger);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillRoot = path.resolve(scriptDir, '..');
  const rootDir = path.resolve(skillRoot, '../../..');

  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-shared-web',
    commandArgs: process.argv.slice(2),
  });

  try {
    const { config } = await resolveSkillPaths(rootDir);
    const frontendAppPath = config.defaults.frontendAppPath;
    const frontendRoot = path.join(rootDir, frontendAppPath);
    const frontendPackageJsonPath = path.join(frontendRoot, 'package.json');

    if (!(await fileExists(frontendPackageJsonPath))) {
      throw new Error(`Frontend package.json not found: ${frontendPackageJsonPath}. Run config-project first.`);
    }

    const themeColor = normalizeThemeColor(options.theme);
    const uiLibrary = resolveUiLibrary(options.uiLibrary, { skillRoot });

    if (!uiLibrary) {
      const available = listUiLibraries().join(', ');
      throw new Error(`Invalid --ui-library "${options.uiLibrary}". Available options: ${available}.`);
    }

    logger.step(`Frontend alvo: ${frontendAppPath}.`);
    logger.step(`Tema resolvido: ${themeColor}.`);
    logger.step(`Modo resolvido: ${options.mode}.`);
    logger.step(`Biblioteca de UI: ${uiLibrary.label} (${uiLibrary.name}).`);

    const baseScaffold = getBaseScaffoldConfig({
      skillRoot,
      primaryColor: themeColor,
      mode: options.mode,
    });
    const uiLibraryLayer = {
      name: `ui-library:${uiLibrary.name}`,
      templateDirs: uiLibrary.templateDirs,
      requiredTemplateFiles: uiLibrary.requiredTemplateFiles ?? [],
      replacements: uiLibrary.replacements,
      runtimeDependencies: uiLibrary.runtimeDependencies ?? [],
      devDependencies: uiLibrary.devDependencies ?? [],
      legacyFiles: uiLibrary.legacyFiles ?? [],
    };
    const scaffoldLayers = [baseScaffold, uiLibraryLayer];

    for (const layer of scaffoldLayers) {
      await ensureTemplateLayerContract(layer);
      logger.step(`Contrato de template validado: ${layer.name}.`);
    }

    if (!options.skipInstall) {
      const dependencyPlan = buildDependencyPlan(scaffoldLayers);
      await installDependencies({
        rootDir,
        frontendAppPath,
        dependencyPlan,
        logger,
        dryRun: options.dryRun,
      });
    } else {
      logger.step('Instalacao de dependencias ignorada por --skip-install.');
    }

    const files = await buildFileMap(scaffoldLayers, logger);

    const stats = { created: 0, updated: 0, unchanged: 0, preserved: 0 };
    const legacyFiles = Array.from(new Set([...(baseScaffold.legacyFiles ?? []), ...(uiLibraryLayer.legacyFiles ?? [])]));

    for (const legacyRelativePath of legacyFiles) {
      const absoluteLegacyPath = path.join(frontendRoot, legacyRelativePath);
      const logLegacyPath = path.posix.join(frontendAppPath, legacyRelativePath.replace(/\\/g, '/'));

      await removeLegacyFile({
        absolutePath: absoluteLegacyPath,
        relativePath: logLegacyPath,
        dryRun: options.dryRun,
        logger,
      });
    }

    const entries = Array.from(files.entries()).sort(([a], [b]) => a.localeCompare(b));

    for (const [relativePath, content] of entries) {
      const absolutePath = path.join(frontendRoot, relativePath);
      const logPath = path.posix.join(frontendAppPath, relativePath.replace(/\\/g, '/'));

      await writeManagedFile({
        absolutePath,
        relativePath: logPath,
        content,
        dryRun: options.dryRun,
        logger,
        stats,
      });
    }

    logger.step(
      `Resumo de arquivos: criados=${stats.created}, atualizados=${stats.updated}, preservados=${stats.preserved}, inalterados=${stats.unchanged}.`,
    );

    if (options.dryRun) {
      logger.step('Execucao concluida em dry-run (sem persistencia).');
    }

    await logger.success();

    console.log('Shared web shell configured successfully.');
    console.log(`Frontend: ${frontendAppPath}`);
    console.log(`Theme: ${themeColor}`);
    console.log(`Mode: ${options.mode}`);
    console.log(`UI library: ${uiLibrary.name}`);
    console.log(
      `Files -> created: ${stats.created}, updated: ${stats.updated}, preserved: ${stats.preserved}, unchanged: ${stats.unchanged}`,
    );
  } catch (error) {
    await logger.failure(error);
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
