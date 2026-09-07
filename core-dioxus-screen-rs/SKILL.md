---
name: core-dioxus-screen-rs
stack: rust
description: Criar telas (screens) Dioxus com separação UI (component) vs lógica (hook/use case). Usar quando o pedido envolver screen Dioxus, tela mobile Rust, listagem, detalhe, formulário de tela, ou feature Dioxus Mobile.
---

# Core Dioxus — Screen

## Overview

Criar telas (screens) Dioxus com separação estrita entre **UI** (`#[component]`) e **lógica** (hooks/use cases). Nenhum componente faz HTTP direto — delega para use cases (`core-use-case-rs`).

## Guidelines

- Toda tela é um `#[component]` em `features/<bc>/presentation/`.
- Estado reativo com `use_signal`/`use_memo`; efeitos via `use_effect`.
- Listagens usam paginação e chamam o use case (nunca o repository).
- O `Result` do domínio (`shared_kernel::Result<T>` — `Err(Vec<DomainError>)`) é exposto na tela: renderizar **toda** a lista de erros (`<For>`), nunca só o primeiro.
- Nenhum `reqwest`/`dioxus::http` na screen — somente no adapter (ver `backend-dioxus-api-client-rs`).

## Workflow

1. Definir `UiState` (loading / data / error).
2. Criar hook `use_*` (ex.: `use_customer_list`) que recebe o use case.
3. Criar `#[component] ApplicationScreen` que usa o hook e renderiza cada caso do estado.
4. Registrar no router (`core-dioxus-navigation-rs`).

## References

- Consultar `references/dioxus-screen-pattern.md` para templates.
- Consultar `../core-use-case-rs/SKILL.md` para o use case.
- Consultar `../config-mobile-dioxus-rs/references/dioxus-namespace-layout.md`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.