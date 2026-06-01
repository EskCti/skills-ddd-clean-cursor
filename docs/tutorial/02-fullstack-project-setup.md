# Tutorial 02 — Full-Stack: Escolha da Combinação

**Objetivo**: Depois da [análise (Tutorial 01)](./01-pipeline-discovery-planning.md), escolher backend + frontend + mobile e seguir o guia da combinação — sempre orquestrado por `config-project-fullstack`.

> **Regra**: Nenhum setup full-stack começa “no escuro”. O `backlog.md` (épicos, BCs, tasks por camada) vem do pipeline `req-*`. O agent **`Config Project Full-Stack`** traduz a combinação escolhida na sequência exata de agents. Cada task usa **Agent** (`display_name`) + **Prompt**.

> **Antes de abrir este tutorial**: confira o [Checklist antes do código](./README.md#checklist-antes-do-código) no README. **DDD** = backend (`req-ddd-modeling`); **CA** = web/mobile (tasks `Frontend *` / `Mobile *`). Ver [DDD vs CA](./README.md#ddd-backend-vs-clean-architecture-webmobile).

---

## Fluxo comum (todas as combinações)

```
Tutorial 01 — req-discovery → req-ddd-modeling → req-migration-strategy → delivery-profile.md → req-agile-planning
                                    │
                                    ▼
                           delivery-profile.md + backlog.md + epics-summary.md
                                    │
                                    ▼
              Config Project Full-Stack  ← informar backend + frontend + mobile
                                    │
                    ┌───────────────┼───────────────────────┐
                    ▼               ▼                       ▼
            Config Project (*)  Config Shared Web (*)   Config Docker + Config CI/CD
            (bootstrap)         shell Tailwind          + Config Shared Core
            stacks/*            sidebar/topbar/rodapé
                    │
                    ▼
         Por BC (inside-out): Core * → Backend * → Frontend * → Mobile * → Unit/E2E Tests
                    │
                    ▼
         [Opcional] Tutorial 04 — OpenSpec (propose → apply → archive)
```

### Prompt inicial — `config-project-fullstack`

> Tenho o backlog em `docs/planning/<projeto>/backlog.md` gerado pelo req-agile-planning.
> Quero criar o projeto `<nome>` com:
> - Backend: [ NestJS | Spring Boot (Kotlin) | Spring Boot (Java) | ASP.NET Core | Axum (Rust) ]
> - Frontend: [ Next.js | Angular | Vue 3 | Nenhum ]
> - Mobile: [ Flutter | Android | Nenhum ]
> Docker e CI/CD no bootstrap. Usar OpenSpec para rastrear mudanças.

O agent responde com: agents de bootstrap, sufixo de skills (`-kt`, `-java`, `-cs`, `-rs` ou nenhum), ordem de EP-000 e link lógico para o tutorial da combinação abaixo.

---

## Matriz de combinações

| Backend | Frontend | Mobile | Quando usar | Tutorial |
|---------|----------|--------|-------------|----------|
| **NestJS** | **Angular** | **Flutter** | Enterprise TS, Tailwind + PrimeNG (widgets), iOS+Android | [nestjs-angular-flutter](./stacks/nestjs-angular-flutter.md) |
| **NestJS** | **Vue 3** | **Flutter** | Produtividade UI (Tailwind + PrimeVue), legado PHP→TS | [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) |
| **NestJS** | **Next.js** | **Flutter** | SSR/SEO, time full TS, tipos compartilhados | [nestjs-next-flutter](./stacks/nestjs-next-flutter.md) |
| **Spring Boot (Kotlin)** | **Vue 3** | **Flutter** | Ecossistema JVM + UI Vue | [spring-vue-flutter](./stacks/spring-vue-flutter.md) |
| **Spring Boot (Java)** | **Vue 3** | **Flutter** | Domínio puro Java + Spring na infra | [java-vue-flutter](./stacks/java-vue-flutter.md) |
| **ASP.NET Core** | **Angular** | **Android** | .NET enterprise + nativo Android | [dotnet-angular-android](./stacks/dotnet-angular-android.md) |
| **ASP.NET Core** | **Vue 3** | **Android** | Legado PHP → .NET + PrimeVue + Compose (RetailOps) | [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) |
| **Axum (Rust)** | **Angular** | **Flutter** | Performance, memória segura, API `:4000` | [rust-vue-flutter](./stacks/rust-vue-flutter.md) *(seção Variante Angular)* |
| **Axum (Rust)** | **Vue 3** | **Flutter** | Rust backend + UI Vue produtiva | [rust-vue-flutter](./stacks/rust-vue-flutter.md) |
| **Qualquer** | — | — | Strangler Fig, só backend / migração incremental | [backend-incremental](./stacks/backend-incremental.md) |

Matriz completa e justificativas: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../config-project-fullstack/references/fullstack-stack-matrix.md)

---

## EP-000 no backlog (padrão full-stack)

Independente da combinação, o **req-agile-planning** deve gerar tasks semelhantes:

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] `infra:fullstack` → **Agent:** `Config Project Full-Stack`
- [ ] `infra:setup`     → **Agent:** `Config Project` / `(Angular)` / `(Vue)` / `(Kotlin)` / `(Java)` / `(C#)` / `(Rust)`
- [ ] `infra:shell-web` → **Agent:** `Config Shared Web` / `(Angular)` / `(Vue)`
- [ ] `infra:docker`    → **Agent:** `Config Docker (TypeScript|Kotlin|Java|C#|Rust)`
- [ ] `infra:cicd`      → **Agent:** `Config CI/CD (TypeScript|Kotlin|Java|C#|Rust)`
- [ ] `domain:shared`   → **Agent:** `Config Shared Core` / `(Kotlin)` / `(Java)` / `(C#)` / `(Rust)`
- [ ] `infra:migration` → **Agent:** `Config Prisma` / `Config JPA (Kotlin)` / `Config JPA (Java)` / `Config EF Core (C#)` / `Config SQLx (Rust)` *(Rust)*
```

---

## Fases por camada (referência rápida)

| Fase | Agents (display_name) | OpenSpec (opcional) |
|------|------------------------|---------------------|
| Bootstrap | Config Project (*), Config Shared Web (*), Config Docker, Config CI/CD, Config Shared Core | `openspec-propose "bootstrap-<nome>"` |
| BC full-stack | Core *, Backend *, Frontend Entity→UseCase→Repository→Page→Form, Mobile Entity→…→Screen, testes API + test:unit-web/mobile | `openspec-propose "ep-XXX-<bc>"` — ver checklist `req-agile-planning` |
| Feature web (isolada) | Frontend Entity → UseCase → Repository → Page → Form | `openspec-propose "feat-<nome>-<fw>"` |
| Feature mobile (isolada) | Mobile Entity → UseCase → Repository → Screen → Form | `openspec-propose "feat-<nome>-<mobile>"` |
| Auth backend | Config Auth Core Basic, Config Auth Backend Basic | `openspec-propose "feat-auth"` |
| Auth web | Config Auth Web Basic (**somente Next.js**) | — |

Ordem inside-out detalhada: [README — Ordem de Implementação](./README.md#ordem-de-implementação-inside-out)

---

## Qual tutorial seguir?

| Situação | Caminho |
|----------|---------|
| Projeto **novo** com web + mobile | 01 → **02 (este)** → tutorial da combinação em `stacks/` |
| **Legado** com migração por BC | 01 → **backend-incremental** → depois combinação full-stack para UI |
| Legado + OpenSpec integrado | 01 → 02 → [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) **ou** [Tutorial 04](./04-ciclo-completo-openspec.md) (narrativa) |
| Já tem backend, falta frontend/mobile | 01 → combinação escolhida (pular bootstrap backend se existir) |
| Dúvida de stack | `Config Project Full-Stack` + matriz acima |

---

## Próximos passos

- Escolha uma linha da [matriz](#matriz-de-combinações) e abra o tutorial em `stacks/`
- [Tutorial 04 — Ciclo OpenSpec](./04-ciclo-completo-openspec.md) — narrativa legado com OpenSpec (stack NestJS + Vue + Flutter)
- [Tutorial 01](./01-pipeline-discovery-planning.md) — se ainda não tiver `backlog.md`
