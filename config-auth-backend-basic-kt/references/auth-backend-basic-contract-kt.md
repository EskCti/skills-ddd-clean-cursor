# Auth Backend Basic Contract (Kotlin / Spring Boot)

## Goal

Gerar o módulo de autenticação backend completo em Spring Boot/Kotlin com JWT, JPA e Flyway.

## Structure

```
apps/backend/src/main/kotlin/<group>/modules/auth/
├── AuthController.kt
├── AuthConfig.kt
├── SecurityConfig.kt
├── JwtTokenProvider.kt
├── JwtAuthenticationFilter.kt
├── RequireAdmin.kt
├── adapter/
│   ├── UserJpaEntity.kt
│   ├── UserJpaRepository.kt
│   ├── PasswordJpaEntity.kt
│   ├── PasswordJpaRepository.kt
│   └── BcryptPasswordCryptoAdapter.kt
└── dto/
    ├── RegisterRequest.kt
    ├── LoginRequest.kt
    ├── ChangePasswordRequest.kt
    └── AuthResponse.kt

apps/backend/src/main/resources/
├── db/migration/
│   ├── V<N>__create_users.sql
│   └── V<N+1>__create_passwords.sql
└── application.yml (jwt.secret, jwt.expiration)
```

## Endpoints

| Method | Path | Auth | Admin | Description |
|--------|------|------|-------|-------------|
| POST | /auth/register | No | No | Registrar novo usuário |
| POST | /auth/login | No | No | Login com email/senha |
| GET | /auth/me | JWT | No | Dados do usuário autenticado |
| GET | /auth/users | JWT | Yes | Listar todos os usuários |
| GET | /auth/users/:id | JWT | Yes | Buscar usuário por ID |
| DELETE | /auth/users/:id | JWT | Yes | Deletar usuário |
| POST | /auth/change-password | JWT | No | Trocar senha do usuário autenticado |

## Component Rules

### AuthController

- `@RestController` com `@RequestMapping("/auth")`
- Injeta use cases do auth core Kotlin
- Mapeia falhas de `Result` para HTTP status codes (400, 401, 404)

### SecurityConfig

- `@Configuration` + `@EnableWebSecurity`
- `SecurityFilterChain` permitindo `/auth/register` e `/auth/login` sem auth
- JWT filter antes de `UsernamePasswordAuthenticationFilter`
- Desabilita CSRF (API stateless)

### JwtTokenProvider

- Gera token JWT com `userId` e `email` como claims
- Valida e extrai claims de token existente
- Configurável via `application.yml` (`jwt.secret`, `jwt.expiration`)

### JwtAuthenticationFilter

- Extrai `Bearer` token do header `Authorization`
- Valida com `JwtTokenProvider`
- Popula `SecurityContextHolder`

### RequireAdmin

- Annotation `@RequireAdmin` para métodos de controller
- `@Aspect` que verifica `user.admin == true` na request autenticada

### JPA Adapters

- `UserJpaEntity` mapeia para tabela `users` com UUID, name, email, admin, avatar_url, timestamps
- `PasswordJpaEntity` mapeia para tabela `passwords` com UUID, user_id (FK), hash, timestamps
- Repositories Spring Data `JpaRepository` que implementam as interfaces do core

### BcryptPasswordCryptoAdapter

- Implementa `PasswordCryptoProvider` usando `BCryptPasswordEncoder` do Spring Security

### Flyway Migrations

- `V<N>__create_users.sql`: tabela `users` com id UUID PK, name, email (UNIQUE), admin, avatar_url, created_at, updated_at
- `V<N+1>__create_passwords.sql`: tabela `passwords` com id UUID PK, user_id FK, hash, created_at

### Seed

- SQL seed (ou `ApplicationRunner`) com usuário admin padrão (`admin@admin.com / Admin123!`)

## Dependencies (build.gradle.kts)

```kotlin
implementation(project(":packages:auth"))
implementation("org.springframework.boot:spring-boot-starter-security")
implementation("io.jsonwebtoken:jjwt-api:0.12.5")
runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")
```

## Notes

- Sem dependência de Passport (conceito do Node.js) — usa Spring Security nativo
- JWT stateless, sem sessão server-side
- `BCryptPasswordEncoder` para hashing
- Flyway para migrations (auto-aplicadas no boot)
