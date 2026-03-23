---
name: config-project-kt
stack: kotlin
description: 'Inicializar ou continuar um projeto Kotlin com backend Spring Boot e estrutura multi-módulo Gradle, criando/reconciliando a estrutura base com módulos de domínio e aplicação separados. Usar quando o pedido envolver bootstrap de projeto Kotlin, setup inicial Spring Boot + Gradle multi-módulo, ou padronização da estrutura de backend Kotlin com Clean Architecture.'
---

# Config Project (Kotlin)

## Overview

Executar setup determinístico e idempotente para bootstrap de projeto Kotlin com Spring Boot, organizado em multi-módulo Gradle para suportar Clean Architecture.
Equivalente ao `config-project` do stack TypeScript (TurboRepo + NestJS), adaptado para o ecossistema Kotlin/Gradle.

## Estrutura alvo

```
project-root/
├── build.gradle.kts              # Root build com plugins e dependências globais
├── settings.gradle.kts           # Inclui módulos
├── gradle.properties
├── gradlew / gradlew.bat
├── docker-compose.yml
├── .env / .env.example
├── .gitignore
├── apps/
│   └── backend-kt/              # Spring Boot application
│       ├── build.gradle.kts
│       └── src/main/kotlin/com/example/
│           ├── Application.kt
│           └── config/
│               ├── CorsConfig.kt
│               └── SecurityConfig.kt
└── packages/
    └── shared/                   # Shared kernel (domain base)
        ├── build.gradle.kts
        └── src/main/kotlin/com/example/shared/
```

## Workflow

1. Detectar se já existe estrutura Gradle no diretório atual.
2. Se ausente, inicializar projeto Gradle com `gradle init` ou template.
3. Configurar `settings.gradle.kts` com módulos (`apps:backend-kt`, `packages:shared`).
4. Criar app Spring Boot em `apps/backend-kt/` com:
   - `build.gradle.kts` com dependências Spring Boot, Kotlin, JPA.
   - `Application.kt` com `@SpringBootApplication`.
   - `CorsConfig.kt` com CORS habilitado.
   - `application.yml` com configuração base.
5. Criar módulo shared em `packages/shared/` com:
   - `build.gradle.kts` como biblioteca Kotlin pura (sem Spring).
6. Configurar `.env`, `.env.example`, `.gitignore` e `docker-compose.yml`.
7. Garantir que backend depende do shared no `build.gradle.kts`.
8. Validar build: `./gradlew build`.

## Configuração base do `build.gradle.kts` (root)

```kotlin
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25" apply false
    id("org.springframework.boot") version "3.3.0" apply false
    id("io.spring.dependency-management") version "1.1.5" apply false
}

allprojects {
    group = "com.example"
    version = "0.0.1-SNAPSHOT"
    repositories { mavenCentral() }
}

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")
    kotlin { jvmToolchain(21) }
}
```

## Configuração do `settings.gradle.kts`

```kotlin
rootProject.name = "project-name"

include("apps:backend-kt")
include("packages:shared")
```

## Notes

- O setup é idempotente: pula etapas já atendidas.
- Módulos adicionais podem ser incluídos depois em `settings.gradle.kts`.
- O backend depende do shared via `implementation(project(":packages:shared"))`.
- Não usar Spring no módulo shared (manter domínio puro).

## References

Consultar `references/bootstrap-contract-kt.md` para contrato detalhado.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
