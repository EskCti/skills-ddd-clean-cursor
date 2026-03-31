---
name: core-entity-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de Entidades de domínio em C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver "entidade", "entity", arquivos `*.cs` de entidade, modelagem de regras de negócio com classes de domínio, validação com Result, composição com Value Objects/Entidades aninhadas, ou criação/ajuste de testes de entidade em C#.'
---

# Entity (C#)

## Overview

Aplicar o padrão de Entidades em C# com foco em identidade (`Id`), invariantes, imutabilidade via `record` ou `class` com `init`, validação no método estático `Create` e operações seguras com `Result`.

## Guidelines

- Ler `references/entity-pattern-cs.md` (se disponível) antes de criar/alterar entidades.
- Entidade como `class` ou `record` com construtor `private/protected`.
- Expor API consistente: `Create` retornando `Result<T>`.
- Validar invariantes com VOs (`Id`, `Name`, `Email`, etc.) e combinar erros.
- Usar `init` ou métodos de domínio para alteração de estado garantindo imutabilidade externa.
- Implementar `Equals` e `GetHashCode` baseados no `Id` (entidades são identificadas por ID, não por estado).
- Preferir métodos de domínio explícitos (ex.: `Deactivate()`, `ChangeName()`) para comportamento relevante.

## Workflow

1. Identificar invariantes e tipo de identidade da entidade.
2. Mapear dependências de VOs e entidades aninhadas para validação.
3. Implementar a classe/record, com método estático `Create` no padrão do projeto.
4. Sobrescrever `Equals`/`GetHashCode` por `Id`.
5. Adicionar métodos de domínio quando houver transição de estado/comportamento.
6. Criar ou atualizar testes cobrindo criação válida, inválida e igualdade por `Id`.
7. Revisar consistência de mapeamento com repositórios/DTOs para novos campos.

## References

- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).
- Seguir padrões de C# idiomáticos (PascalCase, namespaces).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
