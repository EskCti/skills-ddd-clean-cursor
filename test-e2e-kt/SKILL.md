---
name: test-e2e-kt
stack: kotlin
description: Criar testes E2E de API Spring Boot com MockMvc/TestRestTemplate e banco real. Usar quando o pedido envolver test:e2e, *E2ETest.kt ou fluxo HTTP completo em Kotlin.
---

# E2E Tests (Kotlin)

## Overview

Testes E2E de API com Spring Boot Test — fluxo HTTP completo até persistência.

## Guidelines

- Ler `references/e2e-test-pattern-kt.md`.
- `@SpringBootTest` + `@AutoConfigureMockMvc` ou `TestRestTemplate`.
- Postgres via Testcontainers ou service do CI.
- Um test class por fluxo crítico do BC.

## Workflow

1. Mapear fluxo da story (POST → GET, etc.).
2. Criar `*E2ETest.kt` em `src/test/kotlin/.../integration/`.
3. Executar `./gradlew test` com banco disponível.
4. Validar no CI.

## References

- `references/e2e-test-pattern-kt.md`
- `../skills-standards.md`

## Global Standards

- Consultar `../skills-standards.md`.
