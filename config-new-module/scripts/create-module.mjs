#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNamespace, resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';
import { createE2eSpec } from '../../test-e2e/scripts/create-e2e-spec.mjs';

let activeRunOps = null;

function usage() {
  console.log(`Usage:
  node create-module.mjs <module-name> [--scope @namespace] [--force]

Examples:
  node create-module.mjs billing
  node create-module.mjs classification --scope @namespace
  node create-module.mjs payments --force`);
}

function parseArgs(argv) {
  let moduleName = '';
  let scope = '';
  let force = false;

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

    if (arg === '--scope') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --scope');
      }
      scope = value;
      i += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (moduleName) {
      throw new Error('Only one module name is allowed.');
    }
    moduleName = arg;
  }

  return { moduleName, scope, force };
}

function validateModuleName(name) {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

function toPascalCase(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(name) {
  const pascal = toPascalCase(name);
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : '';
}

function toImportPath(fromDir, toFilePath) {
  const withoutExtension = toPosixPath(path.relative(fromDir, toFilePath).replace(/\.(tsx?|jsx?)$/, ''));
  return withoutExtension.startsWith('.') ? withoutExtension : `./${withoutExtension}`;
}

function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}

const MODULE_MAIN_MENU_LABELS = {
  accounts: 'Contas',
  auth: 'Autenticação',
  autenticacao: 'Autenticação',
  categories: 'Categorias',
  'credit-cards': 'Cartões',
  cartoes: 'Cartões',
  example: 'Exemplos',
  examples: 'Exemplos',
  'finance-hub': 'Hub Financeiro',
  recurring: 'Recorrentes',
  statements: 'Extratos',
  transactions: 'Transações',
  transacoes: 'Transações',
};

const MODULE_MENU_WORD_ACCENT_OVERRIDES = {
  aplicacao: 'Aplicação',
  autenticacao: 'Autenticação',
  cartoes: 'Cartões',
  categorias: 'Categorias',
  configuracoes: 'Configurações',
  conexoes: 'Conexões',
  consolidacao: 'Consolidação',
  conciliacao: 'Conciliação',
  creditos: 'Créditos',
  diagnostico: 'Diagnóstico',
  estagio: 'Estágio',
  extratos: 'Extratos',
  historico: 'Histórico',
  informacoes: 'Informações',
  integracoes: 'Integrações',
  modulo: 'Módulo',
  notificacoes: 'Notificações',
  parametros: 'Parâmetros',
  permissoes: 'Permissões',
  relatorios: 'Relatórios',
  revisao: 'Revisão',
  transacoes: 'Transações',
  usuarios: 'Usuários',
  validacao: 'Validação',
  variacoes: 'Variações',
  visao: 'Visão',
};

const MODULE_MAIN_MENU_ICONS = {
  accounts: 'wallet',
  auth: 'shield-check',
  categories: 'tags',
  'credit-cards': 'credit-card',
  example: 'flask-conical',
  examples: 'flask-conical',
  'finance-hub': 'wallet',
  recurring: 'repeat',
  statements: 'file-text',
  transactions: 'arrow-right-left',
};

const MODULE_MAIN_MENU_ICON_RULES = [
  { icon: 'wallet', keywords: ['account', 'wallet', 'bank', 'balance'] },
  { icon: 'tags', keywords: ['categor', 'tag', 'classif'] },
  { icon: 'credit-card', keywords: ['card', 'credit'] },
  { icon: 'repeat', keywords: ['recurr', 'repeat', 'subscription'] },
  { icon: 'file-text', keywords: ['statement', 'invoice', 'report', 'document'] },
  { icon: 'arrow-right-left', keywords: ['transaction', 'transfer', 'movement', 'payment'] },
  { icon: 'shield-check', keywords: ['auth', 'permission', 'access', 'role', 'security'] },
  { icon: 'flask-conical', keywords: ['example', 'demo', 'sample'] },
];

const LUCIDE_ICON_COMPONENT_BY_MAIN_MENU_ICON = {
  'arrow-right-left': 'ArrowRightLeft',
  boxes: 'Boxes',
  'credit-card': 'CreditCard',
  'file-text': 'FileText',
  'flask-conical': 'FlaskConical',
  repeat: 'Repeat',
  'shield-check': 'Fingerprint',
  tags: 'Tags',
  wallet: 'Wallet',
};

const MODULE_MAIN_MENU_USAGE_BASE_SCORES = {
  accounts: 98,
  transactions: 100,
  'credit-cards': 94,
  recurring: 90,
  categories: 86,
  statements: 82,
  example: 35,
  examples: 35,
  auth: 20,
};

const MODULE_MAIN_MENU_USAGE_RULES = [
  { score: 35, keywords: ['transaction', 'transfer', 'payment', 'movement'] },
  { score: 33, keywords: ['account', 'wallet', 'bank', 'cash', 'balance'] },
  { score: 30, keywords: ['card', 'credit', 'debit'] },
  { score: 27, keywords: ['recurr', 'subscription', 'installment', 'repeat'] },
  { score: 22, keywords: ['categor', 'tag', 'classif', 'budget'] },
  { score: 18, keywords: ['statement', 'report', 'invoice', 'document'] },
  { score: -15, keywords: ['example', 'demo', 'sample'] },
];

const MODULE_MAIN_MENU_ADMIN_IDS = new Set(['auth']);
const MODULE_MAIN_MENU_ADMIN_KEYWORDS = ['auth', 'admin', 'permission', 'role', 'security', 'access', 'user'];

function normalizeSemanticText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hasSomeKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function toTitleCaseFromKebab(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => {
      const normalizedPart = part.toLowerCase();
      if (MODULE_MENU_WORD_ACCENT_OVERRIDES[normalizedPart]) {
        return MODULE_MENU_WORD_ACCENT_OVERRIDES[normalizedPart];
      }
      return normalizedPart.charAt(0).toUpperCase() + normalizedPart.slice(1);
    })
    .join(' ');
}

function resolveMainMenuLabel(moduleName) {
  return MODULE_MAIN_MENU_LABELS[moduleName] || toTitleCaseFromKebab(moduleName);
}

function resolveMainMenuIcon(moduleName) {
  if (MODULE_MAIN_MENU_ICONS[moduleName]) {
    return MODULE_MAIN_MENU_ICONS[moduleName];
  }

  const normalizedName = moduleName.toLowerCase();
  for (const rule of MODULE_MAIN_MENU_ICON_RULES) {
    if (rule.keywords.some((keyword) => normalizedName.includes(keyword))) {
      return rule.icon;
    }
  }

  return 'boxes';
}

function resolveMainMenuLucideIcon(moduleName) {
  const menuIcon = resolveMainMenuIcon(moduleName);
  return LUCIDE_ICON_COMPONENT_BY_MAIN_MENU_ICON[menuIcon] || 'Boxes';
}

function normalizeMainMenuItem(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const id = typeof entry.id === 'string' ? entry.id.trim() : '';
  const href = typeof entry.href === 'string' ? entry.href.trim() : '';
  const label = typeof entry.label === 'string' ? entry.label.trim() : '';
  const icon = typeof entry.icon === 'string' ? entry.icon.trim() : '';

  if (!id || !href || !label || !icon) {
    return null;
  }

  const normalized = { id, href, label, icon };
  if (typeof entry.adminOnly === 'boolean') {
    normalized.adminOnly = entry.adminOnly;
  }

  return normalized;
}

function analyzeMainMenuItem(item) {
  const semanticText = normalizeSemanticText(`${item.id} ${item.href} ${item.label} ${item.icon}`);
  const hasBaseScore = Object.hasOwn(MODULE_MAIN_MENU_USAGE_BASE_SCORES, item.id);
  let usageScore = hasBaseScore ? MODULE_MAIN_MENU_USAGE_BASE_SCORES[item.id] : 50;

  for (const rule of MODULE_MAIN_MENU_USAGE_RULES) {
    if (hasSomeKeyword(semanticText, rule.keywords)) {
      usageScore += rule.score;
    }
  }

  const inferredAdmin = MODULE_MAIN_MENU_ADMIN_IDS.has(item.id) || hasSomeKeyword(semanticText, MODULE_MAIN_MENU_ADMIN_KEYWORDS);
  const isAdmin = item.adminOnly === true || inferredAdmin;

  if (isAdmin) {
    usageScore -= 40;
  }

  return { isAdmin, usageScore };
}

function compareMainMenuItems(a, b) {
  const aAnalysis = analyzeMainMenuItem(a);
  const bAnalysis = analyzeMainMenuItem(b);

  if (aAnalysis.isAdmin !== bAnalysis.isAdmin) {
    return aAnalysis.isAdmin ? 1 : -1;
  }

  if (aAnalysis.usageScore !== bAnalysis.usageScore) {
    return bAnalysis.usageScore - aAnalysis.usageScore;
  }

  const labelComparison = a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' });
  if (labelComparison !== 0) return labelComparison;
  const hrefComparison = a.href.localeCompare(b.href, 'en', { sensitivity: 'base' });
  if (hrefComparison !== 0) return hrefComparison;
  return a.id.localeCompare(b.id, 'en', { sensitivity: 'base' });
}

function parseDashboardLayoutMenuItems(moduleItemsBlock) {
  const items = [];
  const itemRegex = /\{[\s\S]*?\}/g;
  const matches = moduleItemsBlock.match(itemRegex) || [];

  for (const rawItem of matches) {
    const idMatch = rawItem.match(/id:\s*['"]([^'"]+)['"]/);
    const labelMatch = rawItem.match(/label:\s*['"]([^'"]+)['"]/);
    const hrefMatch = rawItem.match(/href:\s*['"]([^'"]+)['"]/);
    const iconMatch = rawItem.match(/icon:\s*([A-Za-z0-9_]+)/);

    const normalized = normalizeMainMenuItem({
      id: idMatch?.[1] || '',
      label: labelMatch?.[1] || '',
      href: hrefMatch?.[1] || '',
      icon: iconMatch?.[1] || '',
    });

    if (normalized) {
      items.push(normalized);
    }
  }

  return items;
}

function renderDashboardLayoutMenuItems(items) {
  return items
    .map(
      (item) => `  {
    id: '${item.id}',
    label: '${item.label}',
    href: '${item.href}',
    icon: ${item.icon},
  },`,
    )
    .join('\n');
}

function parseLucideImportSpecifiers(importSpecifiersRaw) {
  return importSpecifiersRaw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

async function ensureFrontendDashboardLayoutMenuEntry({ dashboardLayoutPath, moduleName, logger }) {
  if (!(await pathExists(dashboardLayoutPath))) {
    throw new Error(`Missing dashboard layout file for menu registration: ${dashboardLayoutPath}`);
  }

  const expectedHref = `/${moduleName}`;
  const nextItem = {
    id: moduleName,
    label: resolveMainMenuLabel(moduleName),
    href: expectedHref,
    icon: resolveMainMenuLucideIcon(moduleName),
  };

  const source = await fs.readFile(dashboardLayoutPath, 'utf8');
  const moduleItemsRegex = /const\s+moduleItems:\s*SidebarMenuItem\[]\s*=\s*\[([\s\S]*?)\];/m;
  const moduleItemsMatch = source.match(moduleItemsRegex);
  if (!moduleItemsMatch) {
    throw new Error(`Unable to locate moduleItems list in dashboard layout: ${dashboardLayoutPath}`);
  }

  const parsedItems = parseDashboardLayoutMenuItems(moduleItemsMatch[1]);
  const existing = parsedItems.find((item) => item.id === moduleName || item.href === expectedHref);
  const nextItemAnalysis = analyzeMainMenuItem(nextItem);
  logger.ai(`heuristica de ordenacao de menu aplicada para o modulo ${moduleName}`);
  if (existing?.adminOnly === true || moduleName === 'auth' || nextItemAnalysis.isAdmin) {
    nextItem.adminOnly = true;
  }

  const keptItems = parsedItems.filter((item) => item.id !== moduleName && item.href !== expectedHref);
  const nextItems = [...keptItems, nextItem].sort(compareMainMenuItems);
  const renderedItems = renderDashboardLayoutMenuItems(nextItems);
  let updated = source.replace(moduleItemsRegex, `const moduleItems: SidebarMenuItem[] = [\n${renderedItems}\n];`);

  const requiredIcons = new Set(nextItems.map((item) => item.icon).filter(Boolean));
  const lucideImportRegex = /import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"];/m;
  const lucideImportMatch = updated.match(lucideImportRegex);

  if (!lucideImportMatch) {
    throw new Error(`Unable to locate lucide-react import in dashboard layout: ${dashboardLayoutPath}`);
  }

  const currentImports = new Set(parseLucideImportSpecifiers(lucideImportMatch[1]));
  for (const iconName of requiredIcons) {
    currentImports.add(iconName);
  }
  currentImports.add('LayoutDashboard');
  const nextImportLine = `import { ${Array.from(currentImports).sort((a, b) => a.localeCompare(b)).join(', ')} } from 'lucide-react';`;
  updated = updated.replace(lucideImportRegex, nextImportLine);

  if (updated === source) {
    logger.step(`Menu principal já estava atualizado em ${dashboardLayoutPath}`);
    return;
  }

  await writeFile(dashboardLayoutPath, updated);
  logger.step(`Menu principal atualizado no layout do dashboard com o módulo ${moduleName}: ${dashboardLayoutPath}`);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureTargetPathAvailability({ targetPath, force, logger, label }) {
  if (!(await pathExists(targetPath))) return;
  if (!force) {
    throw new Error(`Directory already exists: ${targetPath}. Use --force to overwrite.`);
  }
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.removePath(targetPath, { recursive: true, force: true, markRisk: true });
  logger.step(`${label} existente removido com --force: ${targetPath}.`);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeFile(filePath, content) {
  if (!activeRunOps) {
    throw new Error('Run operations are not initialized.');
  }
  await activeRunOps.writeTextFile(filePath, content, {
    ensureNewline: false,
    markRiskOnOverwrite: true,
  });
}

function stringifyJson(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

async function ensurePackageDependency({ packageJsonPath, dependencyName, dependencyVersion, logger, label }) {
  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`Missing package.json file: ${packageJsonPath}`);
  }

  const packageJson = await readJson(packageJsonPath);
  const dependencies =
    packageJson.dependencies && typeof packageJson.dependencies === 'object' ? packageJson.dependencies : {};
  const currentVersion = dependencies[dependencyName];
  if (currentVersion === dependencyVersion) {
    return false;
  }

  dependencies[dependencyName] = dependencyVersion;
  packageJson.dependencies = dependencies;
  await writeFile(packageJsonPath, stringifyJson(packageJson));
  logger.step(`${label} atualizado com dependência ${dependencyName}@${dependencyVersion}: ${packageJsonPath}`);
  return true;
}

async function ensureBackendModuleImportedInAppModule({ appModulePath, moduleName, moduleClassName, logger }) {
  if (!(await pathExists(appModulePath))) {
    throw new Error(`Missing backend app module file: ${appModulePath}`);
  }

  const importPath = `./modules/${moduleName}/${moduleName}.module`;
  const importLine = `import { ${moduleClassName}Module } from '${importPath}';`;
  let content = await fs.readFile(appModulePath, 'utf8');
  let updated = content;

  const hasImport = updated.includes(`from '${importPath}'`) || updated.includes(`from "${importPath}"`);
  if (!hasImport) {
    const importBlockMatch = updated.match(/^(import[^\n]*\n)+/m);
    if (importBlockMatch) {
      updated = `${importBlockMatch[0]}${importLine}\n${updated.slice(importBlockMatch[0].length)}`;
    } else {
      updated = `${importLine}\n${updated}`;
    }
  }

  const importsArrayRegex = /imports:\s*\[([\s\S]*?)\],/m;
  const importsArrayMatch = updated.match(importsArrayRegex);
  if (importsArrayMatch && !new RegExp(`\\b${moduleClassName}Module\\b`).test(importsArrayMatch[1])) {
    const inner = importsArrayMatch[1];
    const replacement =
      inner.trim().length === 0 ? `\n    ${moduleClassName}Module,\n  ` : `\n    ${moduleClassName}Module,${inner}`;
    updated = updated.replace(importsArrayRegex, `imports: [${replacement}],`);
  }

  if (updated !== content) {
    if (!activeRunOps) {
      throw new Error('Run operations are not initialized.');
    }
    await activeRunOps.writeTextFile(appModulePath, updated, {
      ensureNewline: false,
      note: `${moduleName}.module import`,
      markRiskOnOverwrite: true,
    });
    logger.step(`arquivo atualizado: ${appModulePath}`);
  }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, '../../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-new-module',
    commandArgs: process.argv.slice(2),
  });

  try {
    activeRunOps = createSkillRunOps({
      rootDir,
      logger,
      dryRun: false,
    });
    const { moduleName, scope: scopeArg, force } = parseArgs(process.argv.slice(2));

    if (!moduleName) {
      usage();
      logger.step('Comando sem nome de módulo. Encerrado após exibir help.');
      await logger.success();
      process.exit(1);
    }

    if (!validateModuleName(moduleName)) {
      throw new Error(`Invalid module name '${moduleName}'. Use lowercase letters, numbers and hyphens.`);
    }

    logger.step(`Nome do módulo validado: ${moduleName}.`);

    const { packagesDir, sharedModule, sharedPackageJsonPath, config } = await resolveSkillPaths(rootDir);
    const targetDir = path.join(packagesDir, moduleName);
    const backendAppPath = config.defaults.backendAppPath;
    const frontendAppPath = config.defaults.frontendAppPath;
    const frontendSrcDir = path.join(rootDir, frontendAppPath, 'src');
    const hasFrontendSrcDir = await pathExists(frontendSrcDir);
    const frontendModulesBaseSegments = hasFrontendSrcDir ? ['src', 'modules'] : ['modules'];
    const frontendAppBaseSegments = hasFrontendSrcDir ? ['src', 'app'] : ['app'];
    const frontendSharedBaseSegments = hasFrontendSrcDir ? ['src', 'shared'] : ['shared'];
    const frontendModulesBaseDir = path.join(rootDir, frontendAppPath, ...frontendModulesBaseSegments);
    const frontendEmptyDashboardStatePath = path.join(
      rootDir,
      frontendAppPath,
      ...frontendSharedBaseSegments,
      'components',
      'ui',
      'empty-dashboard-state.tsx',
    );
    const frontendAppBaseDir = path.join(rootDir, frontendAppPath, ...frontendAppBaseSegments);
    const frontendPrivateGroupDir = path.join(frontendAppBaseDir, '(private)');
    const hasFrontendPrivateGroup = await pathExists(frontendPrivateGroupDir);
    const backendModuleDir = path.join(rootDir, backendAppPath, 'src', 'modules', moduleName);
    const frontendModuleDir = path.join(frontendModulesBaseDir, moduleName);
    const frontendRouteDir = path.join(
      hasFrontendPrivateGroup ? frontendPrivateGroupDir : frontendAppBaseDir,
      moduleName,
    );
    const backendPrismaModelPath = path.join(rootDir, backendAppPath, 'prisma', 'models', `${moduleName}.model.prisma`);
    const backendAppModulePath = path.join(rootDir, backendAppPath, 'src', 'app.module.ts');
    const backendPackageJsonPath = path.join(rootDir, backendAppPath, 'package.json');
    const frontendPackageJsonPath = path.join(rootDir, frontendAppPath, 'package.json');
    const frontendDashboardLayoutCandidates = [
      path.join(hasFrontendPrivateGroup ? frontendPrivateGroupDir : frontendAppBaseDir, 'dashboard', 'layout.tsx'),
      path.join(frontendAppBaseDir, 'dashboard', 'layout.tsx'),
    ];
    let frontendDashboardLayoutPath = frontendDashboardLayoutCandidates[0];
    for (const candidate of frontendDashboardLayoutCandidates) {
      if (await pathExists(candidate)) {
        frontendDashboardLayoutPath = candidate;
        break;
      }
    }

    let sharedScopeFromPackage = '';
    try {
      const sharedPkg = await readJson(sharedPackageJsonPath);
      const sharedName = sharedPkg?.name;
      if (typeof sharedName === 'string' && sharedName.includes('/')) {
        sharedScopeFromPackage = sharedName.split('/')[0];
      }
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw new Error(`Invalid shared package file at ${sharedPackageJsonPath}: ${error.message}`);
      }
    }

    const { scope } = await resolveNamespace({
      rootDir,
      cliScope: scopeArg,
      fallbackScope: sharedScopeFromPackage,
    });
    logger.step(`Namespace resolvido: ${scope}.`);

    const packageName = `${scope}/${moduleName}`;
    const sharedDependency = `${scope}/${sharedModule}`;
    const workspaceTsConfigBasePath = path.join(packagesDir, 'config', 'typescript-config', 'base.json');
    const legacyWorkspaceTsConfigBasePath = path.join(packagesDir, 'typescript-config', 'base.json');
    const fallbackTsConfigBasePath = path.join(rootDir, 'packages', 'config', 'typescript-config', 'base.json');
    const legacyFallbackTsConfigBasePath = path.join(rootDir, 'packages', 'typescript-config', 'base.json');
    let tsConfigBasePath = fallbackTsConfigBasePath;
    if (await pathExists(workspaceTsConfigBasePath)) {
      tsConfigBasePath = workspaceTsConfigBasePath;
    } else if (await pathExists(legacyWorkspaceTsConfigBasePath)) {
      tsConfigBasePath = legacyWorkspaceTsConfigBasePath;
    } else if (await pathExists(legacyFallbackTsConfigBasePath)) {
      tsConfigBasePath = legacyFallbackTsConfigBasePath;
    }
    const tsConfigExtendsPath = toPosixPath(path.relative(targetDir, tsConfigBasePath));
    const moduleClassName = toPascalCase(moduleName);
    const backendControllerClassName = `${moduleClassName}Controller`;
    const backendPrismaClassName = `${moduleClassName}Prisma`;
    const backendModuleClassName = `${moduleClassName}Module`;
    const frontendDashboardComponentName = `${moduleClassName}DashboardComponent`;
    const frontendDashboardComponentFileName = `${moduleName}-dashboard.component.tsx`;
    const frontendDashboardPageName = 'DashboardPage';
    const frontendDashboardPageFileName = 'dashboard.page.tsx';
    const frontendModuleLayoutName = `${moduleClassName}ModuleLayout`;
    const frontendModuleMenuItemsName = `${toCamelCase(moduleName)}MenuItems`;
    const frontendModuleSidebarMenuName = `${moduleClassName}SidebarMenu`;
    const frontendDashboardModuleName = resolveMainMenuLabel(moduleName);
    const hasFrontendEmptyDashboardState = await pathExists(frontendEmptyDashboardStatePath);

    await ensureTargetPathAvailability({
      targetPath: targetDir,
      force,
      logger,
      label: 'Diretório do package',
    });
    await ensureTargetPathAvailability({
      targetPath: backendModuleDir,
      force,
      logger,
      label: 'Diretório do módulo backend',
    });
    await ensureTargetPathAvailability({
      targetPath: frontendModuleDir,
      force,
      logger,
      label: 'Diretório do módulo frontend',
    });
    await ensureTargetPathAvailability({
      targetPath: frontendRouteDir,
      force,
      logger,
      label: 'Diretório da rota frontend',
    });

    const packageJson = {
      name: packageName,
      version: '0.1.0',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.js',
          require: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
      scripts: {
        dev: 'tsc --watch',
        build: 'tsc',
        test: 'jest --coverage',
        'test:watch': 'jest --watchAll',
      },
      dependencies: {
        [sharedDependency]: '*',
      },
      devDependencies: {
        '@types/jest': '^30.0.0',
        jest: '^30.2.0',
        'ts-jest': '^29.4.5',
      },
    };

    const tsconfigJson = {
      extends: tsConfigExtendsPath,
      compilerOptions: {
        rootDir: 'src',
        outDir: './dist',
        declaration: true,
      },
      include: ['src'],
      exclude: ['dist', 'build', 'node_modules'],
    };

    const jestConfig = `import type { Config } from "jest";

const COVERAGE_MIN = 95;

const config: Config = {
\tverbose: true,
\tpreset: "ts-jest",
\ttestMatch: ["**/test/**/*.test.ts"],
\tcollectCoverage: true,
\tcollectCoverageFrom: [
\t\t"src/**/*.ts",
\t\t"!src/**/index.ts",
\t],
\tcoveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/test/"],
\tcoverageThreshold: {
\t\tglobal: {
\t\t\tlines: COVERAGE_MIN,
\t\t\tbranches: COVERAGE_MIN,
\t\t\tfunctions: COVERAGE_MIN,
\t\t\tstatements: COVERAGE_MIN,
\t\t},
\t},
};

export default config;
`;

    const indexTs = `export function getModuleName(): string {
  return "${moduleName}";
}
`;

    const indexTest = `import { getModuleName } from "../src";

describe("getModuleName", () => {
  it("returns module name", () => {
    expect(getModuleName()).toBe("${moduleName}");
  });
});
`;
    const backendControllerTs = `import { Controller, Get } from '@nestjs/common';

@Controller('${moduleName}')
export class ${backendControllerClassName} {
  @Get()
  getExample() {
    return {
      module: '${moduleName}',
      message: '${moduleName} endpoint is working',
    };
  }
}
`;
    const backendPrismaTs = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class ${backendPrismaClassName} {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma.client;
  }
}
`;
    const backendModuleTs = `import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { ${backendControllerClassName} } from './${moduleName}.controller';
import { ${backendPrismaClassName} } from './${moduleName}.prisma';

@Module({
  imports: [DbModule],
  controllers: [${backendControllerClassName}],
  providers: [${backendPrismaClassName}],
  exports: [${backendPrismaClassName}],
})
export class ${backendModuleClassName} {}
`;
    const backendPrismaModel = `// Prisma models for module: ${moduleName}
// Add concrete models for this module below.
`;
    if (hasFrontendEmptyDashboardState) {
      logger.step(`Componente base detectado para dashboard vazio: ${frontendEmptyDashboardStatePath}.`);
    } else {
      logger.step(
        `Componente base de dashboard vazio nao encontrado (${frontendEmptyDashboardStatePath}); aplicando fallback local para evitar erro de compilacao.`,
      );
    }

    const frontendDashboardComponentTsx = hasFrontendEmptyDashboardState
      ? `import { EmptyDashboardState } from '@/shared/components/ui/empty-dashboard-state';

export function ${frontendDashboardComponentName}() {
  return <EmptyDashboardState moduleName="${frontendDashboardModuleName}" />;
}
`
      : `export function ${frontendDashboardComponentName}() {
  return (
    <section className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">${moduleClassName} Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Estrutura inicial do módulo ${moduleName}.
      </p>
    </section>
  );
}
`;
    const frontendDashboardPageTsx = `import { ${frontendDashboardComponentName} } from "../components/${moduleName}-dashboard.component";

export function ${frontendDashboardPageName}() {
  return <${frontendDashboardComponentName} />;
}
`;
    const frontendModuleLayoutTsx = `'use client';

import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { PrivateAppShell } from '@/modules/auth/template/private-app-shell.component';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';

const ${frontendModuleMenuItemsName}: SidebarMenuItem[] = [
  {
    id: 'overview',
    label: 'Visão Geral ${frontendDashboardModuleName}',
    href: '/${moduleName}',
    icon: LayoutDashboard,
    match: 'exact',
  },
];

function ${frontendModuleSidebarMenuName}() {
  return (
    <SidebarMenu
      mainItem={{
        id: 'back',
        label: 'Voltar',
        href: '/dashboard',
        icon: ArrowLeft,
      }}
      sections={[
        {
          id: '${moduleName}',
          label: '${frontendDashboardModuleName}',
          items: ${frontendModuleMenuItemsName},
        },
      ]}
    />
  );
}

export default function ${frontendModuleLayoutName}({ children }: { children: React.ReactNode }) {
  return <PrivateAppShell sidebar={<${frontendModuleSidebarMenuName} />}>{children}</PrivateAppShell>;
}
`;
    const frontendModuleIndexPath = path.join(frontendModuleDir, 'index.ts');
    const backendPrismaPath = path.join(backendModuleDir, `${moduleName}.prisma.ts`);
    const backendControllerPath = path.join(backendModuleDir, `${moduleName}.controller.ts`);
    const backendModulePath = path.join(backendModuleDir, `${moduleName}.module.ts`);
    const backendModuleIndexPath = path.join(backendModuleDir, 'index.ts');
    const frontendDashboardComponentPath = path.join(
      frontendModuleDir,
      'components',
      frontendDashboardComponentFileName,
    );
    const frontendDashboardPagePath = path.join(frontendModuleDir, 'pages', frontendDashboardPageFileName);
    const frontendAppRoutePagePath = path.join(frontendRouteDir, 'page.tsx');
    const frontendAppRouteLayoutPath = path.join(frontendRouteDir, 'layout.tsx');
    const frontendDashboardPageImportPath = toImportPath(frontendRouteDir, frontendDashboardPagePath);
    const frontendAppRoutePageTsx = `import { ${frontendDashboardPageName} } from "${frontendDashboardPageImportPath}";

export default function Page() {
  return <${frontendDashboardPageName} />;
}
`;
    const frontendModuleIndexTs = `export * from "./components/${moduleName}-dashboard.component";
export * from "./pages/dashboard.page";
`;
    const backendModuleIndexTs = `export * from "./${moduleName}.module";
`;

    await activeRunOps.ensureDir(path.join(targetDir, 'src'), {
      note: 'estrutura base de pacote',
    });
    await activeRunOps.ensureDir(path.join(targetDir, 'test'), {
      note: 'estrutura base de pacote',
    });

    await writeFile(path.join(targetDir, 'package.json'), stringifyJson(packageJson));
    logger.step(`criou arquivo: ${path.join(targetDir, 'package.json')}`);
    await writeFile(path.join(targetDir, 'tsconfig.json'), stringifyJson(tsconfigJson));
    logger.step(`criou arquivo: ${path.join(targetDir, 'tsconfig.json')}`);
    await writeFile(path.join(targetDir, 'jest.config.ts'), jestConfig);
    logger.step(`criou arquivo: ${path.join(targetDir, 'jest.config.ts')}`);
    await writeFile(path.join(targetDir, 'src', 'index.ts'), indexTs);
    logger.step(`criou arquivo: ${path.join(targetDir, 'src', 'index.ts')}`);
    await writeFile(path.join(targetDir, 'test', 'index.test.ts'), indexTest);
    logger.step(`criou arquivo: ${path.join(targetDir, 'test', 'index.test.ts')}`);
    logger.step(`Estrutura base criada em ${targetDir}.`);
    logger.step(`Dependência compartilhada configurada: ${sharedDependency}.`);

    await writeFile(backendControllerPath, backendControllerTs);
    logger.step(`criou arquivo: ${backendControllerPath}`);
    await writeFile(backendPrismaPath, backendPrismaTs);
    logger.step(`criou arquivo: ${backendPrismaPath}`);
    await writeFile(backendModulePath, backendModuleTs);
    logger.step(`criou arquivo: ${backendModulePath}`);
    await writeFile(backendModuleIndexPath, backendModuleIndexTs);
    logger.step(`criou arquivo: ${backendModuleIndexPath}`);
    await writeFile(backendPrismaModelPath, backendPrismaModel);
    logger.step(`criou arquivo: ${backendPrismaModelPath}`);
    await ensureBackendModuleImportedInAppModule({
      appModulePath: backendAppModulePath,
      moduleName,
      moduleClassName,
      logger,
    });
    logger.step(`Estrutura backend criada em ${backendModuleDir}.`);

    await writeFile(frontendDashboardComponentPath, frontendDashboardComponentTsx);
    logger.step(`criou arquivo: ${frontendDashboardComponentPath}`);
    await writeFile(frontendDashboardPagePath, frontendDashboardPageTsx);
    logger.step(`criou arquivo: ${frontendDashboardPagePath}`);
    await writeFile(frontendModuleIndexPath, frontendModuleIndexTs);
    logger.step(`criou arquivo: ${frontendModuleIndexPath}`);
    await writeFile(frontendAppRoutePagePath, frontendAppRoutePageTsx);
    logger.step(`criou arquivo: ${frontendAppRoutePagePath}`);
    await writeFile(frontendAppRouteLayoutPath, frontendModuleLayoutTsx);
    logger.step(`criou arquivo: ${frontendAppRouteLayoutPath}`);
    await ensureFrontendDashboardLayoutMenuEntry({
      dashboardLayoutPath: frontendDashboardLayoutPath,
      moduleName,
      logger,
    });
    logger.step(`Estrutura frontend criada em ${frontendModuleDir}.`);

    await ensurePackageDependency({
      packageJsonPath: backendPackageJsonPath,
      dependencyName: packageName,
      dependencyVersion: '*',
      logger,
      label: 'Backend package',
    });
    await ensurePackageDependency({
      packageJsonPath: frontendPackageJsonPath,
      dependencyName: packageName,
      dependencyVersion: '*',
      logger,
      label: 'Frontend package',
    });

    await createE2eSpec({
      rootDir,
      moduleName,
      backendPath: backendAppPath,
      template: 'module-get',
      web: true,
      moduleLabel: frontendDashboardModuleName,
      logger: {
        log: (message) => {
          console.log(message);
          logger.step(message);
        },
      },
    });

    console.log(`Created module at: ${targetDir}`);
    console.log(`Package name: ${packageName}`);
    console.log(`Backend module scaffolded at: ${path.join(backendAppPath, 'src', 'modules', moduleName)}`);
    console.log(
      `Frontend module scaffolded at: ${path.join(frontendAppPath, ...frontendModulesBaseSegments, moduleName)}`,
    );
    console.log(
      `Frontend route scaffolded at: ${path.join(frontendAppPath, ...frontendAppBaseSegments, hasFrontendPrivateGroup ? '(private)' : '', moduleName)}`,
    );
    console.log(`Backend/frontend dependencies updated with: ${packageName}@*`);
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
