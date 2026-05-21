# Full-Stack Stack Decision Matrix

## Escolha rápida de stack

| Contexto | Backend | Frontend | Mobile | Justificativa | Tutorial |
|----------|---------|----------|--------|---------------|----------|
| Enterprise TS + PrimeNG | NestJS | Angular | Flutter | Tipagem forte, iOS+Android | [nestjs-angular-flutter](../../docs/tutorial/stacks/nestjs-angular-flutter.md) |
| Legado PHP → TS (referência) | NestJS | Vue+PrimeVue | Flutter | Produtividade UI | [nestjs-vue-flutter](../../docs/tutorial/stacks/nestjs-vue-flutter.md) |
| Startup tech (time JS/TS) | NestJS | Next.js | Flutter | Tipos compartilhados, SSR | [nestjs-next-flutter](../../docs/tutorial/stacks/nestjs-next-flutter.md) |
| Enterprise Java / JVM | Spring Boot | Vue+PrimeVue | Flutter | Spring + Vue | [spring-vue-flutter](../../docs/tutorial/stacks/spring-vue-flutter.md) |
| Enterprise .NET / Azure | ASP.NET Core | Angular | Android | LINQ, Android nativo | [dotnet-angular-android](../../docs/tutorial/stacks/dotnet-angular-android.md) |
| Migração incremental | Qualquer | — | — | Strangler Fig | [backend-incremental](../../docs/tutorial/stacks/backend-incremental.md) |

---

## Sequência de agents por stack combinada

> **Tutoriais passo a passo**: [Hub Full-Stack](../../docs/tutorial/02-fullstack-project-setup.md) · pasta [`docs/tutorial/stacks/`](../../docs/tutorial/stacks/)

### Stack 1: NestJS + Angular + Flutter (enterprise JS)

**Tutorial**: [nestjs-angular-flutter.md](../../docs/tutorial/stacks/nestjs-angular-flutter.md)

```
Fase 1 — Setup (inclui Docker + CI/CD)
  openspec-propose "bootstrap-<projeto>"  (se usando openspec)
  openspec-apply-change "bootstrap-<projeto>"
  ├── config-project-angular           → monorepo NestJS + Angular + docker-compose dev
  ├── config-shared-web-angular        → shell Tailwind (sidebar, topbar, rodapé)
  ├── config-project-flutter           → app Flutter separado
  ├── config-docker                    → Dockerfile multi-stage (produção)
  ├── config-cicd                      → GitHub Actions CI + CD
  └── config-shared-core               → shared kernel DDD

Fase 2 — Domínio (por BC)
  openspec-propose "bc-<nome>"          (se usando openspec)
  core-value-object → core-entity → core-domain-service
  core-repository → core-dto → core-use-case → core-query-cqrs
  backend-prisma-data → backend-controller

Fase 3 — Frontend Angular (por feature)
  openspec-propose "feat-<nome>-angular"
  frontend-entity-angular → frontend-usecase-angular → frontend-repository-angular
  frontend-page-angular → frontend-form-angular

Fase 4 — Mobile Flutter (por tela)
  openspec-propose "feat-<nome>-flutter"
  mobile-entity-flutter → mobile-usecase-flutter → mobile-repository-flutter
  mobile-screen-flutter → mobile-form-flutter

Fase 5 — Auth
  config-auth-core-basic → config-auth-backend-basic → config-auth-web-basic
```

### Stack 2: Spring Boot (KT) + Vue + Flutter

**Tutorial**: [spring-vue-flutter.md](../../docs/tutorial/stacks/spring-vue-flutter.md)

```
Fase 1 — Setup (inclui Docker + CI/CD)
  config-project-kt → config-project-vue → config-shared-web-vue → config-project-flutter
  config-docker-kt → config-cicd-kt
  config-shared-core-kt

Fase 2 — Domínio (por BC) — sufixo -kt
  core-value-object-kt → core-entity-kt → ...
  backend-controller-kt

Fase 3 — Frontend Vue (por feature)
  frontend-entity-vue → frontend-usecase-vue → frontend-repository-vue
  frontend-page-vue → frontend-form-vue

Fase 4 — Mobile Flutter
  mobile-entity-flutter → mobile-usecase-flutter → mobile-repository-flutter
  mobile-screen-flutter → mobile-form-flutter
```

### Stack 3: ASP.NET Core (CS) + Angular + Android

**Tutorial**: [dotnet-angular-android.md](../../docs/tutorial/stacks/dotnet-angular-android.md)

```
Fase 1 — Setup (inclui Docker + CI/CD)
  config-project-cs → config-project-angular → config-shared-web-angular → config-project-android
  config-docker-cs → config-cicd-cs

Fase 2 — Domínio (por BC) — sufixo -cs
  core-value-object-cs → core-entity-cs → ...
  backend-controller-cs

Fase 3 — Frontend Angular (por feature)
  frontend-entity-angular → frontend-usecase-angular → frontend-repository-angular
  frontend-page-angular → frontend-form-angular

Fase 4 — Mobile Android
  mobile-entity-android → mobile-usecase-android → mobile-repository-android
  mobile-screen-android → mobile-form-android
```

---

## Quando usar OpenSpec

| Situação | Usar OpenSpec? | Motivo |
|----------|---------------|--------|
| Projeto novo solo (1 dev) | Opcional | Agents diretos são mais rápidos |
| Time de 2+ devs | Recomendado | Rastreabilidade de mudanças |
| Feature com múltiplas camadas (backend+frontend+mobile) | Fortemente recomendado | Uma mudança OpenSpec cobre todas as camadas |
| Refatoração/migração de legado | Recomendado | req-discovery → openspec-propose → openspec-apply-change |
| Hotfix urgente | Não necessário | Agents diretos |
| Sprint planning + execução | Recomendado | backlog.md → openspec-propose por épico → apply |

---

## Estrutura de repositório recomendada (monorepo)

```
<projeto>/
├── apps/
│   ├── backend/              # NestJS | Spring Boot | ASP.NET Core
│   ├── web/                  # Next.js
│   ├── web-angular/          # Angular 17+
│   ├── web-vue/              # Vue 3 + PrimeVue
│   ├── mobile-flutter/       # Flutter app
│   └── mobile-android/       # Android app
├── packages/
│   └── <bc>/                 # Shared domain modules (TS monorepo)
├── openspec/
│   └── changes/              # OpenSpec changes (proposal, design, tasks)
├── docs/
│   ├── discovery/            # req-discovery outputs
│   ├── modeling/             # req-ddd-modeling outputs
│   └── planning/             # req-agile-planning outputs
├── .github/
│   └── workflows/            # CI/CD pipelines
├── docker-compose.yml        # Serviços locais (Postgres, Redis, etc.)
└── .env.example
```

---

## Checklist de projeto completo

- [ ] Bootstrap (config-project) executado para backend + frontend + mobile
- [ ] config-docker + config-cicd executados no bootstrap
- [ ] config-shared-core executado
- [ ] Config Prisma / JPA / EF Core configurado
- [ ] Pelo menos um BC implementado inside-out
- [ ] Auth configurada (se necessário)
- [ ] Primeira mudança OpenSpec criada (openspec-propose "bootstrap-<nome>")
