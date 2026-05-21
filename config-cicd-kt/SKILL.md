---
name: config-cicd-kt
stack: kotlin
description: Criar ou revisar pipeline GitHub Actions para projetos Kotlin com Spring Boot, cobrindo testes com Gradle, build Docker, push para registry e deploy. Usar quando o pedido envolver GitHub Actions, CI/CD, pipeline, deploy automatizado ou integração contínua para stack Kotlin/Spring Boot/Gradle.
---

# Config CI/CD (Kotlin)

## Overview

Gerar workflows GitHub Actions para backend Kotlin com Spring Boot (Gradle multi-módulo), cobrindo CI (build + test) e CD (build Docker + push + deploy).

## Estrutura gerada

```
project-root/
└── .github/
    └── workflows/
        ├── ci.yml          ← gradle build + test em PRs
        └── cd.yml          ← build Docker + push + deploy em main/tags
```

## Workflow

1. Verificar se `.github/workflows/` existe; criar se necessário.
2. Criar `ci.yml` — executado em PRs com Gradle build e testes.
3. Criar `cd.yml` — executado em push para `main` ou tags `v*`.
4. Perguntar ao usuário: registry (GHCR, Docker Hub, ECR)?
5. Perguntar: ambiente de deploy?

## References

- Consultar `references/cicd-pattern-kt.md` para templates completos.
- Consultar `../skills-standards.md` para convenções globais (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
