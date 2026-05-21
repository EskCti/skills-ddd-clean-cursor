---
name: test-unit-cs
stack: csharp
description: Criar ou revisar testes unitários C# (xUnit) para Domain e Application com Coverlet ≥95%. Usar quando o pedido envolver test:unit, test:coverage, *Tests.cs, Moq ou cobertura em projetos ASP.NET Core.
---

# Unit Tests (C#)

## Overview

Testes unitários para **Domain + Application** com xUnit, Moq e Coverlet — meta **≥95% lines**.

## Guidelines

- Ler `references/unit-test-pattern-cs.md`.
- Projeto de testes separado: `tests/<Project>.UnitTests/`.
- Mockar interfaces de repositório — sem EF Core/InMemory em unit tests de domínio.
- `[Fact]` / `[Theory]` para casos válidos e inválidos.
- `dotnet test --collect:"XPlat Code Coverage"` deve atingir ≥95% no Core.

## Workflow

1. Identificar entities, VOs e use cases do BC.
2. Criar `*Tests.cs` em pastas `Domain/` e `Application/`.
3. Configurar Coverlet no `.csproj` de testes se ausente.
4. Implementar testes felizes + erros de negócio.
5. Executar `dotnet test` com collector.
6. Ajustar até coverage gate passar no CI.

## References

- `references/unit-test-pattern-cs.md`
- `../skills-standards.md`

## Global Standards

- Consultar `../skills-standards.md`.
