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
- Devolver sempre DTO de saída (`*Output`) — nunca a entidade de domínio.
- Mapear `Result.isFailure()` → `ResponseEntity`: `400 { "errors": [...] }` (lista completa via `getErrorMessages()`), `404` (não encontrado), `500` (exceção inesperada).
- Create retorna `201 Created` (não `200`).
- Prefixo de rota por BC: `/customers`, `/orders`.
- Sem JPA nem regras de domínio no controller.

## Workflow

1. Definir `@RequestMapping` base.
2. Implementar endpoints delegando ao use case e mapeando `Result.isFailure()` → 400/404/500 (ver `references/controller-pattern-java.md`).
3. Injetar use cases via construtor (Spring DI).
4. E2E com MockMvc — `test-e2e-java`.

## References

- Ver `references/controller-pattern-java.md` — exemplo completo (create 201, `400 { "errors": [...] }`, 404 e 500).
- Ver `../config-shared-core-java/references/shared-patterns-java.md` — API do `Result<T>`.
- Consultar `../skills-standards.md` § **5.1** e seção **Java Stack Standards**.
