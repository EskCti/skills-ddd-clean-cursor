---
name: frontend-usecase-vue
stack: typescript
description: Criar casos de uso Vue como funções composables ou classes TypeScript com retorno Promise<Result<T>>. Usar quando o pedido envolver use case Vue, composable de aplicação, lógica de negócio no frontend Vue, ou orquestração entre repository e entidade em Vue 3.
---

# Frontend UseCase (Vue)

## Overview

Criar casos de uso Vue como classes TypeScript simples (não composables) que recebem um `IRepository` via construtor, retornando `Promise<Result<T>>`. A Pinia store instancia e usa os use cases.

## Guidelines

- Use case é uma **classe TypeScript simples** (não `@Injectable`, não composable).
- Recebe `I<Bc>Repository` no construtor.
- Retorna `Promise<Result<T>>` — nunca lança exceção.
- A Pinia store instancia os use cases via provider ou diretamente.

## Workflow

1. Criar classe `Create<Bc>UseCase` e `Get<Bc>sUseCase`.
2. Receber repository no construtor.
3. Implementar lógica com retorno `Promise<Result<T>>`.
4. Criar em `src/features/<bc>/domain/<bc>.use-cases.ts`.
5. Instanciar na Pinia store via `inject()` ou factory.

## References

- Consultar references/vue-usecase-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
