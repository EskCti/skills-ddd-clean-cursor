---
name: use-case
description: Criar, revisar ou orientar a implementação de casos de uso (application services) no padrão Pharmacore. Usar quando o pedido envolver "caso de uso", "use case", arquivos `*.usecase.ts`, orquestração de entidades/repositórios/queries, regras de negócio de aplicação, mapeamento de falhas com `Result`, ou criação/ajuste de testes de use case.
---

# Use Case

## Overview

Aplicar o padrão de casos de uso do projeto com foco em orquestração de dependências, validações de fluxo, retorno consistente com `Result` e testes que cubram caminhos de sucesso e falha.

## Guidelines

- Ler `references/use-case-pattern.md` antes de criar ou alterar use cases.
- Implementar o contrato `UseCase<IN, OUT>` com `execute(data: IN): Promise<Result<OUT>>`.
- Manter o use case como orquestrador: valida fluxo, chama providers/repos/queries e delega invariantes para entidades/VOs.
- Injetar dependências via construtor com interfaces de provider/repository/query.
- Tratar falhas cedo (`early return`) com `Result.fail(...)` ou `result.withFail`.
- Evitar lógica de persistência/infra dentro do use case.
- Para atualização de estado, reaplicar validações de domínio com `tryCreate` ou `cloneWith`.

## Workflow

1. Definir `IN/OUT` e o contrato do use case.
2. Identificar dependências necessárias (repo, query, checker, provider).
3. Implementar `execute` com validações de pré-condição e retornos de falha imediatos.
4. Orquestrar criação/atualização de entidades via `tryCreate`/`cloneWith` quando necessário.
5. Persistir/consultar dados somente por interfaces de provider.
6. Cobrir testes com cenário feliz, validações de entrada e falhas de dependências.

## References

Consultar `references/use-case-pattern.md` para paths, checklist, exemplos e armadilhas frequentes do projeto.
