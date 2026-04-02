---
name: core-domain-service-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de serviços de domínio em C#, restritos ao núcleo de domínio. Usar quando o pedido envolver "domain service", "serviço de domínio", políticas de domínio, cálculos/regras puras entre entidades e VOs em C#, ou criação/ajuste de testes desses serviços.'
---

# Domain Service (C#)

## Overview

Aplicar o padrão de serviço de domínio em C# para encapsular regras que não pertencem naturalmente a uma única entidade/VO, mantendo lógica pura e independente de infraestrutura.

## Guidelines

- Considerar domínio apenas dentro de namespaces `Project.Module.Domain`.
- Manter o serviço sem dependência de framework, HTTP, banco, ASP.NET Core ou estado global.
- Preferir classes `static` para funções puras ou interfaces/implementações injetáveis se houver necessidade de polimorfismo (raro em serviços de domínio puros).
- Receber dados de domínio (entities, VOs) e retornar tipos simples ou valores de domínio.
- Nomear por intenção de regra (`*Policy`, `*Calculator`, `*Resolver`, `*Specification`).

## Workflow

1. Confirmar que a classe alvo está em namespace de domínio.
2. Identificar a regra transversal que não cabe em uma única entidade.
3. Definir API mínima (classe static ou interface/impl).
4. Implementar regra sem side effects e sem I/O.
5. Garantir consumo simples por use cases.
6. Criar testes unitários cobrindo cenários principais e bordas.

## References

- Consultar references/domain-service-pattern-cs.md para exemplos e padrões detalhados.
- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
