# Auth Core Basic Contract (Kotlin)

## Goal

Gerar o módulo auth core básico em Kotlin com domínios `user`, `password` e `application`.

## Structure

```
packages/auth/  (ou packages/auth/core/)
├── build.gradle.kts
├── src/main/kotlin/<group>/auth/application/
│   ├── dto/UserDto.kt
│   ├── query/FindUserByEmailQuery.kt
│   ├── query/FindUserByIdQuery.kt
│   ├── query/FindPasswordHashQuery.kt
│   ├── query/UserExistsQuery.kt
│   ├── usecase/CreateUserUseCase.kt
│   ├── usecase/ChangePasswordUseCase.kt
│   ├── usecase/DeleteUserUseCase.kt
│   ├── usecase/FindByEmailUseCase.kt
│   ├── usecase/FindByIdUseCase.kt
│   └── usecase/LoginUseCase.kt
├── src/main/kotlin/<group>/auth/domain/
│   ├── entity/User.kt
│   ├── entity/Password.kt
│   ├── provider/PasswordCryptoProvider.kt
│   ├── repository/UserRepository.kt
│   ├── repository/PasswordRepository.kt
│   └── service/PasswordChangePolicyService.kt
└── src/test/kotlin/<group>/auth/
    ├── application/
    │   └── usecase/CreateUserUseCaseTest.kt
    └── domain/
        ├── entity/UserTest.kt
        ├── entity/PasswordTest.kt
        └── service/PasswordChangePolicyServiceTest.kt
```

## Package Layout

- Pacotes alinhados ao padrão `com.<org>.<module>.<layer>`:
  - `com.example.auth.domain.entity`, `com.example.auth.domain.provider`, `com.example.auth.domain.repository`, `com.example.auth.domain.service`
  - `com.example.auth.application.dto`, `com.example.auth.application.query`, `com.example.auth.application.usecase`

## Domain Rules

### User

- `data class User` com `id: Id`, `name: Name`, `email: Email`, `admin: Boolean = false`, `avatarUrl: String? = null`
- `companion object` com `tryCreate()` retornando `DomainResult<User>` acumulando erros de todos os VOs (`Id`, `Name`, `Email`)
- Igualdade por `id`

### Password

- `data class Password` com `id: Id`, `userId: Id`, `hash: HashPassword`
- `tryCreate()` retorna `DomainResult<Password>` acumulando erros de `Id`/`Id.required`/`HashPassword`
- Validação via `HashPassword` (somente hash bcrypt)
- Não usar `StrongPassword` dentro de `Password`

### PasswordChangePolicyService

- Serviço de domínio puro (sem I/O, em `domain.service`)
- Valida força da nova senha e verifica reuso contra hashes recentes
- Retorna `DomainResult<Unit>` acumulando erros (`StrongPassword.tryCreate` + `PASSWORD_RECENTLY_USED`)
- Depende de `PasswordCryptoProvider` para comparação

### CreateUserUseCase

- Recebe `CreateUserInput` (name, email, password, admin?, avatarUrl?)
- Usa `TransactionManager.runInTransaction` para persistir User + Password atomicamente, acumulando os `errors` dos dois writes (sem `getOrThrow()` dentro da transação)
- Verifica duplicidade via `UserExistsQuery` → `DomainResult.failure(listOf("USER_ALREADY_EXISTS"))`

### ChangePasswordUseCase

- Depende de `UserExistsQuery`, `PasswordRepository.findRecentByUserId`, `PasswordCryptoProvider`
- Delega validação de política para `PasswordChangePolicyService`
- Retorna `DomainResult<Unit>`

### Ports (interfaces)

- `UserRepository` (domain.repository): create, update, delete — retornam `DomainResult<Unit>`
- `PasswordRepository` (domain.repository): create, findByUserId, findRecentByUserId — create retorna `DomainResult<Unit>`
- `PasswordCryptoProvider` (domain.provider): hash, compare
- `FindUserByEmailQuery`: findByEmail
- `FindUserByIdQuery`: findById
- `FindPasswordHashQuery`: findPasswordHash
- `UserExistsQuery`: existsByEmail

## Test Rules

- Testes unitários com JUnit 5 + MockK (ou stubs manuais)
- Cada use case testado com cenário de sucesso e falha
- Entidades testadas via `tryCreate` e regras de negócio
- `PasswordChangePolicyService` testado com cenários de reuso e força
- Teste de acumulação: entrada com múltiplos VOs inválidos deve expor **todos** os erros em `result.errors`

## Notes

- Usa `DomainResult` (compartilhado via `com.example.shared.domain.result`) com `errors: List<String>` acumulando — nunca `kotlin.Result` de primeira falha no domínio
- `suspend fun` para operações assíncronas (compatível com coroutines)
- Sem dependência de framework (Spring, etc.) no core