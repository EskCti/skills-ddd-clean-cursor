---
name: config-auth-core-basic-kt
stack: kotlin
description: Criar/recriar o módulo de autenticação básico Kotlin de forma determinística, refletindo o domínio auth com foco em `user`, `password` e `application`, incluindo código e testes unitários. A skill detecta automaticamente se o projeto usa pacotes diretos (`packages/*`) ou aninhados (`packages/*/*`) e cria no caminho correto. Usar quando o pedido envolver bootstrap/rebootstrap do auth core mínimo Kotlin, sem perfil e sem permissões, com `Password` validando hash bcrypt, fluxo de criação de usuário com `TransactionManager` e política de troca de senha em serviço de domínio.
---

# Config Auth Core Basic (Kotlin)

## Overview

Criar ou recriar o pacote auth core básico em Kotlin no caminho padrão detectado automaticamente com template versionado na própria skill.

O alvo padrão será:

- `packages/auth` quando o projeto usar pacotes diretos (`packages/*`)
- `packages/auth/core` quando o projeto usar pacotes aninhados (`packages/*/*`)

A implementação gerada é determinística e inclui:

- `user` (data class com `admin: Boolean = false`, `avatarUrl: String?` opcional)
- `password` (data class validando hash bcrypt via `HashPassword`, serviço de política de troca)
- `application` (query `UserExistsQuery`, use case `CreateUserUseCase` com transação explícita via `TransactionManager`)
- suíte de testes unitários com JUnit 5

Correção obrigatória do modelo:

- `Password` valida hash criptografado via `HashPassword` (somente hash).
- Validação de força de senha ocorre em `PasswordChangePolicyService`.
- `ChangePasswordUseCase` depende de `UserExistsQuery`, `PasswordRepository.findRecentByUserId` e `PasswordCryptoProvider`.

## Workflow

1. Executar `node scripts/create-auth-core-basic-kt.mjs`.
2. Grupo é resolvido por precedência: `--group` > `PROJECT_GROUP` > config file > `com.example`.
3. Se o diretório já existir, usar `--force` para sobrescrever.
4. Opcionalmente executar testes do pacote com `--run-tests`.
5. Atualizar `settings.gradle.kts` e `apps/backend/build.gradle.kts` com dependência do pacote auth.

## Commands

Criar/recriar no alvo padrão:

```bash
node .agents/skills/config-auth-core-basic-kt/scripts/create-auth-core-basic-kt.mjs
```

Definir grupo explícito:

```bash
node .agents/skills/config-auth-core-basic-kt/scripts/create-auth-core-basic-kt.mjs --group com.acme
```

Sobrescrever e executar testes:

```bash
node .agents/skills/config-auth-core-basic-kt/scripts/create-auth-core-basic-kt.mjs --force --run-tests
```

## Resources

- `scripts/create-auth-core-basic-kt.mjs`: gerador determinístico cross-platform.
- `assets/auth-core-basic-template-kt`: template completo do auth core básico Kotlin.
- `references/auth-core-basic-contract-kt.md`: contrato dos artefatos gerados.

## Output Contract

A skill deve gerar exatamente a estrutura descrita em `references/auth-core-basic-contract-kt.md`, sem incluir `permission`, `role`, `audit` ou `oauth`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções Kotlin.
