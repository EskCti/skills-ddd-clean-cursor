# CI/CD Pattern (C# — ASP.NET Core .NET 8+)

## .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore -c Release

      - name: Unit tests with coverage
        run: dotnet test tests/ProjectName.UnitTests --no-build -c Release --collect:"XPlat Code Coverage" --results-directory ./coverage

      - name: Coverage gate (domain + application ≥95%)
        run: |
          REPORT=$(find ./coverage -name "coverage.cobertura.xml" | head -1)
          dotnet tool install -g dotnet-reportgenerator-globaltool || true
          reportgenerator -reports:"$REPORT" -targetdir:./coverage/report -reporttypes:TextSummary
          PCT=$(grep -oP 'Line coverage: \K[\d.]+' ./coverage/report/Summary.txt | head -1)
          echo "Coverage: ${PCT}%"
          awk "BEGIN { exit !($PCT >= 95) }" <<< "$PCT" || (echo "FAIL: coverage below 95%" && exit 1)

      - name: Integration tests
        run: dotnet test tests/ProjectName.IntegrationTests --no-build -c Release --logger trx
        env:
          ConnectionStrings__DefaultConnection: Host=localhost;Database=test_db;Username=test;Password=test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: '**/*.trx'
```

## .github/workflows/cd.yml (GHCR + deploy)

```yaml
name: CD

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE: ghcr.io/${{ github.repository }}/backend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: src/ProjectName.Backend/Dockerfile
          push: true
          tags: ${{ env.IMAGE }}:${{ github.sha }},${{ env.IMAGE }}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy
        run: flyctl deploy --app ${{ secrets.FLY_APP_BACKEND }} --image ${{ env.IMAGE }}:${{ github.sha }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Checklist

- [ ] `.github/workflows/ci.yml` criado
- [ ] `.github/workflows/cd.yml` criado
- [ ] Secrets configurados no repositório
- [ ] `config-docker-cs` executado antes (Dockerfile existe)
- [ ] Projeto de testes referencia connection string via env var
- [ ] Branch `main` protegida com CI obrigatório
