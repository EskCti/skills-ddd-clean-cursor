---
name: config-new-module-kt
stack: kotlin
description: Criar um novo módulo de forma determinística no padrão Kotlin/Spring Boot multi-module Gradle, gerando scaffold em `packages/<module-name>` (sub-projeto Gradle), `apps/backend/src/main/kotlin/.../modules/<module-name>` (módulo Spring Boot com controller + JPA repository) e migration Flyway inicial. Usar quando o pedido envolver criação de módulo backend Kotlin no monorepo Gradle.
---

# Config New Module (Kotlin)

## Overview

Padronizar a criação de novos módulos no projeto Kotlin multi-module Gradle com duas entregas sincronizadas:

1. Sub-projeto em `packages/<module-name>` com `build.gradle.kts`, entidade de domínio placeholder, interface de repository e teste mínimo.
2. Módulo backend em `apps/backend/src/main/kotlin/<base-package>/modules/<module-name>` com `@RestController`, JPA entity, Spring Data repository, `@Configuration` do módulo e migration Flyway.

Executar o script Node da skill para receber o nome do módulo e gerar os arquivos mínimos de código e teste, sem depender de shell específico de SO.

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module-kt.mjs <module-name>`.
3. Namespace/grupo é resolvido por precedência: `--group` > `PROJECT_GROUP` > `skills.config.local.json` > `skills.config.json` > fallback `com.example`.
4. Conferir a estrutura criada em:
   - `packages/<module-name>/build.gradle.kts`
   - `packages/<module-name>/src/main/kotlin/<base-package>/<module>/domain/entity/*.kt`
   - `packages/<module-name>/src/main/kotlin/<base-package>/<module>/domain/repository/*.kt`
   - `packages/<module-name>/src/test/kotlin/<base-package>/<module>/**/*Test.kt`
   - `apps/backend/src/main/kotlin/<base-package>/modules/<module>/*Controller.kt`
   - `apps/backend/src/main/kotlin/<base-package>/modules/<module>/*JpaRepository.kt`
   - `apps/backend/src/main/kotlin/<base-package>/modules/<module>/*JpaEntity.kt`
   - `apps/backend/src/main/kotlin/<base-package>/modules/<module>/*Config.kt`
   - `apps/backend/src/main/resources/db/migration/V*__create_<module>.sql`
5. Confirmar que o package contém API mínima e teste.
6. Confirmar que o backend contém controller com endpoint GET de exemplo.
7. Confirmar que `settings.gradle.kts` foi atualizado com `include("packages:<module-name>")`.
8. Confirmar que `apps/backend/build.gradle.kts` possui dependência `project(":packages:<module-name>")`.

## Commands

Criar módulo no grupo padrão do projeto:

```bash
node .agents/skills/config-new-module-kt/scripts/create-module-kt.mjs <module-name>
```

Definir grupo explícito:

```bash
node .agents/skills/config-new-module-kt/scripts/create-module-kt.mjs <module-name> --group com.acme
```

Sobrescrever diretório existente:

```bash
node .agents/skills/config-new-module-kt/scripts/create-module-kt.mjs <module-name> --force
```

## Output Contract

O script deve gerar exatamente:

### Package (`packages/<module-name>`)

- `build.gradle.kts` (dependência em `:packages:shared`)
- `src/main/kotlin/<base-package>/<module>/domain/entity/<Module>.kt` (data class de domínio placeholder)
- `src/main/kotlin/<base-package>/<module>/domain/repository/<Module>Repository.kt` (interface de repository)
- `src/test/kotlin/<base-package>/<module>/domain/entity/<Module>Test.kt` (teste mínimo)

### Backend (`apps/backend`)

- `src/main/kotlin/<base-package>/modules/<module>/<Module>Controller.kt` (`@RestController` com GET)
- `src/main/kotlin/<base-package>/modules/<module>/<Module>JpaEntity.kt` (`@Entity` JPA)
- `src/main/kotlin/<base-package>/modules/<module>/<Module>JpaRepository.kt` (Spring Data `JpaRepository`)
- `src/main/kotlin/<base-package>/modules/<module>/<Module>Config.kt` (`@Configuration` + `@ComponentScan`)
- `src/main/resources/db/migration/V<next>__create_<module>.sql` (migration Flyway)
- Atualização em `settings.gradle.kts` com `include("packages:<module-name>")`
- Atualização em `apps/backend/build.gradle.kts` com `implementation(project(":packages:<module-name>"))`

## Naming Convention

- Pastas: sempre minúsculas em kebab-case.
- Pacotes Kotlin: lowercase dot-separated derivado de `<group>.<module>`.
- Arquivos Kotlin: PascalCase com sufixo de tipo (`*Controller.kt`, `*JpaEntity.kt`, `*JpaRepository.kt`, `*Config.kt`).
- Convenção global: `../skills-standards.md` seção Kotlin.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
