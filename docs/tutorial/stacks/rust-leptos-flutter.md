# Stack: Axum (Rust) + Leptos SSR + Flutter

**Combinação**: Backend Rust (Axum + sqlx) · Frontend Leptos SSR (cargo-leptos) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: Full-stack **100% Rust** no backend e web admin, com SSR/hidratação Leptos, mobile Flutter consumindo API REST em `:4000`.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project (Rust)` → `Config SQLx (Rust)` → `Config Project (Leptos)` → `Config Shared Web (Leptos)` → `Config Project (Flutter)` → `Config Docker (Rust)` → `Config CI/CD (Rust)` → `Config Shared Core (Rust)` → `Core * (Rust)` + `Frontend * (Leptos)` + `Mobile * (Flutter)` → `Unit Tests (Rust)` → `E2E Tests (Rust)`

> **Layout backend**: [`config-shared-core-rs/references/rust-namespace-layout.md`](../../../config-shared-core-rs/references/rust-namespace-layout.md)
> **Layout frontend**: [`config-project-leptos/references/leptos-namespace-layout.md`](../../../config-project-leptos/references/leptos-namespace-layout.md)

---

## Etapa 0 — Orquestração

**Prompt inicial — `Config Project Full-Stack`:**

> Tenho o backlog em `docs/planning/<nome>/backlog.md`.
> Quero criar o projeto `<nome>` com:
> - Backend: Axum (Rust)
> - Frontend: Leptos SSR
> - Mobile: Flutter
> Docker e CI/CD no bootstrap. Usar OpenSpec para rastrear mudanças.

**Sequência EP-000:**

```
openspec-propose "bootstrap-<nome>"
openspec-apply-change "bootstrap-<nome>"
├── Config Project (Rust)          → Cargo workspace (shared-kernel + api Axum)
├── Config SQLx (Rust)             → migrations/ + DATABASE_URL
├── Config Project (Leptos)        → crates/web-leptos (:3000)
├── Config Shared Web (Leptos)     → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Flutter)       → app Flutter (Dio → :4000)
├── Config Docker (Rust)           → Dockerfile multi-stage
├── Config CI/CD (Rust)            → clippy + test + coverage ≥95% domain+app
└── Config Shared Core (Rust)      → crates/shared-kernel
```

---

## Etapa 1 — Bootstrap Backend (Rust)

Igual ao [Rust + Vue + Flutter](./rust-vue-flutter.md#etapa-1--bootstrap-backend-rust). API em `http://localhost:4000`.

---

## Etapa 2 — Bootstrap Leptos + Flutter

### 2A — Leptos SSR + shell

**Agent:** `Config Project (Leptos)`

> Bootstrap crate web-leptos no workspace Cargo com cargo-leptos, Tailwind v4, API_BASE_URL apontando para :4000.

```bash
node config-project-leptos/scripts/project-init-leptos.mjs \
  --frontend-path crates/web-leptos \
  --api-url http://localhost:4000
cargo install cargo-leptos
```

**Agent:** `Config Shared Web (Leptos)`

```bash
node config-shared-web-leptos/scripts/init-shared-web-leptos.mjs \
  --frontend-path crates/web-leptos --theme fuchsia --mode dark
```

Integrar `AdminShell` em `app.rs` — ver `config-shared-web-leptos/references/integrate-shell.md`.

Dev:

```bash
npx @tailwindcss/cli -i crates/web-leptos/style/main.css -o crates/web-leptos/style/output.css --watch
cargo leptos watch
```

### 2B — Flutter

**Agent:** `Config Project (Flutter)`

> App Flutter consumindo `http://localhost:4000`, clean architecture por feature, Riverpod + Dio + go_router.

### 2C — Docker + CI/CD

Igual [Rust + Vue + Flutter](./rust-vue-flutter.md#2c--docker--cicd).

---

## Etapa 3 — BC Customers (backend Rust)

Igual [Rust + Vue + Flutter](./rust-vue-flutter.md#etapa-3--bc-customers-backend-rust).

---

## Etapa 4 — Feature Leptos (`feat-customer-leptos`)

```
openspec-propose "feat-customer-leptos"
Frontend Entity (Leptos)       → Customer + shared_kernel::Result
Frontend UseCase (Leptos)      → CreateCustomer, ListCustomers
Frontend Repository (Leptos)   → CustomerHttpRepository (reqwest → :4000)
Frontend Page (Leptos)         → CustomerListPage (Resource + UseCase)
Frontend Form (Leptos)         → CustomerFormPage (signals + UseCase)
```

**Agent:** `Frontend Repository (Leptos)`

> Crie CustomerHttpRepository consumindo GET/POST http://localhost:4000/customers. Mapeie JSON para Customer via try_new().

**Agent:** `Frontend Page (Leptos)`

> Crie CustomerListPage com Resource, tabela Tailwind, erros completos do Result.

---

## Etapa 5 — Feature Flutter

Igual [Rust + Vue + Flutter](./rust-vue-flutter.md#etapa-5--feature-flutter-feat-customer-flutter).

---

## EP-000 — exemplo no backlog

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] `infra:fullstack` → **Agent:** `Config Project Full-Stack`
- [ ] `infra:setup`     → **Agent:** `Config Project (Rust)`
- [ ] `infra:migration` → **Agent:** `Config SQLx (Rust)`
- [ ] `infra:setup`     → **Agent:** `Config Project (Leptos)`
- [ ] `infra:shell-web` → **Agent:** `Config Shared Web (Leptos)`
- [ ] `infra:setup`     → **Agent:** `Config Project (Flutter)`
- [ ] `infra:docker`    → **Agent:** `Config Docker (Rust)`
- [ ] `infra:cicd`      → **Agent:** `Config CI/CD (Rust)`
- [ ] `domain:shared`   → **Agent:** `Config Shared Core (Rust)`
```

---

## Checklist

- [ ] Análise (01) → backlog com **Agent (Rust)** no backend
- [ ] Bootstrap: Config Project (Rust) + SQLx + Leptos + Flutter + Docker + CI/CD + shared-core-rs
- [ ] `cargo leptos watch` sobe em `:3000` e consome API `:4000`
- [ ] BC Customers: Unit Tests ≥95% + E2E HTTP
- [ ] Frontend Entity → Form (Leptos) com erros completos na UI
- [ ] Mobile Entity → Screen (Flutter)
- [ ] OpenSpec archive nas mudanças

---

## Próximos passos

- [Rust + Vue + Flutter](./rust-vue-flutter.md) — variante com Vue em vez de Leptos
- [Hub Full-Stack](../02-fullstack-project-setup.md)
- Matriz completa: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../../config-project-fullstack/references/fullstack-stack-matrix.md)
