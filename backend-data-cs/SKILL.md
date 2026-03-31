---
name: backend-data-cs
stack: csharp
description: "Criar, revisar ou orientar a camada de persistência do backend C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver entidades de banco (EF Core), repositórios concretos, mapeamentos de banco para domínio, ou configuração de acesso a dados em C#."
---

# Backend Data (C# / EF Core)

## Overview

Aplicar o padrão de persistência do backend C# cobrindo modelagem EF Core, repositórios de infraestrutura, e implementação dos adapters com mapeamento consistente para domínio.

## Guidelines

- Entidades de Banco (EF Core) ficam na camada de Infrastructure, **não** no domínio.
- Separar a classe de persistência (`CustomerDbo` ou `CustomerEfEntity`) da entidade de domínio (`Customer`).
- Implementar mapeamentos explícitos: `ToDomain` (db -> domain) e `FromDomain` (domain -> db).
- Repositórios de Infraestrutura implementam as interfaces de domínio (`ICustomerRepository`) e retornam `Task<Result<T>>`.
- Tratar exceções de banco (concorrência, violação de constraint) e converter para `Result.Failure`.

## Workflow

1. Identificar alteração: modelo de persistência, migration ou repositório.
2. Ajustar a classe de persistência do EF Core.
3. Atualizar a implementação do repositório/query.
4. Revisar os mapeamentos `ToDomain`/`FromDomain`.
5. Validar a persistência com testes de integração (usando Banco em memória ou SQLite/Docker).
6. Rodar migrations (via `config-efcore-cs`).

## References

- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
