---
name: frontend-page-leptos
stack: rust
description: Criar páginas de listagem Leptos SSR com Resource, signals e UseCase — Tailwind para layout, exibição de lista completa de erros. Usar quando o pedido envolver página Leptos, listagem SSR, DataTable simples ou tela de listagem no crate web-leptos.
---

# Frontend Page (Leptos)

## Overview

Criar componentes de listagem em `features/<bc>/presentation/` usando Leptos `Resource` + UseCase. Layout com Tailwind; tabela HTML simples ou componentes customizados. Exibir **todos** os erros de `Result::Err` — nunca só o primeiro.

## Workflow

1. Criar `#[component] pub fn <Bc>ListPage` em `presentation/list_page.rs`.
2. Instanciar `Arc<dyn Repository>` + UseCase fora do componente ou via context.
3. Usar `Resource::new` para carregar dados async.
4. Renderizar loading, erros (`For` sobre `errors`) e tabela com `For` sobre items.
5. Registrar rota em `app.rs`.

## References

- Consultar `references/leptos-page-pattern.md` para código completo.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
