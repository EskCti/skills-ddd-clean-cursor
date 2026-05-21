---
name: config-docker-kt
stack: kotlin
description: Criar ou revisar Dockerfile multi-stage para produção em projetos Kotlin com Spring Boot, gerando imagem JVM otimizada com Gradle build e JRE enxuto. Usar quando o pedido envolver Dockerfile, imagem Docker, build de produção, containerização ou docker-compose de produção para stack Kotlin/Spring Boot.
---

# Config Docker (Kotlin)

## Overview

Gerar Dockerfile multi-stage otimizado para produção em backend Kotlin com Spring Boot (Gradle multi-módulo).

> O `docker-compose.yml` de **desenvolvimento local** (apenas banco) é gerado pelo `config-jpa-kt`. Este skill cobre **build de produção** com multi-stage e imagem JRE enxuta.

## Estrutura gerada

```
project-root/
├── apps/
│   └── backend-kt/
│       └── Dockerfile          ← multi-stage Gradle + JRE
├── docker-compose.prod.yml     ← orquestra backend + db
└── .dockerignore               ← exclui .gradle, build, .env
```

## Workflow

1. Verificar se `apps/backend-kt/` e `build.gradle.kts` existem.
2. Criar `apps/backend-kt/Dockerfile` com estágio `builder` (Gradle build) e `runner` (JRE alpine).
3. Criar `.dockerignore` cobrindo `.gradle`, `build/`, `.env*`.
4. Criar `docker-compose.prod.yml` orquestrando backend-kt e postgres.
5. Validar: `docker build -f apps/backend-kt/Dockerfile .`

## References

- Consultar `references/docker-pattern-kt.md` para templates completos.
- Consultar `../skills-standards.md` para convenções globais (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
