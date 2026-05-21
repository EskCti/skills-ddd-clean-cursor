---
name: frontend-page-vue
stack: typescript
description: Criar ou revisar páginas/componentes Vue 3 com Composition API, PrimeVue 4 e Pinia no padrão do projeto. Usar quando o pedido envolver componente Vue, página Vue, listagem DataTable PrimeVue, detalhe, store Pinia ou feature Vue standalone.
---

# Frontend Page (Vue)

## Overview

Criar componentes Vue 3 com Composition API (`<script setup>`), **Tailwind CSS** para layout/estilo, PrimeVue para widgets complexos e Pinia para estado.

> **Estilização**: seguir `skills-standards.md` §4.1 — layout via classes Tailwind; PrimeVue apenas para DataTable e componentes complexos.

## Guidelines

- Sempre `<script setup lang="ts">` com Composition API.
- Estado do componente: `ref()` e `computed()`.
- Estado global: Pinia store por Bounded Context.
- Tabelas: `DataTable` do PrimeVue com `paginator`.
- Serviços em `src/services/<bc>.service.ts` usando axios ou fetch.

## Workflow

1. Identificar BC e funcionalidade.
2. Criar view em `views/<bc>/<NomeView>.vue`.
3. Criar store em `stores/<bc>.store.ts` se necessário.
4. Criar service em `services/<bc>.service.ts`.
5. Registrar rota em `router/index.ts`.

## References

- Consultar references/vue-page-pattern.md para templates concretos.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
