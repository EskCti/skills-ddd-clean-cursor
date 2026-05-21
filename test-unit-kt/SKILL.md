---
name: test-unit-kt
stack: kotlin
description: Criar ou revisar testes unitários Kotlin (JUnit 5) para domain e application com JaCoCo ≥95%. Usar quando o pedido envolver test:unit, test:coverage, *Test.kt, MockK ou cobertura em módulos Spring Boot/Kotlin.
---

# Unit Tests (Kotlin)

## Overview

Testes unitários para camadas **domain + application** com JUnit 5, MockK e gate JaCoCo **≥95% lines**.

## Guidelines

- Ler `references/unit-test-pattern-kt.md`.
- Usar `kotlin.test` + JUnit 5; coroutines com `runBlocking` ou `runTest`.
- Mockar repositórios com MockK — sem `@SpringBootTest` em unit tests.
- Configurar JaCoCo no `build.gradle.kts` do módulo.
- `./gradlew :packages:<module>:check` deve passar com coverage verification.

## Workflow

1. Identificar classes domain/application do BC.
2. Criar `*Test.kt` em `src/test/kotlin` espelhando o package.
3. VO/Entity: casos válidos e inválidos.
4. UseCase: mock repository, fluxo feliz + erros.
5. Adicionar/atualizar bloco JaCoCo no `build.gradle.kts`.
6. Executar `./gradlew test jacocoTestCoverageVerification`.
7. Ajustar testes até ≥95%.

## References

- `references/unit-test-pattern-kt.md`
- `../skills-standards.md`

## Global Standards

- Consultar `../skills-standards.md`.
