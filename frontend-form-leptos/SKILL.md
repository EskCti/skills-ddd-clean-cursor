---
name: frontend-form-leptos
stack: rust
description: Criar formulários Leptos SSR com signals, Action/ServerFn ou submit handler async chamando UseCase e exibindo erros de negócio completos. Usar quando o pedido envolver formulário Leptos, create/edit SSR ou validação de formulário no crate web-leptos.
---

# Frontend Form (Leptos)

## Overview

Criar formulários em `features/<bc>/presentation/form_page.rs` com signals para campos, submit async via UseCase e exibição de `Result::Err` completo. Validação de domínio delegada à entidade — erros de negócio exibidos na UI.

## Workflow

1. Criar signals para cada campo (`name`, `email`, `cpf`).
2. Signal `errors: RwSignal<Vec<String>>` para mensagens.
3. No submit: chamar `CreateCustomer.execute()` e mapear `Err` → `errors`.
4. Em sucesso: redirecionar com `use_navigate()` ou limpar formulário.
5. Registrar rota `/customers/new` em `app.rs`.

## References

- Consultar `references/leptos-form-pattern.md` para código completo.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
