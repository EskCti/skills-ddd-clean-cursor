---
name: core-domain-service-java
stack: java
description: Criar serviços de domínio Java (regras puras entre entidades/VOs). Usar quando o pedido envolver domain service, Policy, Calculator ou Specification em packages/<bc>/domain/service.
---

# Core Domain Service (Java)

## Overview

Serviços de domínio em `packages/<bc>/.../domain/service/<Name>.java` — lógica pura, sem Spring/JPA/HTTP.

## Guidelines

- Apenas em `domain/service/` do BC — nunca em `application/` ou `infrastructure/`.
- Sem dependências de framework, HTTP, banco ou I/O.
- Métodos determinísticos recebendo entidades/VOs e retornando `Result` ou tipos simples.
- Nomear por intenção: `CustomerUniquenessPolicy`, `OrderTotalCalculator`.

## Workflow

1. Confirmar que a regra não cabe em uma única entidade/VO.
2. Implementar em `domain/service/`.
3. Consumir a partir de use cases (`core-use-case-java`).
4. Testes unitários — `test-unit-java`.

## References

- `references/domain-service-pattern-java.md`
- `../config-shared-core-java/references/java-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
