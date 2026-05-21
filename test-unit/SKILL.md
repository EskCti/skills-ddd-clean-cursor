---
name: test-unit
stack: typescript
description: Criar ou revisar testes unitários de camadas domain e application (entity, VO, use case, query) com meta de cobertura ≥95%. Usar quando o pedido envolver test:unit, test:coverage, arquivos *.test.ts, Jest, cobertura de código ou validação de invariantes de domínio.
---

# Unit Tests (TypeScript)

## Overview

Guia a criação de testes unitários para **domain + application** com Jest, garantindo **≥95% de cobertura de lines** no escopo do módulo/BC.

## Guidelines

- Ler `references/unit-test-pattern.md` antes de escrever testes.
- Testar **comportamento e invariantes**, não detalhes de implementação.
- Mockar ports (`IRepository`, serviços externos) — nunca DB/HTTP em unit test.
- Seguir paths existentes: `packages/<module>/core/test/**` ou `test/**` colocado ao lado do módulo.
- Após criar testes, executar `npm test` e confirmar threshold do `jest.config.ts`.
- Se coverage < 95%, adicionar casos para branches não cobertos antes de concluir.

## Workflow

1. Identificar artefatos a testar (VOs, Entity, UseCase, Query) a partir do BC ou task do backlog.
2. Localizar ou criar pasta `test/` espelhando a estrutura de `src/`.
3. Para cada VO: testes válido + inválido + normalização.
4. Para Entity: factory + métodos de domínio + igualdade por id.
5. Para UseCase/Query: fluxo feliz + erros de negócio (mock repository).
6. Executar `npm test -- --coverage` no package do módulo.
7. Se necessário, rodar `node scripts/check-coverage.mjs 95 domain application entity vo use-case use-cases queries`.
8. Ajustar `jest.config.ts` `collectCoverageFrom` se o escopo incluir arquivos irrelevantes.

## Integração com backlog

| Task prefix | Este skill cobre |
|-------------|------------------|
| `test:unit` | Escrita dos testes |
| `test:coverage` | Validação ≥95% + ajuste até passar |

## References

- `references/unit-test-pattern.md` — padrões, checklist, jest.config
- `../skills-standards.md` — Test Coverage Standard
- `../config-cicd/assets/check-coverage.mjs` — script de gate para CI

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
