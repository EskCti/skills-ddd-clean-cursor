---
name: frontend-entity-leptos
stack: rust
description: Criar entidades de domínio Leptos em Rust puro (sem leptos::*), com shared_kernel::Result e validações que acumulam erros. Usar quando o pedido envolver entidade de domínio Leptos, modelo de domínio Rust no frontend ou validação de domínio no crate web-leptos.
---

# Frontend Entity (Leptos)

## Overview

Criar entidades de domínio em Rust puro — **sem** dependências `leptos`, `reqwest` ou `serde`. Reutilizar `shared_kernel::Result<T>` do workspace (mesmo contrato do backend: `Err(Vec<DomainError>)`).

## Guidelines

- Entidades ficam em `features/<bc>/domain/entity.rs`.
- Factory `try_new()` ou `create()` retornando `Result<Self>`.
- Validações acumulam erros e retornam `Result::Err(errors)` — nunca `panic!` ou `unwrap` em validação.
- Sem imports de `leptos::*` na camada domain.

## Workflow

1. Criar entidade em `crates/web-leptos/src/features/<bc>/domain/entity.rs`.
2. Re-exportar em `domain/mod.rs`.
3. Testes unitários em `#[cfg(test)]` no mesmo arquivo ou `domain/entity_test.rs`.

## References

- Consultar `references/leptos-entity-pattern.md` para código completo.
- Consultar `../config-project-leptos/references/leptos-namespace-layout.md`.
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
