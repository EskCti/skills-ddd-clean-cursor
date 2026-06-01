---
name: config-jpa-java
stack: java
description: Inicializar e padronizar infraestrutura JPA/Spring Data no backend Java com Flyway, datasource via application.yml e Docker Compose Postgres. Usar quando o pedido envolver setup JPA, migrations Flyway ou rebootstrap de banco no backend Java.
---

# Config JPA (Java)

## Overview

Setup determinístico da infraestrutura JPA/Spring Data no `apps/backend-java`: datasource, Flyway, Hibernate `ddl-auto: validate`, Postgres via docker-compose.

## Workflow

1. Confirmar `apps/backend-java/build.gradle` com Spring Boot 3.
2. Garantir dependências: `spring-boot-starter-data-jpa`, `flyway-core`, `postgresql`.
3. Configurar `application.yml` com `${DATABASE_URL}` e Flyway em `classpath:db/migration`.
4. Criar `V1__bootstrap.sql` mínimo se ausente.
5. Alinhar `docker-compose.yml` e `.env.example`.
6. Validar: `./gradlew :apps:backend-java:bootRun`.

## O que o setup garante

- `spring.jpa.hibernate.ddl-auto: validate`
- `spring.flyway.enabled: true`
- Migrations em `apps/backend-java/src/main/resources/db/migration/`
- JPA entities **somente** em `modules/<bc>/infrastructure/persistence/*JpaEntity.java`

## Commands

```bash
node config-jpa-java/scripts/init-jpa-backend-java.mjs --apply
node config-jpa-java/scripts/init-jpa-backend-java.mjs --apply --module customers
```

## Resources

- `scripts/init-jpa-backend-java.mjs`
- `references/jpa-init-checklist-java.md`
- `../config-shared-core-java/references/java-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
