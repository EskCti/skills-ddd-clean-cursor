---
name: config-shared-core-rs
stack: rust
description: Gerenciar o Shared Kernel Rust (Entity, ValueObject, Result, UseCase). Usar quando o pedido envolver classes base transversais, Result tipado ou traits de aplicação no workspace Cargo.
---

# Config Shared Core (Rust)

## Overview

Manter o crate `shared-kernel` com abstrações DDD reutilizáveis por todos os Bounded Contexts.

## Localização

- `crates/shared-kernel/src/`

## Estrutura

```
shared-kernel/
├── Cargo.toml
└── src/
    ├── lib.rs
    ├── entity.rs       # trait Entity { fn id(&self) -> &EntityId; }
    ├── value_object.rs # trait ValueObject
    ├── result.rs       # Result<T, E = DomainError>
    ├── error.rs        # DomainError, AppError
    └── use_case.rs     # trait UseCase<Input, Output>
```

## Workflow

1. Ler `references/rust-namespace-layout.md` — namespaces dos **módulos de BC** não repetem nomes de tipos.
2. Implementar ou estender tipos no kernel sem dependências de Axum/sqlx.
3. Publicar API estável via `lib.rs` (`pub use`).
4. Rodar `cargo test -p shared-kernel`.

## References

- `references/rust-namespace-layout.md` — layout modular obrigatório
- `references/shared-patterns-rs.md` — Result, Entity, VO
- `assets/shared-template-rs/` — templates copiados pelo bootstrap

## Global Standards

- Consultar `../skills-standards.md` seção **Rust Stack Standards**.
