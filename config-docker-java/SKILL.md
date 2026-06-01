---
name: config-docker-java
stack: java
description: Dockerfile multi-stage para backend Java (Spring Boot) em produção. Usar quando o pedido envolver container, docker-compose.prod ou deploy Java.
---

# Config Docker (Java)

## Overview

Multi-stage: `eclipse-temurin:21-jdk` builder + `eclipse-temurin:21-jre-alpine` runtime. JAR via `./gradlew :apps:backend-java:bootJar`.

## Estrutura

```
project-root/
├── apps/backend-java/Dockerfile
├── docker-compose.prod.yml
└── .dockerignore
```

## Workflow

1. Builder: `./gradlew :apps:backend-java:bootJar --no-daemon`.
2. Runner: copiar JAR, `EXPOSE 4000`, `ENTRYPOINT java -jar`.
3. Validar `docker build -f apps/backend-java/Dockerfile .`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
