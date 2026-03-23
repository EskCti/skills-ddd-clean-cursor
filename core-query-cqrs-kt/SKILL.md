---
name: core-query-cqrs-kt
stack: kotlin
description: 'Criar, revisar ou orientar queries no padrão CQRS de leitura em Kotlin. Usar quando o pedido envolver interfaces de Query, use cases de leitura (find-*), projeções/DTOs para consumo da API/front, paginação/filtros/agregações e separação entre leitura (query) e escrita (repository/comando) em Kotlin.'
---

# Query CQRS (Kotlin)

## Overview

Aplicar o padrão de consultas de leitura desacopladas dos comandos em Kotlin, retornando DTOs/projeções adequadas ao consumo da API sem expor entidades.

## Guidelines

- Usar Query para leitura/projeção; usar Repository para fluxos de comando.
- Definir interfaces de query no domínio com `suspend fun execute(...): Result<DTO>`.
- Implementar query no adapter de infraestrutura (JPA, Exposed) retornando DTO.
- Manter use case de leitura fino: chamar query, mapear falhas.
- Não acoplar query a regras de domínio de escrita.

## Workflow

1. Identificar se o caso é leitura (query) ou comando (repository).
2. Definir contrato da query e DTO de saída.
3. Implementar query no adapter, incluindo filtros/paginação quando aplicável.
4. Usar a query no use case de leitura e mapear erros.
5. Validar formato final do DTO para o consumidor.
6. Criar testes cobrindo sucesso, vazio/not found e falhas.

## References

Consultar `references/query-cqrs-pattern-kt.md` para exemplos, checklist e critérios.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
