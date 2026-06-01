---
name: core-value-object-rs
stack: rust
description: Criar Value Objects Rust imutáveis com validação e shared_kernel::Result. Usar quando o pedido envolver VO, validação de domínio ou struct com invariantes em Rust.
---

# Core Value Object (Rust)

## Overview

VOs em `modules::<bc>::domain::value_objects::<name>.rs` — tipo exportado como `domain::Email`, **não** `value_objects::email::Email` aninhado.

## Guidelines

- Ler `references/value-object-pattern-rs.md` e `../config-shared-core-rs/references/rust-namespace-layout.md`.
- Struct ou newtype com validação em `try_new` / `new` → `Result<Self>`.
- Implementar `shared_kernel::ValueObject`.
- Um VO por arquivo (`email.rs` → `Email`).

## Workflow

1. Identificar regras e normalização.
2. Criar arquivo em `domain/value_objects/`.
3. Re-exportar em `domain/value_objects/mod.rs` se necessário (`pub use email::Email`).
4. Testes em `#[cfg(test)]` ou `tests/` do crate — skill `test-unit-rs`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
