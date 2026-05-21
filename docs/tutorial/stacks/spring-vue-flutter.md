# Stack: Spring Boot + Vue 3 + Flutter

**Combinação**: Backend Kotlin (Spring Boot) · Frontend Vue 3 (PrimeVue) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Ecossistema JVM maduro, Spring Boot no backend, UI Vue produtiva, Flutter cross-platform.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project (Kotlin)` → `Config Project (Vue)` → `Config Shared Web (Vue)` → `Config Project (Flutter)` → `Config Docker (Kotlin)` → `Config CI/CD (Kotlin)` → `Config Shared Core (Kotlin)` → `Core * (Kotlin)` + `Frontend * (Vue)` + `Mobile * (Flutter)`

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: Spring Boot + Vue + Flutter. Backlog pronto. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-<nome>"
├── Config Project (Kotlin)       → Gradle multi-módulo + Spring Boot
├── Config Project (Vue)          → apps/web-vue (monorepo ou repo sibling)
├── Config Shared Web (Vue)       → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Flutter)
├── Config Docker (Kotlin)
├── Config CI/CD (Kotlin)         → JaCoCo ≥95% domain+application
└── Config Shared Core (Kotlin)
```

> Vue e Flutter rodam em monorepo npm **ou** repositórios separados — o `Config Project Full-Stack` define a estrutura. O importante é API Kotlin em `:8080` (ou porta do `skills.config.json`).

---

## Etapa 1 — Bootstrap Backend

**Agent:** `Config Project (Kotlin)`

```bash
node config-project-kt/scripts/project-init-kt.mjs --project-name=<nome>
```

**Estrutura típica:**

```
<nome>/
├── build.gradle.kts
├── src/main/kotlin/          # API Spring Boot
├── docker-compose.yml
└── apps/web-vue/             # após Config Project (Vue)
```

---

## Etapa 2 — Bootstrap Vue + Flutter

Sequência igual ao [NestJS + Vue + Flutter](./nestjs-vue-flutter.md) — agents `Config Project (Vue)`, `Config Project (Flutter)`, `Config Shared Web (Vue)`.

Proxy Vite: `/api` → `http://localhost:8080`

---

## Etapa 3 — BC Customers (backend Kotlin)

```
openspec-propose "bc-customers"
Core Value Object (Kotlin) → Core Entity (Kotlin) → Core Repository (Kotlin) → Core DTO (Kotlin)
Core Use Case (Kotlin) → Core Query CQRS (Kotlin) → Backend Data (Kotlin) → Backend Controller (Kotlin)
Unit Tests (Kotlin) → E2E Tests (Kotlin)
```

**Agent:** `E2E Tests (Kotlin)`

> MockMvc: POST /customers → GET /customers/{id}. `@SpringBootTest` + Postgres via docker-compose.

---

## Etapa 4 — Feature Vue

Agents Vue: `Frontend Entity (Vue)` → `Frontend UseCase (Vue)` → `Frontend Repository (Vue)` → `Frontend Page (Vue)` → `Frontend Form (Vue)`

Ver [NestJS + Vue + Flutter — Etapa 4](./nestjs-vue-flutter.md#etapa-4--feature-vue-feat-customer-vue).

---

## Etapa 5 — Feature Flutter

Agents `Mobile Entity (Flutter)` → … → `Mobile Screen (Flutter)` — ver [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (seção mobile).

---

## Checklist

- [ ] Análise → backlog com Agent `(Kotlin)` no backend
- [ ] Spring Boot + Vue + Flutter + Docker + CI/CD
- [ ] BC Customers: JaCoCo ≥95% + MockMvc E2E
- [ ] UI Vue + app Flutter (agents por camada)
- [ ] EP-000 arquivado no OpenSpec

---

## Próximos passos

- [Backend incremental](./backend-incremental.md) — se migrar BC antes da UI
- [Hub Full-Stack](../02-fullstack-project-setup.md)
