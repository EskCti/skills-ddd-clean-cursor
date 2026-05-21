---
name: frontend-page-angular
stack: typescript
description: Criar ou revisar páginas/componentes Angular 17+ standalone no padrão do projeto, usando Composition API via signals, PrimeNG para UI, serviços com HttpClient e lazy loading por feature. Usar quando o pedido envolver componente Angular, página, listagem, detalhe, tabela PrimeNG, ou feature Angular standalone.
---

# Frontend Page (Angular)

## Overview

Criar componentes Angular 17+ standalone com **Tailwind CSS** para layout, PrimeNG para widgets complexos, lazy loading por feature, signals para estado reativo e HttpClient para chamadas à API.

> **Estilização**: seguir `skills-standards.md` §4.1 — layout via classes Tailwind; PrimeNG apenas para p-table e componentes complexos.

## Guidelines

- Sempre standalone: `standalone: true` no decorator.
- Estado reativo com `signal()` e `computed()` (evitar `ngOnInit` com variáveis mutáveis sem signal).
- Serviço separado por feature injetado via `inject()`.
- Tabelas: usar `p-table` (PrimeNG DataTable) com paginação e filtros.
- Listagens com lazy loading do módulo de rota.

## Workflow

1. Identificar o Bounded Context e a funcionalidade (listagem, detalhe, dashboard).
2. Criar o componente standalone em `features/<bc>/<nome>.component.ts`.
3. Criar o serviço em `features/<bc>/services/<bc>.service.ts`.
4. Registrar rota lazy em `features/<bc>/<bc>.routes.ts`.
5. Adicionar imports PrimeNG necessários no componente.

## References

- Consultar references/angular-page-pattern.md para templates concretos.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
