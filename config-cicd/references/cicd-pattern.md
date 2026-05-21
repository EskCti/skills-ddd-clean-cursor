# CI/CD Pattern (TypeScript — NestJS + Next.js)

## .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
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

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Unit tests with coverage
        run: npm run test -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: Coverage gate (domain + application ≥95%)
        run: node scripts/check-coverage.mjs 95 domain application entity vo use-case use-cases queries

      - name: E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
```

## .github/workflows/cd.yml (GHCR + Fly.io)

```yaml
name: CD

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_BACKEND: ghcr.io/${{ github.repository }}/backend
  IMAGE_WEB: ghcr.io/${{ github.repository }}/web

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
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: ${{ env.IMAGE_BACKEND }}:${{ github.sha }},${{ env.IMAGE_BACKEND }}:latest

      - name: Build and push web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ${{ env.IMAGE_WEB }}:${{ github.sha }},${{ env.IMAGE_WEB }}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy backend
        run: flyctl deploy --app ${{ secrets.FLY_APP_BACKEND }} --image ${{ env.IMAGE_BACKEND }}:${{ github.sha }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Deploy web
        run: flyctl deploy --app ${{ secrets.FLY_APP_WEB }} --image ${{ env.IMAGE_WEB }}:${{ github.sha }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Secrets necessários

| Secret | Descrição |
|--------|-----------|
| `FLY_API_TOKEN` | Token do Fly.io (para deploy) |
| `FLY_APP_BACKEND` | Nome do app backend no Fly |
| `FLY_APP_WEB` | Nome do app web no Fly |
| `GITHUB_TOKEN` | Automático (push para GHCR) |

## Checklist

- [ ] `.github/workflows/ci.yml` criado
- [ ] `.github/workflows/cd.yml` criado
- [ ] Unit tests com `--coverage` configurado
- [ ] Coverage gate ≥95% em domain + application (falha CI se abaixo)
- [ ] Secrets configurados no repositório GitHub
- [ ] `config-docker` executado antes (Dockerfiles existem)
- [ ] Branch `main` protegida com status check de CI obrigatório
