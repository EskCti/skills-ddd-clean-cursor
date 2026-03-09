---
name: project-init
description: Inicializar um projeto já baseado em TurboRepo para o padrão com frontend (Next.js) e backend (NestJS sem git interno), com nomes/pastas/portas parametrizados via `skills.config.json` e override por CLI. Usar quando o pedido envolver bootstrap de monorepo web+backend, recriação das apps padrão do Turbo, setup inicial do stack Next+Nest, ou padronização das tasks de `test/build` no Turbo.
---

# Project Init

## Overview

Executar um script determinístico que recria a camada de apps do monorepo e aplica as alterações necessárias de configuração global.
O fluxo usa comandos oficiais de scaffold (`create-next-app` e `nest new --skip-git`) e finaliza com ajustes de `.env`, `main.ts`, `package.json` e `turbo.json`.
As configurações padrão são lidas de `skills.config.json` (em `.agents/skills/config`, `.cloud/skills/config` ou `config/` no repositório de skills).

## Workflow

1. Ler defaults de `frontendAppPath`, `backendAppPath`, `frontendPort`, `backendPort` e env vars no `skills.config.json`.
2. Limpar os diretórios de destino configurados para frontend e backend.
3. Criar app frontend com `create-next-app` no parent de `frontendAppPath`.
4. Criar app backend com `nest new --skip-git` no parent de `backendAppPath` (sem repositório git interno).
5. Instalar `ts-node` no root e `dotenv` no backend.
6. Atualizar `package.json` root com script `test`.
7. Atualizar `turbo.json` com `tasks.test.cache=false` e `build.outputs` contendo `dist/**`.
8. Criar `.env` e `.env.example` do frontend/backend com portas configuradas.
9. Configurar `main.ts` do backend para `backendPortEnvVar` via `.env` e `app.enableCors()`.

## Commands

Fluxo padrão:

```bash
node .agents/skills/project-init/scripts/project-init.mjs
```

> Se o repositório estiver instalado em `.cloud/skills`, ajuste o caminho dos comandos.

Pular instalação global do Nest CLI (forçar `npx`):

```bash
node .agents/skills/project-init/scripts/project-init.mjs --skip-global-nest
```

Customizar paths e portas:

```bash
node .agents/skills/project-init/scripts/project-init.mjs \
  --frontend-path apps/frontend \
  --backend-path apps/api \
  --frontend-port 3000 \
  --backend-port 4000
```

Customizar nomes das env vars de porta/url:

```bash
node .agents/skills/project-init/scripts/project-init.mjs \
  --frontend-api-env-var NEXT_PUBLIC_API_URL \
  --backend-port-env-var PORT
```

## Resources

- `scripts/project-init.mjs`: script principal de bootstrap.
- `references/bootstrap-contract.md`: contrato dos arquivos e alterações que o bootstrap aplica.
