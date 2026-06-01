---
name: config-cicd-java
stack: java
description: Pipeline CI/CD GitHub Actions para Java (Gradle test, JaCoCo coverage). Usar quando o pedido envolver workflow Java ou gate de qualidade.
---

# Config CI/CD (Java)

## Overview

Workflow CI: `./gradlew build`, `./gradlew test`, JaCoCo coverage — meta **≥95%** em domain+application dos módulos BC (`packages/<bc>/`).

## Workflow

1. `.github/workflows/ci.yml` em push/PR.
2. Serviço Postgres para testes integração.
3. Falhar PR se coverage abaixo do threshold.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
