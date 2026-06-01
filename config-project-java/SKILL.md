---
name: config-project-java
stack: java
description: Inicializar workspace Java (Gradle multi-module) com Spring Boot 3, JPA, shared kernel e layout modular por Bounded Context. Usar quando o pedido envolver bootstrap backend Java, setup Gradle multi-module ou estrutura Clean Architecture em Java 21.
---

# Config Project (Java)

## Overview

Bootstrap determinístico e idempotente: workspace Gradle com `packages/shared` e app `backend-java` (Spring Boot 3), Postgres via docker-compose dev, layout **modular por camada** sem namespaces redundantes.

## Estrutura alvo

```
project-root/
├── settings.gradle
├── build.gradle
├── gradle.properties
├── apps/
│   └── backend-java/
│       └── src/main/java/com/example/
│           ├── Application.java
│           └── modules/
│               └── health/
├── packages/
│   └── shared/                # Result, Entity, UseCase
├── docker-compose.yml
└── .env.example
```

## Namespaces (obrigatório)

Consultar `../config-shared-core-java/references/java-namespace-layout.md`:

- ✅ `com.example.customers.domain.entity.Customer`
- ❌ `com.example.customers.domain.entity.customer.CustomerEntity`
- ❌ Spring annotations em `packages/<bc>/`

## Workflow

1. Detectar `settings.gradle` na raiz; se ausente, copiar template.
2. Validar subprojetos `packages:shared` e `apps:backend-java`.
3. Configurar `.env`, `docker-compose.yml`, `application.yml` (porta 4000).
4. `./gradlew build`.

## Commands

```bash
node config-project-java/scripts/project-init-java.mjs --group=com.example
cp .env.example .env && docker compose up -d
./gradlew :apps:backend-java:bootRun
```

## Resources

- `agents/openai.yaml`
- `scripts/project-init-java.mjs`
- `assets/project-template-java/`
- `references/bootstrap-contract-java.md`
- `../config-shared-core-java/references/java-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
