---
name: core-value-object
description: Criar, revisar ou orientar a implementação de Value Objects no projeto Pharmacore. Usar quando o pedido envolver "value object", "objeto de valor", "VO", regras de validação e normalização para atributos de domínio, ou criação de novos arquivos em `packages/shared/src/vo` com padrão `ValueObject` + `Result`.
---

# Value Object

## Overview

Aplicar o padrão de Value Object do projeto, garantindo imutabilidade, validação de invariantes, normalização de dados e a interface `create/tryCreate` com `Result`.

## Guidelines

- Ler `references/vo-pattern.md` antes de criar ou modificar VOs.
- Reutilizar o padrão existente de `ValueObject`, `Result` e `ValueObjectConfig`.
- Preferir validações explícitas com códigos de erro estáticos (ex.: `INVALID_EMAIL`).
- Expor métodos auxiliares apenas quando agregam valor (ex.: getters derivados).

## Workflow

1. Identificar o tipo base do VO (string, number, etc.) e invariantes.
2. Verificar VOs existentes para evitar duplicação ou para alinhar regras.
3. Implementar o VO seguindo o esqueleto padrão (ver referência).
4. Adicionar testes em `packages/shared/test/vo` espelhando os casos da referência.
5. Revisar a API pública para manter consistência (`create`, `tryCreate`, erros).

## References

Consultar `references/vo-pattern.md` para padrões, exemplos e caminhos relevantes do projeto.
Consultar `../skills-standards.md` para convenção global de nomenclatura.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
