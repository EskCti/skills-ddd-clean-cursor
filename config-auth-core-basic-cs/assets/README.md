# Auth Core Basic Template (C#)

Basic authentication domain for .NET:

- `Domain/Entities/User.cs` — User entity with Name, Email, IsAdmin
- `Domain/ValueObjects/Password.cs` — Password value object with hash verification
- `Application/UseCases/LoginUseCase.cs` — Login use case (IUseCase implementation)
- `Application/UseCases/RegisterUseCase.cs` — Register use case with IUserRepository

Depends on `config-shared-core-cs` (Entity, Result, Name, Email value objects).
