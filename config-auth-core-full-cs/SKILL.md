---
name: config-auth-core-full-cs
stack: csharp
description: Gerenciar o sistema completo de autenticação e autorização (RBAC) em C#. Usar quando o pedido envolver permissões complexas, múltiplos tenants ou integração avançada de identidade em .NET.
---

# Config Auth Core Full (C#)

## Overview

Expandir o núcleo de auth para suportar roles, permissões e multi-tenancy em C#, sobre o `config-auth-core-basic-cs` (User, Password) e o kernel `config-shared-core-cs` (Entity, Result, ValueObject) — sempre com `Result<T>` e `Errors: IReadOnlyList<string>` (§5.1).

## Guidelines

- `Role` e `Permission` são entidades de domínio puro (sem dependências EF Core/ASP.NET).
- `Permission` segue o padrão `resource:action` (ex.: `products:create`).
- Use cases (`CreateRoleUseCase`, `AssignPermissionUseCase`) retornam `Result<T>` — falha sempre com `Result<T>.Failure(errors)` (lista, nunca `throw`).
- Autorização no transporte: `Claims` + policy-based authorization (`[HasPermission("products:create")]`) — nunca acoplar regras RBAC ao controller.

## Workflow

1. Implementar `Role` e `Permission` no domínio (ver `assets/auth-core-full-template-cs/`).
2. Criar Use Cases para gestão de permissões (combinar `Role.Create`/`Permission.Create` com `Result.Combine` quando houver múltiplos invariantes).
3. Configurar políticas de autorização avançadas (claims, policies, decorators).
4. Testes: usar `test-unit-cs` (≥95% domain+application) — cobrir duplicidade de role/permission e autorização negada.



## NÃO FAZER

- ❌ Retornar `throw`/exceção no fluxo normal — use cases devolvem `Result<T>.Failure(...)`.

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/create-auth-core-full-cs.mjs`: Script de criação (placeholder).
- `assets/README.md`: Estrutura do template RBAC no Core..
- `references/rbac-contract-cs.md`: Contrato de roles e permissões..
- `references/rbac-patterns-cs.md`: Padrões de autorização (claims, policies).
