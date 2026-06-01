#!/usr/bin/env node

/**
 * config-new-module-java — scaffold Bounded Context (layered, no redundant namespaces)
 *
 * Usage: node config-new-module-java/scripts/create-module-java.mjs <bc-name> [options]
 *   bc-name: kebab plural, e.g. customers
 *   --entity=Customer       Entity class name (default: inferred from bc)
 *   --group=com.example     Maven group (default: com.example)
 *   --backend-path=apps/backend-java
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const bcArg = argv.find((a) => !a.startsWith('--'));
if (!bcArg) {
  console.error('Usage: create-module-java.mjs <bc-name> [--entity=Customer] [--group=com.example]');
  process.exit(1);
}

const entityArg = argv.find((a) => a.startsWith('--entity='))?.split('=')[1];
const group = argv.find((a) => a.startsWith('--group='))?.split('=')[1] || 'com.example';
const backendPathArg = argv.find((a) => a.startsWith('--backend-path='))?.split('=')[1] || 'apps/backend-java';

const bc = bcArg.replace(/-/g, '').toLowerCase() === bcArg.replace(/-/g, '')
  ? bcArg.toLowerCase()
  : bcArg.toLowerCase().replace(/-/g, '');
const bcPath = bcArg.toLowerCase().replace(/_/g, '-');

const entity =
  entityArg ||
  bc.replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase()) ||
  'Entity';
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);

const root = process.cwd();
const packagesDest = path.join(root, 'packages', bcPath);
const backendModules = path.resolve(root, backendPathArg, 'src/main/java', group.replace(/\./g, '/'), 'modules', bcPath);
const templateDir = path.resolve(__dirname, '..', 'assets', 'module-template-java');

const replacements = [
  ['__GROUP__', group],
  ['__BC__', bc],
  ['__Entity__', entity],
  ['__entity__', entityCamel],
];

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyPathReplacements(name) {
  return applyReplacements(name);
}

function walkCopy(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destName = applyPathReplacements(entry.name);
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      walkCopy(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      content = applyReplacements(content);
      fs.writeFileSync(destPath, content, 'utf-8');
      console.log(`  [created] ${path.relative(root, destPath)}`);
    }
  }
}

if (fs.existsSync(packagesDest)) {
  console.error(`Module already exists: ${packagesDest}`);
  process.exit(1);
}

console.log(`\n=== config-new-module-java ===`);
console.log(`BC: ${bc} → packages/${bcPath}/`);
console.log(`Entity: ${entity}\n`);

// Copy packages template
const packagesTemplate = path.join(templateDir, 'packages', '__BC__');
fs.mkdirSync(packagesDest, { recursive: true });
walkCopy(packagesTemplate, packagesDest);

// Copy backend template
const backendTemplate = path.join(templateDir, 'backend', 'modules', '__BC__');
fs.mkdirSync(backendModules, { recursive: true });
walkCopy(backendTemplate, backendModules);

// Update settings.gradle
const settingsPath = path.join(root, 'settings.gradle');
if (fs.existsSync(settingsPath)) {
  let settings = fs.readFileSync(settingsPath, 'utf-8');
  const includeLine = `include 'packages:${bcPath.replace(/\//g, ':')}'`;
  if (!settings.includes(includeLine)) {
    settings = settings.trimEnd() + `\n${includeLine}\n`;
    fs.writeFileSync(settingsPath, settings, 'utf-8');
    console.log(`  [updated] settings.gradle`);
  }
}

// Wire backend dependency
const backendGradle = path.join(root, backendPathArg, 'build.gradle');
if (fs.existsSync(backendGradle)) {
  let gradle = fs.readFileSync(backendGradle, 'utf-8');
  const dep = `    implementation project(':packages:${bcPath.replace(/\//g, ':')}')`;
  if (!gradle.includes(dep)) {
    gradle = gradle.replace(
      /dependencies\s*\{/,
      `dependencies {\n${dep}`,
    );
    fs.writeFileSync(backendGradle, gradle, 'utf-8');
    console.log(`  [updated] ${path.relative(root, backendGradle)}`);
  }
}

console.log('\nNamespace:');
console.log(`  ${group}.${bc}.domain.entity.${entity}`);
console.log(`  ${group}.modules.${bc}.infrastructure.persistence.${entity}JpaEntity`);
console.log(`  (not ${bc}.domain.entity.${entityCamel}.${entity}Entity)\n`);
