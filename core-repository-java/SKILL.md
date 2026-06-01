---
name: core-repository-java
stack: java
description: Criar ports (interfaces) de repositório em domain/repository Java. Usar quando o pedido envolver interface Repository ou contrato de persistência de domínio.
---

# Core Repository (Java)

## Overview

Interfaces em `domain/repository/CustomerRepository.java` — ex.: `com.example.customers.domain.repository.CustomerRepository`.

## Guidelines

- Interface no **domínio** (`packages/<bc>/`); implementação JPA em `modules/<bc>/infrastructure/persistence/*Adapter`.
- Métodos retornando `Result<T>`.
- Nome: `<Entity>Repository` (sem prefixo `I`).

## Workflow

1. Definir operações do aggregate.
2. Criar interface em `domain/repository/`.
3. Adapter via `backend-data-java`.

## Global Standards

- Consultar `../config-shared-core-java/references/java-namespace-layout.md`.
