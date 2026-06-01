---
name: test-unit-java
stack: java
description: Testes unitários Java para domain e application (JUnit 5, JaCoCo). Usar quando o pedido envolver test:unit, coverage ou testes nos módulos BC.
---

# Unit Tests (Java)

## Overview

Testes JUnit 5 em `packages/<bc>/src/test/java/` — meta **≥95%** domain+application.

## Guidelines

- Mock ports com Mockito ou fake implementando `*Repository`.
- Sem Postgres real em unit tests de domínio.
- `./gradlew test jacocoTestReport`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
