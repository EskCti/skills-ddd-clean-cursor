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
  node create-module.mjs classification --scope @namespace
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

function toCamelCase(name) {
  const pascal = toPascalCase(name);
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : "";
}

function toImportPath(fromDir, toFilePath) {
  const withoutExtension = toPosixPath(
    path.relative(fromDir, toFilePath).replace(/\.(tsx?|jsx?)$/, ""),
  );
  return withoutExtension.startsWith(".")
    ? withoutExtension
    : `./${withoutExtension}`;
}

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
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
    skillName: "config-new-module",
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
    const frontendAppBaseSegments = hasFrontendSrcDir
      ? ["src", "app"]
      : ["app"];
    const frontendModulesBaseDir = path.join(
      rootDir,
      frontendAppPath,
      ...frontendModulesBaseSegments,
    );
    const frontendEmptyDashboardStatePath = path.join(
      frontendModulesBaseDir,
      "dashboard",
      "components",
      "empty-dashboard-state.component.tsx",
    );
    const frontendAppBaseDir = path.join(
      rootDir,
      frontendAppPath,
      ...frontendAppBaseSegments,
    );
    const frontendPrivateGroupDir = path.join(frontendAppBaseDir, "(private)");
    const hasFrontendPrivateGroup = await pathExists(frontendPrivateGroupDir);
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
      hasFrontendPrivateGroup ? frontendPrivateGroupDir : frontendAppBaseDir,
      moduleName,
    );
    const backendPrismaModelPath = path.join(
      rootDir,
      backendAppPath,
      "prisma",
      "models",
      `${moduleName}.model.prisma`,
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
    const workspaceTsConfigBasePath = path.join(
      packagesDir,
      "typescript-config",
      "base.json",
    );
    const fallbackTsConfigBasePath = path.join(
      rootDir,
      "packages",
      "typescript-config",
      "base.json",
    );
    const tsConfigBasePath = await pathExists(workspaceTsConfigBasePath)
      ? workspaceTsConfigBasePath
      : fallbackTsConfigBasePath;
    const tsConfigExtendsPath = toPosixPath(
      path.relative(targetDir, tsConfigBasePath),
    );
    const moduleClassName = toPascalCase(moduleName);
    const backendControllerClassName = `${moduleClassName}Controller`;
    const backendPrismaClassName = `${moduleClassName}Prisma`;
    const backendModuleClassName = `${moduleClassName}Module`;
    const frontendDashboardComponentName = `${moduleClassName}DashboardComponent`;
    const frontendDashboardComponentFileName = `${moduleName}-dashboard.component.tsx`;
    const frontendDashboardPageName = "DashboardPage";
    const frontendDashboardPageFileName = "dashboard.page.tsx";
    const frontendMenuDataTypeName = `${moduleClassName}MenuItem`;
    const frontendMenuItemsConstName = `${toCamelCase(moduleName)}MenuItems`;
    const hasFrontendEmptyDashboardState = await pathExists(
      frontendEmptyDashboardStatePath,
    );

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
      },
      devDependencies: {
        "@types/jest": "^30.0.0",
        jest: "^30.2.0",
        "ts-jest": "^29.4.5",
      },
    };

    const tsconfigJson = {
      extends: tsConfigExtendsPath,
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
    const frontendMenuDataTs = `export type ${frontendMenuDataTypeName} = {
  id: "dashboard";
  label: string;
  href: string;
  description: string;
};

export const ${frontendMenuItemsConstName}: ${frontendMenuDataTypeName}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/${moduleName}",
    description: "Página inicial do módulo ${moduleName}.",
  },
];
`;
    if (hasFrontendEmptyDashboardState) {
      logger.step(
        `Componente base detectado para dashboard vazio: ${frontendEmptyDashboardStatePath}.`,
      );
    } else {
      logger.step(
        `Componente base de dashboard vazio nao encontrado (${frontendEmptyDashboardStatePath}); aplicando fallback local para evitar erro de compilacao.`,
      );
    }

    const frontendDashboardComponentTsx = hasFrontendEmptyDashboardState
      ? `import { EmptyDashboardState } from "../../dashboard/components/empty-dashboard-state.component";

export function ${frontendDashboardComponentName}() {
  return <EmptyDashboardState />;
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
    const frontendMenuDataPath = path.join(
      frontendModuleDir,
      "data",
      `${moduleName}-menu.data.ts`,
    );
    const frontendModuleIndexPath = path.join(frontendModuleDir, "index.ts");
    const backendPrismaPath = path.join(
      backendModuleDir,
      `${moduleName}.prisma.ts`,
    );
    const backendControllerPath = path.join(
      backendModuleDir,
      `${moduleName}.controller.ts`,
    );
    const backendModulePath = path.join(
      backendModuleDir,
      `${moduleName}.module.ts`,
    );
    const backendModuleIndexPath = path.join(backendModuleDir, "index.ts");
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
    const frontendDashboardPageImportPath = toImportPath(
      frontendRouteDir,
      frontendDashboardPagePath,
    );
    const frontendAppRoutePageTsx = `import { ${frontendDashboardPageName} } from "${frontendDashboardPageImportPath}";

export default function Page() {
  return <${frontendDashboardPageName} />;
}
`;
    const frontendModuleIndexTs = `export * from "./components/${moduleName}-dashboard.component";
export * from "./data/${moduleName}-menu.data";
export * from "./pages/dashboard.page";
`;
    const backendModuleIndexTs = `export * from "./${moduleName}.module";
`;

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
    await writeFile(frontendMenuDataPath, frontendMenuDataTs);
    logger.step(`criou arquivo: ${frontendMenuDataPath}`);
    await writeFile(frontendDashboardPagePath, frontendDashboardPageTsx);
    logger.step(`criou arquivo: ${frontendDashboardPagePath}`);
    await writeFile(frontendModuleIndexPath, frontendModuleIndexTs);
    logger.step(`criou arquivo: ${frontendModuleIndexPath}`);
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
      `Frontend route scaffolded at: ${path.join(frontendAppPath, ...frontendAppBaseSegments, hasFrontendPrivateGroup ? "(private)" : "", moduleName)}`,
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
