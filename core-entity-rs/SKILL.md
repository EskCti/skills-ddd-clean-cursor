---
name: core-entity-rs
stack: rust
description: Criar entidades de domínio Rust (aggregate roots) com Entity, Result e VOs. Usar quando o pedido envolver entity, aggregate ou regras de negócio em modules/<bc>/domain.
---

# Core Entity (Rust)

## Overview

Entidade em `domain/entity.rs` como `pub struct Customer` — path `modules::customers::domain::Customer`.

## Guidelines

- Ler `references/entity-pattern-rs.md` e `rust-namespace-layout.md`.
- Implementar `shared_kernel::Entity`.
- Factory `try_new` retornando `Result<Self>` com `Err(Vec<DomainError>)`; combinar erros de todos os VOs.
- Comportamento via métodos de domínio (`deactivate`, etc.).
- **Proibido** `domain/customer/mod.rs` com `struct Customer` dentro de `mod customer`.

## Workflow

1. Mapear VOs e invariantes.
2. Implementar em `domain/entity.rs`.
3. `pub use entity::Customer` em `domain/mod.rs`.
4. Testes unitários — `test-unit-rs`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
