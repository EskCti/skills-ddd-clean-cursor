---
name: config-project
description: Inicializar ou continuar um projeto no padrão TurboRepo com frontend (Next.js) e backend (NestJS sem git interno), criando/reconciliando a estrutura base via `npx create-turbo@latest` no diretório atual quando necessário e aplicando setup idempotente por `skills.config.json` (com override via CLI). Usar quando o pedido envolver bootstrap de monorepo web+backend, setup inicial Next+Nest, reaplicação segura do setup sem sobrescrever, ou padronização das tasks de `test/build` no Turbo.
---

# Config Project

## Overview

Executar um script determinístico e idempotente para bootstrap web+backend no padrão do monorepo.
O fluxo usa `npx create-turbo@latest` para gerar a base padrão do TurboRepo (incluindo configs compartilhadas e `.gitignore`) e reconcilia apenas o que estiver faltando na pasta atual.
Se `.git` já existir no diretório atual, o scaffold é executado com `--no-git` para evitar recriação de repositório git.
Depois cria frontend/backend apenas quando necessário, aplica namespace do `skills.config.json` nos pacotes e atualiza somente os arquivos pendentes.
As configurações padrão são lidas de `skills.config.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/` no repositório de skills).

## Workflow

1. Ler defaults de `namespace`, `frontendAppPath`, `backendAppPath`, `frontendPort`, `backendPort` e env vars no `skills.config.json`.
2. Detectar gaps da estrutura Turbo na pasta atual; quando necessário, executar `npx create-turbo@latest` e reconciliar somente os arquivos/pastas ausentes (`packages/eslint-config`, `packages/typescript-config`, `.gitignore`, `.npmrc`, configs base).
3. Antes de criar apps customizados, remover os projetos padrão do Turbo (`apps/docs`, `apps/web` e `packages/ui`) quando detectados como template original.
4. Criar app frontend com `create-next-app --src-dir` somente se `frontendAppPath` ainda não existir como app Next.js, garantindo estrutura `src/` no frontend.
5. Criar app backend com `nest new --skip-git` somente se `backendAppPath` ainda não existir como app NestJS.
6. Garantir namespace em todos os projetos do workspace (`apps/*` e `packages/*`), incluindo frontend/backend, usando `namespace` do config (ou `--scope`).
7. Instalar apenas dependências faltantes (`turbo` e `ts-node` no root, `dotenv` no backend).
8. Atualizar `package.json` root e `turbo.json` de forma incremental.
9. Atualizar `.env` e `.env.example` de frontend/backend via upsert (sem apagar chaves extras existentes).
10. Ajustar `main.ts` do backend de forma incremental (`dotenv/config`, `app.enableCors()`, porta via `backendPortEnvVar`).
11. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Fluxo padrão:

```bash
node .agents/skills/config-project/scripts/project-init.mjs
```

> Se o repositório estiver instalado em `.cloud/skills`, ajuste o caminho dos comandos.

Pular instalação global do Nest CLI (forçar `npx`):

```bash
node .agents/skills/config-project/scripts/project-init.mjs --skip-global-nest
```

Customizar paths e portas:

```bash
node .agents/skills/config-project/scripts/project-init.mjs \
  --frontend-path apps/frontend \
  --backend-path apps/api \
  --frontend-port 3000 \
  --backend-port 4000
```

Customizar nomes das env vars de porta/url:

```bash
node .agents/skills/config-project/scripts/project-init.mjs \
  --frontend-api-env-var NEXT_PUBLIC_API_URL \
  --backend-port-env-var PORT
```

Sobrescrever namespace por CLI:

```bash
node .agents/skills/config-project/scripts/project-init.mjs --scope @namespace
```

## Resources

- `scripts/project-init.mjs`: script principal de bootstrap.
- `references/bootstrap-contract.md`: contrato dos arquivos e alterações que o bootstrap aplica.
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
