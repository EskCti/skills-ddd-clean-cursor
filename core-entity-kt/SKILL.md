---
name: core-entity-kt
stack: kotlin
description: 'Criar, revisar ou orientar a implementação de Entidades de domínio em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver "entidade", "entity", arquivos `*.kt` de entidade, modelagem de regras de negócio com classes de domínio, validação com Result, composição com Value Objects/Entidades aninhadas, ou criação/ajuste de testes de entidade em Kotlin.'
---

# Entity (Kotlin)

## Overview

Aplicar o padrão de Entidades em Kotlin com foco em identidade (`id`), invariantes, imutabilidade via `data class`/`copy`, validação no `tryCreate` (companion object) e operações seguras com `Result`.

## Guidelines

- Ler `references/entity-pattern-kt.md` antes de criar/alterar entidades.
- Entidade como `data class` com construtor `private` e factory no `companion object`.
- Expor API consistente: `create` (throws) e `tryCreate` (`Result`).
- Validar invariantes com VOs (`Id`, `Name`, `Email`, etc.) e combinar erros.
- Usar `copy()` para atualização imutável (equivalente a `cloneWith` do TS).
- Implementar `equals`/`hashCode` por `id` (não por todos os campos).
- Preferir métodos de domínio explícitos (ex.: `deactivate()`, `changeName()`) para comportamento relevante.

## Workflow

1. Identificar invariantes e tipo de identidade da entidade.
2. Mapear dependências de VOs e entidades aninhadas para validação.
3. Implementar `data class`, companion object com `create/tryCreate` no padrão do projeto.
4. Sobrescrever `equals`/`hashCode` por `id` quando necessário.
5. Adicionar métodos de domínio quando houver transição de estado/comportamento.
6. Criar ou atualizar testes cobrindo criação válida, inválida, copy e igualdade por `id`.
7. Revisar consistência de mapeamento com repositórios/DTOs para novos campos.

## References

Consultar `references/entity-pattern-kt.md` para paths, checklist, exemplos e armadilhas comuns.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
