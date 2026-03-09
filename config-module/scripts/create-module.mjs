#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveNamespace,
  resolveSkillPaths,
} from "../../utils/resolve-skill-config.mjs";
import { createSkillRunLogger } from "../../utils/skill-run-log.mjs";

function usage() {
  console.log(`Usage:
  node create-module.mjs <module-name> [--scope @namespace] [--force]

Examples:
  node create-module.mjs billing
  node create-module.mjs classification --scope @polpig
  node create-module.mjs payments --force`);
}

function parseArgs(argv) {
  let moduleName = "";
  let scope = "";
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }

    if (arg === "--force") {
      force = true;
      continue;
    }

    if (arg === "--scope") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --scope");
      }
      scope = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (moduleName) {
      throw new Error("Only one module name is allowed.");
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
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureTargetPathAvailability({
  targetPath,
  force,
  logger,
  label,
}) {
  if (!(await pathExists(targetPath))) return;
  if (!force) {
    throw new Error(`Directory already exists: ${targetPath}. Use --force to overwrite.`);
  }
  await fs.rm(targetPath, { recursive: true, force: true });
  logger.step(`${label} existente removido com --force: ${targetPath}.`);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function stringifyJson(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

async function ensurePackageDependency({
  packageJsonPath,
  dependencyName,
  dependencyVersion,
  logger,
  label,
}) {
  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`Missing package.json file: ${packageJsonPath}`);
  }

  const packageJson = await readJson(packageJsonPath);
  const dependencies = packageJson.dependencies && typeof packageJson.dependencies === "object"
    ? packageJson.dependencies
    : {};
  const currentVersion = dependencies[dependencyName];
  if (currentVersion === dependencyVersion) {
    return false;
  }

  dependencies[dependencyName] = dependencyVersion;
  packageJson.dependencies = dependencies;
  await writeFile(packageJsonPath, stringifyJson(packageJson));
  logger.step(
    `${label} atualizado com dependência ${dependencyName}@${dependencyVersion}: ${packageJsonPath}`,
  );
  return true;
}

async function ensureBackendModuleImportedInAppModule({
  appModulePath,
  moduleName,
  moduleClassName,
  logger,
}) {
  if (!(await pathExists(appModulePath))) {
    throw new Error(`Missing backend app module file: ${appModulePath}`);
  }

  const importPath = `./modules/${moduleName}/${moduleName}.module`;
  const importLine = `import { ${moduleClassName}Module } from '${importPath}';`;
  let content = await fs.readFile(appModulePath, "utf8");
  let updated = content;

  const hasImport =
    updated.includes(`from '${importPath}'`) ||
    updated.includes(`from "${importPath}"`);
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
    const replacement = inner.trim().length === 0
      ? `\n    ${moduleClassName}Module,\n  `
      : `\n    ${moduleClassName}Module,${inner}`;
    updated = updated.replace(importsArrayRegex, `imports: [${replacement}],`);
  }

  if (updated !== content) {
    await fs.writeFile(appModulePath, updated, "utf8");
    logger.step(`arquivo atualizado: ${appModulePath}`);
  }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, "../../../..");
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: "config-module",
    commandArgs: process.argv.slice(2),
  });

  try {
    const {
      moduleName,
      scope: scopeArg,
      force,
    } = parseArgs(process.argv.slice(2));

    if (!moduleName) {
      usage();
      logger.step("Comando sem nome de módulo. Encerrado após exibir help.");
      await logger.success();
      process.exit(1);
    }

    if (!validateModuleName(moduleName)) {
      throw new Error(
        `Invalid module name '${moduleName}'. Use lowercase letters, numbers and hyphens.`,
      );
    }

    logger.step(`Nome do módulo validado: ${moduleName}.`);

    const { packagesDir, sharedModule, sharedPackageJsonPath, config } =
      await resolveSkillPaths(rootDir);
    const targetDir = path.join(packagesDir, moduleName);
    const backendAppPath = config.defaults.backendAppPath;
    const frontendAppPath = config.defaults.frontendAppPath;
    const frontendSrcDir = path.join(rootDir, frontendAppPath, "src");
    const hasFrontendSrcDir = await pathExists(frontendSrcDir);
    const frontendModulesBaseSegments = hasFrontendSrcDir
      ? ["src", "modules"]
      : ["modules"];
    const frontendModulesImportPrefix = hasFrontendSrcDir
      ? "@/src/modules"
      : "@/modules";
    const frontendModulesBaseDir = path.join(
      rootDir,
      frontendAppPath,
      ...frontendModulesBaseSegments,
    );
    const backendModuleDir = path.join(
      rootDir,
      backendAppPath,
      "src",
      "modules",
      moduleName,
    );
    const frontendModuleDir = path.join(
      frontendModulesBaseDir,
      moduleName,
    );
    const frontendRouteDir = path.join(
      rootDir,
      frontendAppPath,
      "app",
      moduleName,
    );
    const backendAppModulePath = path.join(
      rootDir,
      backendAppPath,
      "src",
      "app.module.ts",
    );
    const backendPackageJsonPath = path.join(
      rootDir,
      backendAppPath,
      "package.json",
    );
    const frontendPackageJsonPath = path.join(
      rootDir,
      frontendAppPath,
      "package.json",
    );

    let sharedScopeFromPackage = "";
    try {
      const sharedPkg = await readJson(sharedPackageJsonPath);
      const sharedName = sharedPkg?.name;
      if (typeof sharedName === "string" && sharedName.includes("/")) {
        sharedScopeFromPackage = sharedName.split("/")[0];
      }
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw new Error(
          `Invalid shared package file at ${sharedPackageJsonPath}: ${error.message}`,
        );
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
    const moduleClassName = toPascalCase(moduleName);
    const backendControllerClassName = `${moduleClassName}Controller`;
    const backendModuleClassName = `${moduleClassName}Module`;
    const frontendDashboardComponentName = `${moduleClassName}DashboardComponent`;
    const frontendDashboardComponentFileName = `${moduleName}-dashboard.component.tsx`;
    const frontendDashboardPageName = "DashboardPage";
    const frontendDashboardPageFileName = "dashboard.page.tsx";
    const frontendDashboardPageImportPath = `${frontendModulesImportPrefix}/${moduleName}/pages/dashboard.page`;

    await ensureTargetPathAvailability({
      targetPath: targetDir,
      force,
      logger,
      label: "Diretório do package",
    });
    await ensureTargetPathAvailability({
      targetPath: backendModuleDir,
      force,
      logger,
      label: "Diretório do módulo backend",
    });
    await ensureTargetPathAvailability({
      targetPath: frontendModuleDir,
      force,
      logger,
      label: "Diretório do módulo frontend",
    });
    await ensureTargetPathAvailability({
      targetPath: frontendRouteDir,
      force,
      logger,
      label: "Diretório da rota frontend",
    });

    const packageJson = {
      name: packageName,
      version: "0.1.0",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      exports: {
        ".": {
          import: "./dist/index.js",
          require: "./dist/index.js",
          types: "./dist/index.d.ts",
        },
      },
      scripts: {
        dev: "tsc --watch",
        build: "tsc",
        test: "jest --coverage",
        "test:watch": "jest --watchAll",
      },
      dependencies: {
        [sharedDependency]: "*",
        "eslint-config": "*",
      },
      devDependencies: {
        "@types/jest": "^30.0.0",
        jest: "^30.2.0",
        "ts-jest": "^29.4.5",
      },
    };

    const tsconfigJson = {
      extends: "../typescript-config/base.json",
      compilerOptions: {
        rootDir: "src",
        outDir: "./dist",
        declaration: true,
      },
      include: ["src"],
      exclude: ["dist", "build", "node_modules"],
    };

    const jestConfig = `import type { Config } from "jest";

const config: Config = {
\tverbose: true,
\tpreset: "ts-jest",
\ttestMatch: ["**/test/**/*.test.ts"],
};

export default config;
`;

    const indexTs = `export function sum(a: number, b: number): number {
  return a + b;
}
`;

    const indexTest = `import { sum } from "../src";

describe("sum", () => {
  it("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
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
    const backendModuleTs = `import { Module } from '@nestjs/common';
import { ${backendControllerClassName} } from './${moduleName}.controller';

@Module({
  controllers: [${backendControllerClassName}],
})
export class ${backendModuleClassName} {}
`;
    const frontendDashboardComponentTsx = `export function ${frontendDashboardComponentName}() {
  return (
    <section>
      <h1>${moduleClassName} Dashboard</h1>
      <p>Template do módulo ${moduleName}.</p>
    </section>
  );
}
`;
    const frontendDashboardPageTsx = `import { ${frontendDashboardComponentName} } from "../components/${moduleName}-dashboard.component";

export function ${frontendDashboardPageName}() {
  return <${frontendDashboardComponentName} />;
}
`;
    const frontendAppRoutePageTsx = `import { ${frontendDashboardPageName} } from "${frontendDashboardPageImportPath}";

export default function Page() {
  return <${frontendDashboardPageName} />;
}
`;
    const backendControllerPath = path.join(
      backendModuleDir,
      `${moduleName}.controller.ts`,
    );
    const backendModulePath = path.join(
      backendModuleDir,
      `${moduleName}.module.ts`,
    );
    const frontendDashboardComponentPath = path.join(
      frontendModuleDir,
      "components",
      frontendDashboardComponentFileName,
    );
    const frontendDashboardPagePath = path.join(
      frontendModuleDir,
      "pages",
      frontendDashboardPageFileName,
    );
    const frontendAppRoutePagePath = path.join(frontendRouteDir, "page.tsx");

    await fs.mkdir(path.join(targetDir, "src"), { recursive: true });
    await fs.mkdir(path.join(targetDir, "test"), { recursive: true });

    await writeFile(
      path.join(targetDir, "package.json"),
      stringifyJson(packageJson),
    );
    logger.step(`criou arquivo: ${path.join(targetDir, "package.json")}`);
    await writeFile(
      path.join(targetDir, "tsconfig.json"),
      stringifyJson(tsconfigJson),
    );
    logger.step(`criou arquivo: ${path.join(targetDir, "tsconfig.json")}`);
    await writeFile(path.join(targetDir, "jest.config.ts"), jestConfig);
    logger.step(`criou arquivo: ${path.join(targetDir, "jest.config.ts")}`);
    await writeFile(path.join(targetDir, "src", "index.ts"), indexTs);
    logger.step(`criou arquivo: ${path.join(targetDir, "src", "index.ts")}`);
    await writeFile(path.join(targetDir, "test", "index.test.ts"), indexTest);
    logger.step(`criou arquivo: ${path.join(targetDir, "test", "index.test.ts")}`);
    logger.step(`Estrutura base criada em ${targetDir}.`);
    logger.step(`Dependência compartilhada configurada: ${sharedDependency}.`);

    await writeFile(backendControllerPath, backendControllerTs);
    logger.step(`criou arquivo: ${backendControllerPath}`);
    await writeFile(backendModulePath, backendModuleTs);
    logger.step(`criou arquivo: ${backendModulePath}`);
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
    await writeFile(frontendAppRoutePagePath, frontendAppRoutePageTsx);
    logger.step(`criou arquivo: ${frontendAppRoutePagePath}`);
    logger.step(`Estrutura frontend criada em ${frontendModuleDir}.`);

    await ensurePackageDependency({
      packageJsonPath: backendPackageJsonPath,
      dependencyName: packageName,
      dependencyVersion: "*",
      logger,
      label: "Backend package",
    });
    await ensurePackageDependency({
      packageJsonPath: frontendPackageJsonPath,
      dependencyName: packageName,
      dependencyVersion: "*",
      logger,
      label: "Frontend package",
    });

    console.log(`Created module at: ${targetDir}`);
    console.log(`Package name: ${packageName}`);
    console.log(
      `Backend module scaffolded at: ${path.join(backendAppPath, "src", "modules", moduleName)}`,
    );
    console.log(
      `Frontend module scaffolded at: ${path.join(frontendAppPath, ...frontendModulesBaseSegments, moduleName)}`,
    );
    console.log(
      `Frontend route scaffolded at: ${path.join(frontendAppPath, "app", moduleName)}`,
    );
    console.log(
      `Backend/frontend dependencies updated with: ${packageName}@*`,
    );
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
