---
name: module-create
description: Criar um novo módulo/pacote dentro de `packages/*` no padrão do projeto Poupig, gerando automaticamente a estrutura base (`package.json`, `tsconfig.json`, `jest.config.ts`, `src/index.ts`, `test/index.test.ts`). Usar quando o pedido envolver "criar módulo", "novo package", "bootstrap de módulo", scaffolding de pacote TypeScript no monorepo ou inicialização de módulo vazio com dependência de `shared`.
---

# Module Create

## Overview

Padronizar a criação de novos módulos ao lado do `sharedModulePath` (ex.: `packages/` por padrão), usando o mesmo formato do módulo de referência (`classification`) e dependência no pacote compartilhado.
Executar o script Node da skill para receber o nome do módulo e gerar os arquivos mínimos de código e teste, sem depender de shell específico de SO.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/config`, `.cloud/skills/config` ou `config/`).

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module.mjs <module-name>`.
3. Namespace é resolvido por precedência: `--scope` > `POUPIG_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback automático.
4. Conferir a estrutura criada em `<dirname(sharedModulePath)>/<module-name>`.
5. Confirmar que o módulo contém função `sum` e teste `index.test.ts`.
6. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar módulo no namespace padrão do projeto:

```bash
node .agents/skills/module-create/scripts/create-module.mjs <module-name>
```

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

Definir namespace por variável de ambiente:

```bash
POUPIG_NAMESPACE=@poupig node .agents/skills/module-create/scripts/create-module.mjs <module-name>
```

Criar módulo com namespace explícito:

```bash
node .agents/skills/module-create/scripts/create-module.mjs <module-name> --scope @poupig
```

Sobrescrever diretório existente:

```bash
node .agents/skills/module-create/scripts/create-module.mjs <module-name> --force
```

## Output Contract

O script deve gerar exatamente:

- `<dirname(sharedModulePath)>/<module-name>/package.json`
- `<dirname(sharedModulePath)>/<module-name>/tsconfig.json`
- `<dirname(sharedModulePath)>/<module-name>/jest.config.ts`
- `<dirname(sharedModulePath)>/<module-name>/src/index.ts`
- `<dirname(sharedModulePath)>/<module-name>/test/index.test.ts`

Consultar `references/module-template.md` para o contrato completo dos arquivos gerados.

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/config`, `.cloud/skills/config` ou `config/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).
