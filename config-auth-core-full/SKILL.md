---
name: config-auth-core-full
description: Criar/recriar o módulo de autenticação core completo de forma determinística no padrão Genérico, refletindo o estado atual do pacote `auth` com `user`, `password`, `application`, `role`, `permission` e `oauth`, incluindo código e testes unitários, sem auditoria. Usar quando o pedido envolver bootstrap/rebootstrap do auth core full (email/senha + OAuth no core), mantendo detecção automática de destino (`packages/auth` ou `packages/auth/core`) e sincronização opcional de dependência nos apps.
---

# Config Auth Core Full

## Overview

Criar ou recriar o pacote auth core completo no caminho padrão detectado automaticamente com template versionado na própria skill.

O alvo padrão será:

- `packages/auth` quando o monorepo estiver configurado com pacotes diretos (`packages/*`)
- `packages/auth/core` quando o monorepo estiver configurado com pacotes aninhados (`packages/*/*`)

A implementação gerada é determinística e inclui os domínios:

- `user`
- `password`
- `application`
- `role`
- `permission`
- `oauth`

Exclusão obrigatória do escopo:

- `audit` (não gerar nem referenciar)

## Workflow

1. Executar `node scripts/create-auth-core-full.mjs`.
2. Resolver namespace por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback do template.
3. Validar contrato mínimo do template antes de copiar para o destino.
4. Se o diretório já existir, usar `--force` para sobrescrever com segurança.
5. Opcionalmente executar testes do pacote com `--run-tests`.
6. Opcionalmente sincronizar dependência `<scope>/auth` em backend/frontend e executar `npm install` no root.
7. Registrar execução em `.log/skills.log`.

## Commands

```bash
node .agents/skills/config-auth-core-full/scripts/create-auth-core-full.mjs
```

```bash
node .agents/skills/config-auth-core-full/scripts/create-auth-core-full.mjs --scope @namespace --force
```

```bash
node .agents/skills/config-auth-core-full/scripts/create-auth-core-full.mjs --force --run-tests
```

```bash
node .agents/skills/config-auth-core-full/scripts/create-auth-core-full.mjs --force --skip-apps-sync --skip-install
```

## Resources

- `scripts/create-auth-core-full.mjs`: gerador determinístico cross-platform.
- `assets/auth-core-full-template`: template completo do auth core full sem auditoria.
- `references/auth-core-full-template-contract.md`: contrato dos artefatos gerados.

## Output Contract

A skill deve gerar exatamente a estrutura descrita em `references/auth-core-full-template-contract.md`, mantendo os domínios full de auth e sem incluir `audit`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
