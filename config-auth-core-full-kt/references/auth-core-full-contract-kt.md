# Auth Core Full Contract (Kotlin)

## Goal

Gerar o módulo auth core completo em Kotlin com domínios `user`, `password`, `application`, `role`, `permission` e `oauth` — sem `audit`.

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
│   ├── application/
│   │   ├── query/UserExistsQuery.kt
│   │   └── usecase/CreateUserUseCase.kt
│   ├── role/
│   │   ├── entity/Role.kt
│   │   ├── repository/RoleRepository.kt
│   │   ├── usecase/AssignRoleUseCase.kt
│   │   └── usecase/RevokeRoleUseCase.kt
│   ├── permission/
│   │   ├── entity/Permission.kt
│   │   ├── repository/PermissionRepository.kt
│   │   ├── usecase/GrantPermissionUseCase.kt
│   │   ├── usecase/RevokePermissionUseCase.kt
│   │   └── guard/HasPermissionGuard.kt
│   └── oauth/
│       ├── entity/OAuthAccount.kt
│       ├── repository/OAuthAccountRepository.kt
│       ├── provider/OAuthTokenProvider.kt
│       ├── usecase/LinkOAuthAccountUseCase.kt
│       └── usecase/UnlinkOAuthAccountUseCase.kt
└── src/test/kotlin/<group>/auth/
    ├── user/ (mesmos testes do basic)
    ├── password/ (mesmos testes do basic)
    ├── application/ (mesmos testes do basic)
    ├── role/
    │   ├── entity/RoleTest.kt
    │   ├── usecase/AssignRoleUseCaseTest.kt
    │   └── usecase/RevokeRoleUseCaseTest.kt
    ├── permission/
    │   ├── entity/PermissionTest.kt
    │   ├── usecase/GrantPermissionUseCaseTest.kt
    │   └── usecase/RevokePermissionUseCaseTest.kt
    └── oauth/
        ├── entity/OAuthAccountTest.kt
        ├── usecase/LinkOAuthAccountUseCaseTest.kt
        └── usecase/UnlinkOAuthAccountUseCaseTest.kt
```

## Domain Rules — Extended (beyond basic)

### Role

- `data class Role` com `id: Id`, `name: Name`, `description: String?`
- `AssignRoleUseCase`: atribui role a um user (valida existência de ambos)
- `RevokeRoleUseCase`: remove role de um user

### Permission

- `data class Permission` com `id: Id`, `name: DotSeparatedName`, `description: String?`
- `GrantPermissionUseCase`: concede permission a um role
- `RevokePermissionUseCase`: remove permission de um role
- `HasPermissionGuard`: verifica se um user possui uma permission específica (via roles)

### OAuth

- `data class OAuthAccount` com `id: Id`, `userId: Id`, `provider: String`, `providerAccountId: String`
- `OAuthTokenProvider`: interface para validar tokens OAuth externos
- `LinkOAuthAccountUseCase`: vincula conta OAuth a um user existente
- `UnlinkOAuthAccountUseCase`: desvincula conta OAuth

## Notes

- Usa `kotlin.Result` nativo
- `suspend fun` para operações assíncronas
- Sem dependência de framework no core
- `DotSeparatedName` do shared para nomes de permission (ex.: `auth.users.read`)
