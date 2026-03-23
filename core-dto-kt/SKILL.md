---
name: core-dto-kt
stack: kotlin
description: 'Criar, revisar ou orientar Data Transfer Objects em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver `data class` DTOs, contratos de entrada (InDTO), saída (OutDTO), DTOs de query CQRS para leitura, paginação/filtros e adaptação de tipagem para consumo da API/front sem vazar detalhes de entidade/ORM.'
---

# DTO (Kotlin)

## Overview

Aplicar o padrão de DTOs em Kotlin para fronteiras de aplicação/leitura, separando claramente entrada, saída e projeções de query conforme o consumidor e o caso de uso.

## Guidelines

- Distinguir DTO por finalidade:
  - Input DTO: entrada de use case/comando/filtro.
  - Output DTO: resposta de use case/controlador.
  - Query DTO (CQRS): projeção de leitura para API/front.
- Usar `data class` para todos os DTOs.
- Query DTO não deve estender classe de entidade.
- DTO sem regra de domínio e sem acoplamento ao ORM.
- Preferir nomes explícitos (`FindAllUsersOutDTO`, `ProductFiltersDTO`).

## Workflow

1. Identificar o tipo de DTO (input, output ou query).
2. Definir o contrato mínimo necessário para o consumidor.
3. Criar `data class` com campos tipados.
4. Padronizar paginação/filtros/metadados quando aplicável.
5. Revisar uso no use case/query/repository para manter fronteiras corretas.

## References

Consultar `references/dto-pattern-kt.md` para exemplos, convenções e checklist.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
