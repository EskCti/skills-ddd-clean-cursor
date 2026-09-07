#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(scriptDir, '..', 'assets');

const SAMPLE_FIELD_VALUES = {
  name: 'João Silva',
  email: 'joao@example.com',
  cpf: '12345678901',
  password: 'Str0ng!Pass',
  title: 'Test title',
  description: 'Test description',
};

function usage() {
  console.log(`Usage:
  node create-e2e-spec.mjs <module-name> [options]

Options:
  --root=<path>              Project root (default: cwd)
  --backend-path=<path>      Backend app (default: apps/backend)
  --template=<name>          module-get | crud | feature (default: crud)
  --create-fields=<list>     Comma-separated POST body fields (crud template)
  --assert-field=<field>     Field to assert on GET response (default: first create field)
  --web                      Also create Playwright spec at e2e/<module>.spec.ts
  --module-label=<label>     Label for web tests (default: PascalCase module name)
  --force                    Overwrite existing spec files`);
}

function parseArgs(argv) {
  const options = {
    moduleName: '',
    root: process.cwd(),
    backendPath: 'apps/backend',
    template: 'crud',
    createFields: [],
    assertField: '',
    web: false,
    moduleLabel: '',
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }
    if (arg === '--web') {
      options.web = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      const key = eqIndex >= 0 ? arg.slice(2, eqIndex) : arg.slice(2);
      let value = eqIndex >= 0 ? arg.slice(eqIndex + 1) : argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      if (eqIndex < 0) i += 1;

      switch (key) {
        case 'root':
          options.root = path.resolve(value);
          break;
        case 'backend-path':
          options.backendPath = value.replace(/\\/g, '/');
          break;
        case 'template':
          options.template = value;
          break;
        case 'create-fields':
          options.createFields = value.split(',').map((f) => f.trim()).filter(Boolean);
          break;
        case 'assert-field':
          options.assertField = value.trim();
          break;
        case 'module-label':
          options.moduleLabel = value.trim();
          break;
        default:
          throw new Error(`Unknown option: --${key}`);
      }
      continue;
    }
    if (options.moduleName) throw new Error('Only one module name is allowed.');
    options.moduleName = arg;
  }

  if (!options.moduleName) {
    usage();
    throw new Error('Module name is required.');
  }

  if (!/^[a-z][a-z0-9-]*$/.test(options.moduleName)) {
    throw new Error('Module name must match /^[a-z][a-z0-9-]*$/.');
  }

  if (!['module-get', 'crud', 'feature'].includes(options.template)) {
    throw new Error('Template must be module-get, crud or feature.');
  }

  if (options.template === 'crud' && options.createFields.length === 0) {
    options.createFields = ['name', 'email'];
  }

  return options;
}

function toPascalCase(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function sampleValue(field) {
  if (field in SAMPLE_FIELD_VALUES) return SAMPLE_FIELD_VALUES[field];
  return `test-${field}`;
}

function buildCreatePayload(fields) {
  const entries = fields.map((field) => `    ${field}: '${sampleValue(field)}'`);
  return `{\n${entries.join(',\n')}\n  }`;
}

function buildCreateAssertions(fields, assertField) {
  const field = assertField || fields[0];
  if (!field) return "        expect(res.body).toBeDefined();";
  return `        expect(res.body.${field}).toBe('${sampleValue(field)}');`;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readTemplate(relativePath) {
  return fs.readFile(path.join(assetsDir, relativePath), 'utf8');
}

function applyTemplate(template, replacements) {
  let content = template;
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

async function writeSpec({ filePath, content, force }) {
  if ((await pathExists(filePath)) && !force) {
    return { written: false, path: filePath, reason: 'exists' };
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
  return { written: true, path: filePath };
}

/**
 * @param {object} params
 * @param {string} params.rootDir
 * @param {string} params.moduleName
 * @param {string} [params.backendPath]
 * @param {'module-get'|'crud'|'feature'} [params.template]
 * @param {string[]} [params.createFields]
 * @param {string} [params.assertField]
 * @param {boolean} [params.web]
 * @param {string} [params.moduleLabel]
 * @param {boolean} [params.force]
 * @param {{ log?: (msg: string) => void }} [params.logger]
 */
export async function createE2eSpec({
  rootDir,
  moduleName,
  backendPath = 'apps/backend',
  template = 'crud',
  createFields = ['name', 'email'],
  assertField = '',
  web = false,
  moduleLabel = '',
  force = false,
  logger = { log: console.log },
}) {
  const ModuleName = toPascalCase(moduleName);
  const label = moduleLabel || ModuleName;
  const isFeature = template === 'feature';
  const templateFile = isFeature
    ? null
    : template === 'module-get'
      ? 'templates/module-get.e2e-spec.ts.template'
      : 'templates/crud.e2e-spec.ts.template';

  let apiResult = null;
  if (!isFeature) {
    const apiTemplate = await readTemplate(templateFile);
    const apiContent = applyTemplate(apiTemplate, {
      ModuleName,
      moduleName,
      createPayload: buildCreatePayload(createFields),
      createAssertions: buildCreateAssertions(createFields, assertField),
    });

    const apiPath = path.join(rootDir, backendPath, 'test', `${moduleName}.e2e-spec.ts`);
    apiResult = await writeSpec({ filePath: apiPath, content: apiContent, force });

    if (apiResult.written) {
      logger.log(`Created API E2E spec: ${path.relative(rootDir, apiPath)}`);
    } else {
      logger.log(`Skipped API E2E spec (exists): ${path.relative(rootDir, apiPath)}`);
    }
  }

  const results = { api: apiResult, web: null };

  if (isFeature || web) {
    const webTemplate = await readTemplate('templates/feature.spec.ts.template');
    const webContent = applyTemplate(webTemplate, {
      moduleName,
      moduleLabel: label,
    });
    const webPath = path.join(rootDir, 'e2e', `${moduleName}.spec.ts`);
    results.web = await writeSpec({ filePath: webPath, content: webContent, force });
    if (results.web.written) {
      logger.log(`Created web E2E spec: ${path.relative(rootDir, webPath)}`);
    } else {
      logger.log(`Skipped web E2E spec (exists): ${path.relative(rootDir, webPath)}`);
    }
  }

  return results;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const opts = parseArgs(process.argv.slice(2));
  createE2eSpec({
    rootDir: opts.root,
    moduleName: opts.moduleName,
    backendPath: opts.backendPath,
    template: opts.template,
    createFields: opts.createFields,
    assertField: opts.assertField,
    web: opts.web,
    moduleLabel: opts.moduleLabel,
    force: opts.force,
  })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message || error);
      process.exit(1);
    });
}
