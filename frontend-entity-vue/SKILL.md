---
name: frontend-entity-vue
stack: typescript
description: Criar entidades de domínio Vue em TypeScript puro (sem Vue/Pinia/PrimeVue), com tipo Result<T, E> e validações que retornam Result em vez de lançar exceções. Usar quando o pedido envolver entidade de domínio Vue, modelo de domínio TypeScript, Result type ou validação de domínio no frontend Vue.
---

# Frontend Entity (Vue)

## Overview

Criar entidades de domínio em TypeScript puro — sem dependências Vue, Pinia ou PrimeVue. Aplicar o tipo `Result<T, E>` para retornos sem exceções (estilo Go).

## Guidelines

- Entidades são **TypeScript puro** — sem `import { ref } from 'vue'`.
- Usar o mesmo `Result<T, E>` compartilhado com Angular se no mesmo monorepo.
- Construtor privado + static factory `create()` retornando `Result<Entity>`.
- Validações no `create()` retornam `err()` em vez de `throw`.

## Workflow

1. Criar `Result<T, E>` em `src/shared/result.ts`.
2. Criar `class <Nome>Entity` com factory `create()`.
3. Criar em `src/features/<bc>/domain/<nome>.entity.ts`.

## References

- Consultar references/vue-entity-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
