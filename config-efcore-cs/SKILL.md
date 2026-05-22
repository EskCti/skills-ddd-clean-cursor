---
name: config-efcore-cs
stack: csharp
description: "Inicializar e padronizar a infraestrutura de persistência Entity Framework Core no backend C# com DbContext, configurações Fluent API, migrations EF, appsettings.json com ConnectionStrings, e Docker Compose para Postgres. Usar quando o pedido envolver setup inicial de EF Core, onboarding de módulos com tabelas no banco ou rebootstrap da infraestrutura de dados no .NET."
---

# Config EF Core (C#)

## Overview

Executar setup determinístico da infraestrutura EF Core no backend C#, com ConnectionString configurada via `appsettings.json`, migrations, Docker Compose para Postgres e configurações de mapeamento via Fluent API.

Equivalente ao `config-prisma` do stack TypeScript e `config-jpa-kt` do stack Kotlin, adaptado para o ecossistema .NET.

## Workflow

1. Confirmar que o projeto contém `.csproj` no Backend e Infrastructure.
2. Configurar dependências EF Core no Infrastructure:
   - `Microsoft.EntityFrameworkCore`
   - `Microsoft.EntityFrameworkCore.Design`
   - `Npgsql.EntityFrameworkCore.PostgreSQL` (ou outro provider)
3. Criar/Ajustar `appsettings.json` com `ConnectionStrings`.
4. Criar `docker-compose.yml` para Postgres compatível com as strings de conexão.
5. Criar classe `AppDbContext` herdando de `DbContext`.
6. Organizar mapeamentos na pasta `Persistence/Configurations/` implementando `IEntityTypeConfiguration<T>`.
7. Criar migration inicial de bootstrap: `dotnet ef migrations add InitialCreate`.
8. Validar que a aplicação inicia e aplica migrations em ambiente de Dev.

## O que o setup garante

- Dependências no Infrastructure:
  - `Npgsql.EntityFrameworkCore.PostgreSQL`
  - `Microsoft.EntityFrameworkCore.Relational`
- `appsettings.json` com:
  - `ConnectionStrings:DefaultConnection` via env `DATABASE_URL` (se possível mapeado)
- `docker-compose.yml` com Postgres alinhado às credenciais locais.
- Pasta `Persistence/Migrations/` com a primeira migração.
- Injeção de dependência no `Program.cs` via `AddDbContext<AppDbContext>`.

## Arquivos críticos

- `apps/backend/Project.Infrastructure/Persistence/Contexts/AppDbContext.cs`
- `apps/backend/Project.Backend/appsettings.json`
- `apps/backend/Project.Infrastructure/Persistence/Configurations/*.Configuration.cs`
- `docker-compose.yml`
- `.env` / `.env.example`

## Commands

Gerar migration (no root):

```bash
dotnet ef migrations add <MigrationName> --project apps/backend/Project.Infrastructure --startup-project apps/backend/Project.Backend --output-dir Persistence/Migrations
```

Aplicar no banco local:

```bash
dotnet ef database update --project apps/backend/Project.Infrastructure --startup-project apps/backend/Project.Backend
```

Remover última migration:

```bash
dotnet ef migrations remove --project apps/backend/Project.Infrastructure --startup-project apps/backend/Project.Backend
```

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/init-efcore-cs.mjs`: Script de automação (placeholder).
- `assets/efcore-template-cs/`: Template base para DbContext e mapeamentos.
- `references/efcore-init-checklist-cs.md`: Checklist operacional detalhado.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura C#.
