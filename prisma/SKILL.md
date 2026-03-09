---
name: prisma
description: "Criar, revisar ou orientar a camada Prisma do backend no padrão Pharmacore. Usar quando o pedido envolver schema Prisma (`schema.prisma`, `models/*.prisma`), migrações SQL, geração de client, seeds (`prisma/seed/*`) e adapters `*.prisma.ts` que mapeiam banco para domínio/DTO."
---

# Prisma

## Overview

Aplicar o padrão Prisma do projeto cobrindo modelagem, migração, seed e implementação dos adapters de persistência/leitura com mapeamento consistente para core.

## Guidelines

- Respeitar organização modular do schema em `apps/backend/prisma/models/*.prisma`.
- Manter mapeamento de nomes com `@map`/`@@map` quando necessário.
- Atualizar client gerado após mudanças de schema/migração.
- Em adapters `*.prisma.ts`, separar mapeamento `toDomain`/`fromDomain` e DTO de query.
- Tratar erros com `Result.fail(...)` no adapter.
- Usar transação para operações compostas.
- Em seed, manter consistência entre tipos do arquivo JSON e payload Prisma.

## Workflow

1. Identificar alteração: schema, migração, seed ou adapter.
2. Ajustar modelos Prisma e/ou migration SQL.
3. Atualizar implementação `*.prisma.ts` afetada (repository/query).
4. Revisar mapeamentos para entidade/DTO e contratos de core.
5. Validar seed e delegates usados (`assertDelegate` quando aplicável).
6. Rodar validações de prisma (generate/migrate/seed) conforme necessidade do task.

## References

Consultar `references/prisma-pattern.md` para paths, checklist e armadilhas do projeto.
