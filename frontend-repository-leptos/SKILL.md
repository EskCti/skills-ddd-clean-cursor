---
name: frontend-repository-leptos
stack: rust
description: Criar repositório HTTP Leptos com reqwest, DTO serde e mapeamento para entidades de domínio com Result. Usar quando o pedido envolver repository Leptos, adapter HTTP no frontend Rust ou integração com API Axum no crate web-leptos.
---

# Frontend Repository (Leptos)

## Overview

Implementar `domain/ports` em `infrastructure/http_repository.rs` usando `reqwest` + `serde`. Mapear DTOs JSON para entidades via `Customer::try_new()`. Tratar erros HTTP como `Result::Err`.

## Workflow

1. Criar DTOs em `infrastructure/dto.rs` com `#[derive(Serialize, Deserialize)]`.
2. Implementar trait em `infrastructure/http_repository.rs`.
3. Ler `API_BASE_URL` de `shared/config.rs`.
4. Expor factory ou `Arc<dyn Repository>` para use cases e componentes.

## References

- Consultar `references/leptos-repository-pattern.md` para código completo.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
