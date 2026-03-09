---
name: dto
description: "Criar, revisar ou orientar Data Transfer Objects no padrão Pharmacore. Usar quando o pedido envolver arquivos `dto/*.ts`, contratos de entrada (`InDTO`), saída (`OutDTO`), DTOs de query CQRS para leitura, paginação/filtros/metadados e adaptação de tipagem para consumo da API/front sem vazar detalhes de entidade/ORM."
---

# Dto

## Overview

Aplicar o padrão de DTOs para fronteiras de aplicação/leitura, separando claramente entrada, saída e projeções de query conforme o consumidor e o caso de uso.

## Guidelines

- Distinguir DTO por finalidade:
  - Input DTO (`InDTO`): entrada de use case/comando/filtro.
  - Output DTO (`OutDTO`): resposta de use case/controlador.
  - Query DTO (CQRS): projeção de leitura para API/front.
- Query DTO não deve estender classe de entidade.
- DTO pode:
  - derivar de `*Props` (ex.: `UserProps`, `RoleProps`) com `Omit`/`Pick`;
  - ou ser totalmente independente quando a projeção exigir.
- Manter DTO sem regra de domínio e sem acoplamento ao ORM.
- Preferir nomes explícitos (`FindAllUsersOutDTO`, `ProductFiltersDTO`, `RoleDTO`).

## Workflow

1. Identificar o tipo de DTO (input, output ou query).
2. Definir o contrato mínimo necessário para o consumidor.
3. Escolher base de tipagem:
  - `*Props` + adaptação (`Omit`/`Pick`) quando fizer sentido;
  - tipo dedicado quando a projeção é diferente do domínio.
4. Padronizar paginação/filtros/metadados quando aplicável.
5. Revisar uso no use case/query/repository para manter fronteiras corretas.

## References

Consultar `references/dto-pattern.md` para exemplos reais do projeto, convenções e checklist.
