---
name: backend-controller-kt
stack: kotlin
description: 'Criar, revisar ou orientar controllers HTTP do backend Spring Boot em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver arquivos `*Controller.kt`, definição de rotas e verbos HTTP, aplicação de segurança (Spring Security), binding de @RequestBody/@PathVariable/@RequestParam, orquestração de use cases e mapeamento de falhas para ResponseEntity/exceções HTTP.'
---

# Backend Controller (Kotlin / Spring Boot)

## Overview

Aplicar o padrão de controller como camada de entrada HTTP em Kotlin: receber request, validar parâmetros básicos, chamar use case e traduzir `Result` para resposta/exceção HTTP.

## Guidelines

- Controller não implementa regra de domínio; delega para use case/query.
- Definir rota e verbo com `@GetMapping`, `@PostMapping`, `@PatchMapping`, `@DeleteMapping`.
- Usar Spring Security (`@PreAuthorize`, `@Secured`) para endpoints protegidos.
- Extrair input com `@RequestBody`, `@PathVariable`, `@RequestParam`.
- Mapear falhas de `Result` para `ResponseEntity` adequado.
- Retornar payload esperado pelo contrato; para operações sem corpo, retornar `ResponseEntity.noContent()`.
- Seguir nomenclatura: arquivos `*Controller.kt`, pacotes em lowercase.

## Workflow

1. Definir rota base (`@RequestMapping("...")`) e segurança por controller.
2. Criar método por endpoint com anotações HTTP e segurança.
3. Chamar use case com dependências injetadas no controller.
4. Tratar `result.isFailure` e retornar `ResponseEntity` com status code correto.
5. Retornar `result.getOrNull()` ou `ResponseEntity.noContent()` conforme contrato.
6. Revisar consistência de status code e formato de erro.

## References

Consultar `references/controller-pattern-kt.md` para exemplos, checklist e armadilhas.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
