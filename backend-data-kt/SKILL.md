---
name: backend-data-kt
stack: kotlin
description: 'Criar, revisar ou orientar a camada de persistência do backend Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver entidades JPA (`@Entity`), Spring Data repositories, migrations Flyway/Liquibase, adapters de persistência que mapeiam banco para domínio/DTO, ou configuração de datasource em Kotlin.'
---

# Backend Data (Kotlin / JPA)

## Overview

Aplicar o padrão de persistência do backend Kotlin cobrindo modelagem JPA, migrations, e implementação dos adapters com mapeamento consistente para domínio.

## Guidelines

- Entidades JPA (`@Entity`) ficam na camada de infraestrutura, **não** no domínio.
- Separar entidade JPA da entidade de domínio (mapeamento explícito `toDomain/fromDomain`).
- Usar Spring Data JPA repositories para operações básicas.
- Migrations via Flyway ou Liquibase (SQL versionado).
- Adapters implementam interfaces de domínio (Repository/Query) e retornam `Result`.
- Tratar erros com `runCatching` e `Result`.

## Workflow

1. Identificar alteração: modelo JPA, migration, seed ou adapter.
2. Ajustar entidade JPA e/ou migration SQL.
3. Atualizar implementação do adapter (repository/query).
4. Revisar mapeamentos `toDomain`/`fromDomain`.
5. Validar seed e dados iniciais.
6. Rodar migrations e testes de integração.

## References

Consultar `references/data-pattern-kt.md` para paths, checklist e armadilhas.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
