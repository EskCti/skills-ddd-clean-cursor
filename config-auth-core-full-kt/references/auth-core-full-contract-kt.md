# Auth Core Full Contract (Kotlin)

## Goal

Gerar o módulo auth core completo em Kotlin com domínios `user`, `password`, `application`, `role`, `permission` e `oauth` — sem `audit`.

## Structure

```
packages/auth/  (ou packages/auth/core/)
├── build.gradle.kts
├── src/main/kotlin/<group>/auth/application/
│   ├── dto/UserDto.kt
│   ├── guard/HasPermissionGuard.kt
│   ├── query/FindUserByEmailQuery.kt
│   ├── query/FindUserByIdQuery.kt
│   ├── query/FindPasswordHashQuery.kt
│   ├── query/UserExistsQuery.kt
│   ├── usecase/CreateUserUseCase.kt
│   ├── usecase/ChangePasswordUseCase.kt
│   ├── usecase/DeleteUserUseCase.kt
│   ├── usecase/FindByEmailUseCase.kt
│   ├── usecase/FindByIdUseCase.kt
│   ├── usecase/LoginUseCase.kt
│   ├── usecase/AssignRoleUseCase.kt
│   ├── usecase/RevokeRoleUseCase.kt
│   ├── usecase/GrantPermissionUseCase.kt
│   ├── usecase/RevokePermissionUseCase.kt
│   ├── usecase/LinkOAuthAccountUseCase.kt
│   └── usecase/UnlinkOAuthAccountUseCase.kt
├── src/main/kotlin/<group>/auth/domain/
│   ├── entity/User.kt
│   ├── entity/Password.kt
│   ├── entity/Role.kt
│   ├── entity/Permission.kt
│   ├── entity/OAuthAccount.kt
│   ├── provider/PasswordCryptoProvider.kt
│   ├── provider/OAuthTokenProvider.kt
│   ├── repository/UserRepository.kt
│   ├── repository/PasswordRepository.kt
│   ├── repository/RoleRepository.kt
│   ├── repository/PermissionRepository.kt
│   ├── repository/OAuthAccountRepository.kt
│   └── service/PasswordChangePolicyService.kt
└── src/test/kotlin/<group>/auth/
    ├── application/usecase/ (mesmos testes do basic)
    └── domain/
        ├── entity/UserTest.kt, PasswordTest.kt (do basic)
        ├── entity/RoleTest.kt
        ├── entity/PermissionTest.kt
        ├── entity/OAuthAccountTest.kt
        └── service/PasswordChangePolicyServiceTest.kt (do basic)
```

## Package Layout

- Pacotes alinhados ao padrão `com.<org>.<module>.<layer>` (igual ao basic):
  - `com.example.auth.domain.entity`, `com.example.auth.domain.provider`, `com.example.auth.domain.repository`, `com.example.auth.domain.service`
  - `com.example.auth.application.dto`, `com.example.auth.application.query`, `com.example.auth.application.usecase`, `com.example.auth.application.guard`

## Domain Rules — Extended (beyond basic)

### Role

- `data class Role` com `id: Id`, `name: Name`, `description: String?`
- `tryCreate()` retorna `DomainResult<Role>` acumulando erros de `Id` e `Name`
- `AssignRoleUseCase`: atribui role a um user (valida existência de ambos, retorna `DomainResult<Unit>`)
- `RevokeRoleUseCase`: remove role de um user

### Permission

- `data class Permission` com `id: Id`, `name: DotSeparatedName`, `description: String?`
- `tryCreate()` retorna `DomainResult<Permission>` acumulando erros de `Id` e `DotSeparatedName`
- `GrantPermissionUseCase`: concede permission a um role
- `RevokePermissionUseCase`: remove permission de um role
- `HasPermissionGuard`: verifica se um user possui uma permission específica (via roles)

### OAuth

- `data class OAuthAccount` com `id: Id`, `userId: Id`, `provider: String`, `providerAccountId: String`
- `tryCreate()` retorna `DomainResult<OAuthAccount>` acumulando erros (`Id`, `Id.required`, `PROVIDER_REQUIRED`, `PROVIDER_ACCOUNT_ID_REQUIRED`)
- `OAuthTokenProvider`: interface para validar tokens OAuth externos → `DomainResult<OAuthUserInfo>`
- `LinkOAuthAccountUseCase`: vincula conta OAuth a um user existente, propagando `tokenResult.errors` e `createResult.errors`
- `UnlinkOAuthAccountUseCase`: desvincula conta OAuth

## Notes

- Usa `DomainResult` (compartilhado via `com.example.shared.domain.result`) com `errors: List<String>` acumulando — nunca `kotlin.Result` de primeira falha no domínio
- `suspend fun` para operações assíncronas
- Sem dependência de framework no core
- `DotSeparatedName` do shared para nomes de permission (ex.: `auth.users.read`)