# Docker Pattern (C# — ASP.NET Core .NET 8+)

## apps/backend/ProjectName.Backend/Dockerfile

Contexto de build: **raiz do repositório** (onde está o `.sln`).

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder
WORKDIR /app

COPY ProjectName.sln ./
COPY apps/backend/ProjectName.Backend/ProjectName.Backend.csproj ./apps/backend/ProjectName.Backend/
COPY apps/backend/ProjectName.Core/ProjectName.Core.csproj ./apps/backend/ProjectName.Core/
COPY apps/backend/ProjectName.Infrastructure/ProjectName.Infrastructure.csproj ./apps/backend/ProjectName.Infrastructure/
COPY apps/backend/ProjectName.Shared.Kernel/ProjectName.Shared.Kernel.csproj ./apps/backend/ProjectName.Shared.Kernel/
RUN dotnet restore

COPY . .
RUN dotnet publish apps/backend/ProjectName.Backend/ProjectName.Backend.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runner
WORKDIR /app

RUN adduser -u 1001 --disabled-password --gecos "" appuser
USER appuser

COPY --from=builder /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ProjectName.Backend.dll"]
```

## docker-compose.prod.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/ProjectName.Backend/Dockerfile
    ports:
      - "8080:8080"
    environment:
      ConnectionStrings__DefaultConnection: Host=postgres;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
      JwtSettings__Secret: ${JWT_SECRET}
      ASPNETCORE_ENVIRONMENT: Production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## .dockerignore

```
**/bin
**/obj
**/.env
**/.env.*
*.log
.git
**/TestResults
apps/web-vue/node_modules
apps/mobile-android/.gradle
apps/mobile-android/build
```

## Checklist

- [ ] Todos os `.csproj` em `apps/backend/` copiados antes do restore
- [ ] `.dockerignore` na raiz
- [ ] `ASPNETCORE_URLS=http://+:8080`
- [ ] `docker build -f apps/backend/ProjectName.Backend/Dockerfile .`
