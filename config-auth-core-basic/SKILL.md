---
name: config-auth-core-basic
description: Criar/recriar o módulo de autenticação básico de forma determinística no padrão Genérico, refletindo o estado atual do pacote `auth` com foco em `user`, `password` e `application`, incluindo código e testes unitários. A skill detecta automaticamente se o monorepo usa pacotes diretos (`packages/*`) ou aninhados (`packages/*/*`) e cria no caminho correto (`packages/auth` ou `packages/auth/core`). Usar quando o pedido envolver bootstrap/rebootstrap do auth core mínimo, sem perfil e sem permissões, com `Password` validando `HashPassword`, fluxo de criação de usuário transacional via `TransactionManager` e política de troca de senha centralizada em serviço de domínio.
---

# Config Auth Core Basic

## Overview

Criar ou recriar o pacote no caminho padrão detectado automaticamente com template versionado na própria skill.
O alvo padrão será:

- `packages/auth` quando o monorepo estiver configurado com pacotes diretos (`packages/*`)
- `packages/auth/core` quando o monorepo estiver configurado com pacotes aninhados (`packages/*/*`)

A detecção considera primeiro `workspaces` do `package.json` raiz e, em caso de ambiguidade, a estrutura existente no disco.
Executar o script Node da skill para gerar estrutura mínima de autenticação com foco em usuário, senha e casos de uso de aplicação.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).

A implementação gerada é determinística e inclui:

- `user` (entidade com `avatarUrl` opcional e `admin` com default `false`, providers e use cases básicos)
- `password` (entidade, providers e use case de troca de senha com política de reuso/força)
- `application` (query `user-exists` e use case `create-user` com `avatarUrl` opcional)
- suíte de testes unitários dos fluxos principais
- criação de usuário com transação explícita (`TransactionManager.runInTransaction`) para persistir `User` + `Password`

Correção obrigatória do modelo:

- `Password` valida hash criptografado via `HashPassword` (somente hash).
- Não usar `StrongPassword` dentro de `Password`; validação de força ocorre em `PasswordChangePolicyService`.
- `ChangePasswordUseCase` depende de `UserExistsQuery`, `PasswordRepository.findRecentByUserId` e `PasswordCryptoProvider`.

## Workflow

1. Executar `node scripts/create-auth-core-basic.mjs`.
2. Namespace é resolvido por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback do template.
3. Validar contrato mínimo do template antes de copiar arquivos para o destino.
4. Se o diretório já existir, usar `--force` para sobrescrever (com proteção para nunca apagar raiz do repositório/sistema).
5. Após gerar no alvo detectado (`packages/auth` ou `packages/auth/core`), confirmar estrutura de `src/` e `test/` conforme contrato atual do módulo.
6. Opcionalmente executar testes do pacote com `--run-tests` (somente no alvo padrão do workspace; em `--target` customizado os testes são ignorados com log explícito).
7. Sincronizar dependência do novo pacote auth no backend e frontend (`apps/backend/package.json` e `apps/web/package.json`), adicionando `<scope>/auth` em `dependencies` quando necessário.
8. Executar `npm install` no root para atualizar lockfile e resolução das workspaces.
9. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar/recriar no alvo padrão detectado no namespace padrão:

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs
```

Definir namespace explícito:

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs --scope @namespace
```

Sobrescrever diretório existente:

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs --force
```

Criar e executar testes do pacote auth core:

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs --force --run-tests
```

Criar sem sincronizar apps e sem instalar dependências (modo avançado):

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs --force --skip-apps-sync --skip-install
```

Definir namespace por variável de ambiente:

```bash
PROJECT_NAMESPACE=@namespace node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs --force
```

## Resources

- `scripts/create-auth-core-basic.mjs`: gerador determinístico cross-platform.
- `assets/auth-core-basic-template`: template completo do auth core básico no estado atual (código + testes + configs).
- `references/auth-core-basic-template-contract.md`: contrato dos artefatos gerados.
- sincronização automática de dependências em backend/frontend + `npm install` no root (desativável com flags de skip).
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal

## Output Contract

A skill deve gerar exatamente a estrutura descrita em `references/auth-core-basic-template-contract.md`, mantendo o layout atual (`src/application` no lugar de `src/root`) e sem incluir `permission`, `role`, `audit`, `oauth` ou use cases de perfil.

## Risk Logging Guardrails

- Registrar fatos de execucao em `.log/skills.log` com marcador no inicio da linha.
- Marcadores minimos esperados: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Sempre registrar `[RISK]` quando houver sobrescrita, exclusao, rename/move, ou fallback forcado em arquivos/pastas.
- Toda falha inesperada deve gerar `[FAIL]` com descricao factual curta do evento.
- Operacoes de terminal e alteracoes de arquivos devem passar pelos utilitarios compartilhados em `../utils` para manter rastreabilidade consistente.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
