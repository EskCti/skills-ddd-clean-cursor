---
name: frontend-entity-angular
stack: typescript
description: Criar entidades de domínio Angular em TypeScript puro (sem Angular/HttpClient), com tipo Result<T, E> e validações que retornam Result em vez de lançar exceções. Usar quando o pedido envolver entidade de domínio Angular, modelo de domínio TypeScript, Result type ou validação de domínio no frontend Angular.
---

# Frontend Entity (Angular)

## Overview

Criar entidades de domínio em TypeScript puro — sem dependências Angular, HttpClient ou PrimeNG. Aplicar o tipo `Result<T, E>` para retornos sem exceções (estilo Go).

## Guidelines

- Entidades são **TypeScript puro** — sem `import { inject } from '@angular/core'`.
- Usar `type Result<T, E = AppError> = Ok<T> | Err<E>` com helpers `ok()` e `err()`.
- Construtor privado + static factory `create()` retornando `Result<Entity>`.
- Validações no `create()` retornam `err()` em vez de `throw`.
- Erros específicos do BC como `type <Bc>Error` ou `enum <Bc>ErrorCode`.

## Workflow

1. Criar `Result<T, E>` em `shared/result/result.ts` (reutilizado por todos os BCs).
2. Criar interface `<Nome>` (dados) e class `<Nome>Entity` com factory `create()`.
3. Validações retornam `err(message)` — nunca `throw`.
4. Criar em `features/<bc>/domain/<nome>.entity.ts`.

## References

- Consultar references/angular-entity-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
