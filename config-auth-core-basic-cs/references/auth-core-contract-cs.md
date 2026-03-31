# Auth Core Contract (C#)

## Alvo

- `src/Project.Core/Domain/Entities/User.cs`
- `src/Project.Core/Domain/Entities/Password.cs`
- `src/Project.Core/Application/UseCases/Auth/`

## Entidades

- **User**:
  - `Id: Guid`
  - `Email: string`
  - `IsAdmin: bool`
  - `AvatarUrl: string?`
- **Password**:
  - `Hash: string`
  - `LastChangedAt: DateTime`
  - Método: `Check(plainText, hasher)`

## Use Cases

- `LoginUseCase`:
  - Input: `Email`, `PlainTextPassword`
  - Output: `UserDto`, `Token`
- `RegisterUseCase`:
  - Input: `Email`, `PlainTextPassword`, `Name`
  - Output: `Guid` (UserId)

## Interfaces de Provider

- `IPasswordHasher`: Interface para Hash/Verify.
- `ITokenProvider`: Interface para gerar JWT.
