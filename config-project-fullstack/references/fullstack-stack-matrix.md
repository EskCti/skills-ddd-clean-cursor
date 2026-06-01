# Full-Stack Stack Decision Matrix

## Escolha rápida de stack

| Contexto | Backend | Frontend | Mobile | Justificativa | Tutorial |
|----------|---------|----------|--------|---------------|----------|
| Enterprise TS + PrimeNG | NestJS | Angular | Flutter | Tipagem forte, iOS+Android | [nestjs-angular-flutter](../../docs/tutorial/stacks/nestjs-angular-flutter.md) |
| Legado PHP → TS (referência) | NestJS | Vue+PrimeVue | Flutter | Produtividade UI | [nestjs-vue-flutter](../../docs/tutorial/stacks/nestjs-vue-flutter.md) |
| Startup tech (time JS/TS) | NestJS | Next.js | Flutter | Tipos compartilhados, SSR | [nestjs-next-flutter](../../docs/tutorial/stacks/nestjs-next-flutter.md) |
| Enterprise Java / JVM | Spring Boot | Vue+PrimeVue | Flutter | Spring + Vue | [spring-vue-flutter](../../docs/tutorial/stacks/spring-vue-flutter.md) |
| Enterprise .NET / Azure | ASP.NET Core | Angular | Android | LINQ, Android nativo | [dotnet-angular-android](../../docs/tutorial/stacks/dotnet-angular-android.md) |
| Performance / sistemas críticos | Axum (Rust) | Angular | Flutter | Backend async, memória segura, API `:4000` | [rust-vue-flutter](../../docs/tutorial/stacks/rust-vue-flutter.md) *(seção Variante Angular)* |
| Performance + UI Vue | Axum (Rust) | Vue+PrimeVue | Flutter | Rust backend + produtividade Vue | [rust-vue-flutter](../../docs/tutorial/stacks/rust-vue-flutter.md) |
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

### Stack 4: Axum (Rust) + Angular + Flutter

**Tutorial**: [rust-vue-flutter.md](../../docs/tutorial/stacks/rust-vue-flutter.md) — seção **Variante Angular** para agents frontend Angular.

```
Fase 1 — Setup (inclui Docker + CI/CD)
  openspec-propose "bootstrap-<projeto>"  (se usando openspec)
  openspec-apply-change "bootstrap-<projeto>"
  ├── config-project-rs              → Cargo workspace (shared-kernel + api Axum), docker-compose Postgres
  ├── config-sqlx-rs                 → migrations sqlx (se não incluídas no bootstrap)
  ├── config-project-angular         → apps/web-angular (monorepo ou sibling)
  ├── config-shared-web-angular      → shell Tailwind
  ├── config-project-flutter         → app Flutter → API http://localhost:4000
  ├── config-docker-rs               → Dockerfile multi-stage Rust
  ├── config-cicd-rs                 → GitHub Actions (clippy, test, coverage ≥95%)
  └── config-shared-core-rs          → crates/shared-kernel (Entity, VO, Result, UseCase)

Fase 2 — Domínio (por BC) — sufixo -rs
  config-new-module-rs               → scaffold modules/<bc>/ (domain/application/infrastructure/interfaces)
  core-value-object-rs → core-entity-rs → core-repository-rs
  core-dto-rs → core-use-case-rs → core-query-cqrs-rs
  backend-data-rs → backend-controller-rs
  unit-tests-rs → e2e-tests-rs

Fase 3 — Frontend Angular (por feature)
  frontend-entity-angular → frontend-usecase-angular → frontend-repository-angular
  frontend-page-angular → frontend-form-angular
  Proxy Angular: /api → http://localhost:4000

Fase 4 — Mobile Flutter
  mobile-entity-flutter → mobile-usecase-flutter → mobile-repository-flutter
  mobile-screen-flutter → mobile-form-flutter

Fase 5 — Auth
  (skills auth -rs em roadmap — usar config-auth-* como referência ou implementação manual)
```

**Layout Rust (obrigatório)**: `config-shared-core-rs/references/rust-namespace-layout.md`

- ✅ `modules::customers::domain::Customer`
- ❌ `domain::customer::Customer`

### Stack 5: Axum (Rust) + Vue + Flutter

**Tutorial**: [rust-vue-flutter.md](../../docs/tutorial/stacks/rust-vue-flutter.md)

```
Fase 1 — Setup
  config-project-rs → config-sqlx-rs → config-project-vue → config-shared-web-vue
  → config-project-flutter → config-docker-rs → config-cicd-rs → config-shared-core-rs

Fase 2 — Domínio (por BC) — sufixo -rs
  (igual Stack 4)

Fase 3 — Frontend Vue
  frontend-entity-vue → frontend-usecase-vue → frontend-repository-vue
  frontend-page-vue → frontend-form-vue
  Proxy Vite: /api → http://localhost:4000

Fase 4 — Mobile Flutter
  (igual Stack 4)
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

## Estrutura de repositório recomendada

### Monorepo TypeScript (NestJS + Next/Angular/Vue)

```
<projeto>/
├── apps/
│   ├── backend/              # NestJS
│   ├── web/                  # Next.js
│   ├── web-angular/          # Angular 17+
│   ├── web-vue/              # Vue 3 + PrimeVue
│   ├── mobile-flutter/       # Flutter app
│   └── mobile-android/       # Android app
├── packages/
│   └── <bc>/                 # Shared domain modules (TS monorepo)
├── openspec/
│   └── changes/
├── docs/
├── .github/workflows/
├── docker-compose.yml
└── .env.example
```

### Multi-stack (Spring / .NET / Rust + frontend separado)

```
<projeto>/
├── Cargo.toml                # Rust: [workspace] na raiz (ou apps/backend-rust/)
├── crates/
│   ├── shared-kernel/
│   └── api/                  # Axum binary + modules/<bc>/
├── migrations/               # sqlx (Rust)
├── src/                      # Spring Boot ou ASP.NET (KT/CS)
├── apps/
│   ├── web-angular/
│   ├── web-vue/
│   ├── mobile-flutter/
│   └── mobile-android/
├── openspec/
├── docs/
├── docker-compose.yml
└── .env.example
```

> **Rust**: API default `BIND_ADDR=0.0.0.0:4000`. Frontend e mobile consomem `http://localhost:4000`.

---

## Checklist de projeto completo

- [ ] Bootstrap (config-project) executado para backend + frontend + mobile
- [ ] config-docker + config-cicd executados no bootstrap (sufixo `-rs` se Rust)
- [ ] config-shared-core executado (`config-shared-core-rs` se Rust)
- [ ] Config Prisma / JPA / EF Core / **SQLx** configurado
- [ ] Pelo menos um BC implementado inside-out (`config-new-module-rs` se Rust)
- [ ] Auth configurada (se necessário; Rust: manual ou roadmap)
- [ ] Primeira mudança OpenSpec criada (openspec-propose "bootstrap-<nome>")
