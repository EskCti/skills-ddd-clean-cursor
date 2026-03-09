---
name: config-module-shared
description: Inicializar o módulo `packages/shared` completo de forma determinística no padrão do projeto Poupig, incluindo estrutura de código (`src/base`, `src/db`, `src/dto`, `src/vo`, `src/index.ts`) e testes (`test/base`, `test/vo`, `test/data`). Usar quando o pedido envolver bootstrap do pacote shared, recriação do shared em novo projeto, reset da base compartilhada ou scaffolding completo do core compartilhado com configs (`package.json`, `tsconfig.json`, `jest.config.ts`).
---

# Config Module Shared

## Overview

Criar ou recriar o pacote no caminho de `sharedModulePath` (padrão: `packages/shared`) com template versionado dentro da própria skill, sem depender do sistema operacional.
Executar o script Node da skill para gerar toda a estrutura de código e testes do módulo shared.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).

## Workflow

1. Executar `node scripts/create-shared.mjs`.
2. Namespace é resolvido por precedência: `--scope` > `POUPIG_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback do template.
3. Se o diretório já existir, usar `--force` para sobrescrever.
4. Antes do `npm install`, adicionar `"@<namespace>/shared": "*"` em `dependencies` apenas dos `package.json` de frontend e backend (conforme `frontendAppPath` e `backendAppPath` no config).
5. Após gerar em `<sharedModulePath>`, executar `npm install` na raiz do projeto para atualizar as dependências do workspace.
6. Opcionalmente executar testes do pacote com `--run-tests`.
7. Conferir estrutura final em `<sharedModulePath>`.
8. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar/recriar `<sharedModulePath>` no namespace padrão do template:

```bash
node .agents/skills/config-module-shared/scripts/create-shared.mjs
```

> Esse comando executa `npm install` na raiz automaticamente após criar o módulo shared.

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

Definir namespace explícito:

```bash
node .agents/skills/config-module-shared/scripts/create-shared.mjs --scope @poupig
```

Sobrescrever o diretório existente de `<sharedModulePath>`:

```bash
node .agents/skills/config-module-shared/scripts/create-shared.mjs --force
```

Criar e executar os testes do pacote shared:

```bash
node .agents/skills/config-module-shared/scripts/create-shared.mjs --force --run-tests
```

Definir namespace por variável de ambiente:

```bash
POUPIG_NAMESPACE=@poupig node .agents/skills/config-module-shared/scripts/create-shared.mjs --force
```

## Resources

- `scripts/create-shared.mjs`: gerador determinístico cross-platform.
- `assets/shared-template`: template completo do módulo shared (código + testes + configs).
- `references/shared-template-contract.md`: contrato dos artefatos gerados.
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal
