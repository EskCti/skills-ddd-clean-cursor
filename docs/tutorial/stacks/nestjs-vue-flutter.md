# Stack: NestJS + Vue 3 + Flutter

**Combinação**: Backend TypeScript (NestJS) · Frontend Vue 3 (PrimeVue 4) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Cenário de referência**: Migração do legado PHP (`loja-php`) — mesmo fluxo do [Tutorial 04](../04-ciclo-completo-openspec.md), focado nesta combinação.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project (Vue)` → `Config Shared Web (Vue)` → `Config Project (Flutter)` → `Config Docker (TypeScript)` → `Config CI/CD (TypeScript)` → `Config Shared Core` → `Core *` → `Frontend * (Vue)` → `Mobile * (Flutter)` → `Unit Tests (TypeScript)` → `E2E Tests (TypeScript)`

---

## Etapa 0 — Orquestração

> Backlog em `docs/planning/loja-nova/backlog.md`. Projeto `loja-nova`: NestJS + Vue 3 + Flutter. Docker e CI/CD no bootstrap. OpenSpec.

**Sequência EP-000:**

```
openspec-propose "bootstrap-loja-nova"
openspec-apply-change "bootstrap-loja-nova"
├── Config Project (Vue)           → apps/backend + apps/web-vue + docker-compose dev
├── Config Shared Web (Vue)        → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Flutter)       → app Flutter (Dio, Riverpod, go_router)
├── Config Docker (TypeScript)     → Dockerfiles produção
├── Config CI/CD (TypeScript)      → GitHub Actions (test ≥95% + test:e2e)
└── Config Shared Core             → packages/shared kernel DDD
```

---

## Etapa 1B — Shell admin

**Agent:** `Config Shared Web (Vue)`

```bash
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs \
  --frontend-path apps/web-vue --theme fuchsia --mode dark
```

Integrar `shell.routes.ts` no router e configurar `@tailwindcss/vite` no Vite.

---

## Etapa 1 — Bootstrap Web

**Agent:** `Config Project (Vue)`

> Bootstrap monorepo NestJS + Vue 3 + PrimeVue 4 (tema Aura), Pinia, proxy Vite `/api` → backend (porta padrão **4000**).

**Estrutura:**

```
loja-nova/
├── apps/backend/           # NestJS
├── apps/web-vue/           # Vue 3 + PrimeVue
│   ├── vite.config.ts      # proxy /api
│   └── src/views/          # páginas por BC
├── mobile-flutter/         # (Etapa 2)
├── playwright.config.ts
├── docker-compose.yml
└── package.json            # workspaces
```

**E2E scaffold** (automático via `Config Project (Vue)` / `ensure-e2e-scaffold.mjs`):

```bash
npm run test:e2e        # Supertest (backend)
npm run test:e2e:web    # Playwright
```

---

## Etapa 2 — Bootstrap Mobile

**Agent:** `Config Project (Flutter)`

> App Flutter consumindo `http://localhost:4000`, clean architecture por feature, Riverpod + Dio.

---

## Etapa 3 — BC Customers (backend)

Mesma ordem inside-out do [Tutorial 04](../04-ciclo-completo-openspec.md) — uma task por camada com **Agent** + **Prompt**:

```
openspec-propose "bc-customers"
Core Value Object → Core Entity → Core Repository → Core DTO
Core Use Case → Core Query CQRS → Backend Prisma Data → Backend Controller
Unit Tests (TypeScript) → E2E Tests (TypeScript)
```

```bash
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud --create-fields name,email,cpf --assert-field email --web
```

---

## Etapa 4 — Feature Vue (`feat-customer-vue`)

```
openspec-propose "feat-customer-vue"
Frontend Entity (Vue)       → Customer + Result<T>
Frontend UseCase (Vue)      → CreateCustomerUseCase, ListCustomersUseCase
Frontend Repository (Vue)   → CustomerHttpRepository
Frontend Page (Vue)         → listagem PrimeVue DataTable
Frontend Form (Vue)         → vee-validate + PrimeVue Form
```

**Agent:** `Frontend Page (Vue)`

> Crie CustomerListView com PrimeVue DataTable, paginação lazy, consumindo ListCustomersUseCase via Pinia.

---

## Etapa 5 — Feature Flutter (`feat-customer-flutter`)

```
Mobile Entity (Flutter)     → Customer + sealed Result
Mobile UseCase (Flutter)    → CreateCustomerUseCase, ListCustomersUseCase
Mobile Repository (Flutter) → CustomerRepositoryImpl (Dio)
Mobile Screen (Flutter)     → CustomerListPage
Mobile Form (Flutter)       → CustomerFormPage
```

Detalhes de implementação: [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (mesmo padrão Clean Architecture).

---

## Checklist

- [ ] Análise (01) → backlog com Agent + Prompt
- [ ] Bootstrap: Config Project (Vue) + Flutter + Docker + CI/CD + shared-core + shell
- [ ] BC Customers + Unit Tests ≥95% + E2E Tests
- [ ] Frontend Entity → Form (Vue)
- [ ] Mobile Entity → Screen (Flutter)
- [ ] OpenSpec archive nas mudanças

---

## Próximos passos

- [Tutorial 04 — Ciclo OpenSpec](../04-ciclo-completo-openspec.md)
- [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) — referência detalhada
- [Hub Full-Stack](../02-fullstack-project-setup.md)
