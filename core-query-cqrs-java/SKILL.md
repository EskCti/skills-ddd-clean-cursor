---
name: core-query-cqrs-java
stack: java
description: Criar queries CQRS Java (leitura) na camada application. Usar quando o pedido envolver busca por id, listagem ou projeção read-only.
---

# Core Query CQRS (Java)

## Overview

Queries em `application/usecase/FindCustomerByIdUseCase.java` — implementando `UseCase<FindCustomerInput, CustomerOutput>`.

## Guidelines

- Read-only; sem mutar aggregate.
- Pode retornar DTO diretamente.
- Mesmas regras de namespace que use cases.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
