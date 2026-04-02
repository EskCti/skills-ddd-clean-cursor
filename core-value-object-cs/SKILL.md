---
name: core-value-object-cs
stack: csharp
description: 'Criar, revisar ou orientar a implementação de Value Objects em C# no padrão DDD/Clean Architecture. Usar quando o pedido envolver "value object", "objeto de valor", "VO", regras de validação e normalização para atributos de domínio, ou criação de novos arquivos em `Project.Core.Domain.ValueObjects` com padrão `Result`.'
---

# Value Object (C#)

## Overview

Aplicar o padrão de Value Object em C#, garantindo imutabilidade, validação de invariantes, normalização de dados e a interface `Create` com `Result<T>`. Usar `record` para igualdade baseada em valor.

## Guidelines

- Ler `references/vo-pattern-cs.md` (se disponível) antes de criar ou modificar VOs.
- Usar `record` para aproveitar a igualdade estrutural nativa do C#.
- Construtor `private` ou `protected` para forçar o uso do método `Create`.
- Validar invariantes no método estático `Create` retornando `Result<T>`.
- Preferir validações explícitas com códigos de erro estáticos (ex.: `Error.InvalidEmail`).

## Workflow

1. Identificar o tipo base do VO (string, decimal, int, etc.) e invariantes.
2. Verificar VOs existentes para evitar duplicação ou para alinhar regras.
3. Implementar o VO seguindo o esqueleto padrão (record + static Create).
4. Adicionar testes unitários cobrindo casos válidos e inválidos.
5. Revisar a API pública para manter consistência (`Create`, `Result`, erros).

## References

- Consultar `../skills-standards.md` para convenção global de nomenclatura (seção C#).
- Seguir padrões de C# idiomáticos.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
