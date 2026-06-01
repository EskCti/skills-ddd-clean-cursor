---
name: config-shared-core-java
stack: java
description: Gerenciar o Shared Kernel Java (Entity, Result, UseCase) em packages/shared. Usar quando o pedido envolver classes base transversais, Result tipado ou interfaces de aplicação no workspace Gradle.
---

# Config Shared Core (Java)

## Overview

Manter o subprojeto `packages/shared` com abstrações DDD reutilizáveis por todos os Bounded Contexts — **pure Java, sem Spring**.

## Localização

- `packages/shared/src/main/java/com/example/shared/`

## Estrutura

```
packages/shared/
├── build.gradle
└── src/main/java/com/example/shared/
    ├── Entity.java       # interface Entity<ID>
    ├── DomainError.java  # record DomainError
    ├── Result.java       # Result<T>
    └── UseCase.java      # interface UseCase<I, O>
```

## Workflow

1. Ler `references/java-namespace-layout.md` — namespaces dos **módulos de BC** não repetem nomes de tipos.
2. Implementar ou estender tipos no kernel sem dependências de Spring/JPA.
3. Garantir que BC modules dependem de `:packages:shared` via Gradle.
4. Rodar `./gradlew :packages:shared:test`.

## References

- `references/java-namespace-layout.md` — layout modular obrigatório
- `references/shared-patterns-java.md` — Result, Entity, UseCase

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
