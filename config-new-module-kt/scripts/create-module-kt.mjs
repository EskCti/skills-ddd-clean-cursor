#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNamespace, resolveSkillPaths } from '../../utils/resolve-skill-config.mjs';
import { createSkillRunLogger } from '../../utils/skill-run-log.mjs';
import { createSkillRunOps } from '../../utils/skill-run-ops.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage:
  node create-module-kt.mjs <module-name> [--group com.example] [--force]

Examples:
  node create-module-kt.mjs billing
  node create-module-kt.mjs classification --group com.acme
  node create-module-kt.mjs payments --force`);
}

function parseArgs(argv) {
  let moduleName = '';
  let group = '';
  let force = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { usage(); process.exit(0); }
    if (arg === '--force') { force = true; continue; }
    if (arg === '--group') { group = argv[++i] || ''; continue; }
    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    if (moduleName) throw new Error('Only one module name is allowed.');
    moduleName = arg;
  }
  return { moduleName, group, force };
}

function validateModuleName(name) {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

function toPascalCase(name) {
  return name.split('-').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function toSnakeCase(name) {
  return name.replace(/-/g, '_');
}

function toPackagePath(group, module) {
  const cleanModule = module.replace(/-/g, '');
  return `${group.replace(/\./g, '/')}/${cleanModule}`;
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function resolveGroup(rootDir, cliGroup) {
  if (cliGroup) return cliGroup;
  const envGroup = process.env.PROJECT_GROUP;
  if (envGroup) return envGroup;
  try {
    const configPaths = [
      path.join(rootDir, 'skills.config.local.json'),
      path.join(rootDir, 'skills.config.json'),
      path.join(rootDir, '.agents', 'skills', 'skills.config.local.json'),
      path.join(rootDir, '.agents', 'skills', 'skills.config.json'),
    ];
    for (const cp of configPaths) {
      if (await pathExists(cp)) {
        const raw = await fs.readFile(cp, 'utf8');
        const cfg = JSON.parse(raw);
        if (cfg.defaults?.group) return cfg.defaults.group;
        if (cfg.defaults?.namespace) return cfg.defaults.namespace.replace('@', '').replace('/', '.');
      }
    }
  } catch { /* ignore */ }
  return 'com.example';
}

async function findNextFlywayVersion(migrationDir) {
  if (!(await pathExists(migrationDir))) return 1;
  const files = await fs.readdir(migrationDir);
  const versions = files
    .map(f => f.match(/^V(\d+)__/))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

async function updateSettingsGradle(rootDir, moduleName, ops, logger) {
  const settingsPath = path.join(rootDir, 'settings.gradle.kts');
  if (!(await pathExists(settingsPath))) {
    logger.warn(`settings.gradle.kts not found at ${rootDir}`);
    return;
  }
  const content = await fs.readFile(settingsPath, 'utf8');
  const includeStr = `include("packages:${moduleName}")`;
  if (content.includes(includeStr)) {
    logger.step(`settings.gradle.kts already includes ${moduleName}`);
    return;
  }
  const updated = content.trimEnd() + `\n${includeStr}\n`;
  await ops.writeTextFile(settingsPath, updated);
  logger.step(`Updated settings.gradle.kts with ${includeStr}`);
}

async function updateBackendBuildGradle(rootDir, backendPath, moduleName, ops, logger) {
  const buildPath = path.join(rootDir, backendPath, 'build.gradle.kts');
  if (!(await pathExists(buildPath))) {
    logger.warn(`Backend build.gradle.kts not found at ${backendPath}`);
    return;
  }
  const content = await fs.readFile(buildPath, 'utf8');
  const depStr = `implementation(project(":packages:${moduleName}"))`;
  if (content.includes(depStr)) {
    logger.step(`Backend build.gradle.kts already has dependency on ${moduleName}`);
    return;
  }
  const depsMatch = content.match(/(dependencies\s*\{)/);
  if (depsMatch) {
    const updated = content.replace(depsMatch[1], `${depsMatch[1]}\n    ${depStr}`);
    await ops.writeTextFile(buildPath, updated);
    logger.step(`Updated backend build.gradle.kts with ${depStr}`);
  } else {
    logger.warn('Could not find dependencies block in backend build.gradle.kts');
  }
}

function generateDomainEntity(pkg, className) {
  return `package ${pkg}.domain.entity

import com.example.shared.domain.vo.Id
import com.example.shared.domain.vo.Name

data class ${className} private constructor(
    val id: Id,
    val name: Name,
    val active: Boolean = true
) {
    companion object {
        fun create(id: String? = null, name: String): ${className} =
            tryCreate(id, name).getOrThrow()

        fun tryCreate(id: String? = null, name: String): Result<${className}> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validName = Name.tryCreate(name).getOrElse { return Result.failure(it) }
            return Result.success(${className}(id = validId, name = validName))
        }
    }

    fun deactivate(): ${className} = copy(active = false)
}
`;
}

function generateDomainRepository(pkg, className) {
  return `package ${pkg}.domain.repository

import ${pkg}.domain.entity.${className}

interface ${className}Repository {
    suspend fun create(entity: ${className}): Result<Unit>
    suspend fun findById(id: String): Result<${className}>
    suspend fun findAll(): List<${className}>
    suspend fun update(entity: ${className}): Result<Unit>
    suspend fun delete(id: String): Result<Unit>
}
`;
}

function generateDomainTest(pkg, className) {
  return `package ${pkg}.domain.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertTrue
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ${className}Test {

    @Test
    fun \`should create ${className} with valid data\`() {
        val result = ${className}.tryCreate(name = "Test ${className}")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull()?.id)
    }

    @Test
    fun \`should fail with blank name\`() {
        val result = ${className}.tryCreate(name = "")
        assertTrue(result.isFailure)
    }

    @Test
    fun \`should deactivate entity\`() {
        val entity = ${className}.create(name = "Test")
        val deactivated = entity.deactivate()
        assertEquals(false, deactivated.active)
    }
}
`;
}

function generateController(pkg, moduleName, className) {
  return `package ${pkg}

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/${moduleName}")
class ${className}Controller {

    @GetMapping
    fun getExample(): Map<String, String> = mapOf(
        "module" to "${moduleName}",
        "message" to "${moduleName} endpoint is working"
    )
}
`;
}

function generateJpaEntity(pkg, moduleName, className) {
  const tableName = `${toSnakeCase(moduleName)}s`;
  return `package ${pkg}

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "${tableName}")
data class ${className}JpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val name: String = "",

    @Column(nullable = false)
    val active: Boolean = true
)
`;
}

function generateJpaRepository(pkg, className) {
  return `package ${pkg}

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ${className}JpaRepository : JpaRepository<${className}JpaEntity, UUID>
`;
}

function generateConfig(pkg, className) {
  return `package ${pkg}

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

@Configuration
@ComponentScan(basePackageClasses = [${className}Config::class])
class ${className}Config
`;
}

function generateMigration(moduleName) {
  const tableName = `${toSnakeCase(moduleName)}s`;
  return `CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
`;
}

function generatePackageBuildGradle() {
  return `plugins {
    kotlin("jvm")
    jacoco
}

dependencies {
    implementation(project(":packages:shared"))
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testImplementation("io.mockk:mockk:1.13.12")
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.jacocoTestReport)
    violationRules {
        rule {
            limit {
                counter = "LINE"
                minimum = "0.95".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}
`;
}

async function main() {
  const rootDir = path.resolve(__dirname, '../../../..');
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: 'config-new-module-kt',
    commandArgs: process.argv.slice(2),
  });

  try {
    const ops = createSkillRunOps({ rootDir, logger, dryRun: false });
    const { moduleName, group: cliGroup, force } = parseArgs(process.argv.slice(2));

    if (!moduleName) { usage(); process.exit(1); }
    if (!validateModuleName(moduleName)) {
      throw new Error(`Invalid module name '${moduleName}'. Use lowercase letters, numbers and hyphens.`);
    }

    const group = await resolveGroup(rootDir, cliGroup);
    const className = toPascalCase(moduleName);
    const cleanModule = moduleName.replace(/-/g, '');
    const domainPkg = `${group}.${cleanModule}`;
    const backendPkg = `${group}.modules.${cleanModule}`;
    const domainPkgPath = toPackagePath(group, moduleName);
    const backendPkgPath = `${group.replace(/\./g, '/')}/modules/${cleanModule}`;
    const backendPath = 'apps/backend';

    logger.step(`Module: ${moduleName}, Class: ${className}, Group: ${group}`);

    const packageDir = path.join(rootDir, 'packages', moduleName);
    const packageSrcDir = path.join(packageDir, 'src', 'main', 'kotlin', domainPkgPath);
    const packageTestDir = path.join(packageDir, 'src', 'test', 'kotlin', domainPkgPath);
    const backendModuleDir = path.join(rootDir, backendPath, 'src', 'main', 'kotlin', backendPkgPath);
    const migrationDir = path.join(rootDir, backendPath, 'src', 'main', 'resources', 'db', 'migration');

    if (await pathExists(packageDir)) {
      if (!force) throw new Error(`Directory exists: ${packageDir}. Use --force.`);
      await ops.removePath(packageDir, { recursive: true, force: true, markRisk: true });
    }
    if (await pathExists(backendModuleDir)) {
      if (!force) throw new Error(`Directory exists: ${backendModuleDir}. Use --force.`);
      await ops.removePath(backendModuleDir, { recursive: true, force: true, markRisk: true });
    }

    await ops.ensureDir(path.join(packageSrcDir, 'domain', 'entity'));
    await ops.ensureDir(path.join(packageSrcDir, 'domain', 'repository'));
    await ops.ensureDir(path.join(packageTestDir, 'domain', 'entity'));
    await ops.ensureDir(backendModuleDir);
    await ops.ensureDir(migrationDir);

    await ops.writeTextFile(path.join(packageDir, 'build.gradle.kts'), generatePackageBuildGradle());
    await ops.writeTextFile(path.join(packageSrcDir, 'domain', 'entity', `${className}.kt`), generateDomainEntity(domainPkg, className));
    await ops.writeTextFile(path.join(packageSrcDir, 'domain', 'repository', `${className}Repository.kt`), generateDomainRepository(domainPkg, className));
    await ops.writeTextFile(path.join(packageTestDir, 'domain', 'entity', `${className}Test.kt`), generateDomainTest(domainPkg, className));
    logger.step(`Package scaffold created at packages/${moduleName}`);

    await ops.writeTextFile(path.join(backendModuleDir, `${className}Controller.kt`), generateController(backendPkg, moduleName, className));
    await ops.writeTextFile(path.join(backendModuleDir, `${className}JpaEntity.kt`), generateJpaEntity(backendPkg, moduleName, className));
    await ops.writeTextFile(path.join(backendModuleDir, `${className}JpaRepository.kt`), generateJpaRepository(backendPkg, className));
    await ops.writeTextFile(path.join(backendModuleDir, `${className}Config.kt`), generateConfig(backendPkg, className));
    logger.step(`Backend module created at ${backendPath}/src/main/kotlin/.../modules/${cleanModule}`);

    const nextVersion = await findNextFlywayVersion(migrationDir);
    const migrationFile = `V${nextVersion}__create_${toSnakeCase(moduleName)}.sql`;
    await ops.writeTextFile(path.join(migrationDir, migrationFile), generateMigration(moduleName));
    logger.step(`Migration created: ${migrationFile}`);

    await updateSettingsGradle(rootDir, moduleName, ops, logger);
    await updateBackendBuildGradle(rootDir, backendPath, moduleName, ops, logger);

    console.log(`\n  Module '${moduleName}' created successfully.`);
    console.log(`  Package: packages/${moduleName}`);
    console.log(`  Backend: ${backendPath}/src/main/kotlin/.../modules/${cleanModule}`);
    console.log(`  Migration: ${migrationFile}\n`);

    await logger.success();
  } catch (error) {
    await logger.failure(error);
    throw error;
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
