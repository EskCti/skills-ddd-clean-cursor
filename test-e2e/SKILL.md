---
name: test-e2e
stack: typescript
description: Criar testes end-to-end de API (Supertest + NestJS) e web (Playwright) para fluxos críticos do MVP. Usar quando o pedido envolver test:e2e, *.e2e-spec.ts, Supertest, Playwright ou validação de fluxo completo HTTP/UI.
---

# E2E Tests (TypeScript)

## Overview

Testes end-to-end para **fluxos críticos**: API com Supertest + `@nestjs/testing`, UI com Playwright quando houver frontend.

## Guidelines

- Ler `references/e2e-test-pattern.md`.
- E2E testa o **fluxo completo** (HTTP real ou browser real) — não mockar use case/repository.
- Um spec por BC: `apps/backend/test/<module>.e2e-spec.ts` (+ `e2e/<module>.spec.ts` se houver UI).
- Banco: Postgres via docker-compose ou service do CI; nunca produção.
- Web E2E só quando a story inclui UI (Angular/Vue/Next).

## Workflow

1. Identificar fluxo crítico da story (critérios de aceitação Given/When/Then).
2. Gerar spec base com o script (idempotente — não sobrescreve sem `--force`):

```bash
# BC com CRUD (POST → GET + 404)
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud \
  --create-fields name,email,cpf \
  --assert-field email \
  --web \
  --module-label Clientes

# Módulo scaffold (só GET /module)
node test-e2e/scripts/create-e2e-spec.mjs billing --template module-get

# Feature web-only (Playwright, sem spec de API)
node test-e2e/scripts/create-e2e-spec.mjs customers --template feature --module-label Clientes
```

3. Ajustar payload/assertions se o contrato da API divergir do template.
4. Bootstrap (`config-project`) já fornece `jest-e2e.json`, `app.e2e-spec.ts`, `playwright.config.ts` e scripts `test:e2e` / `test:e2e:web`.
5. `config-new-module` gera automaticamente `module-get` + spec web ao criar módulo.
6. Executar `npm run test:e2e` (API) e `npm run test:e2e:web` (UI).
7. Validar no CI (`config-cicd` — step `test:e2e`).

## Integração com backlog

| Task prefix | Este skill cobre |
|-------------|------------------|
| `test:e2e` | Specs API e/ou Playwright |

## References

- `references/e2e-test-pattern.md`
- `scripts/create-e2e-spec.mjs` — gerador de specs por BC
- `assets/templates/` — templates `module-get`, `crud`, `feature`
- `../config-cicd/references/cicd-pattern.md`
- `../skills-standards.md`

## Global Standards

- Consultar `../skills-standards.md`.
