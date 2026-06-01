# Rust — Layout modular e namespaces (Clean Architecture)

Referência obrigatória para **todos** os skills `-rs` de backend.

## Princípio: camadas sim, redundância não

Organize por **Bounded Context** (módulo) e **camada arquitetural**. O tipo principal vive na camada — **não** repita o nome do agregado como submódulo.

| Evitar (redundante) | Usar (profissional) |
|---------------------|---------------------|
| `customers::domain::customer::Customer` | `customers::domain::Customer` |
| `domain::cliente::Cliente` | `customers::domain::Customer` |
| `customers::Customer::Customer` | `customers::domain::Customer` |
| `infrastructure::customer_repository::CustomerRepository` (port) | `customers::domain::ports::CustomerRepository` (trait) |
| `CustomerEntity` no domínio | `Customer` no domínio; `CustomerRecord` na infra |

**Código em inglês** (`Customer`, `Email`). Português só em docs, UI e comentários de negócio quando necessário.

## Árvore padrão por Bounded Context

Cada BC é um módulo em `crates/api/src/modules/<bc>/` (kebab-case na pasta, snake_case no `mod`):

```
modules/customers/
├── mod.rs                 # re-export público do BC
├── domain/
│   ├── mod.rs             # pub use entity::Customer; pub mod ports; pub mod value_objects;
│   ├── entity.rs          # struct Customer
│   ├── services/          # domain services (Policy, Calculator) — core-domain-service-rs
│   │   └── mod.rs
│   ├── ports/
│   │   ├── mod.rs
│   │   └── repository.rs  # trait CustomerRepository
│   └── value_objects/
│       ├── mod.rs
│       ├── email.rs       # struct Email
│       └── cpf.rs
├── application/
│   ├── mod.rs
│   ├── dto.rs             # CreateCustomerInput, CustomerOutput
│   ├── create_customer.rs # CreateCustomer (handler / use case)
│   └── find_by_id.rs      # FindCustomerById (query)
├── infrastructure/
│   ├── mod.rs
│   └── persistence/
│       ├── mod.rs
│       └── repository_sqlx.rs  # struct CustomerRepositorySqlx implements CustomerRepository
└── interfaces/
    ├── mod.rs
    └── http/
        ├── mod.rs
        ├── routes.rs
        └── handlers.rs
```

## Paths Rust resultantes

```rust
// Domínio
crate::modules::customers::domain::Customer
crate::modules::customers::domain::Email
crate::modules::customers::domain::ports::CustomerRepository

// Aplicação
crate::modules::customers::application::CreateCustomer
crate::modules::customers::application::CustomerOutput

// Infra (adapter com nome distinto do port)
crate::modules::customers::infrastructure::persistence::CustomerRepositorySqlx

// HTTP (Axum)
crate::modules::customers::interfaces::http::create_customer
```

## Regras de arquivos

| Regra | Detalhe |
|-------|---------|
| Um tipo principal por arquivo | `entity.rs` → `Customer`; `email.rs` → `Email` |
| Pasta BC | kebab-case: `modules/customers/` |
| Módulo Rust | snake_case: `mod customers;` |
| Port (trait) | sempre em `domain::ports`, sufixo descritivo no adapter (`*Sqlx`, `*Postgres`) |
| Record de persistência | `CustomerRecord` ou `customer_row` — **nunca** `Customer` na infra |
| DTO | sufixo `Input` / `Output` ou `Dto` na camada `application` |
| Handlers HTTP | funções em `interfaces::http`, thin — delegam ao use case |

## Workspace Cargo (bootstrap)

```
project-root/
├── Cargo.toml              # [workspace]
├── crates/
│   ├── shared-kernel/      # Entity, ValueObject, Result, UseCase trait
│   └── api/                # Axum binary + modules/*
├── migrations/             # sqlx migrate (config-sqlx-rs)
├── tests/
│   └── integration/        # test-e2e-rs
├── docker-compose.yml
└── .env.example
```

## `mod.rs` do BC (exemplo)

```rust
//! Bounded context: customers

pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod interfaces;

pub use domain::Customer;
```

## `domain/mod.rs` (exemplo)

```rust
mod entity;

pub mod ports;
pub mod value_objects;

pub use entity::Customer;
```

## Anti-patterns

- Módulo aninhado com mesmo nome do tipo (`customer/customer.rs` exportando `Customer` dentro de `mod customer`).
- Misturar port e adapter no mesmo arquivo.
- Importar `sqlx` ou `axum` dentro de `domain/` ou `application/`.
- BC gigante sem subpastas por camada.
