---
name: config-auth-web-basic
description: Criar/recriar de forma deterministica o modulo de autenticacao web no Next.js (sign-in/sign-up/dashboard/users/profile), com contexto de auth, schemas/formularios, rotas App Router e componentes de controle de acesso (private/public/admin), refletindo o estado atual do `apps/web`. Usar quando o pedido envolver bootstrap/rebootstrap da camada web de autenticacao.
---

# Config Auth Web Basic

## Overview

Executar setup idempotente da autenticacao web no `apps/web`, cobrindo:

- modulo `src/modules/auth` completo:
  - `components` (private/public/admin route, navegacao, avatar, cards/forms, indicador admin)
  - `data` (contexto de auth, hooks, services HTTP, schemas de auth/user, menu)
  - `pages` (`sign-in`, `sign-up`, `auth-dashboard`, `users`, `profile`)
- integracao no App Router:
  - rotas publicas em `src/app/(public)/auth/*`
  - rotas privadas/admin em `src/app/(private)/auth/*`
  - layout privado com menu condicional do modulo auth
- integracao de provider global:
  - `src/app/providers.tsx`
  - `src/app/layout.tsx` envolvendo `AppProviders`
- dependencia de workspace do core auth em `apps/web/package.json`

A skill aplica arquivos canonicos por template versionado e faz replace automatico de:

- `__AUTH_PACKAGE_NAME__` -> `<scope>/auth`
- `__SHARED_PACKAGE_NAME__` -> `<scope>/shared`
- `__PROJECT_SCOPE_SLUG__` -> slug do scope para chaves locais (ex.: `poupig`)

## Workflow

1. Rodar simulacao:
   - `node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --dry-run`
2. Aplicar mudancas:
   - `node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply`
3. Opcionalmente instalar dependencias e validar build:
   - `node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply --install --run-build`

## Commands

Aplicar modulo auth web basico:

```bash
node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply
```

Aplicar e instalar dependencias:

```bash
node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply --install
```

Aplicar, instalar e validar build:

```bash
node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply --install --run-build
```

Forcar namespace fallback quando nao for possivel detectar o pacote auth automaticamente:

```bash
node .agents/skills/config-auth-web-basic/scripts/init-config-auth-web-basic.mjs --apply --scope @namespace
```

## Resources

- `scripts/init-config-auth-web-basic.mjs`: orquestrador idempotente da skill.
- `assets/config-auth-web-basic-template`: template canonico dos arquivos do auth web.
- `references/config-auth-web-basic-contract.md`: contrato de saida esperado.
- Log local: `.log/skills.log`.

## Output Contract

A skill deve convergir o frontend para o contrato descrito em `references/config-auth-web-basic-contract.md`, mantendo compatibilidade com `@namespace/auth`, `@namespace/shared` e com execucao repetivel sem duplicacao estrutural.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
