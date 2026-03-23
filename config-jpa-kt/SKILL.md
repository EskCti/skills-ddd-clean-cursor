---
name: config-jpa-kt
stack: kotlin
description: 'Inicializar e padronizar a infraestrutura de persistência JPA/Spring Data no backend Kotlin com entidades JPA de bootstrap, application.yml com datasource, Docker Compose para Postgres compatível com variáveis de ambiente, migrations Flyway, e criação/ajuste de módulo de configuração de banco. Usar quando o pedido envolver setup inicial de JPA, onboarding de módulos com entidades JPA ou rebootstrap da infraestrutura de banco no backend Kotlin.'
---

# Config JPA (Kotlin)

## Overview

Executar setup determinístico da infraestrutura JPA/Spring Data no backend Kotlin, com datasource configurado via `application.yml`, migrations Flyway, Docker Compose para Postgres e módulo de configuração de banco.
Equivalente ao `config-prisma` do stack TypeScript, adaptado para o ecossistema Spring Boot + JPA.

## Workflow

1. Confirmar que o projeto contém `build.gradle.kts` ou `pom.xml` com Spring Boot.
2. Configurar dependências JPA/Spring Data, Flyway e driver Postgres.
3. Criar/ajustar `application.yml` com datasource, JPA e Flyway.
4. Criar `docker-compose.yml` para Postgres compatível com variáveis de ambiente.
5. Criar migration inicial de bootstrap (Flyway `V1__bootstrap.sql`).
6. Criar/ajustar módulo de configuração de banco (`DatabaseConfig.kt`) quando necessário.
7. Validar que a aplicação inicia e conecta ao banco.

## O que o setup garante

- Dependências em `build.gradle.kts`:
  - `spring-boot-starter-data-jpa`
  - `postgresql` (driver)
  - `flyway-core` + `flyway-database-postgresql`
- `application.yml` com:
  - `spring.datasource.url` via `${DATABASE_URL}`
  - `spring.jpa.hibernate.ddl-auto: validate`
  - `spring.flyway.enabled: true`
  - `spring.flyway.locations: classpath:db/migration`
- `docker-compose.yml` com Postgres alinhado ao `DATABASE_URL` do `.env`.
- Diretório `src/main/resources/db/migration/` com migration de bootstrap.
- `.env` e `.env.example` com `DATABASE_URL`, `JWT_SECRET`.

## Arquivos críticos

- `build.gradle.kts` (ou `pom.xml`)
- `src/main/resources/application.yml`
- `src/main/resources/application-dev.yml` (opcional, para profile dev)
- `src/main/resources/db/migration/V1__bootstrap.sql`
- `docker-compose.yml`
- `.env` / `.env.example`

## Commands

Simular alterações (dry-run):

```bash
node config-jpa-kt/scripts/init-jpa-backend-kt.mjs --dry-run
```

> Se instalado como submódulo: `node .agents/skills/config-jpa-kt/scripts/init-jpa-backend-kt.mjs --dry-run`

Aplicar alterações:

```bash
node config-jpa-kt/scripts/init-jpa-backend-kt.mjs --apply
```

Criar migrations para módulos:

```bash
node config-jpa-kt/scripts/init-jpa-backend-kt.mjs --apply --module auth --module product
```

Customizar path do backend:

```bash
node config-jpa-kt/scripts/init-jpa-backend-kt.mjs --apply --backend-path apps/api-kt
```

## Resources

- `scripts/init-jpa-backend-kt.mjs`: script de setup JPA/Flyway.
- `references/jpa-init-checklist-kt.md`: checklist operacional.
- Log local de execução: `.log/skills.log`.

## Scaffold de módulos

Para cada novo módulo de domínio, o script cria migration Flyway automaticamente com `--module`:

```
src/main/resources/db/migration/V2__create_users.sql
src/main/resources/db/migration/V3__create_products.sql
```

## Regra de escopo

- Não incluir seeds de dados por módulo nesta etapa.
- O bootstrap de migration deve ser mínimo (tabela de bootstrap ou vazio).
- Não sobrescrever `application.yml` já configurado; apenas upsert de chaves faltantes.

## References

Consultar `references/jpa-init-checklist-kt.md` para checklist operacional.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
