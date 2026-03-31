---
name: core-use-case-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de casos de uso (application services) em C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver "caso de uso", "use case", orquestração de entidades/repositórios/queries, regras de negócio de aplicação, mapeamento de falhas com Result, ou criação/ajuste de testes de use case em C#.'
---

# Use Case (C#)

## Overview

Aplicar o padrão de casos de uso em C# com foco em orquestração de dependências, validações de fluxo, retorno consistente com `Result<T>` e testes que cubram caminhos de sucesso e falha.

## Guidelines

- Implementar interface `IUseCase<TInput, TOutput>` ou classe direta com método `Task<Result<TOutput>> Execute(TInput input)`.
- Manter o use case como orquestrador: valida fluxo, chama repositories/queries e delega invariantes para entidades/VOs.
- Injetar dependências (interfaces) via construtor.
- Tratar falhas cedo (fail-fast) retornando `Result.Failure<T>(errors)`.
- Evitar lógica de persistência ou detalhes de infraestrutura (como SQL ou chamadas HTTP diretas).

## Workflow

1. Definir Input/Output DTOs e o contrato do use case.
2. Identificar dependências necessárias (ICustomerRepository, IEmailService, etc.).
3. Implementar `Execute` com validações de pré-condição.
4. Orquestrar a criação/atualização de entidades de domínio.
5. Persistir dados usando o repositório.
6. Retornar `Result.Success(output)` ou `Result.Failure(errors)`.
7. Criar testes unitários usando mocks para as dependências.

## References

- Consultar references/use-case-pattern-cs.md para exemplos e padrões detalhados.
- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
