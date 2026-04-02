---
name: config-db-seed-cs
stack: csharp
description: Configurar o mecanismo de seeding de banco de dados em C#. Usar quando o pedido envolver popular o banco com dados iniciais, mocks para desenvolvimento ou dados mestres para a aplicação .NET.
---

# Config DB Seed (C#)

## Overview

Implementar seeding de dados determinístico e idempotente no EF Core, organizado por módulos e executado via `Program.cs` ou CLI.

## Estrutura sugerida

```
src/ProjectName.Infrastructure/
└── Persistence/
    └── Seed/
        ├── DataSeeder.cs         # Orquestrador de seeds
        └── Modules/
            ├── UserSeed.cs       # Seed específico do módulo Auth
            └── ProductSeed.cs    # Seed de exemplo
```

## Workflow

1. Criar classe base ou interface para Seeders.
2. Implementar seeds específicos usando o `AppDbContext`.
3. Garantir idempotência (verificar se o dado já existe antes de inserir).
4. Configurar o `DataSeeder.cs` para chamar todos os seeds de módulo.
5. Injetar e executar o `DataSeeder` no `Program.cs` (apenas em ambiente de Dev/Staging).

## Commands

```bash
node config-db-seed-cs/scripts/init-seed-cs.mjs --project-name=MyApp
```

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/init-seed-cs.mjs`: Script de scaffolding.
- `assets/seed-template-cs/`: Template das classes de seed.
- `references/seed-pattern-cs.md`: Padrões e boas práticas de seeding no EF Core.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura.
