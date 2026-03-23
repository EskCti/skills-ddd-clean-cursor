# Auth Core Basic Contract (Kotlin)

## Goal

Gerar o módulo auth core básico em Kotlin com domínios `user`, `password` e `application`.

## Structure

```
packages/auth/  (ou packages/auth/core/)
├── build.gradle.kts
├── src/main/kotlin/<group>/auth/
│   ├── user/
│   │   ├── entity/User.kt
│   │   ├── dto/UserDto.kt
│   │   ├── repository/UserRepository.kt
│   │   ├── query/FindUserByEmailQuery.kt
│   │   ├── query/FindUserByIdQuery.kt
│   │   ├── query/FindPasswordHashQuery.kt
│   │   ├── usecase/FindByEmailUseCase.kt
│   │   ├── usecase/FindByIdUseCase.kt
│   │   ├── usecase/LoginUseCase.kt
│   │   └── usecase/DeleteUserUseCase.kt
│   ├── password/
│   │   ├── entity/Password.kt
│   │   ├── repository/PasswordRepository.kt
│   │   ├── provider/PasswordCryptoProvider.kt
│   │   ├── service/PasswordChangePolicyService.kt
│   │   └── usecase/ChangePasswordUseCase.kt
│   └── application/
│       ├── query/UserExistsQuery.kt
│       └── usecase/CreateUserUseCase.kt
└── src/test/kotlin/<group>/auth/
    ├── user/
    │   ├── entity/UserTest.kt
    │   ├── usecase/FindByEmailUseCaseTest.kt
    │   ├── usecase/FindByIdUseCaseTest.kt
    │   ├── usecase/LoginUseCaseTest.kt
    │   └── usecase/DeleteUserUseCaseTest.kt
    ├── password/
    │   ├── entity/PasswordTest.kt
    │   ├── service/PasswordChangePolicyServiceTest.kt
    │   └── usecase/ChangePasswordUseCaseTest.kt
    └── application/
        └── usecase/CreateUserUseCaseTest.kt
```

## Domain Rules

### User

- `data class User` com `id: Id`, `name: Name`, `email: Email`, `admin: Boolean = false`, `avatarUrl: String? = null`
- `companion object` com `tryCreate()` retornando `Result<User>`
- Igualdade por `id`

### Password

- `data class Password` com `id: Id`, `userId: Id`, `hash: HashPassword`
- Validação via `HashPassword` (somente hash bcrypt)
- Não usar `StrongPassword` dentro de `Password`

### PasswordChangePolicyService

- Serviço de domínio puro (sem I/O)
- Valida força da nova senha e verifica reuso contra hashes recentes
- Depende de `PasswordCryptoProvider` para comparação

### CreateUserUseCase

- Recebe `CreateUserInput` (name, email, password, admin?, avatarUrl?)
- Usa `TransactionManager.runInTransaction` para persistir User + Password atomicamente
- Verifica duplicidade via `UserExistsQuery`

### ChangePasswordUseCase

- Depende de `UserExistsQuery`, `PasswordRepository.findRecentByUserId`, `PasswordCryptoProvider`
- Delega validação de política para `PasswordChangePolicyService`

### Providers (interfaces)

- `UserRepository`: create, update, delete
- `PasswordRepository`: create, findByUserId, findRecentByUserId
- `PasswordCryptoProvider`: hash, compare
- `FindUserByEmailQuery`: findByEmail
- `FindUserByIdQuery`: findById
- `FindPasswordHashQuery`: findPasswordHash
- `UserExistsQuery`: existsByEmail

## Test Rules

- Testes unitários com JUnit 5 + MockK (ou stubs manuais)
- Cada use case testado com cenário de sucesso e falha
- Entidades testadas via `tryCreate` e regras de negócio
- `PasswordChangePolicyService` testado com cenários de reuso e força

## Notes

- Usa `kotlin.Result` nativo do Kotlin
- `suspend fun` para operações assíncronas (compatível com coroutines)
- Sem dependência de framework (Spring, etc.) no core
