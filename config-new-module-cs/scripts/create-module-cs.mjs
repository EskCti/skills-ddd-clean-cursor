#!/usr/bin/env node

/**
 * config-new-module-cs — scaffold a new domain module in C# solution
 *
 * Usage: node config-new-module-cs/scripts/create-module-cs.mjs [options]
 *   --project-name=<name>   Project name (default: Project)
 *   --module-name=<name>    Module name (e.g. Catalog, Billing)
 *   --target=<path>         Target directory (default: cwd)
 */

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; })
);

const projectName = args['project-name'] || 'Project';
const moduleName = args['module-name'];
const target = path.resolve(args['target'] || process.cwd());

if (!moduleName) {
  console.error('Error: --module-name is required');
  console.error('Usage: node create-module-cs.mjs --module-name=Catalog');
  process.exit(1);
}

const coreModuleDir = path.join(target, 'src', `${projectName}.Core`, moduleName);
const infraModuleDir = path.join(target, 'src', `${projectName}.Infrastructure`, moduleName);
const backendModuleDir = path.join(target, 'src', `${projectName}.Backend`, 'Modules', moduleName);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  [created] ${path.relative(target, dir)}/`);
  }
}

function writeIfAbsent(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] ${path.relative(target, filePath)}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  [created] ${path.relative(target, filePath)}`);
}

const ns = `${projectName}.Core.${moduleName}`;

console.log(`\n=== config-new-module-cs ===`);
console.log(`Project: ${projectName}`);
console.log(`Module:  ${moduleName}\n`);

console.log(`--- Core layer ---`);
ensureDir(path.join(coreModuleDir, 'Domain', 'Entities'));
ensureDir(path.join(coreModuleDir, 'Domain', 'ValueObjects'));
ensureDir(path.join(coreModuleDir, 'Domain', 'Repositories'));
ensureDir(path.join(coreModuleDir, 'Application', 'UseCases'));
ensureDir(path.join(coreModuleDir, 'Application', 'DTOs'));
ensureDir(path.join(coreModuleDir, 'Application', 'Queries'));

writeIfAbsent(path.join(coreModuleDir, 'Domain', 'Entities', '.gitkeep'), '');
writeIfAbsent(path.join(coreModuleDir, 'Application', 'UseCases', '.gitkeep'), '');

console.log(`\n--- Infrastructure layer ---`);
ensureDir(path.join(infraModuleDir, 'Persistence', 'Repositories'));
ensureDir(path.join(infraModuleDir, 'Persistence', 'Configurations'));

writeIfAbsent(path.join(infraModuleDir, 'Persistence', 'Repositories', '.gitkeep'), '');

console.log(`\n--- Backend layer ---`);
ensureDir(path.join(backendModuleDir, 'Controllers'));

writeIfAbsent(
  path.join(backendModuleDir, 'Controllers', `${moduleName}Controller.cs`),
  `using Microsoft.AspNetCore.Mvc;

namespace ${projectName}.Backend.Modules.${moduleName}.Controllers;

[ApiController]
[Route("api/${moduleName.toLowerCase()}")]
public class ${moduleName}Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(new { module = "${moduleName}", status = "ok" });
    }
}
`
);

console.log(`\n[done] Module ${moduleName} scaffolded.`);
console.log(`  1. Add entities in Core/${moduleName}/Domain/Entities/`);
console.log(`  2. Add use cases in Core/${moduleName}/Application/UseCases/`);
console.log(`  3. Add EF configs in Infrastructure/${moduleName}/Persistence/Configurations/`);
console.log(`  4. Register DI in Program.cs`);
console.log(`  5. dotnet build\n`);
