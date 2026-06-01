---
name: config-project-fullstack
stack: agnostic
description: Orquestrar a criação de um projeto full-stack completo com backend (NestJS/Spring Boot Kotlin/Spring Boot Java/ASP.NET Core/Axum Rust), frontend (Next.js/Angular/Vue com Tailwind CSS) e mobile opcional (Flutter/Android). Integrar OpenSpec para gerenciamento de mudanças ao longo do ciclo. Usar quando o pedido envolver criar um projeto do zero com múltiplas camadas, ou quando o usuário não sabe por onde começar.
---

# Config Project Full-Stack

## Overview

Guia o usuário pela criação de um projeto completo — backend + frontend + mobile — orquestrando os agents corretos em sequência e integrando o OpenSpec nos pontos de mudança.

**Este skill não gera código diretamente.** Ele define QUAL agent chamar, em qual ORDEM e com qual PROMPT, incluindo os pontos onde o OpenSpec agrega valor.

---

## Etapa 0 — Definição do projeto

Antes de iniciar, coletar as seguintes decisões:

```
1. Nome do projeto: <kebab-case>
2. Backend: [ ] NestJS (TypeScript)  [ ] Spring Boot (Kotlin)  [ ] Spring Boot (Java)  [ ] ASP.NET Core (C#)  [ ] Axum (Rust)
3. Frontend: [ ] Next.js (+ Tailwind/Shadcn)  [ ] Angular (+ Tailwind)  [ ] Vue 3 (+ Tailwind)  [ ] Nenhum
4. Mobile:   [ ] Flutter  [ ] Android (Kotlin + Compose)  [ ] Ambos  [ ] Nenhum
5. Autenticação: [ ] Básica (JWT)  [ ] Completa (RBAC)  [ ] Nenhuma por agora
6. OpenSpec: [ ] Sim, quero rastrear mudanças com openspec  [ ] Não (agents diretos)
```

---

## Etapa 1 — Bootstrap do Projeto

### 1A — Projeto backend + frontend web

Escolha o agent conforme a combinação:

| Backend | Frontend | Agent a usar | Prompt sugerido |
|---------|----------|--------------|-----------------|
| NestJS (TS) | Next.js | `Config Project` → `Config Shared Web` | "Bootstrap monorepo NestJS + Next.js com TurboRepo, Prisma, docker-compose. Depois: Config Shared Web (Tailwind + Shadcn + shell admin)." |
| NestJS (TS) | Angular | `Config Project (Angular)` → `Config Shared Web (Angular)` | "Bootstrap monorepo NestJS + Angular 17+ com Tailwind. Depois: Config Shared Web (Angular) para shell admin." |
| NestJS (TS) | Vue 3 | `Config Project (Vue)` → `Config Shared Web (Vue)` | "Bootstrap monorepo NestJS + Vue 3 + Tailwind. Depois: Config Shared Web (Vue) para shell admin." |
| Spring Boot (KT) | Angular | `Config Project (Kotlin)` + `Config Project (Angular)` → `Config Shared Web (Angular)` | Backend primeiro; depois frontend + shell. |
| Spring Boot (Java) | Angular | `Config Project (Java)` + `Config Project (Angular)` → `Config Shared Web (Angular)` | Gradle multi-module; domain em `packages/`, Spring em `apps/backend-java`. |
| Spring Boot (Java) | Vue 3 | `Config Project (Java)` + `Config Project (Vue)` → `Config Shared Web (Vue)` | Idem; proxy Vite `/api` → `http://localhost:4000`. |
| Spring Boot (KT) | Vue 3 | `Config Project (Kotlin)` + `Config Project (Vue)` → `Config Shared Web (Vue)` | Backend primeiro; depois frontend + shell. |
| ASP.NET Core (CS) | Angular | `Config Project (C#)` + `Config Project (Angular)` → `Config Shared Web (Angular)` | Backend primeiro; depois frontend + shell. |
| ASP.NET Core (CS) | Vue 3 | `Config Project (C#)` + `Config Project (Vue)` → `Config Shared Web (Vue)` | Backend primeiro; depois frontend + shell. |
| Axum (Rust) | Angular | `Config Project (Rust)` + `Config Project (Angular)` → `Config Shared Web (Angular)` | Cargo workspace na raiz ou `apps/backend/`; API em `:4000`; depois frontend + shell. |
| Axum (Rust) | Vue 3 | `Config Project (Rust)` + `Config Project (Vue)` → `Config Shared Web (Vue)` | Idem; proxy Vite `/api` → `http://localhost:4000`. |
| Axum (Rust) | Nenhum | `Config Project (Rust)` | API-only; mobile opcional apontando para `:4000`. |

> **Java (Spring Boot)**: Gradle multi-module — `packages/<bc>/` (domain + application, pure Java) + `apps/backend-java/modules/<bc>/` (JPA + `@RestController`). Layout: `java-namespace-layout.md`. **Kotlin vs Java**: mesma stack Spring; Kotlin usa skills `-kt`, Java usa `-java`.

> **Rust**: backend é workspace Cargo (`shared-kernel` + `api` Axum), **não** monorepo Turbo. Layout modular por BC: `config-shared-core-rs/references/rust-namespace-layout.md` — camadas `domain` / `application` / `infrastructure` / `interfaces`, sem `domain::customer::Customer`.

> **OpenSpec aqui**: Se usar OpenSpec, criar a mudança ANTES do bootstrap:
> ```
> Agent: openspec-propose
> Prompt: "Crie a mudança 'bootstrap-<nome-projeto>' com proposta, design e tasks para setup do projeto <stack escolhida>."
> Depois: openspec-apply-change → chama o Config Project correto.
> ```

### 1B — Shell web (Tailwind + layout profissional)

Após `config-project-*` do frontend:

| Frontend | Agent | Prompt sugerido |
|----------|-------|-----------------|
| Next.js | `Config Shared Web` | "Configure shell admin Tailwind + Shadcn: sidebar, topbar, rodapé, dashboard vazio." |
| Angular | `Config Shared Web (Angular)` | "Execute init-shared-web-angular.mjs e mescle app.routes.shell.ts." |
| Vue | `Config Shared Web (Vue)` | "Execute init-shared-web-vue.mjs, configure @tailwindcss/vite e mescle shell.routes.ts." |

### 1C — Projeto mobile

Após o backend estar configurado:

| Mobile | Agent | Prompt sugerido |
|--------|-------|-----------------|
| Flutter | `Config Project (Flutter)` | "Configure o app Flutter consumindo a API em http://localhost:4000, estrutura clean por feature, Riverpod, Dio, go_router." |
| Android | `Config Project (Android)` | "Configure o app Android com Compose, Hilt, Retrofit apontando para http://localhost:4000, Navigation Compose." |
| Ambos | Rodar Flutter → Android | Executar em sequência, ambos apontando para o mesmo backend. |

### 1D — Docker e CI/CD (durante o bootstrap)

Após o bootstrap de backend + frontend (+ mobile, se houver), configure **produção e pipeline** antes de implementar BCs:

| Stack | Docker | CI/CD |
|-------|--------|-------|
| TypeScript | `config-docker` | `config-cicd` |
| Kotlin | `config-docker-kt` | `config-cicd-kt` |
| C# | `config-docker-cs` | `config-cicd-cs` |
| Rust | `config-docker-rs` | `config-cicd-rs` |
| Java | `config-docker-java` | `config-cicd-java` |

> **Java (bootstrap completo)**: após `Config Project (Java)`, incluir `Config JPA (Java)`, `Config Docker (Java)` e `Config CI/CD (Java)` (JaCoCo ≥95% domain+application).

> **Rust (bootstrap completo)**: após `Config Project (Rust)`, incluir `Config SQLx (Rust)` se migrations ainda não existirem, `Config Docker (Rust)` e `Config CI/CD (Rust)` (clippy, test, coverage ≥95% domain+application).

> **OpenSpec aqui**: incluir `config-docker` e `config-cicd` na mudança `bootstrap-<nome>`:
> ```
> Agent: openspec-propose
> Prompt: "Crie a mudança 'bootstrap-<nome>' com tasks para config-project, config-docker, config-cicd e config-shared-core."
> Depois: openspec-apply-change → executa todos no bootstrap.
> ```

---

## Etapa 2 — Shared Kernel e Módulo Base

Após o bootstrap, configurar o kernel compartilhado de domínio:

| Stack | Agent | Prompt |
|-------|-------|--------|
| TypeScript | `Config Shared Core` | "Crie o shared kernel com Entity, ValueObject, Result, IUseCase base." |
| Kotlin | `Config Shared Core (Kotlin)` | "Crie o shared kernel Kotlin com Entity, VO, Result, UseCase, Repository interfaces." |
| C# | `Config Shared Core (C#)` | "Crie o shared kernel C# com Entity, ValueObject, Result<T>, IUseCase, IRepository." |
| Rust | `Config Shared Core (Rust)` | "Estenda crates/shared-kernel com Entity, ValueObject, Result, UseCase. Siga rust-namespace-layout.md — sem dependências Axum/sqlx no kernel." |
| Java | `Config Shared Core (Java)` | "Estenda packages/shared com Result, Entity, UseCase. Siga java-namespace-layout.md — sem Spring no shared kernel." |

> **OpenSpec aqui**: Para cada Bounded Context novo, use `openspec-propose` antes de criar o módulo:
> ```
> Agent: openspec-propose
> Prompt: "Crie a mudança 'bc-customers' para implementar o Bounded Context de Clientes: Customer entity, VOs (Name, Email, CPF), CreateCustomerUseCase, CustomerRepository."
> Depois: openspec-apply-change → aciona Core Entity, Core Value Object, Core Use Case, Backend Controller, Frontend Entity (*), etc. (conforme tasks.md com **Agent** + **Prompt**)
> ```

---

## Etapa 3 — Implementação Inside-Out (por Bounded Context)

Para cada BC identificado no backlog, seguir esta ordem:

```
1. domain:vo          → core-value-object[-kt|-cs|-rs|-java]
2. domain:entity      → core-entity[-kt|-cs|-rs|-java]
3. domain:service     → core-domain-service[-kt|-cs|-rs|-java]   (se necessário)
4. domain:repository  → core-repository[-kt|-cs|-rs|-java]
5. app:dto            → core-dto[-kt|-cs|-rs|-java]
6. app:usecase        → core-use-case[-kt|-cs|-rs|-java]
7. app:query          → core-query-cqrs[-kt|-cs|-rs|-java]
8. infra:persistence  → backend-data[-kt|-cs|-rs|-java] | backend-prisma-data (TS)
9. infra:migration    → config-jpa-kt | config-jpa-java | config-efcore-cs | config-sqlx-rs | config-prisma
10. interface:controller → backend-controller[-kt|-cs|-rs|-java]
```

> **Java — novo BC**: antes das tasks acima, `Config New Module (Java)` scaffold em `packages/<bc>/` + `apps/backend-java/modules/<bc>/`.

> **Rust — novo BC**: antes das tasks acima, `Config New Module (Rust)` scaffold em `crates/api/src/modules/<bc>/`.

### 3A — Frontend Web (por página/feature)

Após o endpoint do backend estar pronto:

| Framework | Domínio + Aplicação + Infra | Apresentação |
|-----------|----------------------------|--------------|
| Next.js | `Frontend Form Schema` | `Frontend Form Schema` |
| Angular | `Frontend Entity (Angular)` → `Frontend UseCase (Angular)` → `Frontend Repository (Angular)` | `Frontend Page (Angular)`, `Frontend Form (Angular)` |
| Vue | `Frontend Entity (Vue)` → `Frontend UseCase (Vue)` → `Frontend Repository (Vue)` | `Frontend Page (Vue)`, `Frontend Form (Vue)` |

> **OpenSpec aqui**: Para features novas no frontend:
> ```
> Agent: openspec-propose
> Prompt: "Crie a mudança 'feat-customer-list-angular' para implementar a listagem de clientes em Angular com DataTable PrimeNG, CustomerService e rota lazy."
> Depois: openspec-apply-change → aciona Frontend Entity (Angular), Frontend UseCase (Angular), Frontend Repository (Angular), Frontend Page (Angular) — uma task por camada no tasks.md.
```

### 3B — Mobile (por tela/feature)

Após a API estar pronta:

| Framework | Domínio + Aplicação + Infra | Apresentação |
|-----------|----------------------------|--------------|
| Flutter | `Mobile Entity (Flutter)` → `Mobile UseCase (Flutter)` → `Mobile Repository (Flutter)` | `Mobile Screen (Flutter)`, `Mobile Form (Flutter)` |
| Android | `Mobile Entity (Android)` → `Mobile UseCase (Android)` → `Mobile Repository (Android)` | `Mobile Screen (Android)`, `Mobile Form (Android)` |

> **OpenSpec aqui**: Para features novas no mobile:
> ```
> Agent: openspec-propose
> Prompt: "Crie a mudança 'feat-customer-list-flutter' para tela de listagem de clientes Flutter com Riverpod AsyncNotifier, ListView e RefreshIndicator."
> Depois: openspec-apply-change → aciona Mobile Entity (Flutter), Mobile UseCase (Flutter), Mobile Repository (Flutter), Mobile Screen (Flutter).
> ```

---

## Etapa 4 — Autenticação (opcional)

| Stack | Auth Básica (JWT) | Auth Completa (RBAC) |
|-------|-------------------|----------------------|
| TypeScript | `Config Auth Core Basic` → `Config Auth Backend Basic` → `Config Auth Web Basic` | `Config Auth Core Full` |
| Kotlin | `Config Auth Core Basic (Kotlin)` → `Config Auth Backend Basic (Kotlin)` | `Config Auth Core Full (Kotlin)` |
| C# | `Config Auth Core (C#)` → `Config Auth Backend Basic (C#)` | `Config Auth Core Full (C#)` |
| Java | — (skills auth `-java` em roadmap) | — |

> **Java + auth**: usar `config-auth-*-kt` como referência de domínio ou implementar em `packages/auth/` seguindo `java-namespace-layout.md`.

---

## Pontos de uso do OpenSpec (resumo)

| Momento | Mudança sugerida | Agents envolvidos no apply |
|---------|-----------------|---------------------------|
| Bootstrap do projeto | `bootstrap-<nome>` | Config Project (*), Config Shared Web (*), Config Docker, Config CI/CD, Config Shared Core, Config SQLx (Rust se `-rs`) |
| Novo Bounded Context | `bc-<nome>` ou `ep-XXX-<bc>` | Core *, Backend *, Frontend *, Mobile *, Unit Tests, E2E Tests |
| Feature frontend | `feat-<nome>-<framework>` | Frontend Entity → UseCase → Repository → Page → Form |
| Feature mobile | `feat-<nome>-<mobile>` | Mobile Entity → UseCase → Repository → Screen → Form |
| Autenticação | `feat-auth` | Config Auth Core Basic, Config Auth Backend Basic (+ Config Auth Web Basic se Next.js) |

> O OpenSpec é **opcional mas recomendado** para times de 2+ pessoas ou projetos com múltiplas features em paralelo. Para projetos solo ou protótipos, usar os agents diretamente é mais rápido.

---

## Workflow rápido (sem OpenSpec)

```
1. Tutorial 01 (req-*) → backlog.md
2. Tutorial 02 Hub → escolher combinação (docs/tutorial/stacks/)
3. config-project-fullstack → bootstrap + docker + cicd + shared-core
4. Por BC: inside-out → test-unit-* → test-e2e-*
5. Frontend/mobile por feature
6. Config Auth (se necessário)
```

Tutoriais: [docs/tutorial/02-fullstack-project-setup.md](../docs/tutorial/02-fullstack-project-setup.md) · [docs/tutorial/stacks/](../docs/tutorial/stacks/) · [Rust + Vue + Flutter](../docs/tutorial/stacks/rust-vue-flutter.md) · [Java + Vue + Flutter](../docs/tutorial/stacks/java-vue-flutter.md)

---

## References

- Consultar references/fullstack-stack-matrix.md para tabela completa de decisão de stack.
- Tutoriais por combinação: docs/tutorial/02-fullstack-project-setup.md (hub) e docs/tutorial/stacks/.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
