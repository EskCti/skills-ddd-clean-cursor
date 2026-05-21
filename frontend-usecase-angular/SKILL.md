---
name: frontend-usecase-angular
stack: typescript
description: Criar serviços Angular que encapsulam casos de uso (application services) com retorno Promise<Result<T>>. Usar quando o pedido envolver use case Angular, application service, lógica de negócio no frontend Angular, ou orquestração entre repository e entidade em Angular.
---

# Frontend UseCase (Angular)

## Overview

Criar Angular services (`@Injectable`) que encapsulam a lógica de aplicação, retornando `Promise<Result<T>>`. O UseCase recebe um `IRepository` via `inject()` e orquestra: valida → chama repository → retorna Result.

## Guidelines

- `@Injectable({ providedIn: 'root' })` ou `providedIn: 'any'` para escopo correto.
- Recebe `I<Bc>Repository` via `inject()` (Angular DI).
- Retorna `Promise<Result<T>>` — nunca lança exceção.
- Um service = um caso de uso (ou casos de uso relacionados ao mesmo BC).
- Separa lógica de apresentação da lógica de aplicação.

## Workflow

1. Criar `abstract class I<Bc>Repository` ou `InjectionToken`.
2. Criar `@Injectable() class Create<Bc>UseCase` com método `execute(params)`.
3. Injetar repository via `inject()`.
4. Implementar lógica com retorno `Promise<Result<T>>`.
5. Criar em `features/<bc>/domain/<bc>.use-cases.ts`.

## References

- Consultar references/angular-usecase-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
