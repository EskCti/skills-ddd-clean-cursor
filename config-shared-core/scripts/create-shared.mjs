#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  resolveNamespace,
  resolveSkillPaths,
} from "../../utils/resolve-skill-config.mjs";
import { createSkillRunLogger } from "../../utils/skill-run-log.mjs";

let activeRunLogger = null;

function usage() {
  console.log(`Usage:
  node create-shared.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>]

Examples:
  node create-shared.mjs
  node create-shared.mjs --scope @polpig
  node create-shared.mjs --force
  node create-shared.mjs --force --run-tests
  node create-shared.mjs --target /tmp/shared-template-test`);
}

function parseArgs(argv) {
  let scope = "";
  let force = false;
  let runTests = false;
  let target = "";

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

    if (arg === "--run-tests") {
      runTests = true;
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

    if (arg === "--target") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --target");
      }
      target = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { scope, force, runTests, target };
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveTarget(rootDir, targetArg) {
  return path.isAbsolute(targetArg)
    ? targetArg
    : path.resolve(rootDir, targetArg);
}

function runCommand(cmd, args, cwd) {
  activeRunLogger?.command(cmd, args);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${code})`));
    });
  });
}

async function installRootDependencies(rootDir) {
  const rootPackageJsonPath = path.join(rootDir, "package.json");
  if (!(await exists(rootPackageJsonPath))) {
    throw new Error(
      `Root package.json not found at ${rootPackageJsonPath}. Cannot run npm install.`,
    );
  }

  console.log("Installing root dependencies with npm install...");
  await runCommand("npm", ["install"], rootDir);
}

async function listFrontendAndBackendPackageJsonPaths({
  rootDir,
  frontendAppPath,
  backendAppPath,
}) {
  const appPaths = [...new Set([frontendAppPath, backendAppPath])];
  const packageJsonPaths = [];

  for (const appPath of appPaths) {
    const packageJsonPath = path.join(rootDir, appPath, "package.json");
    if (await exists(packageJsonPath)) {
      packageJsonPaths.push(packageJsonPath);
    }
  }

  return packageJsonPaths;
}

async function listWorkspacePackageJsonPaths(rootDir) {
  const roots = ["apps", "packages"];
  const results = [];

  for (const root of roots) {
    const rootPath = path.join(rootDir, root);
    if (!(await exists(rootPath))) continue;

    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packageJsonPath = path.join(rootPath, entry.name, "package.json");
      if (await exists(packageJsonPath)) {
        results.push(packageJsonPath);
      }
    }
  }

  return results;
}

async function ensureSharedDependencyOnFrontendAndBackend({
  rootDir,
  sharedPackageName,
  frontendAppPath,
  backendAppPath,
}) {
  const targetPackageJsonPaths = await listFrontendAndBackendPackageJsonPaths({
    rootDir,
    frontendAppPath,
    backendAppPath,
  });
  const targetPackageJsonSet = new Set(
    targetPackageJsonPaths.map((packageJsonPath) => path.resolve(packageJsonPath)),
  );
  const workspacePackageJsonPaths = await listWorkspacePackageJsonPaths(rootDir);

  let changedCount = 0;
  let addedOrUpdatedCount = 0;
  let removedCount = 0;

  for (const packageJsonPath of workspacePackageJsonPaths) {
    const pkg = await readJson(packageJsonPath);
    if (pkg.name === sharedPackageName) continue;

    const isTargetPackage = targetPackageJsonSet.has(path.resolve(packageJsonPath));
    const deps = pkg.dependencies ?? {};
    const hasSharedDependency = sharedPackageName in deps;

    if (isTargetPackage) {
      if (deps[sharedPackageName] === "*") continue;

      pkg.dependencies = deps;
      pkg.dependencies[sharedPackageName] = "*";
      await writeJson(packageJsonPath, pkg);
      changedCount += 1;
      addedOrUpdatedCount += 1;
      continue;
    }

    if (!hasSharedDependency) continue;

    delete deps[sharedPackageName];
    if (Object.keys(deps).length === 0) {
      delete pkg.dependencies;
    } else {
      pkg.dependencies = deps;
    }
    await writeJson(packageJsonPath, pkg);
    changedCount += 1;
    removedCount += 1;
  }

  return {
    changedCount,
    addedOrUpdatedCount,
    removedCount,
  };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, "..");
  const templateDir = path.join(skillDir, "assets", "shared-template");
  const rootDir = path.resolve(skillDir, "../../..");
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: "config-shared-core",
    commandArgs: process.argv.slice(2),
  });

  try {
    activeRunLogger = logger;
    const { scope: scopeArg, force, runTests, target } = parseArgs(
      process.argv.slice(2),
    );
    const { packagesDir, sharedModule, config } = await resolveSkillPaths(rootDir);
    const defaultTargetDir = path.join(packagesDir, sharedModule);
    const targetDir = target
      ? resolveTarget(rootDir, target)
      : defaultTargetDir;
    const targetPackageJsonPath = path.join(targetDir, "package.json");

    logger.step(`Diretório alvo resolvido: ${targetDir}.`);

    if (!(await exists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    if (await exists(targetDir)) {
      if (!force) {
        throw new Error(
          `Target directory already exists: ${targetDir}. Use --force to overwrite.`,
        );
      }
      await fs.rm(targetDir, { recursive: true, force: true });
      logger.step(`Diretório existente removido com --force: ${targetDir}.`);
    }

    await fs.mkdir(path.dirname(targetDir), { recursive: true });
    await fs.cp(templateDir, targetDir, { recursive: true });
    logger.step("Template do módulo shared copiado para o diretório alvo.");

    const pkg = await readJson(targetPackageJsonPath);
    const templateScope =
      typeof pkg.name === "string" && pkg.name.includes("/")
        ? pkg.name.split("/")[0]
        : "@poupig";
    const { scope } = await resolveNamespace({
      rootDir,
      cliScope: scopeArg,
      fallbackScope: templateScope,
    });
    logger.step(`Namespace resolvido: ${scope}.`);

    pkg.name = `${scope}/${sharedModule}`;
    await writeJson(targetPackageJsonPath, pkg);
    logger.step(`Nome do pacote atualizado para ${pkg.name}.`);

    console.log(`Shared module created at: ${targetDir}`);
    console.log(`Package name: ${pkg.name}`);

    const shouldInstallRoot = targetDir === defaultTargetDir;
    if (shouldInstallRoot) {
      const dependencyChanges = await ensureSharedDependencyOnFrontendAndBackend({
        rootDir,
        sharedPackageName: pkg.name,
        frontendAppPath: config.defaults.frontendAppPath,
        backendAppPath: config.defaults.backendAppPath,
      });
      if (dependencyChanges.changedCount > 0) {
        console.log(
          `Synchronized dependency "${pkg.name}: *" on frontend/backend (updated: ${dependencyChanges.addedOrUpdatedCount}, removed from non-targets: ${dependencyChanges.removedCount}).`,
        );
        logger.step(
          `Dependência "${pkg.name}: *" sincronizada em frontend/backend (atualizados: ${dependencyChanges.addedOrUpdatedCount}, removidos fora do alvo: ${dependencyChanges.removedCount}).`,
        );
      } else {
        console.log(
          `Frontend/backend dependencies already synchronized for "${pkg.name}: *".`,
        );
        logger.step(
          `Dependência "${pkg.name}: *" já estava sincronizada para frontend/backend.`,
        );
      }

      await installRootDependencies(rootDir);
      logger.step("npm install executado na raiz do projeto.");
    } else {
      console.log(
        "Skipping root npm install because --target points to a custom directory.",
      );
      logger.step("npm install da raiz foi ignorado por uso de --target customizado.");
    }

    if (runTests) {
      console.log(`Running tests for ${pkg.name}...`);
      await runCommand("npm", ["run", "test", "-w", pkg.name], rootDir);
      logger.step(`Testes executados para ${pkg.name}.`);
    } else {
      logger.step("Execução de testes não solicitada.");
    }

    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  } finally {
    activeRunLogger = null;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
