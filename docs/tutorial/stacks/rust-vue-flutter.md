# Stack: Axum (Rust) + Vue 3 + Flutter

**Combinação**: Backend Rust (Axum + sqlx) · Frontend Vue 3 (PrimeVue) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Backend de alta performance e memória segura, UI Vue produtiva (Tailwind + PrimeVue), Flutter cross-platform. API REST em `:4000`.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project (Rust)` → `Config SQLx (Rust)` → `Config Project (Vue)` → `Config Shared Web (Vue)` → `Config Project (Flutter)` → `Config Docker (Rust)` → `Config CI/CD (Rust)` → `Config Shared Core (Rust)` → `Core * (Rust)` + `Frontend * (Vue)` + `Mobile * (Flutter)` → `Unit Tests (Rust)` → `E2E Tests (Rust)`

> **Layout obrigatório**: [`config-shared-core-rs/references/rust-namespace-layout.md`](../../../config-shared-core-rs/references/rust-namespace-layout.md) — camadas `domain` / `application` / `infrastructure` / `interfaces`, **sem** `domain::customer::Customer`.

---

## Etapa 0 — Orquestração

> Projeto `<nome>`: Axum + Vue + Flutter. Backlog pronto. Docker/CI/CD no bootstrap.

**Prompt inicial — `Config Project Full-Stack`:**

> Tenho o backlog em `docs/planning/<nome>/backlog.md`.
> Quero criar o projeto `<nome>` com:
> - Backend: Axum (Rust)
> - Frontend: Vue 3
> - Mobile: Flutter
> Docker e CI/CD no bootstrap. Usar OpenSpec para rastrear mudanças.

**Sequência EP-000:**

```
openspec-propose "bootstrap-<nome>"
openspec-apply-change "bootstrap-<nome>"
├── Config Project (Rust)          → Cargo workspace (shared-kernel + api Axum)
├── Config SQLx (Rust)             → migrations/ + DATABASE_URL
├── Config Project (Vue)           → apps/web-vue
├── Config Shared Web (Vue)        → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Flutter)       → app Flutter (Dio → :4000)
├── Config Docker (Rust)           → Dockerfile multi-stage
├── Config CI/CD (Rust)            → clippy + test + coverage ≥95% domain+app
└── Config Shared Core (Rust)      → crates/shared-kernel
```

> Rust usa **Cargo workspace** na raiz — não é monorepo Turbo. Vue e Flutter ficam em `apps/` (monorepo npm opcional) ou repositórios sibling; o importante é a API em `http://localhost:4000`.

---

## Etapa 1 — Bootstrap Backend (Rust)

**Agent:** `Config Project (Rust)`

**Prompt:**

> Inicialize workspace Rust com Axum, sqlx, shared-kernel e modules/ por Bounded Context. Siga rust-namespace-layout.md — camadas domain/application/infrastructure/interfaces sem namespaces redundantes. Porta 4000, docker-compose Postgres.

```bash
node config-project-rs/scripts/project-init-rs.mjs --project-name=<nome>
cp .env.example .env
docker compose up -d
cargo run -p api
```

**Estrutura típica:**

```
<nome>/
├── Cargo.toml                    # [workspace]
├── crates/
│   ├── shared-kernel/            # Entity, ValueObject, Result, UseCase
│   └── api/
│       └── src/
│           ├── main.rs
│           ├── lib.rs
│           ├── config.rs         # BIND_ADDR default 0.0.0.0:4000
│           └── modules/
│               └── health/       # health check
├── migrations/                   # sqlx (Config SQLx)
├── tests/integration/            # E2E HTTP
├── docker-compose.yml
├── apps/web-vue/                 # após Config Project (Vue)
├── mobile-flutter/               # após Config Project (Flutter)
└── .env.example
```

### 1B — SQLx e migrations

**Agent:** `Config SQLx (Rust)`

**Prompt:**

> Configure migrations sqlx na raiz do workspace. Crie migration inicial para Postgres. Garantir DATABASE_URL e sqlx migrate run no CI.

```bash
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate add init
sqlx migrate run
```

### 1C — Shared Kernel

**Agent:** `Config Shared Core (Rust)`

**Prompt:**

> Estenda crates/shared-kernel com Entity, ValueObject, Result e UseCase. Sem dependências Axum/sqlx no kernel. pub use estável em lib.rs.

```bash
cargo test -p shared-kernel
```

---

## Etapa 2 — Bootstrap Vue + Flutter

### 2A — Vue 3 + shell

**Agent:** `Config Project (Vue)`

> Bootstrap Vue 3 + PrimeVue 4 (tema Aura), Pinia, proxy Vite `/api` → `http://localhost:4000`.

**Agent:** `Config Shared Web (Vue)`

```bash
node config-shared-web-vue/scripts/init-shared-web-vue.mjs \
  --frontend-path apps/web-vue --theme fuchsia --mode dark
```

Integrar `shell.routes.ts` no router e `@tailwindcss/vite` no Vite.

**Proxy Vite** (`apps/web-vue/vite.config.ts`):

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
},
```

### 2B — Flutter

**Agent:** `Config Project (Flutter)`

> App Flutter consumindo `http://localhost:4000`, clean architecture por feature, Riverpod + Dio + go_router.

### 2C — Docker + CI/CD

**Agent:** `Config Docker (Rust)` → **Agent:** `Config CI/CD (Rust)`

```bash
docker build -t <nome>-api .
cargo clippy -p api -- -D warnings
cargo test --workspace
cargo llvm-cov --package api --lcov --output-path lcov.info   # meta ≥95% domain+application
```

---

## Etapa 3 — BC Customers (backend Rust)

**Agent:** `Config New Module (Rust)` (scaffold do BC)

```bash
node config-new-module-rs/scripts/create-module-rs.mjs customers --entity=Customer
cargo check -p api
```

Namespace esperado:

```
✅ crate::modules::customers::domain::Customer
✅ crate::modules::customers::domain::ports::CustomerRepository
✅ crate::modules::customers::infrastructure::persistence::CustomerRepositorySqlx
❌ crate::modules::customers::domain::customer::Customer
```

**OpenSpec + inside-out:**

```
openspec-propose "bc-customers"
Config New Module (Rust)
Core Value Object (Rust)   → Email, Cpf em domain/value_objects/
Core Entity (Rust)         → Customer em domain/entity.rs
Core Repository (Rust)     → trait CustomerRepository em domain/ports/
Core DTO (Rust)            → CreateCustomerInput, CustomerOutput
Core Use Case (Rust)       → CreateCustomer
Core Query CQRS (Rust)     → FindCustomerById
Backend Data (Rust)        → CustomerRepositorySqlx + CustomerRecord
Config SQLx (Rust)         → migration create_customers
Backend Controller (Rust)  → POST /customers, GET /customers/{id}
Unit Tests (Rust)          → domain + application (mock port)
E2E Tests (Rust)           → POST → GET integração HTTP
```

### Exemplos de tasks (backlog)

```markdown
- [ ] `domain:vo` Criar VO Email e Cpf (~2h)
  - **Agent:** `Core Value Object (Rust)`
  - **Prompt:** "Crie Email e Cpf em modules/customers/domain/value_objects/. Re-export como domain::Email e domain::Cpf — sem submódulo email::Email."

- [ ] `domain:entity` Criar entidade Customer (~2h)
  - **Agent:** `Core Entity (Rust)`
  - **Prompt:** "Crie Customer em modules/customers/domain/entity.rs. Aggregate root com create() → Result e métodos de domínio."

- [ ] `domain:repository` Port CustomerRepository (~1h)
  - **Agent:** `Core Repository (Rust)`
  - **Prompt:** "Trait CustomerRepository async em domain/ports/repository.rs. Métodos save e find_by_id retornando shared_kernel::Result."

- [ ] `app:usecase` CreateCustomer (~2h)
  - **Agent:** `Core Use Case (Rust)`
  - **Prompt:** "Struct CreateCustomer em application/create_customer.rs implementando UseCase<CreateCustomerInput, CustomerOutput>. Injetar Arc<dyn CustomerRepository>."

- [ ] `infra:persistence` CustomerRepositorySqlx (~2h)
  - **Agent:** `Backend Data (Rust)`
  - **Prompt:** "Implemente CustomerRepositorySqlx em infrastructure/persistence/. CustomerRecord separado de domain::Customer. Mapeamento record ↔ domínio."

- [ ] `interface:controller` Rotas Axum (~2h)
  - **Agent:** `Backend Controller (Rust)`
  - **Prompt:** "Handlers finos em interfaces/http: POST /customers (201) e GET /customers/{id} (404 se ausente). Delegar a CreateCustomer e FindCustomerById."

- [ ] `test:unit` Testes domain + app (~2h)
  - **Agent:** `Unit Tests (Rust)`
  - **Prompt:** "#[cfg(test)] com mock do CustomerRepository. Cobrir create() feliz e erros de negócio. Meta ≥95% domain+application."

- [ ] `test:e2e` Fluxo HTTP (~2h)
  - **Agent:** `E2E Tests (Rust)`
  - **Prompt:** "Teste integração em tests/integration/: POST /customers → GET /customers/{id}. Postgres via docker-compose."
```

```bash
cargo test -p api
cargo test --test integration
```

---

## Etapa 4 — Feature Vue (`feat-customer-vue`)

Mesma ordem Clean Architecture do [NestJS + Vue + Flutter](./nestjs-vue-flutter.md#etapa-4--feature-vue-feat-customer-vue):

```
openspec-propose "feat-customer-vue"
Frontend Entity (Vue)       → Customer + Result<T>
Frontend UseCase (Vue)      → CreateCustomerUseCase, ListCustomersUseCase
Frontend Repository (Vue)   → CustomerHttpRepository (fetch /api/customers)
Frontend Page (Vue)         → listagem PrimeVue DataTable
Frontend Form (Vue)         → vee-validate + PrimeVue Form
```

**Agent:** `Frontend Repository (Vue)`

> Crie CustomerHttpRepository consumindo GET/POST http://localhost:4000/customers (ou /api/customers via proxy Vite). Mapeie JSON para Customer entity e Result<T>.

**Agent:** `Frontend Page (Vue)`

> Crie CustomerListView com PrimeVue DataTable, paginação lazy, consumindo ListCustomersUseCase via Pinia.

---

## Etapa 5 — Feature Flutter (`feat-customer-flutter`)

```
openspec-propose "feat-customer-flutter"
Mobile Entity (Flutter)     → Customer + sealed Result
Mobile UseCase (Flutter)    → CreateCustomerUseCase, ListCustomersUseCase
Mobile Repository (Flutter) → CustomerRepositoryImpl (Dio → :4000)
Mobile Screen (Flutter)     → CustomerListPage
Mobile Form (Flutter)       → CustomerFormPage
```

Detalhes de implementação: [NestJS + Angular + Flutter](./nestjs-angular-flutter.md) (mesmo padrão Clean Architecture mobile).

**Agent:** `Mobile Repository (Flutter)`

> Implemente CustomerRepositoryImpl com Dio apontando para http://localhost:4000/customers. Trate erros HTTP como Failure no Result.

---

## EP-000 — exemplo no backlog

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] `infra:fullstack` → **Agent:** `Config Project Full-Stack`
- [ ] `infra:setup`     → **Agent:** `Config Project (Rust)`
  - **Prompt:** "Bootstrap workspace Cargo Axum + sqlx + shared-kernel. Porta 4000."
- [ ] `infra:migration` → **Agent:** `Config SQLx (Rust)`
- [ ] `infra:setup`     → **Agent:** `Config Project (Vue)`
- [ ] `infra:shell-web` → **Agent:** `Config Shared Web (Vue)`
- [ ] `infra:setup`     → **Agent:** `Config Project (Flutter)`
- [ ] `infra:docker`    → **Agent:** `Config Docker (Rust)`
- [ ] `infra:cicd`      → **Agent:** `Config CI/CD (Rust)`
- [ ] `domain:shared`   → **Agent:** `Config Shared Core (Rust)`
```

---

## Variante: Axum + Angular + Flutter

Substitua agents Vue por Angular na mesma ordem:

| Vue | Angular |
|-----|---------|
| `Config Project (Vue)` | `Config Project (Angular)` |
| `Config Shared Web (Vue)` | `Config Shared Web (Angular)` |
| `Frontend Entity (Vue)` | `Frontend Entity (Angular)` |
| `Frontend UseCase (Vue)` | `Frontend UseCase (Angular)` |
| `Frontend Repository (Vue)` | `Frontend Repository (Angular)` |
| `Frontend Page (Vue)` | `Frontend Page (Angular)` |
| `Frontend Form (Vue)` | `Frontend Form (Angular)` |

Backend Rust (Etapas 1 e 3) permanece idêntico. Proxy Angular: `/api` → `http://localhost:4000`.

---

## Auth (roadmap)

Skills `config-auth-*-rs` ainda não existem. Para JWT/RBAC:

- Implementar manualmente em `modules/auth/` seguindo o mesmo layout de camadas, **ou**
- Usar `config-auth-core-basic` / `config-auth-backend-basic` como referência de domínio e adaptar para Rust.

---

## Checklist

- [ ] Análise (01) → backlog com **Agent (Rust)** no backend
- [ ] Bootstrap: Config Project (Rust) + SQLx + Vue + Flutter + Docker + CI/CD + shared-core-rs
- [ ] `cargo check` / `cargo test --workspace` verdes
- [ ] BC Customers: Unit Tests ≥95% domain+application + E2E HTTP
- [ ] Frontend Entity → Form (Vue) consumindo API `:4000`
- [ ] Mobile Entity → Screen (Flutter)
- [ ] OpenSpec archive nas mudanças (`bootstrap-*`, `bc-*`, `feat-*`)

---

## Próximos passos

- [Backend incremental](./backend-incremental.md) — Strangler Fig / migrar BC antes da UI
- [Hub Full-Stack](../02-fullstack-project-setup.md)
- [Tutorial 04 — Ciclo OpenSpec](../04-ciclo-completo-openspec.md) — narrativa legado (adaptar agents para `-rs`)
- Matriz completa: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../../config-project-fullstack/references/fullstack-stack-matrix.md)
