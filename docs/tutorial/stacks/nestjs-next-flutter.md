# Stack: NestJS + Next.js + Flutter

**Combinação**: Backend TypeScript (NestJS) · Frontend Next.js (App Router) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Time full TypeScript, SSR/SEO, tipos compartilhados entre monorepo TurboRepo e app Flutter.

Agents: `config-project-fullstack` → `config-project` → `config-shared-web` → `config-project-flutter` → `config-docker` → `config-cicd` → `config-shared-core` → `frontend-form-schema` → `mobile-*-flutter` → `test-unit` → `test-e2e`

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: NestJS + Next.js + Flutter. Backlog em `docs/planning/<nome>/backlog.md`. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-<nome>"
├── config-project          → TurboRepo apps/web (Next.js) + apps/backend (NestJS)
├── config-shared-web       → shell Tailwind + Shadcn (sidebar, topbar, rodapé)
├── config-project-flutter
├── config-docker + config-cicd + config-shared-core
```

O `config-project` inclui scaffold E2E (`jest-e2e.json`, `playwright.config.ts`, `test:e2e`).

## Etapa 1B — Shell admin (`config-shared-web`)

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs \
  --theme fuchsia --mode dark --ui-library shadcn
```

---

## Etapa 1 — Bootstrap (`config-project`)

```bash
node config-project/scripts/project-init.mjs
# defaults: apps/web (Next.js) + apps/backend (NestJS)
```

**Estrutura:**

```
<nome>/
├── apps/web/               # Next.js (src/)
├── apps/backend/           # NestJS
├── apps/mobile-flutter/    # Flutter (config-project-flutter)
├── packages/shared/        # config-shared-core
├── e2e/smoke.spec.ts
└── turbo.json
```

---

## Etapa 2 — BC Customers (backend)

Ordem inside-out padrão (sem sufixo). Após controller:

```bash
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud --create-fields name,email,cpf --web
npm run test:e2e
```

---

## Etapa 3 — Feature Web Next.js

Next.js neste repositório usa principalmente **`frontend-form-schema`** (RHF + Zod) para formulários.

```
openspec-propose "feat-customer-next"
frontend-form-schema      → schema Zod + React Hook Form
config-new-module         → scaffold packages/customers + rota app/(private)/customers
```

Para **listagem**, estender o módulo web com Server Components ou Client Component + fetch à API — padrão similar ao dashboard gerado por `config-new-module`.

**Agent `frontend-form-schema`:**

> Crie formulário de cadastro de Customer com RHF + Zod: name, email, cpf. POST /customers via server action ou API route proxy.

**Playwright:**

```bash
npm run test:e2e:web
```

---

## Etapa 4 — Feature Flutter

Mesmo fluxo mobile do [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (Etapa 8 — Mobile Flutter) — skills `mobile-*-flutter`.

---

## Checklist

- [ ] Análise (01) → backlog
- [ ] `config-project` + Flutter + Docker + CI/CD + shared-core
- [ ] BC Customers + unit ≥95% + e2e API
- [ ] Formulário Next.js (frontend-form-schema)
- [ ] Telas Flutter
- [ ] CI: lint + test + coverage gate + test:e2e

---

## Próximos passos

- [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) — referência detalhada de BC e mobile
- [Hub Full-Stack](../02-fullstack-project-setup.md)
