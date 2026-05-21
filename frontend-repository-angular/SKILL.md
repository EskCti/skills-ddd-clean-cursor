---
name: frontend-repository-angular
stack: typescript
description: Criar a implementação do repositório Angular com HttpClient, DTO de API e mapeamento para entidade de domínio, retornando Promise<Result<T>>. Usar quando o pedido envolver repository Angular, HttpClient wrapper, DTO-to-entity mapping, ou implementação de IRepository no Angular.
---

# Frontend Repository (Angular)

## Overview

Criar `class <Bc>HttpRepository implements I<Bc>Repository` que usa `HttpClient` para chamar a API e mapeia DTOs → entidade de domínio. Erros HTTP → `Result.err(message)`.

## Guidelines

- Implementa `I<Bc>Repository` (definido no domain).
- Usa `HttpClient` via `inject()`.
- Resposta da API mapeada de DTO → entidade via `CustomerEntity.create()`.
- Erros HTTP capturados com `catchError` do RxJS → retornam `err(message)`.
- Registrado no provider como `{ provide: CUSTOMER_REPOSITORY, useClass: CustomerHttpRepository }`.

## Workflow

1. Criar DTO interface `<Bc>ApiDto` (estrutura da API).
2. Criar `class <Bc>HttpRepository implements I<Bc>Repository`.
3. Cada método: `firstValueFrom(http.get<Dto>(...))` → mapear → retornar Result.
4. Capturar erros HTTP e converter para `err(message)`.
5. Registrar no `app.config.ts` como provider.

## References

- Consultar references/angular-repository-pattern.md para código completo.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
