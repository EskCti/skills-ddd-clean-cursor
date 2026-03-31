# Auth Backend Basic Template (C#)

Backend infrastructure for authentication in ASP.NET Core:

- `Controllers/AuthController.cs` — Register, Login, Me endpoints
- `Infrastructure/Identity/TokenProvider.cs` — JWT token generation (ITokenProvider + JwtTokenProvider)
- `Infrastructure/Identity/PasswordHasher.cs` — BCrypt hashing (IPasswordHasher + BCryptPasswordHasher)

Requires NuGet packages: `BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`.
