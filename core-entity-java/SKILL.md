---
name: core-entity-java
stack: java
description: Criar entidades de domínio Java (aggregate roots) com Entity, Result e VOs. Usar quando o pedido envolver entity, aggregate ou regras de negócio em packages/<bc>/domain/entity.
---

# Core Entity (Java)

## Overview

Entidade em `domain/entity/Customer.java` — path `com.example.customers.domain.entity.Customer`.

## Guidelines

- Ler `references/entity-pattern-java.md` e `java-namespace-layout.md`.
- Implementar `com.example.shared.Entity<ID>`.
- Factory `create()` retornando `Result<Self>`; combinar VOs com `Result.mergeErrors` → lista de `DomainError`.
- Comportamento via métodos de domínio (`deactivate`, etc.).
- **Proibido** `domain.entity.customer.CustomerEntity` ou sufixo `Entity` no domínio.

## Workflow

1. Mapear VOs e invariantes.
2. Implementar em `domain/entity/`.
3. Testes unitários — `test-unit-java`.

## References

- `references/entity-pattern-java.md`
- `../config-shared-core-java/references/java-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
