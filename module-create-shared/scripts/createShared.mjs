#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  resolveNamespace,
  resolveSkillPaths,
} from "../../shared/resolve-skill-config.mjs";

function usage() {
  console.log(`Usage:
  node createShared.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>]

Examples:
  node createShared.mjs
  node createShared.mjs --scope @polpig
  node createShared.mjs --force
  node createShared.mjs --force --run-tests
  node createShared.mjs --target /tmp/shared-template-test`);
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

async function main() {
  const { scope: scopeArg, force, runTests, target } = parseArgs(
    process.argv.slice(2),
  );

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, "..");
  const templateDir = path.join(skillDir, "assets", "shared-template");
  const rootDir = path.resolve(skillDir, "../../..");
  const { packagesDir, sharedModule } = await resolveSkillPaths(rootDir);
  const defaultTargetDir = path.join(packagesDir, sharedModule);
  const targetDir = target
    ? resolveTarget(rootDir, target)
    : defaultTargetDir;
  const targetPackageJsonPath = path.join(targetDir, "package.json");

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
  }

  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(templateDir, targetDir, { recursive: true });

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

  pkg.name = `${scope}/${sharedModule}`;
  await writeJson(targetPackageJsonPath, pkg);

  console.log(`Shared module created at: ${targetDir}`);
  console.log(`Package name: ${pkg.name}`);

  if (runTests) {
    console.log(`Running tests for ${pkg.name}...`);
    await runCommand("npm", ["run", "test", "-w", pkg.name], rootDir);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
