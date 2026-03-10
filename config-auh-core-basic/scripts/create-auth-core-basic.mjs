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
  node create-auth-core-basic.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>]

Examples:
  node create-auth-core-basic.mjs
  node create-auth-core-basic.mjs --scope @poupig
  node create-auth-core-basic.mjs --force
  node create-auth-core-basic.mjs --force --run-tests
  node create-auth-core-basic.mjs --target /tmp/auth-core-basic-template-test`);
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

function resolveDefaultAuthCoreTarget({ rootDir, sharedModulePathRelative, packagesDir }) {
  const normalized = sharedModulePathRelative.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const sharedIndex = segments.indexOf("shared");

  if (sharedIndex >= 0) {
    const baseSegments = segments.slice(0, sharedIndex);
    return path.join(rootDir, ...baseSegments, "auth", "core");
  }

  return path.join(packagesDir, "auth", "core");
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

async function replaceTokenRecursively({
  targetDir,
  token,
  replacement,
}) {
  const stack = [targetDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      const ext = path.extname(entry.name);
      if (![".ts", ".json", ".md"].includes(ext)) {
        continue;
      }

      const content = await fs.readFile(fullPath, "utf8");
      if (!content.includes(token)) {
        continue;
      }

      await fs.writeFile(fullPath, content.split(token).join(replacement), "utf8");
    }
  }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, "..");
  const templateDir = path.join(skillDir, "assets", "auth-core-basic-template");
  const rootDir = path.resolve(skillDir, "../../..");
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: "config-auh-core-basic",
    commandArgs: process.argv.slice(2),
  });

  try {
    activeRunLogger = logger;

    const { scope: scopeArg, force, runTests, target } = parseArgs(
      process.argv.slice(2),
    );

    const {
      packagesDir,
      sharedModule,
      sharedModulePathRelative,
      sharedPackageJsonPath,
    } = await resolveSkillPaths(rootDir);
    const defaultTargetDir = resolveDefaultAuthCoreTarget({
      rootDir,
      sharedModulePathRelative,
      packagesDir,
    });
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
    logger.step("Template do módulo auth/core básico copiado para o diretório alvo.");

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

    pkg.name = `${scope}/auth`;
    const dependencies = {
      ...(pkg.dependencies ?? {}),
    };

    let sharedPackageLeaf = sharedModule;
    if (await exists(sharedPackageJsonPath)) {
      const sharedPkg = await readJson(sharedPackageJsonPath);
      if (
        typeof sharedPkg?.name === "string" &&
        sharedPkg.name.includes("/")
      ) {
        sharedPackageLeaf = sharedPkg.name.split("/")[1];
      }
    }

    delete dependencies.__SHARED_PACKAGE_NAME__;
    dependencies[`${scope}/${sharedPackageLeaf}`] = "*";
    pkg.dependencies = dependencies;

    await writeJson(targetPackageJsonPath, pkg);

    const sharedPackageName = `${scope}/${sharedPackageLeaf}`;
    await replaceTokenRecursively({
      targetDir,
      token: "__SHARED_PACKAGE_NAME__",
      replacement: sharedPackageName,
    });

    logger.step(`Nome do pacote atualizado para ${pkg.name}.`);
    logger.step(`Dependência shared configurada para ${sharedPackageName}.`);

    console.log(`Auth core basic module created at: ${targetDir}`);
    console.log(`Package name: ${pkg.name}`);

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
