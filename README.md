# skills-ddd-clean

Coleção de skills para agentes de IA com foco em **Domain-Driven Design (DDD)** e **Clean Architecture**, pensada para padronizar a arquitetura e a forma de implementação em múltiplos projetos.

Este repositório foi desenhado para ser reutilizado como **Git submodule** em outros repositórios, permitindo compartilhar a mesma base de skills entre times e produtos.

## Propósito

O objetivo é oferecer um conjunto de instruções reutilizáveis para agentes que cubra, de ponta a ponta:

- análise de sistemas legados e planejamento ágil com DDD (`req-*`);
- bootstrap de projetos full-stack com backend, frontend web e mobile (`config-project-fullstack`);
- Docker e CI/CD integrados ao setup do projeto (`config-docker`, `config-cicd`);
- modelagem de domínio com **Entidades**, **Value Objects** e **Domain Services**;
- camada de aplicação com **Use Cases**, **DTOs** e **Controllers**;
- persistência e integração com **Prisma**, **JPA** ou **EF Core**;
- leitura com **CQRS (Query side)**;
- frontend e mobile com **Clean Architecture completa** (entity → use case → repository → page/screen);
- **Tailwind CSS** como padrão de estilização em todos os frontends web (ver `skills-standards.md` §4.1);
- **testes unitários ≥95%** (`test-unit-*`) e **E2E de fluxos críticos** (`test-e2e-*`);
- padronização de nomenclatura e estrutura de código.

## Tutoriais

Guias em [`docs/tutorial/`](docs/tutorial/README.md):

| # | Tutorial | Quando usar |
|---|----------|-------------|
| [01](docs/tutorial/01-pipeline-discovery-planning.md) | Análise e Planejamento (`req-*`) | Sempre primeiro — gera `backlog.md` |
| [02](docs/tutorial/02-fullstack-project-setup.md) | **Hub Full-Stack** | Escolher backend + frontend + mobile após análise |
| — | [Stacks por combinação](docs/tutorial/README.md#fase-2--full-stack-escolher-combinação) | NestJS+Angular+Flutter, NestJS+Vue+Flutter, Axum+Leptos+Flutter, Spring+Vue, .NET+Angular+Android, etc. |
| [03](docs/tutorial/03-implementacao-modulo.md) | Backend incremental (atalho) | Strangler Fig / só API |
| [04](docs/tutorial/04-ciclo-completo-openspec.md) | Ciclo OpenSpec | Legado → NestJS+Vue+Flutter (referência ou narrativa) |

**Ordem**: Análise (01) → Hub (02) → combinação em `stacks/` → OpenSpec (04, referência ou narrativa legado).

## Pilares Arquiteturais

As skills deste repositório seguem estes pilares:

- **Domain-Driven Design (DDD)**
- **Clean Architecture**
- **Separation of Concerns** entre domínio, aplicação, interface e infraestrutura
- **Padronização de contratos e nomenclatura** para previsibilidade do código
- **Reuso de decisões arquiteturais** em múltiplos repositórios

## Estrutura de Skills

### Orquestração Full-Stack

- `config-project-fullstack`: **ponto de entrada recomendado** — orquestra a criação de um projeto completo definindo qual agent chamar para backend + frontend + mobile + Docker/CI/CD, integrado com OpenSpec nos pontos de mudança

### Skills TypeScript (sem sufixo)

Principais skills disponíveis neste repositório:

- `config-project`: inicialização de monorepo com TurboRepo (web + backend) — inclui scaffold E2E (Supertest + Playwright)
- `config-new-module`, `config-shared-core`, `config-shared-web`, `config-shared-web-angular` e `config-shared-web-vue`: scaffolding de módulos/pacotes e **shell web admin** (Tailwind: sidebar, topbar, rodapé)
- `config-prisma`: setup inicial e padronização de Prisma no backend (script `.js`)
- `config-docker`: Dockerfile multi-stage NestJS + Next.js (node:20-alpine multi-stage)
- `config-cicd`: GitHub Actions — lint + test + build Docker + push GHCR + deploy
- `config-auth-core-basic`: auth core básico TypeScript (user, password, application)
- `config-auth-core-full`: auth core completo TypeScript (basic + role, permission, oauth)
- `config-auth-backend-basic`: auth backend NestJS (JWT, Passport, Prisma adapters)
- `config-auth-web-basic`: auth web Next.js (sign-in, sign-up, dashboard, users, profile)
- `core-entity`: modelagem de entidades de domínio
- `core-value-object`: criação de objetos de valor
- `core-domain-service`: regras de domínio transversais
- `core-use-case`: orquestração de regras de aplicação
- `core-dto`: contratos de entrada/saída e projeções
- `core-repository`: contratos e implementações de persistência
- `backend-prisma-data`: schema/migrações/adapters Prisma
- `core-query-cqrs`: consultas de leitura no padrão CQRS
- `backend-controller`: camada HTTP/NestJS
- `test-unit`: testes unitários domain+application (Jest, ≥95% coverage)
- `test-e2e`: testes E2E API (Supertest) e web (Playwright) — `create-e2e-spec.mjs` por BC
- `frontend-form-schema`: formulários React Hook Form + validação

### Skills Kotlin (sufixo `-kt`)

- `config-project-kt`: bootstrap projeto Kotlin multi-módulo com Gradle + Spring Boot
- `config-shared-core-kt`: kernel compartilhado de domínio (Entity, VO, Result, UseCase)
- `config-jpa-kt`: setup JPA/Spring Data, Flyway, Docker Compose (dev local)
- `config-docker-kt`: Dockerfile multi-stage Spring Boot (Gradle builder + JRE alpine runner)
- `config-cicd-kt`: GitHub Actions — gradle test + build Docker + push GHCR + deploy
- `config-new-module-kt`: criação de módulo Kotlin (package Gradle + módulo Spring Boot)
- `config-auth-core-basic-kt`: auth core básico Kotlin (user, password, application + testes)
- `config-auth-core-full-kt`: auth core completo Kotlin (basic + role, permission, oauth)
- `config-auth-backend-basic-kt`: auth backend Spring Boot (JWT, Security, JPA adapters, Flyway)
- `core-entity-kt`: entidades de domínio em Kotlin (data class, companion object, Result)
- `core-value-object-kt`: Value Objects em Kotlin (value class, data class)
- `core-domain-service-kt`: serviços de domínio puros em Kotlin
- `core-use-case-kt`: casos de uso em Kotlin (UseCase interface, suspend, Result)
- `core-dto-kt`: Data Transfer Objects em Kotlin (data class)
- `core-repository-kt`: contratos e implementações de repositório em Kotlin
- `core-query-cqrs-kt`: queries CQRS de leitura em Kotlin
- `backend-controller-kt`: controllers Spring Boot em Kotlin (@RestController)
- `backend-data-kt`: persistência JPA, Spring Data, migrations em Kotlin
- `test-unit-kt`: testes unitários domain+application (JUnit 5 + JaCoCo ≥95%)
- `test-e2e-kt`: testes E2E API Spring Boot (MockMvc + Postgres)

### Skills C# (sufixo `-cs`)

- `config-project-cs`: bootstrap projeto .NET com solução (.sln) multi-projeto Clean Architecture
- `config-shared-core-cs`: kernel compartilhado (Entity, ValueObject, Result, IUseCase, IRepository)
- `config-efcore-cs`: setup Entity Framework Core, DbContext, Fluent API, migrations
- `config-docker-cs`: Dockerfile multi-stage ASP.NET Core (SDK builder + aspnet runtime alpine)
- `config-cicd-cs`: GitHub Actions — dotnet test + build Docker + push GHCR + deploy
- `config-db-seed-cs`: seeding de dados com EF Core (DataSeeder, seeds por módulo)
- `config-new-module-cs`: criação de módulo .NET (Core + Infrastructure + Backend controller)
- `config-auth-core-basic-cs`: auth core básico C# (User, Password, Login/Register use cases)
- `config-auth-core-full-cs`: auth core completo C# (basic + Role, Permission, RBAC)
- `config-auth-backend-basic-cs`: auth backend ASP.NET Core (JWT, BCrypt, Register/Login/Me)
- `core-entity-cs`: entidades de domínio em C# (Entity base, Result, Equals/GetHashCode)
- `core-value-object-cs`: Value Objects em C# (record, ValueObject base)
- `core-domain-service-cs`: serviços de domínio puros em C#
- `core-use-case-cs`: casos de uso em C# (IUseCase, async, Result)
- `core-dto-cs`: Data Transfer Objects em C# (record)
- `core-repository-cs`: contratos de repositório em C# (IRepository, Result)
- `core-query-cqrs-cs`: queries CQRS de leitura em C#
- `backend-controller-cs`: controllers ASP.NET Core ([ApiController], ActionResult)
- `backend-data-cs`: persistência EF Core, adapters, configurations
- `test-unit-cs`: testes unitários Domain+Application (xUnit + Coverlet ≥95%)
- `test-e2e-cs`: testes E2E API (WebApplicationFactory + IntegrationTests)

### Skills Rust (sufixo `-rs`) — backend modular Axum

Layout obrigatório: `config-shared-core-rs/references/rust-namespace-layout.md` — camadas `domain` / `application` / `infrastructure` / `interfaces`, **sem** `domain::customer::Customer`.

**Bootstrap e infra:**
- `config-project-rs`: workspace Cargo (shared-kernel + api Axum), docker-compose dev
- `config-shared-core-rs`: kernel (Entity, ValueObject, Result, UseCase)
- `config-new-module-rs`: scaffold BC em `crates/api/src/modules/<bc>/`
- `config-sqlx-rs`: migrations Postgres (sqlx)
- `config-docker-rs` / `config-cicd-rs`: produção e CI (clippy, test, coverage ≥95%, **memory leak check** ao fechar épico)

**Domínio e aplicação:**
- `core-entity-rs` / `core-value-object-rs` / `core-domain-service-rs` / `core-repository-rs` (ports)
- `core-dto-rs` / `core-use-case-rs` / `core-query-cqrs-rs`

**Infra e interface:**
- `backend-data-rs`: adapters `*RepositorySqlx` + `CustomerRecord`
- `backend-controller-rs`: handlers Axum em `interfaces/http`
- `test-unit-rs` / `test-e2e-rs`: domain+app e integração HTTP

**Tutorial full-stack (Rust + Vue + Flutter):** [docs/tutorial/stacks/rust-vue-flutter.md](docs/tutorial/stacks/rust-vue-flutter.md)

**Tutorial full-stack (Rust + Leptos + Flutter):** [docs/tutorial/stacks/rust-leptos-flutter.md](docs/tutorial/stacks/rust-leptos-flutter.md)

### Skills Java (sufixo `-java`) — backend Spring Boot

Layout obrigatório: `config-shared-core-java/references/java-namespace-layout.md` — domínio puro em `packages/<bc>/`, Spring em `apps/backend-java/modules/<bc>/`.

**Bootstrap e infra:**
- `config-project-java`: Gradle multi-module (shared + backend-java), docker-compose dev
- `config-shared-core-java`: kernel (Result, Entity, UseCase)
- `config-new-module-java`: scaffold BC em `packages/<bc>/` + módulo Spring
- `config-jpa-java`: migrations Flyway + JPA
- `config-docker-java` / `config-cicd-java`: produção e CI (JaCoCo ≥95%)

**Domínio e aplicação:**
- `core-entity-java` / `core-value-object-java` / `core-domain-service-java` / `core-repository-java`
- `core-dto-java` / `core-use-case-java` / `core-query-cqrs-java`

**Infra e interface:**
- `backend-data-java`: adapters JPA + `*JpaEntity` separado do domínio
- `backend-controller-java`: `@RestController` Spring
- `test-unit-java` / `test-e2e-java`: JUnit 5 + MockMvc

**Tutorial full-stack (Java + Vue + Flutter):** [docs/tutorial/stacks/java-vue-flutter.md](docs/tutorial/stacks/java-vue-flutter.md)

### Skills Frontend Angular (sufixo `-angular`) — Clean Architecture completa

Skills para projetos Angular 17+ standalone + NestJS com **todas as camadas DDD**:

**Domínio e Aplicação:**
- `frontend-entity-angular`: entidade TypeScript puro com `Result<T, E>`, `ok()`/`err()` e factory `create()` — sem dependências Angular
- `frontend-usecase-angular`: Angular service (`@Injectable`) como caso de uso — `Promise<Result<T>>`, injeta `InjectionToken<IRepository>`
- `frontend-repository-angular`: `HttpRepository implements IRepository` com HttpClient, DTO mapping, `try/catch → err()`

**Apresentação:**
- `config-project-angular`: bootstrap monorepo NestJS + Angular 17+ com **Tailwind CSS**, PrimeNG (widgets), proxy e docker-compose
- `config-shared-web-angular`: shell admin Tailwind (sidebar colapsável, topbar, rodapé, dashboard vazio)
- `frontend-page-angular`: listagem com DataTable PrimeNG, injeta UseCase (não Service HTTP direto)
- `frontend-form-angular`: formulário Reactive Forms, injeta UseCase, exibe `result.error` da camada de negócio

### Skills Frontend Leptos (sufixo `-leptos`) — Clean Architecture completa

Skills para Leptos SSR + Axum (workspace Cargo) com **todas as camadas DDD** — domínio Rust puro reutilizando `shared_kernel::Result`:

**Domínio e Aplicação:**
- `frontend-entity-leptos`: entidade Rust puro com `shared_kernel::Result<T>` e factory `try_new()` — sem dependências Leptos
- `frontend-usecase-leptos`: struct + `execute()` async retornando `Result<T>` — injeta `Arc<dyn Repository>`
- `frontend-repository-leptos`: `HttpRepository` com reqwest, DTO serde, mapeamento para entidade

**Apresentação:**
- `config-project-leptos`: bootstrap crate `web-leptos` com cargo-leptos, Tailwind v4, API em `:4000`
- `config-shared-web-leptos`: shell admin Tailwind (sidebar colapsável, topbar, rodapé, dashboard vazio)
- `frontend-page-leptos`: listagem SSR com `Resource` + UseCase, erros completos na UI
- `frontend-form-leptos`: formulário com signals, submit via UseCase, exibe `Result::Err` completo

### Skills Frontend Vue (sufixo `-vue`) — Clean Architecture completa

Skills para Vue 3 + **Tailwind CSS** + PrimeVue + NestJS com **todas as camadas DDD**:

**Domínio e Aplicação:**
- `frontend-entity-vue`: entidade TypeScript puro com `Result<T, E>` e factory `create()`
- `frontend-usecase-vue`: classes TypeScript puras (UseCase) com `Promise<Result<T>>` — instanciadas pela Pinia store
- `frontend-repository-vue`: `HttpRepository implements IRepository` com fetch, DTO mapping; Pinia store instancia `UseCase(repository)`

**Apresentação:**
- `config-project-vue`: bootstrap monorepo NestJS + Vue 3 + **Tailwind CSS** + PrimeVue (widgets), Pinia, proxy Vite
- `config-shared-web-vue`: shell admin Tailwind (sidebar colapsável, topbar, rodapé, dashboard vazio)
- `frontend-page-vue`: listagem DataTable PrimeVue, store usa UseCase (não fetch direto)
- `frontend-form-vue`: formulário vee-validate + Zod, `store.create()` retorna `Result` para exibir erros de negócio

### Skills Mobile Flutter (sufixo `-flutter`) — Clean Architecture completa

Skills para Flutter com **domain → data → presentation** e padrão `sealed class Result<T>`:

**Domínio e Aplicação:**
- `mobile-entity-flutter`: entidade Dart puro com `sealed class Result<T>` (Success/Failure), `sealed class <Bc>Failure`
- `mobile-usecase-flutter`: `abstract class UseCase<Type, Params>` com `Future<Result<Type>>` — sem Flutter deps
- `mobile-repository-flutter`: `IRepository` (Dart puro) + `RepositoryImpl` com Dio/datasource + `DioException → Failure`

**Apresentação:**
- `config-project-flutter`: bootstrap Flutter com clean architecture, Riverpod, Dio, go_router
- `mobile-screen-flutter`: tela com AsyncNotifier que injeta UseCase (não repository diretamente)
- `mobile-form-flutter`: formulário Flutter que chama UseCase via notifier, trata `result.when(success:, failure:)`

### Skills Mobile Android (sufixo `-android`) — Clean Architecture completa

Skills para Android Kotlin com Jetpack Compose e **domain → data → presentation** com `kotlin.Result<T>`:

**Domínio e Aplicação:**
- `mobile-entity-android`: entidade Kotlin puro com `sealed class Failure : Exception()` e `companion fun create(): Result<Entity>`
- `mobile-usecase-android`: `interface UseCase<in Params, out R>` com `suspend invoke(): Result<R>` — sem Android deps
- `mobile-repository-android`: `IRepository` Kotlin puro + `RepositoryImpl @Inject` com `runCatching {}` + Retrofit

**Apresentação:**
- `config-project-android`: bootstrap Android com Compose, Hilt, Retrofit e Navigation Compose
- `mobile-screen-android`: ViewModel `@Inject` recebe UseCase (não IRepository), expõe `StateFlow<UiState>`
- `mobile-form-android`: formulário Compose, ViewModel com `createState: StateFlow<CreateState>` + `LaunchedEffect`

### Skills de Requisitos, Migração e Planejamento (agnóstico de linguagem)

Skills para análise de sistemas existentes, modelagem DDD, estratégia de migração e planejamento ágil:

- `req-discovery`: analisar sistema existente (**qualquer linguagem** — PHP, Go, Python, Java, etc.) via URL ou caminho local, documentando requisitos em DDD/Clean Architecture
- `req-ddd-modeling`: aplicar o **Roadmap DDD** (Estratégico → Tático → Operacional) sobre requisitos — subdomínios (Core/Supporting/Generic), bounded contexts com cardinalidade (1:1, 1:N, N:1), context map, linguagem ubíqua, padrões táticos (entities, VOs, domain events) e recomendação de topologia (monólito modular vs microserviços)
- `req-migration-strategy`: definir a **estratégia de migração de legado** para DDD/Clean Architecture — Strangler Fig, sequência por BC, Anti-Corruption Layer (ACL) e plano de coexistência
- `req-agile-planning`: organizar requisitos em épicos, stories e tasks DDD, com referência aos **skills TS/KT/CS deste repositório** para implementação

### Skills utilitárias (OpenSpec)

Também existem skills utilitárias para fluxo OpenSpec:

- `openspec-propose`
- `openspec-explore`
- `openspec-apply-change`
- `openspec-archive-change`

### Skills de workflow (Git)

- `git-organized-commits`: commits **atômicos por área** (sem `git add .`), mensagens convencionais com corpo descritivo e template de PR em 4 crases — agent **`Organized Git Commits`**

## Como usar como submódulo

Você pode instalar este repositório em `.agents` ou `.cloud`, conforme o runtime/agente utilizado no projeto.

### Opção A: pasta `.agents`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .agents/skills
git submodule update --init --recursive
```

### Opção B: pasta `.cloud`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .cloud/skills
git submodule update --init --recursive
```

## Atualizar skills no projeto consumidor

Para atualizar o ponteiro do submódulo para a versão mais recente:

```bash
# Exemplo com .agents
cd .agents/skills
git checkout main
git pull origin main
cd -

git add .agents/skills
git commit -m "chore(skills): atualiza submódulo skills-ddd-clean"
```

> Se o submódulo estiver em `.cloud`, ajuste o caminho nos comandos.

## Como contribuir com novas skills (a partir de outro projeto)

É possível evoluir as skills diretamente do repositório consumidor (onde o submódulo está instalado):

1. Entrar na pasta do submódulo.
2. Criar uma branch no repositório de skills.
3. Implementar/ajustar as skills.
4. Commitar e enviar para o remoto do repositório de skills.
5. Abrir PR e fazer merge.
6. Voltar ao projeto consumidor e atualizar o ponteiro do submódulo.

Exemplo:

```bash
cd .agents/skills
git checkout -b feat/nova-skill-ou-ajuste
# editar arquivos...
git add .
git commit -m "feat(skill): adiciona nova skill"
git push -u origin feat/nova-skill-ou-ajuste

# depois do merge no repo de skills
cd .agents/skills
git checkout main
git pull origin main
cd -
git add .agents/skills
git commit -m "chore(skills): aponta para nova versão"
```

## Configuração de namespace e padrões

O repositório possui configuração padrão em:

- `.env/skills.config.json`
- `.env/skills.config.example.json`

Use esses arquivos para alinhar namespace e convenções de scaffolding entre projetos.

Parâmetros principais disponíveis hoje:

- `namespace`: namespace dos packages (ex.: `@my-org`)
- `sharedModulePath`: caminho relativo completo do módulo shared (ex.: `packages/shared`, `packages/core/shared`)
- `frontendAppPath`: caminho relativo completo da app frontend (ex.: `apps/web`, `applications/front`)
- `backendAppPath`: caminho relativo completo da app backend (ex.: `apps/backend`, `services/api`)
- `frontendPort`: porta padrão da app frontend
- `backendPort`: porta padrão da app backend
- `frontendApiUrlEnvVar`: nome da env var de URL de API no frontend
- `backendPortEnvVar`: nome da env var de porta no backend
- `docsPath`: caminho relativo para documentação gerada (ex.: `docs`), usado por `req-discovery` e `req-agile-planning`

Convenção global de nomenclatura e padrões gerais:

- `skills-standards.md` (na raiz do repositório, ou `.agents/skills/skills-standards.md` quando usado como submódulo)

## Benefícios esperados

- consistência arquitetural entre projetos;
- menor tempo de setup e implementação;
- redução de divergências de naming e organização;
- evolução centralizada das práticas de DDD + Clean Architecture.
