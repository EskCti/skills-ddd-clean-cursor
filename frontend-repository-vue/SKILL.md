---
name: frontend-repository-vue
stack: typescript
description: Criar a implementação do repositório Vue com fetch/axios, DTO de API e mapeamento para entidade de domínio, retornando Promise<Result<T>>. Usar quando o pedido envolver repository Vue, fetch wrapper, DTO-to-entity mapping, ou implementação de ICustomerRepository no Vue 3.
---

# Frontend Repository (Vue)

## Overview

Criar `class <Bc>HttpRepository implements I<Bc>Repository` que usa `fetch` ou `axios` para chamar a API e mapeia DTOs → entidade de domínio. A Pinia store instancia os use cases com este repositório.

## Guidelines

- Implementa `I<Bc>Repository` (do domínio).
- Usa `fetch` nativo ou `axios`.
- Resposta da API mapeada de DTO → entidade via `<Bc>Entity.create()`.
- Erros HTTP capturados com `try/catch` → `err(message)`.
- Instanciado e injetado na Pinia store.

## Workflow

1. Criar DTO type `<Bc>ApiDto` (estrutura da API).
2. Criar `class <Bc>HttpRepository implements I<Bc>Repository`.
3. Instanciar o repositório na Pinia store junto com os use cases.

## References

- Consultar references/vue-repository-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
