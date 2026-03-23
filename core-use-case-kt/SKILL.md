---
name: core-use-case-kt
stack: kotlin
description: 'Criar, revisar ou orientar a implementação de casos de uso (application services) em Kotlin no padrão DDD/Clean Architecture. Usar quando o pedido envolver "caso de uso", "use case", orquestração de entidades/repositórios/queries, regras de negócio de aplicação, mapeamento de falhas com Result, ou criação/ajuste de testes de use case em Kotlin.'
---

# Use Case (Kotlin)

## Overview

Aplicar o padrão de casos de uso em Kotlin com foco em orquestração de dependências, validações de fluxo, retorno consistente com `Result` e testes que cubram caminhos de sucesso e falha.

## Guidelines

- Ler `references/use-case-pattern-kt.md` antes de criar ou alterar use cases.
- Implementar interface `UseCase<IN, OUT>` com `suspend fun execute(data: IN): Result<OUT>`.
- Manter o use case como orquestrador: valida fluxo, chama repositories/queries e delega invariantes para entidades/VOs.
- Injetar dependências via construtor (interfaces, não implementações concretas).
- Tratar falhas cedo (early return) com `Result.failure(...)` ou `.getOrElse { return ... }`.
- Evitar lógica de persistência/infra dentro do use case.

## Workflow

1. Definir `IN/OUT` e o contrato do use case.
2. Identificar dependências necessárias (repository, query, provider).
3. Implementar `execute` com validações de pré-condição e retornos de falha imediatos.
4. Orquestrar criação/atualização de entidades via `tryCreate`/`copy`.
5. Persistir/consultar dados somente por interfaces de provider.
6. Cobrir testes com cenário feliz, validações de entrada e falhas de dependências.

## References

Consultar `references/use-case-pattern-kt.md` para paths, checklist, exemplos e armadilhas.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.

---
