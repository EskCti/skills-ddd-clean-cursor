# Guia de Integração Contínua e Entrega Contínua (CI/CD) para Projetos C#

Este guia fornece templates e configurações para implementar pipelines de CI/CD para projetos C# seguindo Clean Architecture e DDD.

## 1. Visão Geral da Pipeline

```
Desenvolvedor → Git Push → CI Pipeline → CD Pipeline → Produção
                     ↓           ↓           ↓           ↓
                 Validação → Build → Testes → Deploy → Monitoramento
```

## 2. GitHub Actions

### Pipeline Básica (`.github/workflows/ci.yml`)
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  DOTNET_VERSION: '8.0.x'
  SOLUTION_FILE: 'Product.sln'

jobs:
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: dotnet restore ${{ env.SOLUTION_FILE }}
      
    - name: Build solution
      run: dotnet build ${{ env.SOLUTION_FILE }} --configuration Release --no-restore
      
    - name: Run unit tests
      run: dotnet test ${{ env.SOLUTION_FILE }} --configuration Release --no-build --verbosity normal
      
    - name: Run integration tests
      run: dotnet test ${{ env.SOLUTION_FILE }} --configuration Release --no-build --filter "Category=Integration"
      
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: test-results
        path: '**/TestResults/*.trx'
        
    - name: Generate coverage report
      run: |
        dotnet test ${{ env.SOLUTION_FILE }} \
          --configuration Release \
          --no-build \
          --collect:"XPlat Code Coverage" \
          --results-directory ./coverage
          
    - name: Upload coverage report
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: ./coverage
```

### Pipeline Avançada com Multi-Stage (`.github/workflows/full-pipeline.yml`)
```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main, develop ]

env:
  DOTNET_VERSION: '8.0.x'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  validate:
    name: Validate Code
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Validate solution structure
      run: |
        # Verificar se todos os projetos necessários existem
        if [ ! -f "Product.sln" ]; then
          echo "❌ Solution file not found"
          exit 1
        fi
        
        # Verificar projetos principais
        REQUIRED_PROJECTS=(
          "src/Product.Domain/Product.Domain.csproj"
          "src/Product.Application/Product.Application.csproj"
          "src/Product.Infrastructure/Product.Infrastructure.csproj"
          "src/Product.Backend/Product.Backend.csproj"
        )
        
        for project in "${REQUIRED_PROJECTS[@]}"; do
          if [ ! -f "$project" ]; then
            echo "❌ Missing project: $project"
            exit 1
          fi
        done
        
        echo "✅ Solution structure validated"
        
  build:
    name: Build Solution
    runs-on: ubuntu-latest
    needs: validate
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Cache NuGet packages
      uses: actions/cache@v4
      with:
        path: ~/.nuget/packages
        key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
        restore-keys: |
          ${{ runner.os }}-nuget-
          
    - name: Build with dotnet
      run: |
        dotnet build Product.sln \
          --configuration Release \
          --no-restore \
          --verbosity minimal
          
    - name: Create build artifact
      run: |
        mkdir -p artifacts
        dotnet publish src/Product.Backend/Product.Backend.csproj \
          --configuration Release \
          --output ./artifacts \
          --no-build
          
    - name: Upload build artifact
      uses: actions/upload-artifact@v4
      with:
        name: backend-artifact
        path: ./artifacts
        
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: build
    
    strategy:
      matrix:
        test-project:
          - 'tests/Product.Domain.Tests/Product.Domain.Tests.csproj'
          - 'tests/Product.Application.Tests/Product.Application.Tests.csproj'
          - 'tests/Product.Infrastructure.Tests/Product.Infrastructure.Tests.csproj'
          
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: dotnet restore ${{ matrix.test-project }}
      
    - name: Run tests
      run: |
        dotnet test ${{ matrix.test-project }} \
          --configuration Release \
          --no-build \
          --logger "trx;LogFileName=test-results.trx" \
          --collect:"XPlat Code Coverage"
          
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: test-results-${{ matrix.test-project }}
        path: '**/TestResults/*'
        
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@v1.4.0
      with:
        project: 'Product'
        path: '.'
        format: 'HTML'
        args: >
          --enableExperimental
          --failOnCVSS 7
          --scan **/*.csproj
          
    - name: Upload security report
      uses: actions/upload-artifact@v4
      with:
        name: security-report
        path: ./reports
        
  docker-build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
      
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: docker-build
    environment: staging
    
    steps:
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -f k8s/staging/
        kubectl rollout status deployment/product-backend -n staging
        
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    
    steps:
    - name: Approve deployment
      run: echo "Deployment approved"
      
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -f k8s/production/
        kubectl rollout status deployment/product-backend -n production
```

## 3. Docker Configuration

### Dockerfile Básico
```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Product.sln", "."]
COPY ["src/Product.Backend/Product.Backend.csproj", "src/Product.Backend/"]
COPY ["src/Product.Application/Product.Application.csproj", "src/Product.Application/"]
COPY ["src/Product.Domain/Product.Domain.csproj", "src/Product.Domain/"]
COPY ["src/Product.Infrastructure/Product.Infrastructure.csproj", "src/Product.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "Product.sln"

# Copy source code
COPY . .

# Build and publish
RUN dotnet build "Product.sln" --configuration Release --no-restore
RUN dotnet publish "src/Product.Backend/Product.Backend.csproj" \
    --configuration Release \
    --no-build \
    --output /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# Copy published application
COPY --from=build /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Entry point
ENTRYPOINT ["dotnet", "Product.Backend.dll"]
```

### Docker Compose para Desenvolvimento
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__Database=Host=db;Port=5432;Database=product;Username=postgres;Password=postgres
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests
      
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=product
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    
  seq:
    image: datalust/seq:latest
    environment:
      - ACCEPT_EULA=Y
    ports:
      - "5341:5341"
      - "8081:80"

volumes:
  postgres_data:
  redis_data:
```

## 4. Kubernetes Configuration

### Deployment (`k8s/production/deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-backend
  namespace: production
  labels:
    app: product-backend
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-backend
  template:
    metadata:
      labels:
        app: product-backend
        version: v1.0.0
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-org/product:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__Database
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: ghcr-secret
```

### Service (`k8s/production/service.yaml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: product-backend-service
  namespace: production
spec:
  selector:
    app: product-backend
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: LoadBalancer
```

### Ingress (`k8s/production/ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: product-backend-ingress
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: product-tls-secret
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: product-backend-service
            port:
              number: 80
```

## 5. Configuração de Qualidade de Código

### `.editorconfig`
```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.cs]
dotnet_sort_system_directives_first = true

# Naming rules
dotnet_naming_rule.types_should_be_pascal_case.severity = suggestion
dotnet_naming_rule.types_should_be_pascal_case.symbols = types
dotnet_naming_rule.types_should_be_pascal_case.style = pascal_case

dotnet_naming_rule.non_field_members_should_be_pascal_case.severity = suggestion
dotnet_naming_rule.non_field_members_should_be_pascal_case.symbols = non_field_members
dotnet_naming_rule.non_field_members_should_be_pascal_case.style = pascal_case
```

### `Directory.Build.props`
```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="StyleCop.Analyzers" Version="1.2.0-beta.507">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="SonarAnalyzer.CSharp" Version="9.19.0.86741">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
</Project>
```

## 6. Scripts de Build e Deploy

### `build.ps1` (PowerShell)
```powershell
param(
    [string]$Configuration = "Release",
    [string]$Version = "1.0.0"
)

Write-Host "Building Product Solution v$Version" -ForegroundColor Green

# Clean
dotnet clean Product.sln --configuration $Configuration

# Restore
dotnet restore Product.sln

# Build
dotnet build Product.sln `
    --configuration $Configuration `
    --no-restore `
    -p:Version=$Version

# Test
dotnet test Product.sln `
    --configuration $Configuration `
    --no-build `
    --logger "trx;LogFileName=test-results.trx"

Write-Host "Build completed successfully" -ForegroundColor Green
```

### `deploy.ps1` (PowerShell)
```powershell
param(
    [string]$Environment = "staging",
    [string]$ImageTag = "latest"
)

Write-Host "Deploying to $Environment with tag $ImageTag" -ForegroundColor Cyan

# Update Kubernetes manifests with new image tag
$deploymentFile = "k8s/$Environment/deployment.yaml"
$content = Get-Content $deploymentFile -Raw
$updatedContent = $content -replace "image: .*", "image: ghcr.io/your-org/product:$ImageTag"
Set-Content -Path $deploymentFile -Value $updatedContent

# Apply Kubernetes configuration
kubectl apply -f k8s/$Environment/

# Wait for rollout
kubectl rollout status deployment/product-backend -n $environment

Write-Host "Deployment to $Environment completed" -ForegroundColor Green
```

## 7. Monitoramento e Observabilidade

### `appsettings.Monitoring.json`
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "Seq",
        "Args": {
          "serverUrl": "http://seq:5341"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  },
  "OpenTelemetry": {
    "ServiceName": "product-backend",
    "Endpoint": "http://jaeger:4317",
    "Metrics": {
      "Enabled": true,
      "Prometheus": {
        "Enabled": true,
        "Endpoint": "/metrics"
      }
    },
    "Tracing": {
      "Enabled": true,
      "Sampler": "ParentBased(AlwaysOn)"
    }
  },
  "HealthChecks": {
    "Endpoint": "/health",
    "UIEndpoint": "/health-ui",
    "EvaluationTimeInSeconds": 10,
    "MinimumSecondsBetweenFailureNotifications": 60
  }
}
```

## 8. Boas Práticas de CI/CD

### 1. **Pipeline como Código**
- Mantenha configurações de pipeline no repositório
- Use versionamento para histórico de mudanças
- Documente decisões de pipeline

### 2. **Builds Reproduzíveis**
- Use versões específicas de ferramentas
- Mantenha dependências controladas
- Use containerização para consistência

### 3. **Testes Automatizados**
- Execute testes em cada commit
- Mantenha cobertura de código alta
- Teste em ambiente isolado

### 4. **Deploy Incremental**
- Use blue-green ou canary deployments
- Implemente rollback automático
- Monitore métricas após deploy

### 5. **Segurança Integrada**
- Scan de dependências em cada build
- Verificação de vulnerabilidades
- Segurança como parte do pipeline

## 9. Ferramentas Recomendadas

| Categoria | Ferramenta | Uso |
|-----------|------------|-----|
| CI/CD | GitHub Actions, GitLab CI, Azure DevOps | Execução de pipelines |
| Container | Docker, Podman | Empacotamento de aplicação |
| Orchestration | Kubernetes, Docker Swarm | Gerenciamento de containers |
| Monitoring | Prometheus, Grafana | Métricas e dashboards |
| Logging | Seq, ELK Stack | Agregação de logs |
| Tracing | Jaeger, Zipkin | Rastreamento distribuído |
| Security | Trivy, Snyk, OWASP Dependency Check | Scan de vulnerabilidades |
| Quality | SonarQube, CodeClimate | Análise estática de código |

## 10. Próximos Passos

1. **Implementar Feature Flags** para deploy controlado
2. **Adicionar Performance Testing** no pipeline
3. **Implementar Chaos Engineering** para resiliência
4. **Automatizar Rollbacks** baseado em métricas
5. **Integrar com Service Mesh** (Istio, Linkerd)
6. **Implementar GitOps** com ArgoCD ou Flux
7. **Adicionar Compliance as Code** para regulamentações