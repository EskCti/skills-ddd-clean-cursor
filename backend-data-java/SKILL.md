---
name: backend-data-java
stack: java
description: Implementar adapters JPA (persistência) Java. Usar quando o pedido envolver repositório concreto, JpaEntity ou mapeamento DB↔domínio.
---

# Backend Data (Java / JPA)

## Overview

Adapters em `modules/<bc>/infrastructure/persistence/CustomerRepositoryAdapter.java` — implementa `domain.repository.CustomerRepository`.

## Guidelines

- JPA entity: `CustomerJpaEntity` — separada de `domain.entity.Customer`.
- Spring Data: `CustomerJpaRepository extends JpaRepository<CustomerJpaEntity, UUID>`.
- Mapeamento explícito `toDomain()` / `toJpaEntity()`.
- Converter exceções JPA → `DomainError` / `Result.err`.
- `@Repository` no adapter; **sem** JPA no pacote `packages/<bc>/`.

## Workflow

1. Migration via `config-jpa-java`.
2. Implementar `*JpaEntity`, `*JpaRepository`, `*RepositoryAdapter`.
3. Testes integração — `test-e2e-java`.

## Global Standards

- Consultar `../config-shared-core-java/references/java-namespace-layout.md`.
