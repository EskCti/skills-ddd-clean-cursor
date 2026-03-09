---
name: query-cqrs
description: Criar, revisar ou orientar queries no padrão CQRS de leitura no Pharmacore. Usar quando o pedido envolver interfaces `*Query`, arquivos `*.query.ts`, use cases de leitura (`find-*`), projeções/DTOs para consumo da API/front, paginação/filtros/agregações e separação entre leitura (query) e escrita (repository/comando).
---

# Query CQRS

## Overview

Aplicar o padrão de consultas de leitura desacopladas dos comandos, retornando DTOs/projeções adequadas ao consumo da API sem expor entidades quando não necessário.

## Guidelines

- Usar Query para leitura/projeção; usar Repository/entidade para fluxos de comando (create/update/delete e invariantes de escrita).
- Definir interfaces de query em `core` (`execute(...) => Promise<Result<DTO>>`).
- Implementar query no adapter de infraestrutura (ex.: Prisma) retornando DTO.
- Manter use case de leitura fino: chamar query, mapear falhas e aplicar formatação complementar quando necessário.
- Não acoplar query a regras de domínio de escrita.
- DTO de query:
  - pode derivar de `*Props` (ex.: `UserProps`, `RoleProps`) com `Omit`/campos adicionais;
  - ou ser DTO totalmente independente, conforme necessidade da projeção.
  - não estender a classe da entidade.

## Workflow

1. Identificar se o caso é leitura (query) ou comando (repository).
2. Definir contrato da query (`FindXxxQuery`) e DTO de saída.
3. Implementar query no adapter (Prisma/in-memory), incluindo filtros/paginação quando aplicável.
4. Usar a query no use case de leitura e mapear erros de domínio.
5. Validar formato final do DTO para o consumidor (API/front).
6. Criar testes cobrindo sucesso, vazio/not found e falhas.

## References

Consultar `references/query-cqrs-pattern.md` para exemplos reais, checklist e critérios de modelagem de DTO.
