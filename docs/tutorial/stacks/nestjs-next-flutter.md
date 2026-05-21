# Stack: NestJS + Next.js + Flutter

**Combinação**: Backend TypeScript (NestJS) · Frontend Next.js (App Router) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Time full TypeScript, SSR/SEO, tipos compartilhados entre monorepo TurboRepo e app Flutter.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project` → `Config Shared Web` → `Config Project (Flutter)` → `Config Docker (TypeScript)` → `Config CI/CD (TypeScript)` → `Config Shared Core` → `Frontend Form Schema` → `Mobile * (Flutter)` → `Unit Tests (TypeScript)` → `E2E Tests (TypeScript)`

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: NestJS + Next.js + Flutter. Backlog em `docs/planning/<nome>/backlog.md`. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-<nome>"
├── Config Project              → TurboRepo apps/web (Next.js) + apps/backend (NestJS)
├── Config Shared Web           → shell Tailwind + Shadcn (sidebar, topbar, rodapé)
├── Config Project (Flutter)
├── Config Docker (TypeScript) + Config CI/CD (TypeScript) + Config Shared Core
```

O `Config Project` inclui scaffold E2E (`jest-e2e.json`, `playwright.config.ts`, `test:e2e`).

## Etapa 1B — Shell admin

**Agent:** `Config Shared Web`

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs \
  --theme fuchsia --mode dark --ui-library shadcn
```

---

## Etapa 1 — Bootstrap

**Agent:** `Config Project`

```bash
node config-project/scripts/project-init.mjs
# defaults: apps/web (Next.js) + apps/backend (NestJS), backend porta 4000
```

**Estrutura:**

```
<nome>/
├── apps/web/               # Next.js (src/)
├── apps/backend/           # NestJS
├── apps/mobile-flutter/    # Flutter (Config Project Flutter)
├── packages/shared/        # Config Shared Core
├── e2e/smoke.spec.ts
└── turbo.json
```

---

## Etapa 2 — BC Customers (backend)

Ordem inside-out padrão — tasks com **Agent** + **Prompt**. Após `Backend Controller`:

```bash
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud --create-fields name,email,cpf --web
npm run test:e2e
```

---

## Etapa 3 — Feature Web Next.js

Next.js neste repositório usa **`Frontend Form Schema`** (RHF + Zod) para formulários.

```
openspec-propose "feat-customer-next"
Frontend Form Schema      → schema Zod + React Hook Form
Config New Module         → scaffold packages/customers + rota app/(private)/customers
```

Para **listagem**, estender o módulo web com Server Components ou Client Component + fetch à API — padrão similar ao dashboard gerado por `Config New Module`.

**Agent:** `Frontend Form Schema`

> Crie formulário de cadastro de Customer com RHF + Zod: name, email, cpf. POST /customers via server action ou API route proxy.

**Playwright:**

```bash
npm run test:e2e:web
```

---

## Etapa 4 — Feature Flutter

Mesmo fluxo mobile do [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (Etapa 8 — Mobile Flutter) — agents `Mobile Entity (Flutter)` → `Mobile Screen (Flutter)`.

---

## Checklist

- [ ] Análise (01) → backlog com Agent + Prompt
- [ ] Config Project + Flutter + Docker + CI/CD + shared-core + shell
- [ ] BC Customers + Unit Tests ≥95% + E2E Tests
- [ ] Formulário Next.js (`Frontend Form Schema`)
- [ ] Telas Flutter (`Mobile Screen (Flutter)`)
- [ ] CI: lint + test + coverage gate + test:e2e

---

## Próximos passos

- [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) — referência detalhada de BC e mobile
- [Hub Full-Stack](../02-fullstack-project-setup.md)
