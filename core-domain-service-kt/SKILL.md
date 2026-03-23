---
name: core-domain-service-kt
stack: kotlin
description: 'Criar, revisar ou orientar a implementação de serviços de domínio em Kotlin, restritos ao núcleo de domínio. Usar quando o pedido envolver "domain service", "serviço de domínio", políticas de domínio, cálculos/regras puras entre entidades e VOs em Kotlin, ou criação/ajuste de testes desses serviços.'
---

# Domain Service (Kotlin)

## Overview

Aplicar o padrão de serviço de domínio em Kotlin para encapsular regras que não pertencem naturalmente a uma única entidade/VO, mantendo lógica pura e independente de infraestrutura.

## Guidelines

- Considerar domínio apenas dentro de pacotes `domain` ou `core`.
- Manter o serviço sem dependência de framework, HTTP, banco, Spring ou estado global.
- Preferir funções puras e determinísticas.
- Receber dados de domínio (entities, VOs) e retornar tipos simples ou valores de domínio.
- Nomear por intenção de regra (`*Policy`, `*Calculator`, `*Resolver`, `*Specification`).
- Implementar como `object` (singleton stateless) ou classe simples.

## Workflow

1. Confirmar que a classe alvo está em pacote de domínio.
2. Identificar a regra transversal que não cabe em uma única entidade.
3. Definir API mínima (object com função ou classe com método).
4. Implementar regra sem side effects e sem I/O.
5. Garantir consumo simples por use cases.
6. Criar testes unitários cobrindo cenários principais e bordas.

## References

Consultar `references/domain-service-pattern-kt.md` para critérios, exemplos e checklist.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
