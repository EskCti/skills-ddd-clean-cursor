---
name: frontend-usecase-leptos
stack: rust
description: Criar casos de uso Leptos em Rust puro (struct + execute async), orquestrando entidades e ports com shared_kernel::Result. Usar quando o pedido envolver use case Leptos, regra de aplicação no frontend Rust ou orquestração domain+repository no crate web-leptos.
---

# Frontend UseCase (Leptos)

## Overview

Criar casos de uso como structs Rust puras em `features/<bc>/application/` — sem dependências Leptos. Recebem `Arc<dyn Repository>` no construtor e expõem `execute()` async retornando `Result<T>`.

## Workflow

1. Definir input/output structs se necessário em `application/dto.rs` ou inline.
2. Criar struct `<Action><Bc>` em `application/<action>_<bc>.rs`.
3. Injetar trait do `domain/ports.rs` via construtor.
4. Componentes Leptos instanciam use case + repository — nunca chamam HTTP direto.

## References

- Consultar `references/leptos-usecase-pattern.md` para código completo.
- Consultar `../frontend-entity-leptos/references/leptos-entity-pattern.md`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
