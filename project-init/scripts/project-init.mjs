#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { loadSkillConfig } from "../../shared/resolve-skill-config.mjs";

function usage() {
  console.log(`Usage:
  node project-init.mjs [--frontend-path apps/web] [--backend-path apps/backend] [--frontend-port 3000] [--backend-port 4000] [--skip-global-nest]

Examples:
  node project-init.mjs
  node project-init.mjs --frontend-path apps/frontend --backend-path apps/api
  node project-init.mjs --frontend-path apps/web --backend-path services/backend
  node project-init.mjs --frontend-port 3100 --backend-port 4100
  node project-init.mjs --skip-global-nest`);
}

function normalizeRelativeDir(value, fieldName) {
  if (typeof value !== "string") {
    throw new Error(`Invalid value for --${fieldName}.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing value for --${fieldName}`);
  }

  if (path.isAbsolute(trimmed)) {
    throw new Error(`Invalid value for --${fieldName}: must be a relative path.`);
  }

  const normalized = path.normalize(trimmed).replace(/\\/g, "/");
  if (normalized === ".." || normalized.startsWith("../")) {
    throw new Error(
      `Invalid value for --${fieldName}: cannot point outside repository root.`,
    );
  }

  return normalized;
}

function normalizePathLeaf(value, fieldName) {
  const leaf = path.basename(value);
  if (!/^[a-z][a-z0-9-]*$/.test(leaf)) {
    throw new Error(
      `Invalid value for --${fieldName}: last segment "${leaf}" must match /^[a-z][a-z0-9-]*$/.`,
    );
  }
}

function normalizeProjectPath(value, fieldName) {
  const normalized = normalizeRelativeDir(value, fieldName);
  normalizePathLeaf(normalized, fieldName);
  return normalized;
}

function normalizePort(value, fieldName) {
  if (!value) throw new Error(`Missing value for --${fieldName}`);
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(
      `Invalid value for --${fieldName}: "${value}" must be an integer between 1 and 65535.`,
    );
  }

  return parsed;
}

function normalizeEnvVarName(value, fieldName) {
  if (!value) throw new Error(`Missing value for --${fieldName}`);
  const trimmed = value.trim();

  if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
    throw new Error(
      `Invalid value for --${fieldName}: "${trimmed}" must match /^[A-Z][A-Z0-9_]*$/.`,
    );
  }

  return trimmed;
}

function parseArgs(argv, defaults) {
  let frontendPath = defaults.frontendAppPath;
  let backendPath = defaults.backendAppPath;
  let frontendPort = defaults.frontendPort;
  let backendPort = defaults.backendPort;
  let frontendApiUrlEnvVar = defaults.frontendApiUrlEnvVar;
  let backendPortEnvVar = defaults.backendPortEnvVar;
  let skipGlobalNest = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }

    if (arg === "--skip-global-nest") {
      skipGlobalNest = true;
      continue;
    }

    if (arg === "--frontend-path") {
      frontendPath = normalizeProjectPath(argv[i + 1], "frontend-path");
      i += 1;
      continue;
    }

    if (arg === "--backend-path") {
      backendPath = normalizeProjectPath(argv[i + 1], "backend-path");
      i += 1;
      continue;
    }

    // Backward-compatible aliases.
    if (arg === "--apps-dir") {
      const appsDir = normalizeRelativeDir(argv[i + 1], "apps-dir");
      frontendPath = path.join(appsDir, path.basename(frontendPath)).replace(
        /\\/g,
        "/",
      );
      backendPath = path.join(appsDir, path.basename(backendPath)).replace(
        /\\/g,
        "/",
      );
      i += 1;
      continue;
    }

    if (arg === "--next-name" || arg === "--frontend-name") {
      const value = argv[i + 1];
      if (!value) throw new Error(`Missing value for ${arg}`);
      const name = value.trim();
      normalizePathLeaf(name, arg.slice(2));
      frontendPath = path.join(path.dirname(frontendPath), name).replace(
        /\\/g,
        "/",
      );
      i += 1;
      continue;
    }

    if (arg === "--backend-name") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --backend-name");
      const name = value.trim();
      normalizePathLeaf(name, "backend-name");
      backendPath = path.join(path.dirname(backendPath), name).replace(
        /\\/g,
        "/",
      );
      i += 1;
      continue;
    }

    if (arg === "--frontend-port") {
      frontendPort = normalizePort(argv[i + 1], "frontend-port");
      i += 1;
      continue;
    }

    if (arg === "--backend-port") {
      backendPort = normalizePort(argv[i + 1], "backend-port");
      i += 1;
      continue;
    }

    if (arg === "--frontend-api-env-var") {
      frontendApiUrlEnvVar = normalizeEnvVarName(
        argv[i + 1],
        "frontend-api-env-var",
      );
      i += 1;
      continue;
    }

    if (arg === "--backend-port-env-var") {
      backendPortEnvVar = normalizeEnvVarName(
        argv[i + 1],
        "backend-port-env-var",
      );
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (frontendPath === backendPath) {
    throw new Error("Frontend and backend paths must be different.");
  }

  return {
    frontendPath,
    backendPath,
    frontendPort,
    backendPort,
    frontendApiUrlEnvVar,
    backendPortEnvVar,
    skipGlobalNest,
  };
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${code})`));
    });
  });
}

function commandExists(cmd, args = ["--version"]) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function ensureArrayValue(arr, value) {
  if (!Array.isArray(arr)) return [value];
  return arr.includes(value) ? arr : [...arr, value];
}

async function cleanTargetDirectories(rootDir, relativePaths) {
  const uniquePaths = [...new Set(relativePaths)];
  await Promise.all(
    uniquePaths.map(async (relativePath) => {
      const absolutePath = path.join(rootDir, relativePath);
      await fs.rm(absolutePath, { recursive: true, force: true });
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    }),
  );
}

async function writeEnvFiles({
  rootDir,
  frontendPath,
  backendPath,
  frontendPort,
  backendPort,
  frontendApiUrlEnvVar,
  backendPortEnvVar,
}) {
  const webEnvContent = [
    `${frontendApiUrlEnvVar}=http://localhost:${backendPort}`,
    `PORT=${frontendPort}`,
    "",
  ].join("\n");
  const backendEnvContent = [
    `${backendPortEnvVar}=${backendPort}`,
    'DATABASE_URL="postgresql://docker:docker@localhost:5432/docker?schema=public"',
    'JWT_SECRET="YOUR_SECRET_HERE"',
    "",
  ].join("\n");

  const webDir = path.join(rootDir, frontendPath);
  const backendDir = path.join(rootDir, backendPath);

  await fs.writeFile(path.join(webDir, ".env.example"), webEnvContent, "utf8");
  await fs.writeFile(path.join(webDir, ".env"), webEnvContent, "utf8");

  await fs.writeFile(
    path.join(backendDir, ".env.example"),
    backendEnvContent,
    "utf8",
  );
  await fs.writeFile(path.join(backendDir, ".env"), backendEnvContent, "utf8");
}

async function patchRootPackageJson(rootDir) {
  const packagePath = path.join(rootDir, "package.json");
  const pkg = await readJson(packagePath);

  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.test = "turbo run test";

  pkg.devDependencies = pkg.devDependencies ?? {};
  if (!pkg.devDependencies["ts-node"]) {
    pkg.devDependencies["ts-node"] = "^10.9.2";
  }

  await writeJson(packagePath, pkg);
}

async function patchTurboJson(rootDir) {
  const turboPath = path.join(rootDir, "turbo.json");
  const turbo = await readJson(turboPath);

  turbo.tasks = turbo.tasks ?? {};
  turbo.tasks.build = turbo.tasks.build ?? {};
  turbo.tasks.build.outputs = ensureArrayValue(
    turbo.tasks.build.outputs,
    "dist/**",
  );

  turbo.tasks.test = {
    ...(turbo.tasks.test ?? {}),
    cache: false,
  };

  await writeJson(turboPath, turbo);
}

async function patchBackendMain({
  rootDir,
  backendPath,
  backendPort,
  backendPortEnvVar,
}) {
  const mainPath = path.join(rootDir, backendPath, "src", "main.ts");
  const content = `import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = Number(process.env.${backendPortEnvVar} ?? ${backendPort});
  await app.listen(port);
}
bootstrap();
`;

  await fs.writeFile(mainPath, content, "utf8");
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, "../../../..");
  const skillConfig = await loadSkillConfig(rootDir);

  const {
    frontendPath,
    backendPath,
    frontendPort,
    backendPort,
    frontendApiUrlEnvVar,
    backendPortEnvVar,
    skipGlobalNest,
  } = parseArgs(process.argv.slice(2), skillConfig.defaults);

  const frontendDir = path.join(rootDir, frontendPath);
  const backendDir = path.join(rootDir, backendPath);
  const frontendParentDir = path.dirname(frontendDir);
  const backendParentDir = path.dirname(backendDir);
  const frontendName = path.basename(frontendPath);
  const backendName = path.basename(backendPath);

  await cleanTargetDirectories(rootDir, [frontendPath, backendPath]);

  console.log(
    `Bootstrap config: frontendPath="${frontendPath}:${frontendPort}", backendPath="${backendPath}:${backendPort}"`,
  );
  console.log(`Creating Next.js app: ${frontendName}`);
  await runCommand(
    "npx",
    ["create-next-app@latest", frontendName, "--yes", "--use-npm"],
    frontendParentDir,
  );

  if (!skipGlobalNest) {
    const hasNest = await commandExists("nest");
    if (!hasNest) {
      console.log("Installing @nestjs/cli globally...");
      await runCommand("npm", ["install", "-g", "@nestjs/cli"], rootDir);
    }
  }

  const nestCreateArgs = [
    "new",
    backendName,
    "--skip-git",
    "--package-manager",
    "npm",
  ];

  const hasNestCli = await commandExists("nest");
  if (hasNestCli) {
    console.log(`Creating NestJS app with nest CLI: ${backendName}`);
    await runCommand("nest", nestCreateArgs, backendParentDir);
  } else {
    console.log(`Creating NestJS app with npx: ${backendName}`);
    await runCommand(
      "npx",
      ["--yes", "@nestjs/cli@latest", ...nestCreateArgs],
      backendParentDir,
    );
  }

  await runCommand("npm", ["install", "-D", "ts-node"], rootDir);
  await runCommand("npm", ["install", "dotenv"], backendDir);

  await patchRootPackageJson(rootDir);
  await patchTurboJson(rootDir);
  await patchBackendMain({
    rootDir,
    backendPath,
    backendPort,
    backendPortEnvVar,
  });
  await writeEnvFiles({
    rootDir,
    frontendPath,
    backendPath,
    frontendPort,
    backendPort,
    frontendApiUrlEnvVar,
    backendPortEnvVar,
  });

  console.log("TurboRepo initialization completed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
