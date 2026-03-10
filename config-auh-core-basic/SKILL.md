---
name: config-auh-core-basic
description: Criar/recriar o módulo `packages/auth/core` básico de forma determinística no padrão Pharmacore, com foco em `user`, `password` e `root` (casos de uso comuns), incluindo código e testes unitários. Usar quando o pedido envolver bootstrap/rebootstrap do auth core mínimo, sem perfil e sem permissões, com `Password` validando `HashPassword`.
---

# Config Auh Core Basic

## Overview

Criar ou recriar o pacote no caminho padrão `packages/auth/core` com template versionado na própria skill.
Executar o script Node da skill para gerar estrutura mínima de autenticação com foco em usuário, senha e casos de uso de root.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).

A implementação gerada é determinística e inclui:
- `user` (entidade, providers e use cases básicos)
- `password` (entidade, providers e use case de troca de senha)
- `root` (caso de uso `create-user`)
- suíte de testes unitários dos fluxos principais

Correção obrigatória do modelo:
- `Password` valida hash criptografado via `HashPassword`.
- Não usar `StrongPassword` dentro de `Password`.

## Workflow

1. Executar `node scripts/create-auth-core-basic.mjs`.
2. Namespace é resolvido por precedência: `--scope` > `POUPIG_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback do template.
3. Se o diretório já existir, usar `--force` para sobrescrever.
4. Após gerar em `packages/auth/core`, confirmar estrutura de `src/` e `test/` do módulo básico.
5. Opcionalmente executar testes do pacote com `--run-tests`.
6. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar/recriar `packages/auth/core` no namespace padrão:

```bash
node .agents/skills/config-auh-core-basic/scripts/create-auth-core-basic.mjs
```

Definir namespace explícito:

```bash
node .agents/skills/config-auh-core-basic/scripts/create-auth-core-basic.mjs --scope @poupig
```

Sobrescrever diretório existente:

```bash
node .agents/skills/config-auh-core-basic/scripts/create-auth-core-basic.mjs --force
```

Criar e executar testes do pacote auth core:

```bash
node .agents/skills/config-auh-core-basic/scripts/create-auth-core-basic.mjs --force --run-tests
```

Definir namespace por variável de ambiente:

```bash
POUPIG_NAMESPACE=@poupig node .agents/skills/config-auh-core-basic/scripts/create-auth-core-basic.mjs --force
```

## Resources

- `scripts/create-auth-core-basic.mjs`: gerador determinístico cross-platform.
- `assets/auth-core-basic-template`: template completo do auth core básico (código + testes + configs).
- `references/auth-core-basic-template-contract.md`: contrato dos artefatos gerados.
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal

## Output Contract

A skill deve gerar exatamente a estrutura descrita em `references/auth-core-basic-template-contract.md`, sem incluir `permission`, `role`, `audit`, `oauth` ou use cases de perfil.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
