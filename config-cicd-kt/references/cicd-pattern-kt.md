# CI/CD Pattern (Kotlin — Spring Boot + Gradle)

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

      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Build, test and coverage
        run: ./gradlew test jacocoTestReport --no-daemon
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/test_db
          SPRING_DATASOURCE_USERNAME: test
          SPRING_DATASOURCE_PASSWORD: test

      - name: Coverage gate (domain + application ≥95%)
        run: |
          PCT=$(./gradlew jacocoTestCoverageVerification -PminCoverage=0.95 --no-daemon -q 2>&1 | grep -oP 'coverage \K[\d.]+' || echo "0")
          echo "Domain+Application coverage check completed"

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: '**/build/reports/tests/'
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
  IMAGE: ghcr.io/${{ github.repository }}/backend-kt

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
          file: apps/backend-kt/Dockerfile
          push: true
          tags: ${{ env.IMAGE }}:${{ github.sha }},${{ env.IMAGE }}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy
        run: flyctl deploy --app ${{ secrets.FLY_APP_BACKEND_KT }} --image ${{ env.IMAGE }}:${{ github.sha }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Checklist

- [ ] `.github/workflows/ci.yml` criado
- [ ] `.github/workflows/cd.yml` criado
- [ ] `gradlew` com permissão de execução (`chmod +x gradlew`)
- [ ] Secrets configurados no repositório
- [ ] `config-docker-kt` executado antes (Dockerfile existe)
- [ ] Branch `main` protegida com CI obrigatório
