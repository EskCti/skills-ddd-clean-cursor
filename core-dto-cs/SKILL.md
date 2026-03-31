---
name: core-dto-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de DTOs (Data Transfer Objects) em C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver contratos de entrada/saída, "Request", "Response", objetos simples para transporte de dados entre camadas em C#.'
---

# DTO (C#)

## Overview

Aplicar o padrão de DTO em C# para transporte de dados entre camadas (API -> Application -> Infrastructure), garantindo desacoplamento do modelo de domínio.

## Guidelines

- Usar `record` para DTOs imutáveis (preferencial em C# moderno) ou `class` simples.
- Propriedades em PascalCase.
- Evitar lógica de negócio dentro do DTO.
- Mapeamentos (opcional): Implementar métodos de extensão ou usar AutoMapper para converter entre DTO e Domínio/Infra.

## Workflow

1. Identificar a necessidade de transporte de dados (Input/Output).
2. Definir as propriedades necessárias seguindo o contrato da API ou Use Case.
3. Implementar como `record` ou `class` com propriedades `get; init;`.
4. Garantir que o DTO não exponha tipos internos de domínio (como VOs ou Entidades) diretamente, a menos que planejado para compartilhamento interno.

## References

- Consultar references/dto-pattern-cs.md para exemplos e padrões detalhados.
- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
