# Stack: Spring Boot + Vue 3 + Flutter

**Combinação**: Backend Kotlin (Spring Boot) · Frontend Vue 3 (PrimeVue) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Ecossistema JVM maduro, Spring Boot no backend, UI Vue produtiva, Flutter cross-platform.

Agents: `config-project-fullstack` → `config-project-kt` → `config-project-vue` → `config-shared-web-vue` → `config-project-flutter` → `config-docker-kt` → `config-cicd-kt` → `config-shared-core-kt` → skills **`-kt`** (backend) + Vue/Flutter (sem sufixo)

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: Spring Boot + Vue + Flutter. Backlog pronto. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-<nome>"
├── config-project-kt       → Gradle multi-módulo + Spring Boot
├── config-project-vue      → apps/web-vue (monorepo ou repo sibling)
├── config-shared-web-vue   → shell Tailwind (sidebar, topbar, rodapé)
├── config-project-flutter
├── config-docker-kt
├── config-cicd-kt          → JaCoCo ≥95% domain+application
└── config-shared-core-kt
```

> Vue e Flutter rodam em monorepo npm **ou** repositórios separados — o `config-project-fullstack` define a estrutura. O importante é API Kotlin em `:8080` (ou porta do `skills.config.json`).

---

## Etapa 1 — Bootstrap Backend (`config-project-kt`)

```bash
node config-project-kt/scripts/project-init-kt.mjs --project-name=<nome>
```

**Estrutura típica:**

```
<nome>/
├── build.gradle.kts
├── src/main/kotlin/          # API Spring Boot
├── docker-compose.yml
└── apps/web-vue/             # após config-project-vue
```

---

## Etapa 2 — Bootstrap Vue + Flutter

Sequência igual ao [NestJS + Vue + Flutter](./nestjs-vue-flutter.md#etapa-1--bootstrap-web-config-project-vue) — agents **sem sufixo** (`config-project-vue`, `config-project-flutter`).

Proxy Vite: `/api` → `http://localhost:8080`

---

## Etapa 3 — BC Customers (backend `-kt`)

```
openspec-propose "bc-customers"
core-value-object-kt → core-entity-kt → core-repository-kt → core-dto-kt
core-use-case-kt → core-query-cqrs-kt → backend-data-kt → backend-controller-kt
test-unit-kt → test-e2e-kt
```

**Agent `E2E Tests (Kotlin)`:**

> MockMvc: POST /customers → GET /customers/{id}. `@SpringBootTest` + Postgres via docker-compose.

---

## Etapa 4 — Feature Vue

Skills Vue (sem sufixo): `frontend-entity-vue` → … → `frontend-form-vue`

Ver [NestJS + Vue + Flutter — Etapa 4](./nestjs-vue-flutter.md#etapa-4--feature-vue-feat-customer-vue).

---

## Etapa 5 — Feature Flutter

Skills `mobile-*-flutter` — ver [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (seção mobile).

---

## Checklist

- [ ] Análise → backlog com sufixo `-kt` nas tasks de backend
- [ ] Spring Boot + Vue + Flutter + Docker + CI/CD
- [ ] BC Customers: JaCoCo ≥95% + MockMvc E2E
- [ ] UI Vue + app Flutter
- [ ] EP-000 arquivado no OpenSpec

---

## Próximos passos

- [Backend incremental](./backend-incremental.md) — se migrar BC antes da UI
- [Hub Full-Stack](../02-fullstack-project-setup.md)
