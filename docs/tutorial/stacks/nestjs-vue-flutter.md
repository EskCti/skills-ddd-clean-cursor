# Stack: NestJS + Vue 3 + Flutter

**Combinação**: Backend TypeScript (NestJS) · Frontend Vue 3 (PrimeVue 4) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Cenário de referência**: Migração do legado PHP (`loja-php`) — mesmo fluxo do [Tutorial 04](../04-ciclo-completo-openspec.md), focado nesta combinação.

Agents: `config-project-fullstack` → `config-project-vue` → `config-shared-web-vue` → `config-project-flutter` → `config-docker` → `config-cicd` → `config-shared-core` → `core-*` → `frontend-*-vue` → `mobile-*-flutter` → `test-unit` → `test-e2e`

---

## Etapa 0 — Orquestração (`config-project-fullstack`)

> Backlog em `docs/planning/loja-nova/backlog.md`. Projeto `loja-nova`: NestJS + Vue 3 + PrimeVue + Flutter. Docker e CI/CD no bootstrap. OpenSpec.

**Sequência EP-000:**

```
openspec-propose "bootstrap-loja-nova"
openspec-apply-change "bootstrap-loja-nova"
├── config-project-vue      → apps/backend + apps/web-vue + docker-compose dev
├── config-shared-web-vue   → shell Tailwind (sidebar, topbar, rodapé)
├── config-project-flutter    → app Flutter (Dio, Riverpod, go_router)
├── config-docker             → Dockerfiles produção
├── config-cicd               → GitHub Actions (test ≥95% + test:e2e)
└── config-shared-core        → packages/shared kernel DDD
```

---

## Etapa 1B — Shell admin (`config-shared-web-vue`)

> Agent: `Config Shared Web (Vue)`

```bash
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs \
  --frontend-path apps/web-vue --theme fuchsia --mode dark
```

Integrar `shell.routes.ts` no router e configurar `@tailwindcss/vite` no Vite.

---

## Etapa 1 — Bootstrap Web (`config-project-vue`)

> Bootstrap monorepo NestJS + Vue 3 + PrimeVue 4 (tema Aura), Pinia, proxy Vite `/api` → backend.

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

**E2E scaffold** (automático via `config-project` / `ensure-e2e-scaffold.mjs`):

```bash
npm run test:e2e        # Supertest (backend)
npm run test:e2e:web    # Playwright
```

---

## Etapa 2 — Bootstrap Mobile (`config-project-flutter`)

> App Flutter consumindo `http://localhost:4000`, clean architecture por feature, Riverpod + Dio.

---

## Etapa 3 — BC Customers (backend)

Mesma ordem inside-out do tutorial NestJS+Angular — skills **sem sufixo**:

```
openspec-propose "bc-customers"
core-value-object → core-entity → core-repository → core-dto
core-use-case → core-query-cqrs → backend-prisma-data → backend-controller
test-unit → test-e2e (create-e2e-spec.mjs customers --template crud --web)
```

```bash
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud --create-fields name,email,cpf --assert-field email --web
```

---

## Etapa 4 — Feature Vue (`feat-customer-vue`)

```
openspec-propose "feat-customer-vue"
frontend-entity-vue       → Customer + Result<T>
frontend-usecase-vue      → CreateCustomerUseCase, ListCustomersUseCase
frontend-repository-vue   → CustomerHttpRepository
frontend-page-vue         → listagem PrimeVue DataTable
frontend-form-vue         → vee-validate + PrimeVue Form
```

**Agent `frontend-page-vue`:**

> Crie CustomerListView com PrimeVue DataTable, paginação lazy, consumindo ListCustomersUseCase via Pinia.

---

## Etapa 5 — Feature Flutter (`feat-customer-flutter`)

```
mobile-entity-flutter → mobile-usecase-flutter → mobile-repository-flutter
mobile-screen-flutter → mobile-form-flutter
```

Detalhes de implementação: [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (mesmo padrão Clean Architecture, skills `-flutter`).

---

## Checklist

- [ ] Tutorial 01 concluído — `backlog.md` com EP-000..N
- [ ] Bootstrap Vue + Flutter + Docker + CI/CD + shared-core
- [ ] BC Customers backend + test:unit ≥95% + test:e2e
- [ ] Feature Vue: listagem + formulário
- [ ] Feature Flutter: listagem + formulário
- [ ] `openspec-archive-change` nas mudanças concluídas

---

## Próximos passos

- [Tutorial 04 — Ciclo OpenSpec](../04-ciclo-completo-openspec.md) (narrativa completa legado → esta stack)
- [Hub Full-Stack](../02-fullstack-project-setup.md) — outras combinações
