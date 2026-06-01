---
name: core-use-case-java
stack: java
description: Criar use cases Java implementando UseCase. Usar quando o pedido envolver command handler, caso de uso ou orquestração application.
---

# Core Use Case (Java)

## Overview

Use cases em `application/usecase/CreateCustomerUseCase.java` — implementando `UseCase<CreateCustomerInput, Customer>`.

## Guidelines

- Injetar `<Entity>Repository` (port, não adapter concreto) via construtor.
- Orquestrar domínio; retornar `Result`.
- Classe plain Java em `packages/<bc>/`; wiring Spring em `*ModuleConfig` no backend.

## Workflow

1. Definir input/output DTOs.
2. Implementar classe + `UseCase`.
3. Registrar `@Bean` no backend — wire no controller (`backend-controller-java`).

## Global Standards

- Consultar `../config-shared-core-java/references/java-namespace-layout.md`.
