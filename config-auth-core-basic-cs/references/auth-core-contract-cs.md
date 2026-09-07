# Auth Core Contract (C#)

## Alvo

- `src/Project.Core/Domain/Entities/User.cs`
- `src/Project.Core/Domain/ValueObjects/Password.cs`
- `src/Project.Core/Domain/Repositories/IUserRepository.cs`
- `src/Project.Core/Domain/Services/IPasswordHasher.cs`
- `src/Project.Core/Domain/Services/ITokenProvider.cs`
- `src/Project.Core/Application/UseCases/Auth/`

## Entidades

- **User**:
  - `Id: Guid` (base `Entity`)
  - `Name: Name` (VO compartilhado)
  - `Email: Email` (VO compartilhado)
  - `Password: Password` (VO com hash)
  - `IsAdmin: bool`
- **Password**:
  - `Hash: string`
  - Método: `CreateFromHash(hash)`, `Verify(plainText, verifier)`

## Use Cases

- `LoginUseCase`:
  - Input: `LoginInput(Email, Password)`
  - Output: `LoginOutput(Token, UserId)`
  - Valida credenciales via `IUserRepository` + `IPasswordHasher`; gera token via `ITokenProvider`.
- `RegisterUseCase`:
  - Input: `RegisterInput(Name, Email, Password, IsAdmin)`
  - Output: `Result<User>`
  - Acumula erros de VOs com `Result.Combine(nameResult, emailResult, passwordResult)` e propaga `Errors: IReadOnlyList<string>`.

## Interfaces de Provider

- `IPasswordHasher`: Interface para Hash/Verify.
- `ITokenProvider`: Interface para gerar JWT.
- `IUserRepository`: `Task<Result<User?>> FindByEmailAsync(email)`, `Task<Result> SaveAsync(user)` (port no Domínio, adapter na Infraestrutura).