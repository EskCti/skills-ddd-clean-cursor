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
        run: |
          for workspace in apps/backend packages/*; do
            [ -d "$workspace" ] || continue
            echo "==> Gate: $workspace"
            (cd "$workspace" && node ../../scripts/check-coverage.mjs 95 domain application entity vo use-case use-cases queries)
          done
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

  e2e-web:
    runs-on: ubuntu-latest
    needs: lint-and-test

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

      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            playwright-${{ runner.os }}-

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start backend + web
        run: |
          npm run build
          npm run start:backend & npm run start:web &
          npx wait-on http://localhost:4000/health http://localhost:3000
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: E2E web (Playwright)
        run: npm run test:e2e:web
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          BASE_URL: http://localhost:3000
```

## Coverage gate por workspace

O Jest escreve `coverage/` dentro de cada package (e não na raiz do monorepo). Portanto o gate `check-coverage.mjs` deve rodar **dentro de cada workspace** — o passo "Coverage gate" acima itera `apps/backend` e `packages/*`, executando o script a partir do diretório de cada workspace (o script resolve `coverage/coverage-summary.json` em relação ao CWD).

O gate **falha** (exit 1) quando:
- nenhum `coverage-summary.json`/`coverage-final.json` existe (rode testes com `--coverage` primeiro); ou
- nenhum arquivo de coverage casa com os segmentos de escopo (`matched === 0`) — evita falso-PASS com 100%.

Alternativa: agregar os summaries de `packages/*` e rodar o gate uma única vez na raiz.

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
