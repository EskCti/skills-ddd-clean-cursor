---
name: core-repository-cs
stack: csharp
description: "Criar, revisar ou orientar contratos e implementações de repositório em C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver interfaces de repositório, operações de persistência de entidades (Save/GetById/GetAll/Delete), adaptação de infraestrutura (EF Core, Dapper) para contratos de domínio, tratamento de erros com Result e mapeamentos ToDomain/FromDomain em C#."
---

# Repository (C#)

## Overview

Aplicar o padrão de repositório em C# para escrita e leitura de entidades de domínio com contratos (interfaces) no domínio e implementação desacoplada em infraestrutura.

## Guidelines

- Definir interface (`ICustomerRepository`) no namespace de domínio.
- Implementar no adapter de infraestrutura (EF Core, Dapper, etc.) retornando `Task<Result<T>>` ou `Task<T?>`.
- Mapear domínio explicitamente: `ToDomain` (db -> entity) e `FromDomain` (entity -> db).
- Tratar falhas com `Result.Failure(...)`.
- Manter separação CQRS: Repositories para comando/escrita, Queries para leitura/projeção DTO (Performance).

## Workflow

1. Confirmar agregados/entidades cobertos pelo repositório.
2. Definir/ajustar interface (`ICustomerRepository`) no namespace de domínio.
3. Implementar adapter de infraestrutura respeitando o contrato.
4. Implementar mapeamento `ToDomain`/`FromDomain`.
5. Garantir consistência transacional (Unit of Work) para operações compostas.
6. Criar/ajustar mocks (NSubstitute, Moq) para testes de use case.

## References

- Consultar references/repository-pattern-cs.md para exemplos e padrões detalhados.
- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
