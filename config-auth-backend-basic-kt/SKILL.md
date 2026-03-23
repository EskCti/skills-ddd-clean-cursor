---
name: config-auth-backend-basic-kt
stack: kotlin
description: Criar/recriar de forma determinística o módulo de autenticação do backend Spring Boot com endpoints HTTP (register/login/me/users/password), JWT com Spring Security, controle de acesso admin, adapters JPA compatíveis com o auth core Kotlin, integração com `TransactionManager`, modelo JPA de auth, migrations Flyway e seed SQL com usuários padrão. Usar quando o pedido envolver bootstrap/rebootstrap da camada backend auth completa no `apps/backend` Kotlin.
---

# Config Auth Backend Basic (Kotlin)

## Overview

Executar setup idempotente do módulo de autenticação backend Spring Boot/Kotlin, cobrindo:

- módulo Spring Boot em `apps/backend/src/main/kotlin/<base-package>/modules/auth/` com:
  - `AuthController.kt` (`@RestController` com endpoints register/login/me/users/change-password)
  - `AuthConfig.kt` (`@Configuration` do módulo)
  - `SecurityConfig.kt` (`@Configuration` Spring Security + JWT filter)
  - `JwtTokenProvider.kt` (geração e validação de JWT)
  - `JwtAuthenticationFilter.kt` (filter do Spring Security)
  - `RequireAdmin.kt` (annotation + aspect para controle admin)
  - `UserJpaEntity.kt` + `UserJpaRepository.kt` (adapter JPA para User)
  - `PasswordJpaEntity.kt` + `PasswordJpaRepository.kt` (adapter JPA para Password)
  - `BcryptPasswordCryptoAdapter.kt` (implementação de `PasswordCryptoProvider`)
- endpoints de autenticação com JWT Bearer e proteção admin
- integração com auth core Kotlin (use cases, entidades e providers)
- migrations Flyway (criação de tabelas users + passwords)
- seed SQL com usuários padrão

## Workflow

1. Garantir infraestrutura JPA pronta (ex.: skill `config-jpa-kt` já aplicada).
2. Executar:
   ```bash
   node .agents/skills/config-auth-backend-basic-kt/scripts/init-auth-backend-basic-kt.mjs --apply
   ```
3. Opcionalmente instalar dependências e validar build:
   ```bash
   node .agents/skills/config-auth-backend-basic-kt/scripts/init-auth-backend-basic-kt.mjs --apply --run-build
   ```
4. Rodar migration Flyway (automática no start do Spring Boot).

## Commands

Aplicar módulo auth backend:

```bash
node .agents/skills/config-auth-backend-basic-kt/scripts/init-auth-backend-basic-kt.mjs --apply
```

Aplicar e validar build:

```bash
node .agents/skills/config-auth-backend-basic-kt/scripts/init-auth-backend-basic-kt.mjs --apply --run-build
```

Forçar grupo:

```bash
node .agents/skills/config-auth-backend-basic-kt/scripts/init-auth-backend-basic-kt.mjs --apply --group com.acme
```

## Resources

- `scripts/init-auth-backend-basic-kt.mjs`: orquestrador idempotente.
- `assets/auth-backend-basic-template-kt`: template canônico dos arquivos gerados.
- `references/auth-backend-basic-contract-kt.md`: contrato de saída.

## Output Contract

A skill deve convergir o backend para o contrato descrito em `references/auth-backend-basic-contract-kt.md`.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais Kotlin.
