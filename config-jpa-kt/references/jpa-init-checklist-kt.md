# JPA Init Checklist (Kotlin Backend)

## Objetivo

Padronizar bootstrap de JPA/Spring Data no backend Kotlin com:

- datasource configurado em `application.yml`
- migrations Flyway em `src/main/resources/db/migration/`
- Docker Compose para Postgres
- configuração de JPA com `ddl-auto: validate`

## Pré-requisitos

- Projeto Spring Boot Kotlin com `build.gradle.kts`
- Docker/Docker Compose instalados
- PostgreSQL disponível (local ou via Docker)

## Passo a passo

### 1. Dependências (`build.gradle.kts`)

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")
}
```

### 2. Configuração (`application.yml`)

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/appdb}
    username: ${DATABASE_USER:postgres}
    password: ${DATABASE_PASSWORD:postgres}
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
  port: ${PORT:4000}
```

### 3. Docker Compose (`docker-compose.yml`)

```yaml
services:
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
```

### 4. Migration de bootstrap

```sql
-- src/main/resources/db/migration/V1__bootstrap.sql
-- Bootstrap migration - replace with real tables
SELECT 1;
```

### 5. Variáveis de ambiente (`.env`)

```
DATABASE_URL=jdbc:postgresql://localhost:5432/appdb
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=change-me
PORT=4000
```

## Scaffold de módulos

Para cada módulo de domínio, criar migration versionada:

```sql
-- V2__create_users.sql
CREATE TABLE users (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    admin       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP
);
```

## Checklist

- [ ] `spring-boot-starter-data-jpa` no `build.gradle.kts`.
- [ ] `flyway-core` + `flyway-database-postgresql` no `build.gradle.kts`.
- [ ] `postgresql` runtime driver.
- [ ] `application.yml` com datasource, JPA e Flyway configurados.
- [ ] `docker-compose.yml` com Postgres.
- [ ] `.env` e `.env.example` com `DATABASE_URL`.
- [ ] `db/migration/V1__bootstrap.sql` criado.
- [ ] Aplicação inicia e conecta ao banco sem erros.

## Pós-bootstrap

- Criar migrations reais por módulo (`V2__create_users.sql`, etc.).
- Criar entidades JPA em `infrastructure/persistence/entity/`.
- Criar Spring Data repositories (`JpaRepository<T, ID>`).
- Criar adapters que implementam interfaces de domínio.
- Seguir convenção global em `../skills-standards.md`.

## Armadilhas comuns

- Usar `ddl-auto: create` ou `update` em produção (usar `validate`).
- Não versionar migrations corretamente (Flyway falha em checksum).
- Esquecer driver PostgreSQL no runtime classpath.
- Não alinhar `DATABASE_URL` entre `.env` e `docker-compose.yml`.
- Misturar entidade JPA com entidade de domínio no mesmo arquivo.
