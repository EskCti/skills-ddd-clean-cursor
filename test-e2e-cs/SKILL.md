---
name: test-e2e-cs
stack: csharp
description: Criar testes E2E de API ASP.NET Core com WebApplicationFactory no projeto IntegrationTests. Usar quando o pedido envolver test:e2e, IntegrationTests ou fluxo HTTP completo em C#.
---

# E2E Tests (C#)

## Overview

Testes E2E de API em `tests/<Project>.IntegrationTests/` usando `WebApplicationFactory<Program>`.

## Guidelines

- Ler `references/e2e-test-pattern-cs.md`.
- Projeto criado pelo `config-project-cs` — referenciar Backend.
- Fluxos críticos: POST criar → GET buscar.
- Unit tests ficam em `UnitTests` (`test-unit-cs`).

## Workflow

1. Identificar endpoints e payload da story.
2. Criar `*E2ETests.cs` em `apps/backend/tests/ProjectName.IntegrationTests/Api/`.
3. `dotnet test apps/backend/tests/ProjectName.IntegrationTests/ProjectName.IntegrationTests.csproj`.
4. CI executa após unit tests.

## References

- `references/e2e-test-pattern-cs.md`
- `../config-project-cs/SKILL.md`
- `../skills-standards.md`

## Global Standards

- Consultar `../skills-standards.md`.
