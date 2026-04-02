---
name: core-query-cqrs-cs
stack: csharp
description: "Criar, revisar ou orientar a implementação de queries estruturadas (CQRS) em C#. Usar quando o pedido envolver leitura otimizada de dados, projeções para DTOs, filtros de busca, paginação, e separação clara entre modelos de escrita e leitura em C#."
---

# Query CQRS (C#)

## Overview

Implementar queries de leitura otimizadas no padrão CQRS em C#. Foco em performance, projeções diretas para DTOs e independência do modelo de domínio para leitura.

## Guidelines

- Separar Queries (Leitura) de Repositories (Escrita).
- Retornar DTOs de leitura específicos para a interface (UI/API).
- Usar ORMs leves (Dapper) ou EF Core com `.AsNoTracking()` para máxima performance.
- Implementar filtros e paginação diretamente na consulta.
- Nomear como `GetXxxQuery` ou `FindXxxQuery`.

## Workflow

1. Identificar os dados necessários para a tela/endpoint e o DTO de destino.
2. Criar a interface de query (ex.: `IFindCustomerByIdQuery`).
3. Implementar a query no layer de Infrastructure (usando Contexto DB ou Connection).
4. Usar Projections para carregar apenas as colunas necessárias.
5. Tratar cenários de "não encontrado" retornando `Result.Failure` ou `null` conforme o padrão do projeto.

## References

- Consultar references/query-pattern-cs.md para exemplos e padrões detalhados.
- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
