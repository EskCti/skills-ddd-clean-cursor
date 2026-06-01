# Tutoriais — Skills DDD/Clean Architecture

Guias práticos do levantamento de requisitos à entrega em produção — **sempre começando pela análise**, depois **full-stack por combinação** de backend + frontend + mobile.

**Público**: desenvolvedor **pleno** aprendendo a sequência de agents no Cursor. Leia primeiro [Trilha mínima](#trilha-mínima-pleno-1–2-dias) e [Checklist antes do código](#checklist-antes-do-código).

---

## DDD (backend) vs Clean Architecture (web/mobile)

| Camada | O quê modelar | Skills de análise | Skills de implementação |
|--------|---------------|-------------------|-------------------------|
| **Backend** | Domínio canônico: BCs, aggregates, VOs, use cases, API | `req-discovery`, `req-ddd-modeling` | `Core *`, `Backend *`, `test-unit-*`, `test-e2e-*` |
| **Web admin** | Telas, rotas, guards; entidades/use cases **finos** que chamam HTTP | Seções **Apresentação — Web** no `ddd-tactical-model.md` + **Telas e fluxos (web)** na US | `Frontend Entity/UseCase/Repository/Page/Form` |
| **Mobile** | Screens, navegação; mesmo padrão CA no cliente | **Apresentação — Mobile** + **Telas e fluxos (mobile)** | `Mobile Entity/UseCase/Repository/Screen/Form` |

> **Regra**: não duplicar DDD tático no Vue/Android. O `req-ddd-modeling` documenta **apresentação** para planejar; a regra de negócio pesada fica no backend.

---

## Como usar agents no Cursor

| Passo | O que fazer |
|-------|-------------|
| 1 | No chat, escolha o **agent pelo `display_name`** (coluna abaixo) ou cite o skill (`@req-discovery`). |
| 2 | Cole o **prompt** sugerido no tutorial ou adapte com caminhos do seu projeto (`docs/discovery/<projeto>/`). |
| 3 | Confira a **saída** no diretório indicado antes do próximo agent. |
| 4 | Na implementação, use o **Agent** + **Prompt** de cada task do `backlog.md` (não o nome da pasta `core-entity`). |
| 5 | Com OpenSpec: `/opsx:propose` ou skill `openspec-propose` → depois `/opsx:apply` (`openspec-apply-change`). |

**Onde achar o `display_name`**: `.agents/skills/<skill>/agents/openai.yaml` → campo `display_name`.

### Pipeline de análise — agents e artefatos

| Ordem | Skill | Agent (`display_name`) | Entrada | Saída principal |
|-------|--------|------------------------|---------|-----------------|
| 1 | `req-discovery` | **Requirement Discovery** | URL ou pasta do legado | `requirements.md`, `ddd-analysis.md`, **`delivery-inventory.md`** |
| 2 | `req-ddd-modeling` | **DDD Modeling** | discovery ou descrição livre | `ddd-strategic-model.md`, `ddd-tactical-model.md` (+ **Apresentação Web/Mobile** por BC) |
| 3 | `req-migration-strategy` | **Migration Strategy** | discovery + modeling (se legado) | `migration-strategy.md`, `acl-design.md` |
| 4 | *(manual/agent)* | **Agile Planning** (Fase 0) | `delivery-inventory` + tático | **`delivery-profile.md`** em `planning/<projeto>/` |
| 5 | `req-agile-planning` | **Agile Planning** | modeling + **delivery-profile** | `backlog.md` (US com **Telas e fluxos** + tasks por camada) |

### Implementação — ordem típica de agents

| Camada | Exemplos de `display_name` (C# + Vue + Android) |
|--------|--------------------------------------------------|
| Bootstrap | `Config Project Full-Stack`, `Config Project (C#)`, `Config Shared Web (Vue)`, `Config Project (Android)` |
| Backend | `Core Entity (C#)`, `Core Use Case (C#)`, `Backend Data (C#)`, `Backend Controller (C#)` |
| Web | `Frontend Entity (Vue)` → `Frontend UseCase (Vue)` → `Frontend Repository (Vue)` → `Frontend Page (Vue)` |
| Mobile | `Mobile Entity (Android)` → … → `Mobile Screen (Android)` |
| Testes | `Unit Tests (C#)`, `E2E Tests (C#)`; `test:unit-web` / `test:unit-mobile` no backlog |

---

## Checklist antes do código

Marque **sim** em todos antes de abrir o [Tutorial 02](./02-fullstack-project-setup.md) ou rodar `config-project-fullstack`:

- [ ] Existe `docs/discovery/<projeto>/delivery-inventory.md` (se o legado tinha web ou mobile).
- [ ] Existe `docs/modeling/<projeto>/ddd-tactical-model.md` com **Superfícies de entrega** (API | Web | Mobile) em cada BC do MVP.
- [ ] Nos BCs com Web/Mobile = Sim, há seções **Apresentação — Web admin** / **Apresentação — Mobile** (ver [client-presentation-model](../../req-ddd-modeling/references/client-presentation-model.md)).
- [ ] Existe `docs/planning/<projeto>/delivery-profile.md` com **uma** stack fixa (não “agnóstico”).
- [ ] Existe `docs/planning/<projeto>/backlog.md` com EP-000 (docker + cicd + shell web se aplicável).
- [ ] Cada US com web no perfil tem **`### Telas e fluxos (web)`** e tasks `interface:entity` → … → `interface:page` (não só `Frontend Page`).
- [ ] Cada US com mobile tem **`### Telas e fluxos (mobile)`** e bloco `interface:mobile-entity` → …
- [ ] Tasks usam **Agent** + **Prompt** (não só nome de skill).
- [ ] Você sabe qual tutorial `stacks/*` seguir (ex.: [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) neste monorepo).

---

## Trilha mínima (pleno, 1–2 dias)

1. [README](./README.md) (esta página) — DDD vs CA + checklist.
2. [Tutorial 01](./01-pipeline-discovery-planning.md) — rodar agents 1→5 na ordem da tabela acima.
3. Validar [checklist](#checklist-antes-do-código).
4. [Tutorial 02](./02-fullstack-project-setup.md) → tutorial da stack ([dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) no RetailOps).
5. Por épico: [Tutorial 04](./04-ciclo-completo-openspec.md) (comandos OpenSpec) ou agents diretos do backlog.

> Referência longa de implementação: [nestjs-angular-flutter](./stacks/nestjs-angular-flutter.md) — use **depois** da sequência estar clara.

---

## Índice

### Fase 1 — Análise (obrigatória)

| # | Tutorial | Conteúdo |
|---|----------|----------|
| [01](./01-pipeline-discovery-planning.md) | Pipeline de Requisitos e Planejamento | `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → **`delivery-profile.md`** → `req-agile-planning` → **`backlog.md`** |

### Fase 2 — Full-Stack (escolher combinação)

| # | Tutorial | Conteúdo |
|---|----------|----------|
| [02](./02-fullstack-project-setup.md) | **Hub Full-Stack** | Matriz backend + frontend + mobile · `config-project-fullstack` · **shell Tailwind** (`config-shared-web*`) · fluxo comum pós-análise |

| Backend | Frontend | Mobile | Tutorial |
|---------|----------|--------|----------|
| NestJS | Angular | Flutter | [stacks/nestjs-angular-flutter.md](./stacks/nestjs-angular-flutter.md) |
| NestJS | Vue 3 | Flutter | [stacks/nestjs-vue-flutter.md](./stacks/nestjs-vue-flutter.md) |
| NestJS | Next.js | Flutter | [stacks/nestjs-next-flutter.md](./stacks/nestjs-next-flutter.md) |
| Spring Boot | Vue 3 | Flutter | [stacks/spring-vue-flutter.md](./stacks/spring-vue-flutter.md) |
| Axum (Rust) | Vue 3 | Flutter | [stacks/rust-vue-flutter.md](./stacks/rust-vue-flutter.md) |
| ASP.NET Core | Angular | Android | [stacks/dotnet-angular-android.md](./stacks/dotnet-angular-android.md) |
| ASP.NET Core | Vue 3 | Android | [stacks/dotnet-cs-vue-android.md](./stacks/dotnet-cs-vue-android.md) |
| Qualquer | — | — | [stacks/backend-incremental.md](./stacks/backend-incremental.md) |

### Fase 3 — Atalhos e integração

| # | Tutorial | Conteúdo |
|---|----------|----------|
| [03](./03-implementacao-modulo.md) | Atalho: Backend incremental | Redireciona para [stacks/backend-incremental.md](./stacks/backend-incremental.md) |
| [04](./04-ciclo-completo-openspec.md) | Ciclo OpenSpec | Narrativa **NestJS + Vue + Flutter** + comandos propose/apply/archive; RetailOps → [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) |

---

## Ordem recomendada

```
01 Análise (req-* + delivery-profile)  ──►  delivery-profile.md + backlog.md
       │         (validar checklist)
       ▼
02 Hub Full-Stack  ──►  escolher combinação (stacks/*)
       │
       ├──► backend-incremental  (Strangler Fig / só API)
       │
       ▼
Implementação por BC (inside-out) + testes
       │
       ▼
04 OpenSpec  (comandos — narrativa TS; RetailOps usa stack C#)
```

> **Não pule** o [Tutorial 03](./03-implementacao-modulo.md) pensando que substitui o 02 — o 03 só redireciona para incremental; escolha stack no hub antes.

> O tutorial [NestJS + Angular + Flutter](./stacks/nestjs-angular-flutter.md) é o **mais detalhado** (referência para BC, testes, frontend e mobile).

---

## Pipeline Completo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PIPELINE COMPLETO                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FASE 1 — DESCOBERTA E PLANEJAMENTO                   → Tutorial 01             │
│                                                                                  │
│  Sistema Legado     req-discovery        req-ddd-modeling                       │
│  (qualquer stack) ──(análise)──────────▶ (DDD backend + Apresentação UI)      │
│                     requirements.md      ddd-strategic-model.md                 │
│                     delivery-inventory   ddd-tactical-model.md                  │
│                     ddd-analysis.md      (+ superfícies API/Web/Mobile)         │
│                         │                                                        │
│                         ▼ (se legado)                                            │
│                   req-migration-strategy                                         │
│                   migration-strategy.md                                          │
│                         │                                                        │
│                         ▼                                                        │
│                   delivery-profile.md   (stack fixa + tabela por BC)            │
│                         │                                                        │
│                         ▼                                                        │
│                   req-agile-planning                                             │
│                   backlog.md (+ Telas e fluxos por US)                          │
│                         │                                                        │
│                         ▼                                                        │
│              [Checklist antes do código] ──► Tutorial 02                        │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FASE 2 — SETUP (combinação escolhida)                → Tutorial 02 + stacks/*  │
│                                                                                  │
│  config-project-fullstack            ← orquestrador pós-backlog                 │
│  ├── config-project[-angular|-vue|-kt|-cs]                                      │
│  ├── config-project[-flutter|-android]                                          │
│  ├── config-docker[-kt|-cs]                                                     │
│  ├── config-cicd[-kt|-cs]                                                       │
│  └── config-shared-core[-kt|-cs]                                                │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FASE 3 — IMPLEMENTAÇÃO (por BC — inside-out)                                   │
│                                                                                  │
│  core-* → backend-* → test-unit-* → test-e2e-*                                  │
│  frontend-entity/usecase/repository/page/form                                   │
│  mobile-entity/usecase/repository/screen/form                                     │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [OpenSpec] openspec-propose → apply-change → archive-change   → Tutorial 04    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## OpenSpec vs Agents de Domínio

**Não substituem um ao outro** — OpenSpec gerencia mudanças; agents implementam DDD/Clean Architecture.

| Situação | Abordagem |
|----------|-----------|
| Projeto novo solo | 01 → 02 → stack escolhida |
| Time 2+ devs | + Tutorial 04 (OpenSpec) |
| Legado / migração | 01 → backend-incremental **ou** stack completa |
| Feature multi-camada | `openspec-propose` cobrindo backend + web + mobile |

### OpenSpec (explore, propose, apply-change, archive-change)

- Gerencia o **ciclo de vida de uma mudança** (change management)
- Requer a **CLI `openspec`** instalada no projeto
- Cria artefatos em `openspec/changes/<nome>/`: `proposal.md`, `design.md`, `tasks.md`
- **`openspec-apply-change`** executa as tasks e chama os skills de domínio internamente

### Agents de domínio (req-*, core-*, backend-*, frontend-*, mobile-*, config-*)

- Implementam **conhecimento técnico específico** de DDD/Clean Architecture
- Podem ser usados diretamente ou via `openspec-apply-change`

### Fluxo combinado (recomendado para times)

```
req-discovery → req-ddd-modeling → [req-migration-strategy]
       → delivery-profile.md → req-agile-planning → backlog.md
                                         │
                          config-project-fullstack → tutorial stacks/*
                                         │
                          openspec-propose / apply / archive (Tutorial 04)
```

---

## Ordem de Implementação (inside-out)

Para cada funcionalidade (alinhado a `req-agile-planning/references/agile-patterns.md`):

```
── BACKEND ──────────────────────────────────────────────────
1.  domain:vo           → core-value-object[-kt|-cs]
2.  domain:entity       → core-entity[-kt|-cs]
3.  domain:repository   → core-repository[-kt|-cs]
4.  app:dto             → core-dto[-kt|-cs]
5.  app:usecase         → core-use-case[-kt|-cs]
6.  app:query           → core-query-cqrs[-kt|-cs]
7.  infra:persistence   → backend-data[-kt|-cs]
8.  interface:controller → backend-controller[-kt|-cs]
── FRONTEND WEB ─────────────────────────────────────────────
9.  interface:entity/usecase/repo/page/form → frontend-* (Angular/Vue/Next)
── MOBILE ───────────────────────────────────────────────────
10. interface:mobile-*  → mobile-* (Flutter/Android)
── QUALIDADE (por BC) ───────────────────────────────────────
11. test:unit/coverage  → test-unit-* (≥95% domain+application)
12. test:e2e            → test-e2e-* (+ Playwright se UI)
```

---

## Escolha da Stack

Ver matriz completa: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../config-project-fullstack/references/fullstack-stack-matrix.md)

| Camada | Opções | Sufixo skills |
|--------|--------|---------------|
| Backend | NestJS, Spring Boot, ASP.NET Core, Axum (Rust) | —, `-kt`, `-cs`, `-rs` |
| Frontend | Next.js, Angular, Vue | skills específicos por framework |
| Mobile | Flutter, Android Compose | `-flutter`, `-android` |
