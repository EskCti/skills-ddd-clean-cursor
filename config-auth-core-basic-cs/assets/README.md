# Auth Core Basic Template (C#)

Basic authentication domain for .NET:

- `Domain/Entities/User.cs` — User entity with Name, Email, Password, IsAdmin
- `Domain/ValueObjects/Password.cs` — Password value object with hash verification
- `Domain/Repositories/IUserRepository.cs` — Repository port (`Task<Result<T>>`)
- `Domain/Services/IPasswordHasher.cs` — Password hashing/verification port
- `Domain/Services/ITokenProvider.cs` — JWT token generation port
- `Application/UseCases/Auth/LoginUseCase.cs` — Login use case (IUseCase implementation)
- `Application/UseCases/Auth/RegisterUseCase.cs` — Register use case with IUserRepository

Depends on `config-shared-core-cs` (Entity, Result, Name, Email value objects).

Violations of `skills-standards.md` §5.1: VOs accumulate errors, entities combine them with `Result.Combine`, failures expose `Errors: IReadOnlyList<string>`.