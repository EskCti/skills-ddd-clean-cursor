#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveNamespace,
  resolveSkillPaths,
} from "../../shared/resolve-skill-config.mjs";
import { createSkillRunLogger } from "../../shared/skill-run-log.mjs";

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

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, "../../../..");
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: "module-create",
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

    const { packagesDir, sharedModule, sharedPackageJsonPath } =
      await resolveSkillPaths(rootDir);
    const targetDir = path.join(packagesDir, moduleName);

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

    try {
      await fs.access(targetDir);
      if (!force) {
        throw new Error(
          `Directory already exists: ${targetDir}. Use --force to overwrite.`,
        );
      }
      await fs.rm(targetDir, { recursive: true, force: true });
      logger.step(`Diretório existente removido com --force: ${targetDir}.`);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
    }

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

    console.log(`Created module at: ${targetDir}`);
    console.log(`Package name: ${packageName}`);
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
