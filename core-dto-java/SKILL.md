---
name: core-dto-java
stack: java
description: Criar DTOs de aplicação Java (Input/Output). Usar quando o pedido envolver contratos na camada application/dto.
---

# Core DTO (Java)

## Overview

DTOs em `packages/<bc>/.../application/dto/` — `CreateCustomerInput`, `CustomerOutput`.

## Guidelines

- Records Java 21 para imutabilidade.
- Sem lógica de negócio; validação de formato leve OK, regras de domínio nos VOs.
- Nomes com sufixo `Input` / `Output`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
