#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSkillRunLogger } from './skill-run-log.mjs';
import { createSkillRunOps } from './skill-run-ops.mjs';

const THEME_MAP = {
  fuchsia: '#d946ef',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

export function createInitFrontendShellScript({
  skillName,
  defaultFrontendPath,
  getBaseScaffoldConfig,
}) {
  function usage() {
    console.log(`Usage:
  node init-${skillName}.mjs [--frontend-path <path>] [--theme <name-or-hex>] [--mode dark|light] [--skip-install] [--dry-run]`);
  }

  function parseArgs(argv) {
    const options = {
      frontendPath: defaultFrontendPath,
      theme: 'fuchsia',
      mode: 'dark',
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
      if (arg === '--frontend-path') {
        options.frontendPath = argv[i + 1]?.trim();
        i += 1;
        continue;
      }
      if (arg === '--theme') {
        options.theme = argv[i + 1]?.trim();
        i += 1;
        continue;
      }
      if (arg === '--mode') {
        options.mode = argv[i + 1]?.trim().toLowerCase();
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
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
    throw new Error(`Invalid theme color "${themeInput}".`);
  }

  async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
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
    for (const templateDir of layer.templateDirs ?? []) {
      if (!(await fileExists(templateDir))) {
        throw new Error(`Template directory not found: ${templateDir}`);
      }
      for (const requiredRelativePath of layer.requiredTemplateFiles ?? []) {
        const requiredAbsolutePath = path.join(templateDir, requiredRelativePath);
        if (!(await fileExists(requiredAbsolutePath))) {
          throw new Error(`Missing required template file: ${requiredRelativePath}`);
        }
      }
    }
  }

  async function writeManagedFile({ absolutePath, relativePath, content, logger, stats, ops }) {
    const exists = await fileExists(absolutePath);
    if (exists) {
      const previous = await fs.readFile(absolutePath, 'utf8');
      if (previous === content) {
        stats.unchanged += 1;
        return;
      }
      stats.updated += 1;
      logger.step(`${ops.dryRun ? '[dry-run] ' : ''}arquivo atualizado: ${relativePath}`);
    } else {
      stats.created += 1;
      logger.step(`${ops.dryRun ? '[dry-run] ' : ''}arquivo criado: ${relativePath}`);
    }

    await ops.writeTextFile(absolutePath, content, {
      ensureNewline: false,
      note: relativePath,
      markRiskOnOverwrite: true,
    });
  }

  async function main() {
    const options = parseArgs(process.argv.slice(2));
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const skillRoot = path.resolve(scriptDir, '..');
    const rootDir = path.resolve(skillRoot, '../../..');

    const logger = await createSkillRunLogger({
      rootDir,
      skillName,
      commandArgs: process.argv.slice(2),
    });
    const ops = createSkillRunOps({ rootDir, logger, dryRun: options.dryRun });

    try {
      const frontendAppPath = options.frontendPath;
      const frontendRoot = path.join(rootDir, frontendAppPath);
      const frontendPackageJsonPath = path.join(frontendRoot, 'package.json');

      if (!(await fileExists(frontendPackageJsonPath))) {
        throw new Error(`Frontend package.json not found: ${frontendPackageJsonPath}. Run config-project-* first.`);
      }

      const themeColor = normalizeThemeColor(options.theme);
      const layer = getBaseScaffoldConfig({
        skillRoot,
        primaryColor: themeColor,
        mode: options.mode,
      });

      await ensureTemplateLayerContract(layer);

      if (!options.skipInstall) {
        const runtimeDeps = layer.runtimeDependencies ?? [];
        const devDeps = layer.devDependencies ?? [];
        if (!options.dryRun) {
          if (runtimeDeps.length > 0) {
            await ops.runCommand('npm', ['--workspace', frontendAppPath, 'install', ...runtimeDeps], rootDir);
          }
          if (devDeps.length > 0) {
            await ops.runCommand('npm', ['--workspace', frontendAppPath, 'install', '-D', ...devDeps], rootDir);
          }
        }
      }

      const files = new Map();
      for (const templateDir of layer.templateDirs) {
        const layerFiles = await readTemplateFiles({
          templateDir,
          replacements: layer.replacements,
        });
        for (const [relativePath, content] of layerFiles) {
          files.set(relativePath, content);
        }
      }

      const stats = { created: 0, updated: 0, unchanged: 0 };
      for (const [relativePath, content] of Array.from(files.entries()).sort(([a], [b]) => a.localeCompare(b))) {
        await writeManagedFile({
          absolutePath: path.join(frontendRoot, relativePath),
          relativePath: path.posix.join(frontendAppPath, relativePath),
          content,
          logger,
          stats,
          ops,
        });
      }

      logger.step(
        `Resumo: criados=${stats.created}, atualizados=${stats.updated}, inalterados=${stats.unchanged}.`,
      );
      await logger.success();
      console.log(`${skillName} configured successfully.`);
      console.log(`Frontend: ${frontendAppPath}`);
      console.log(`Theme: ${themeColor}`);
      console.log(`Mode: ${options.mode}`);
    } catch (error) {
      await logger.failure(error);
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  return main;
}
