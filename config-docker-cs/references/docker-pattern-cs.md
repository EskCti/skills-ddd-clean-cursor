# Docker Pattern (C# — ASP.NET Core .NET 8+)

## src/ProjectName.Backend/Dockerfile

```dockerfile
# Stage 1: Builder — SDK completo para compilação e publish
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder
WORKDIR /app

# Restaurar dependências (cache de camada)
COPY *.sln ./
COPY src/ProjectName.Backend/ProjectName.Backend.csproj ./src/ProjectName.Backend/
COPY src/ProjectName.Core/ProjectName.Core.csproj ./src/ProjectName.Core/
COPY src/ProjectName.Infrastructure/ProjectName.Infrastructure.csproj ./src/ProjectName.Infrastructure/
COPY src/ProjectName.Shared.Kernel/ProjectName.Shared.Kernel.csproj ./src/ProjectName.Shared.Kernel/
RUN dotnet restore

# Build e publish
COPY . .
RUN dotnet publish src/ProjectName.Backend/ProjectName.Backend.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Stage 2: Runner — apenas ASP.NET runtime (sem SDK)
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
version: '3.8'
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
      dockerfile: src/ProjectName.Backend/Dockerfile
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
```

## Checklist

- [ ] Todos os `.csproj` copiados antes do restore (cache de camadas)
- [ ] `.dockerignore` criado na raiz
- [ ] `ASPNETCORE_URLS=http://+:8080` configurado
- [ ] Variáveis sensíveis via `.env`
- [ ] `docker build` testado localmente
- [ ] Imagem final < 200MB (aspnet alpine + binários .NET)
- [ ] Considerar `--self-contained` para imagem sem runtime externo
