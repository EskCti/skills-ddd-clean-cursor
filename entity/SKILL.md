---
name: entity
description: Criar, revisar ou orientar a implementação de Entidades de domínio no padrão Pharmacore. Usar quando o pedido envolver "entidade", "entity", arquivos `*.entity.ts`, modelagem de regras de negócio com `Entity`, validação com `Result`, composição com Value Objects/Entidades aninhadas, ou criação/ajuste de testes de entidade.
---

# Entity

## Overview

Aplicar o padrão de Entidades do projeto com foco em identidade (`id`), invariantes, imutabilidade prática (sem setters), validação no `tryCreate` e operações seguras com `cloneWith`.

## Guidelines

- Ler `references/entity-pattern.md` antes de criar/alterar entidades.
- Estender `Entity<Type, Props>` de `@pharmacore/shared` e manter construtor `private` ou `protected`.
- Expor API consistente: `create` (throw) e `tryCreate` (`Result`).
- Validar invariantes com VOs (`Id`, `Name`, `Text`, `Number`, `Sku`, etc.) e `Result.combine`.
- Persistir no `props` apenas valores normalizados (`instance.value`, `instance.props` quando aplicável).
- Implementar getters para propriedades de domínio; evitar acesso externo direto a `props` fora da entidade.
- Preferir métodos de domínio explícitos (ex.: `deactivate`, `createMovementIn`) para comportamento relevante.

## Workflow

1. Identificar invariantes e tipo de identidade da entidade (`Id.tryCreate`/`Id.required`).
2. Mapear dependências de VOs e entidades aninhadas para validação.
3. Implementar `Props`, classe, getters e `create/tryCreate` no padrão do projeto.
4. Adicionar métodos de domínio quando houver transição de estado/comportamento.
5. Criar ou atualizar testes em `packages/*/core/test/**` cobrindo criação válida, inválida, `cloneWith` e igualdade por `id`.
6. Revisar consistência de mapeamento com repositórios/DTOs para novos campos.

## References

Consultar `references/entity-pattern.md` para paths, checklist, exemplos e armadilhas comuns observadas no código atual.
