---
name: domain-service
description: Criar, revisar ou orientar a implementação de serviços de domínio no padrão Pharmacore, restritos ao núcleo de domínio (`*core/*`). Usar quando o pedido envolver "domain service", "serviço de domínio", arquivos `*.service.ts` em `packages/*/core/src/**`, políticas de domínio, cálculos/regras puras entre entidades e VOs, ou criação/ajuste de testes desses serviços.
---

# Domain Service

## Overview

Aplicar o padrão de serviço de domínio para encapsular regras que não pertencem naturalmente a uma única entidade/VO, mantendo lógica pura e independente de infraestrutura.

## Guidelines

- Considerar domínio apenas dentro de `*core/*`.
- Não tratar `*.service.ts` de `web`, `frontend`, `api` ou infraestrutura como domínio.
- Manter o serviço sem dependência de framework, HTTP, banco, Prisma, Nest, React ou estado global.
- Preferir funções/métodos puros e determinísticos.
- Receber dados de domínio (entities, DTOs de domínio, VOs) e retornar tipos simples/valores de domínio.
- Nomear por intenção de regra (`Policy`, `Calculator`, `Resolver`, `Specification`).

## Workflow

1. Confirmar que o arquivo alvo está em `packages/*/core/*`.
2. Identificar a regra transversal que não cabe em uma única entidade.
3. Definir API mínima do serviço (classe com método estático ou instância simples).
4. Implementar regra sem side effects e sem I/O.
5. Garantir consumo simples por use cases/contexts.
6. Criar testes unitários cobrindo cenários principais e bordas.

## References

Consultar `references/domain-service-pattern.md` para critérios de fronteira, exemplos reais e checklist de implementação/testes.
