---
name: core-value-object-java
stack: java
description: Criar Value Objects Java imutáveis com validação e Result. Usar quando o pedido envolver VO, validação de domínio ou invariantes em packages/<bc>/domain/valueobject.
---

# Core Value Object (Java)

## Overview

VOs em `packages/<bc>/src/.../domain/valueobject/<Name>.java` — tipo exportado como `domain.valueobject.Email`, **não** `valueobject.email.Email` aninhado.

## Guidelines

- Ler `../config-shared-core-java/references/java-namespace-layout.md`.
- Record ou class final com validação em factory `create()` → `Result<Self>`.
- Um VO por arquivo (`Email.java` → `Email`).
- Sem Spring/JPA no pacote de domínio.

## Workflow

1. Identificar regras e normalização.
2. Criar arquivo em `domain/valueobject/`.
3. Testes unitários — `test-unit-java`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
