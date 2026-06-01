---
name: test-e2e-java
stack: java
description: Testes E2E HTTP Java (MockMvc / @SpringBootTest). Usar quando o pedido envolver test:e2e ou fluxo POST/GET completo.
---

# E2E Tests (Java)

## Overview

Testes em `apps/backend-java/src/test/java/` com `@SpringBootTest` + `MockMvc` ou `TestRestTemplate` — Postgres de teste via docker-compose ou Testcontainers.

## Guidelines

- Fluxo: POST criar → GET buscar.
- `@AutoConfigureMockMvc` para testes HTTP sem subir servidor externo.
- `./gradlew :apps:backend-java:test`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
