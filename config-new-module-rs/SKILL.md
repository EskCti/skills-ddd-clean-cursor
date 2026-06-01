---
name: config-new-module-rs
stack: rust
description: Criar módulo (Bounded Context) Rust em crates/api/src/modules/<bc>/ com camadas domain/application/infrastructure/interfaces, sem namespaces redundantes. Usar quando o pedido envolver novo BC no backend Axum.
---

# Config New Module (Rust)

## Overview

Scaffold determinístico de um Bounded Context seguindo `rust-namespace-layout.md`:

```
modules/customers/
  domain/entity.rs          → Customer (not domain/customer/customer.rs)
  domain/ports/repository.rs
  application/create_customer.rs
  infrastructure/persistence/repository_sqlx.rs
  interfaces/http/
```

## Workflow

1. Confirmar workspace bootstrap (`config-project-rs`).
2. Executar script com nome do BC (plural, kebab-case ou snake_case).
3. Opcional: `--entity=Customer` se o singular não for inferível.
4. Registrar rotas em `api::router` (merge `modules::<bc>::interfaces::http::routes()`).
5. `cargo check -p api`.

## Commands

```bash
node config-new-module-rs/scripts/create-module-rs.mjs customers --entity=Customer
```

## Resources

- `agents/openai.yaml`
- `scripts/create-module-rs.mjs`
- `assets/module-template-rs/`
- `../config-shared-core-rs/references/rust-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Rust Stack Standards**.
