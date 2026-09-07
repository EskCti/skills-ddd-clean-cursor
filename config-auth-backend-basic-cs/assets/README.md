# Auth Backend Basic Template (C#)

Backend infrastructure for authentication in ASP.NET Core:

- `Controllers/AuthController.cs` — Register, Login, Me endpoints
- `Infrastructure/Identity/TokenProvider.cs` — JWT token generation (JwtTokenProvider implementando ITokenProvider do Core)
- `Infrastructure/Identity/PasswordHasher.cs` — BCrypt hashing (BCryptPasswordHasher implementando IPasswordHasher do Core)

Requires NuGet packages: `BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `System.IdentityModel.Tokens.Jwt`, `Microsoft.IdentityModel.Tokens`.
