---
name: config-shared-core
stack: typescript
description: Inicializar o módulo `packages/shared` completo de forma determinística no padrão do projeto Workspace, incluindo estrutura de código (`src/base`, `src/db`, `src/dto`, `src/vo`, `src/index.ts`) e testes (`test/base`, `test/vo`, `test/data`) com VOs `HashPassword`, `DotSeparatedName` e `Name`, além de `ResultValidator` em `src/base` e `TransactionManager` em `src/db`. Usar quando o pedido envolver bootstrap do pacote shared, recriação do shared em novo projeto, reset da base compartilhada ou scaffolding completo do core compartilhado com configs (`package.json`, `tsconfig.json`, `jest.config.ts`).
---

# Config Shared Core

## Overview

Criar ou recriar o pacote no caminho de `sharedModulePath` (padrão: `packages/shared`) com template versionado dentro da própria skill, sem depender do sistema operacional.
Executar o script Node da skill para gerar toda a estrutura de código e testes do módulo shared.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).
O template inclui obrigatoriamente os VOs `HashPassword` (`src/vo/hash-password.vo.ts`), `DotSeparatedName` (`src/vo/dot-separated-name.vo.ts`) e `Name` (`src/vo/name.vo.ts`), com testes correspondentes em `test/vo/` e exports em `src/vo/index.ts`.
`HashPassword` valida hash bcrypt no formato `$2a$|$2b$|$2y$` com rounds de dois dígitos e payload base64 bcrypt.
Também inclui obrigatoriamente `ResultValidator` (`src/base/result-validator.ts`, `test/base/result-validator.test.ts`) e `TransactionManager` (`src/db/transaction.manager.ts`, exportado em `src/db/index.ts`).

## Workflow

1. Executar `node scripts/create-shared.mjs`.
2. Namespace é resolvido por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback do template.
3. Validar contrato mínimo do template (arquivos críticos de config, código e testes) antes de copiar para o destino.
4. Se o diretório já existir, usar `--force` para sobrescrever (com proteção para nunca apagar raiz do repositório/sistema).
5. Antes do `npm install`, adicionar/atualizar `"@<namespace>/shared": "*"` em `dependencies` apenas dos `package.json` de frontend e backend (conforme `frontendAppPath` e `backendAppPath` no config), sem remover dependências de outros pacotes.
6. Após gerar em `<sharedModulePath>`, executar `npm install` na raiz do projeto para atualizar as dependências do workspace.
7. Opcionalmente executar testes do pacote com `--run-tests`:
   - alvo padrão (`<sharedModulePath>`): `npm run test -w <scope>/shared`
   - alvo customizado com `--target`: executa `npm install` + `npm run test` no diretório alvo somente quando `../typescript-config/base.json` estiver disponível relativo ao target; caso contrário, registra skip com motivo explícito
8. Conferir estrutura final em `<sharedModulePath>`.
9. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar/recriar `<sharedModulePath>` no namespace padrão do template:

```bash
node .agents/skills/config-shared-core/scripts/create-shared.mjs
```

> Esse comando executa `npm install` na raiz automaticamente após criar o módulo shared.

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

Definir namespace explícito:

```bash
node .agents/skills/config-shared-core/scripts/create-shared.mjs --scope @namespace
```

Sobrescrever o diretório existente de `<sharedModulePath>`:

```bash
node .agents/skills/config-shared-core/scripts/create-shared.mjs --force
```

Criar e executar os testes do pacote shared:

```bash
node .agents/skills/config-shared-core/scripts/create-shared.mjs --force --run-tests
```

Definir namespace por variável de ambiente:

```bash
PROJECT_NAMESPACE=@namespace node .agents/skills/config-shared-core/scripts/create-shared.mjs --force
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

## Risk Logging Guardrails

- Registrar fatos de execucao em `.log/skills.log` com marcador no inicio da linha.
- Marcadores minimos esperados: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Sempre registrar `[RISK]` quando houver sobrescrita, exclusao, rename/move, ou fallback forcado em arquivos/pastas.
- Toda falha inesperada deve gerar `[FAIL]` com descricao factual curta do evento.
- Operacoes de terminal e alteracoes de arquivos devem passar pelos utilitarios compartilhados em `../utils` para manter rastreabilidade consistente.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
