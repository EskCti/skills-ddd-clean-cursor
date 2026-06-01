#!/usr/bin/env node

/**
 * config-new-module-rs — scaffold Bounded Context module (layered, no redundant namespaces)
 *
 * Usage: node config-new-module-rs/scripts/create-module-rs.mjs <bc-name> [--entity=Customer]
 *   bc-name: kebab or snake plural, e.g. customers
 *   --api-path=crates/api/src/modules  (default)
 */

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const bcArg = argv.find((a) => !a.startsWith('--'));
if (!bcArg) {
  console.error('Usage: create-module-rs.mjs <bc-name> [--entity=EntityName]');
  process.exit(1);
}

const entityArg = argv.find((a) => a.startsWith('--entity='))?.split('=')[1];
const apiPathArg = argv.find((a) => a.startsWith('--api-path='))?.split('=')[1];

const bc = bcArg.replace(/-/g, '_').toLowerCase();
const bcPath = bc.replace(/_/g, '-');
const entity =
  entityArg ||
  bc.replace(/_/g, ' ').replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase()).replace(/\s+\w/g, (m) => m.trim().toUpperCase()) ||
  'Entity';
const entitySnake = entity.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

const root = process.cwd();
const apiModules = path.resolve(root, apiPathArg || 'crates/api/src/modules');
const destDir = path.join(apiModules, bcPath);
const templateDir = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'assets',
  'module-template-rs',
);

const replacements = [
  ['__BC__', bc],
  ['__bc_path__', bcPath],
  ['__Entity__', entity],
  ['__entity_snake__', entitySnake],
];

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function walkCopy(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    let destName = applyReplacements(entry.name);
    if (destName.includes('create_') && destName.endsWith('.rs') && destName.includes('__')) {
      destName = `create_${entitySnake}.rs`;
    }
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      walkCopy(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      content = applyReplacements(content);
      content = content.replace(/create___entity_snake__/g, `create_${entitySnake}`);
      fs.writeFileSync(destPath, content, 'utf-8');
      console.log(`  [created] ${path.relative(root, destPath)}`);
    }
  }
}

if (fs.existsSync(destDir)) {
  console.error(`Module already exists: ${destDir}`);
  process.exit(1);
}

console.log(`\n=== config-new-module-rs ===`);
console.log(`BC: ${bc} → modules/${bcPath}/`);
console.log(`Entity: ${entity}\n`);

fs.mkdirSync(destDir, { recursive: true });
walkCopy(templateDir, destDir);

const modRs = path.join(apiModules, 'mod.rs');
if (fs.existsSync(modRs)) {
  let modContent = fs.readFileSync(modRs, 'utf-8');
  const modLine = `pub mod ${bc};`;
  if (!modContent.includes(modLine)) {
    modContent = modContent.trimEnd() + `\n${modLine}\n`;
    fs.writeFileSync(modRs, modContent, 'utf-8');
    console.log(`  [updated] ${path.relative(root, modRs)}`);
  }
}

console.log('\nNamespace:');
console.log(`  crate::modules::${bc}::domain::${entity}`);
console.log(`  (not ${bc}::domain::${entitySnake}::${entity})\n`);
