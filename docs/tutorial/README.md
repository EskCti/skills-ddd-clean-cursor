# Tutoriais — Skills DDD/Clean Architecture

Guias práticos do levantamento de requisitos à entrega em produção — **sempre começando pela análise**, depois **full-stack por combinação** de backend + frontend + mobile.

---

## Índice

### Fase 1 — Análise (obrigatória)

| # | Tutorial | Conteúdo |
|---|----------|----------|
| [01](./01-pipeline-discovery-planning.md) | Pipeline de Requisitos e Planejamento | `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → `req-agile-planning` → **`backlog.md`** |

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
| ASP.NET Core | Angular | Android | [stacks/dotnet-angular-android.md](./stacks/dotnet-angular-android.md) |
| Qualquer | — | — | [stacks/backend-incremental.md](./stacks/backend-incremental.md) |

### Fase 3 — Atalhos e integração

| # | Tutorial | Conteúdo |
|---|----------|----------|
| [03](./03-implementacao-modulo.md) | Atalho: Backend incremental | Redireciona para [stacks/backend-incremental.md](./stacks/backend-incremental.md) |
| [04](./04-ciclo-completo-openspec.md) | Ciclo OpenSpec (legado → NestJS+Vue+Flutter) | Narrativa integrada ou referência propose/apply/archive |

---

## Ordem recomendada

```
01 Análise (req-*)  ──►  backlog.md
       │
       ▼
02 Hub Full-Stack  ──►  escolher combinação (stacks/*)
       │
       ├──► backend-incremental  (Strangler Fig / só API)
       │
       ▼
Implementação por BC + testes
       │
       ▼
04 OpenSpec  (referência ou narrativa legado — não duplica 01+02+stack)
```

> O tutorial [NestJS + Angular + Flutter](./stacks/nestjs-angular-flutter.md) é o **mais detalhado** (referência para BC, testes, frontend e mobile).

---

## Pipeline Completo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PIPELINE COMPLETO                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FASE 1 — DESCOBERTA E MODELAGEM (agnóstico)          → Tutorial 01             │
│                                                                                  │
│  Sistema Legado     req-discovery        req-ddd-modeling                       │
│  (qualquer stack) ──(análise)──────────▶ (roadmap DDD)                         │
│                     requirements.md      ddd-strategic-model.md                 │
│                     ddd-analysis.md      ddd-tactical-model.md                  │
│                         │                                                        │
│                         ▼ (se legado)                                            │
│                   req-migration-strategy                                         │
│                   migration-strategy.md                                          │
│                         │                                                        │
│                         ▼                                                        │
│                   req-agile-planning                                             │
│                   backlog.md  ◄── input para config-project-fullstack           │
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
req-discovery → req-ddd-modeling → req-agile-planning
                                         │
                                    backlog.md
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
| Backend | NestJS, Spring Boot, ASP.NET Core | —, `-kt`, `-cs` |
| Frontend | Next.js, Angular, Vue | skills específicos por framework |
| Mobile | Flutter, Android Compose | `-flutter`, `-android` |
