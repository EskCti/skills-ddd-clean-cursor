# Stack: Spring Boot (Java) + Vue 3 + Flutter

**Combinação**: Backend Java (Spring Boot) · Frontend Vue 3 (PrimeVue) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Ecossistema JVM com Java puro no domínio, Spring Boot na infra/interface, UI Vue produtiva, Flutter cross-platform. API REST em `:4000`.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

> **Kotlin vs Java**: mesma stack Spring; Kotlin usa skills `-kt` ([spring-vue-flutter](./spring-vue-flutter.md)), Java usa `-java` (este tutorial).

Agents: `Config Project Full-Stack` → `Config Project (Java)` → `Config JPA (Java)` → `Config Project (Vue)` → `Config Shared Web (Vue)` → `Config Project (Flutter)` → `Config Docker (Java)` → `Config CI/CD (Java)` → `Config Shared Core (Java)` → `Core * (Java)` + `Frontend * (Vue)` + `Mobile * (Flutter)` → `Unit Tests (Java)` → `E2E Tests (Java)`

> **Layout obrigatório**: [`config-shared-core-java/references/java-namespace-layout.md`](../../../config-shared-core-java/references/java-namespace-layout.md) — domínio puro em `packages/<bc>/`, Spring em `apps/backend-java/modules/<bc>/`.

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: Spring Boot (Java) + Vue + Flutter. Backlog pronto. Docker/CI/CD no bootstrap.

**Prompt inicial — `Config Project Full-Stack`:**

> Tenho o backlog em `docs/planning/<nome>/backlog.md`.
> Quero criar o projeto `<nome>` com:
> - Backend: Spring Boot (Java)
> - Frontend: Vue 3
> - Mobile: Flutter
> Docker e CI/CD no bootstrap. Usar OpenSpec para rastrear mudanças.

**Sequência EP-000:**

```
openspec-propose "bootstrap-<nome>"
openspec-apply-change "bootstrap-<nome>"
├── Config Project (Java)          → Gradle multi-module (packages/ + backend-java)
├── Config JPA (Java)              → Flyway migrations + JPA
├── Config Project (Vue)           → apps/web-vue
├── Config Shared Web (Vue)        → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Flutter)       → app Flutter (Dio → :4000)
├── Config Docker (Java)           → Dockerfile multi-stage
├── Config CI/CD (Java)            → JaCoCo ≥95% domain+application
└── Config Shared Core (Java)      → packages/shared (Result, Entity, UseCase)
```

> Java usa **Gradle multi-module** — domínio sem Spring em `packages/`, Spring em `apps/backend-java`. Vue e Flutter em `apps/` (monorepo npm opcional). API em `http://localhost:4000`.

---

## Etapa 1 — Bootstrap Backend (Java)

**Agent:** `Config Project (Java)`

**Prompt:**

> Inicialize projeto Gradle multi-module com Spring Boot, packages/shared e apps/backend-java. Siga java-namespace-layout.md — domínio puro sem Spring, JPA e @RestController na infra. Porta 4000, docker-compose Postgres.

```bash
node config-project-java/scripts/project-init-java.mjs --project-name=<nome>
cp .env.example .env
docker compose up -d
./gradlew :apps:backend-java:bootRun
```

**Estrutura típica:**

```
<nome>/
├── settings.gradle
├── build.gradle
├── packages/
│   ├── shared/                   # Result, Entity, UseCase (pure Java)
│   └── <bc>/                     # domain + application (pure Java)
├── apps/
│   └── backend-java/             # Spring Boot
│       └── src/main/java/com/example/
│           ├── Application.java
│           └── modules/
│               └── health/
├── src/main/resources/db/migration/   # Flyway (Config JPA)
├── docker-compose.yml
└── apps/web-vue/                 # após Config Project (Vue)
```

---

## Etapa 2 — Bootstrap Vue + Flutter

Sequência igual ao [NestJS + Vue + Flutter](./nestjs-vue-flutter.md) — agents `Config Project (Vue)`, `Config Project (Flutter)`, `Config Shared Web (Vue)`.

Proxy Vite: `/api` → `http://localhost:4000`

---

## Etapa 3 — BC Customers (backend Java)

**Agent:** `Config New Module (Java)` (scaffold)

**Prompt:**

> Crie módulo customers em packages/customers/ (domain + application) e apps/backend-java/.../modules/customers/ (JPA + controller). Siga java-namespace-layout.md.

```
openspec-propose "bc-customers"
Config New Module (Java)
Core Value Object (Java) → Core Entity (Java) → Core Domain Service (Java) → Core Repository (Java)
Core DTO (Java) → Core Use Case (Java) → Core Query CQRS (Java)
Config JPA (Java) → Backend Data (Java) → Backend Controller (Java)
Unit Tests (Java) → E2E Tests (Java)
```

**Exemplo de namespaces:**

```java
// Domínio (packages/customers — pure Java)
com.example.customers.domain.entity.Customer
com.example.customers.domain.valueobject.Email
com.example.customers.domain.repository.CustomerRepository

// Infra (Spring)
com.example.modules.customers.infrastructure.persistence.CustomerJpaEntity
com.example.modules.customers.interfaces.web.CustomerController
```

**Agent:** `E2E Tests (Java)`

> MockMvc: POST /customers → GET /customers/{id}. `@SpringBootTest` + Postgres via docker-compose.

---

## Etapa 4 — Feature Vue

Agents Vue: `Frontend Entity (Vue)` → `Frontend UseCase (Vue)` → `Frontend Repository (Vue)` → `Frontend Page (Vue)` → `Frontend Form (Vue)`

Ver [NestJS + Vue + Flutter — Etapa 4](./nestjs-vue-flutter.md#etapa-4--feature-vue-feat-customer-vue).

---

## Etapa 5 — Feature Flutter

Agents `Mobile Entity (Flutter)` → … → `Mobile Screen (Flutter)` — ver [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (seção mobile).

Base URL Dio: `http://localhost:4000` (ou host do emulador).

---

## Checklist

- [ ] Análise → backlog com Agent `(Java)` no backend
- [ ] Gradle multi-module + Vue + Flutter + Docker + CI/CD
- [ ] Domínio em `packages/` sem anotações Spring
- [ ] BC Customers: JaCoCo ≥95% + MockMvc E2E
- [ ] UI Vue + app Flutter (agents por camada)
- [ ] EP-000 arquivado no OpenSpec

---

## Próximos passos

- [Spring Boot Kotlin + Vue](./spring-vue-flutter.md) — se preferir Kotlin no backend
- [Backend incremental](./backend-incremental.md) — se migrar BC antes da UI
- [Hub Full-Stack](../02-fullstack-project-setup.md)
- [OpenSpec Java task examples](../../templates/openspec-java-task-examples.md)
