---
name: backend-controller-java
stack: java
description: Criar controllers HTTP Spring (@RestController) Java. Usar quando o pedido envolver REST API, rotas ou controllers na camada interfaces/web.
---

# Backend Controller (Java / Spring Boot)

## Overview

Controllers finos em `modules/<bc>/interfaces/web/CustomerController.java` — delegam a use cases da camada `application`.

## Guidelines

- Controller não implementa regra de domínio; delega para use case.
- Definir rota com `@RequestMapping`, verbos `@GetMapping`, `@PostMapping`, etc.
- Extrair input com `@RequestBody`, `@PathVariable`, `@RequestParam`.
- Mapear `Result.isFailure()` → `ResponseEntity` adequado (400/404/500).
- Prefixo de rota por BC: `/customers`, `/orders`.
- Sem JPA nem regras de domínio no controller.

## Workflow

1. Definir `@RequestMapping` base.
2. Implementar endpoints delegando ao use case.
3. Injetar use cases via construtor (Spring DI).
4. E2E com MockMvc — `test-e2e-java`.

## Global Standards

- Consultar `../skills-standards.md` seção **Java Stack Standards**.
