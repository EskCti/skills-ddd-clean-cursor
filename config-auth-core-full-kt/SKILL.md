---
name: config-auth-core-full-kt
stack: kotlin
description: Criar/recriar o módulo de autenticação core completo Kotlin de forma determinística, incluindo `user`, `password`, `application`, `role`, `permission` e `oauth`, com código e testes unitários, sem auditoria. Usar quando o pedido envolver bootstrap/rebootstrap do auth core full Kotlin (email/senha + OAuth no core), mantendo detecção automática de destino e sincronização de dependência nos apps.
---

# Config Auth Core Full (Kotlin)

## Overview

Criar ou recriar o pacote auth core completo em Kotlin no caminho padrão detectado automaticamente com template versionado na própria skill.

O alvo padrão será:

- `packages/auth` quando o projeto usar pacotes diretos (`packages/*`)
- `packages/auth/core` quando o projeto usar pacotes aninhados (`packages/*/*`)

A implementação gerada é determinística e inclui os domínios:

- `user` — entidade, DTOs, queries, use cases (CRUD + login)
- `password` — entidade, repository, crypto provider, política de troca, use case
- `application` — query UserExistsQuery, use case CreateUserUseCase com TransactionManager
- `role` — entidade Role, repository, use cases de assign/revoke
- `permission` — entidade Permission, repository, use cases de grant/revoke, guard de verificação
- `oauth` — entidade OAuthAccount, repository, use case de link/unlink, provider OAuthTokenProvider

Exclusão obrigatória do escopo: `audit` (não gerar nem referenciar).

## Workflow

1. Executar `node scripts/create-auth-core-full-kt.mjs`.
2. Resolver grupo por precedência: `--group` > `PROJECT_GROUP` > config file > `com.example`.
3. Se o diretório já existir, usar `--force` para sobrescrever.
4. Opcionalmente executar testes com `--run-tests`.
5. Atualizar `settings.gradle.kts` e `apps/backend/build.gradle.kts`.

## Commands

```bash
node .agents/skills/config-auth-core-full-kt/scripts/create-auth-core-full-kt.mjs
```

```bash
node .agents/skills/config-auth-core-full-kt/scripts/create-auth-core-full-kt.mjs --group com.acme --force
```

```bash
node .agents/skills/config-auth-core-full-kt/scripts/create-auth-core-full-kt.mjs --force --run-tests
```

## Resources

- `scripts/create-auth-core-full-kt.mjs`: gerador determinístico cross-platform.
- `assets/auth-core-full-template-kt`: template completo do auth core full Kotlin.
- `references/auth-core-full-contract-kt.md`: contrato dos artefatos gerados.

## Output Contract

A skill deve gerar exatamente a estrutura descrita em `references/auth-core-full-contract-kt.md`, mantendo os domínios full de auth e sem incluir `audit`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções Kotlin.
