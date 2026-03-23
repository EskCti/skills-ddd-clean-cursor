#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { loadSkillConfig, resolveNamespace } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let logger = null;
let ops = null;

function usage() {
  console.log(`Usage:
  node project-init-kt.mjs [--scope @namespace] [--backend-path apps/backend-kt] [--backend-port 4000] [--dry-run]

Examples:
  node project-init-kt.mjs
  node project-init-kt.mjs --scope @myorg
  node project-init-kt.mjs --dry-run
  node project-init-kt.mjs --backend-path apps/api-kt --backend-port 4100`);
}

function parseArgs(argv) {
  const args = { scope: '', backendPath: '', backendPort: 0, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--scope') { args.scope = argv[++i] || ''; continue; }
    if (arg === '--backend-path') { args.backendPath = argv[++i] || ''; continue; }
    if (arg === '--backend-port') { args.backendPort = Number(argv[++i]) || 0; continue; }
    if (arg === '--dry-run') { args.dryRun = true; continue; }
    if (arg === '--help' || arg === '-h') { args.help = true; continue; }
  }
  return args;
}

async function findRepoRoot() {
  let dir = process.cwd();
  while (true) {
    const gitDir = path.join(dir, '.git');
    try { await fs.access(gitDir); return dir; } catch { /* noop */ }
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

// --- Generators ---

function generateRootBuildGradle(group) {
  return `plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25" apply false
    id("org.springframework.boot") version "3.3.0" apply false
    id("io.spring.dependency-management") version "1.1.5" apply false
}

allprojects {
    group = "${group}"
    version = "0.0.1-SNAPSHOT"
    repositories { mavenCentral() }
}

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")
    kotlin { jvmToolchain(21) }
}
`;
}

function generateSettingsGradle(projectName, backendPath) {
  const backendModule = backendPath.replace(/\//g, ':');
  return `rootProject.name = "${projectName}"

include("${backendModule}")
include("packages:shared")
`;
}

function generateBackendBuildGradle() {
  return `plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

dependencies {
    implementation(project(":packages:shared"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.test {
    useJUnitPlatform()
}
`;
}

function generateApplicationKt(basePackage) {
  return `package ${basePackage}

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class Application

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}
`;
}

function generateCorsConfigKt(basePackage, frontendPort) {
  return `package ${basePackage}.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class CorsConfig {
    @Bean
    fun corsConfigurer(): WebMvcConfigurer = object : WebMvcConfigurer {
        override fun addCorsMappings(registry: CorsRegistry) {
            registry.addMapping("/**")
                .allowedOrigins("http://localhost:${frontendPort}")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true)
        }
    }
}
`;
}

function generateApplicationYml(port) {
  return `spring:
  datasource:
    url: \${DATABASE_URL:jdbc:postgresql://localhost:5432/appdb}
    username: \${DATABASE_USER:postgres}
    password: \${DATABASE_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: \${PORT:${port}}
`;
}

function generateDockerCompose() {
  return `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;
}

function generateEnvFile(port) {
  return `DATABASE_URL=jdbc:postgresql://localhost:5432/appdb
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=change-me
PORT=${port}
`;
}

function generateGitignore() {
  return `.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
*.class
*.jar
*.war
*.log
.idea/
*.iml
.env
!.env.example
.DS_Store
.log/
`;
}

function generateSharedBuildGradle() {
  return `plugins {
    kotlin("jvm")
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
}

tasks.test {
    useJUnitPlatform()
}
`;
}

function generateBootstrapMigration() {
  return `-- V1__bootstrap.sql
-- Bootstrap migration - replace with real domain tables
SELECT 1;
`;
}

function generateGradleProperties() {
  return `kotlin.code.style=official
org.gradle.parallel=true
org.gradle.caching=true
`;
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); process.exit(0); }

  const rootDir = await findRepoRoot();
  const config = await loadSkillConfig(rootDir);
  const ns = await resolveNamespace({ rootDir, cliScope: args.scope });
  const scope = ns.scope;
  const group = scope.replace('@', '').replace(/[^a-z0-9]/g, '.');

  const backendPath = args.backendPath || 'apps/backend-kt';
  const backendPort = args.backendPort || config.defaults.backendPort || 4000;
  const frontendPort = config.defaults.frontendPort || 3000;
  const projectName = `${scope.replace('@', '')}-workspace`;
  const basePackage = `com.${group.split('.')[0] || 'example'}`;

  logger = await createSkillRunLogger({ rootDir, skillName: 'config-project-kt' });
  ops = createSkillRunOps({ rootDir, logger, dryRun: args.dryRun });

  console.log(`\n  Scope:        ${scope} (${ns.source})`);
  console.log(`  Group:        ${group}`);
  console.log(`  Backend:      ${backendPath}`);
  console.log(`  Backend port: ${backendPort}`);
  console.log(`  Base package: ${basePackage}`);
  console.log(`  Dry run:      ${args.dryRun}\n`);

  const backendSrcDir = path.join(rootDir, backendPath, 'src/main/kotlin', basePackage.replace(/\./g, '/'));
  const backendConfigDir = path.join(backendSrcDir, 'config');
  const backendResDir = path.join(rootDir, backendPath, 'src/main/resources');
  const backendMigrationDir = path.join(backendResDir, 'db/migration');
  const sharedSrcDir = path.join(rootDir, 'packages/shared/src/main/kotlin', basePackage.replace(/\./g, '/'), 'shared');

  // Root files
  await ops.writeTextFile(path.join(rootDir, 'build.gradle.kts'), generateRootBuildGradle(group));
  await ops.writeTextFile(path.join(rootDir, 'settings.gradle.kts'), generateSettingsGradle(projectName, backendPath));
  await ops.writeTextFile(path.join(rootDir, 'gradle.properties'), generateGradleProperties());
  await ops.writeTextFile(path.join(rootDir, '.gitignore'), generateGitignore());
  await ops.writeTextFile(path.join(rootDir, 'docker-compose.yml'), generateDockerCompose());
  await ops.writeTextFile(path.join(rootDir, '.env.example'), generateEnvFile(backendPort));

  if (!(await pathExists(path.join(rootDir, '.env')))) {
    await ops.writeTextFile(path.join(rootDir, '.env'), generateEnvFile(backendPort));
  }

  // Backend
  await ops.writeTextFile(path.join(rootDir, backendPath, 'build.gradle.kts'), generateBackendBuildGradle());
  await ops.ensureDir(backendConfigDir);
  await ops.writeTextFile(path.join(backendSrcDir, 'Application.kt'), generateApplicationKt(basePackage));
  await ops.writeTextFile(path.join(backendConfigDir, 'CorsConfig.kt'), generateCorsConfigKt(basePackage, frontendPort));
  await ops.writeTextFile(path.join(backendResDir, 'application.yml'), generateApplicationYml(backendPort));
  await ops.ensureDir(backendMigrationDir);
  await ops.writeTextFile(path.join(backendMigrationDir, 'V1__bootstrap.sql'), generateBootstrapMigration());

  // Shared (minimal)
  await ops.writeTextFile(path.join(rootDir, 'packages/shared/build.gradle.kts'), generateSharedBuildGradle());
  await ops.ensureDir(sharedSrcDir);

  // Gradle wrapper check
  if (!(await pathExists(path.join(rootDir, 'gradlew')))) {
    logger.info('Gradle wrapper not found — run "gradle wrapper" to initialize.');
    console.log('\n  ⚠ Gradle wrapper not found. Run: gradle wrapper --gradle-version 8.8');
  }

  await logger.success();
  console.log('\n  ✓ config-project-kt complete.\n');
}

main().catch(async (err) => {
  console.error('\n  ✗ Error:', err.message);
  if (logger) await logger.failure(err);
  process.exit(1);
});
