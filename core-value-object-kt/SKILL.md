---
name: core-value-object-kt
stack: kotlin
description: 'Criar, revisar ou orientar a implementação de Value Objects em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver "value object", "objeto de valor", "VO", regras de validação e normalização para atributos de domínio, ou criação de novos VOs com `value class` ou `data class` + `Result`.'
---

# Value Object (Kotlin)

## Overview

Aplicar o padrão de Value Object em Kotlin, garantindo imutabilidade, validação de invariantes, normalização de dados e a interface `create/tryCreate` com `Result`.

## Guidelines

- Ler `references/vo-pattern-kt.md` antes de criar ou modificar VOs.
- Preferir `@JvmInline value class` para VOs simples de tipo único (String, Int, Long).
- Usar `data class` para VOs compostos (ex.: Address com street + city + zip).
- Construtor `private`, factory no `companion object` com `create` e `tryCreate`.
- Validações explícitas com mensagens de erro legíveis.
- Normalização (trim, lowercase) aplicada antes da construção.

## Workflow

1. Identificar o tipo base do VO (string, number, composto) e invariantes.
2. Verificar VOs existentes para evitar duplicação.
3. Implementar o VO seguindo o esqueleto padrão (ver referência).
4. Adicionar testes cobrindo sucesso, falha e normalização.
5. Revisar API pública para manter consistência (`create`, `tryCreate`, erros).

## References

Consultar `references/vo-pattern-kt.md` para padrões, exemplos e caminhos relevantes.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
