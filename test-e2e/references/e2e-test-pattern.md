# E2E Test Pattern (TypeScript)

## Escopo

| Tipo | Ferramenta | O que testa |
|------|------------|-------------|
| **API E2E** | Supertest + `@nestjs/testing` | Fluxo HTTP completo (controller → use case → DB) |
| **Web E2E** | Playwright | Fluxo UI (formulário → API → feedback visual) |

E2E **não** entra no gate de 95% de unit coverage — cobre **fluxos críticos** do MVP.

## API E2E — NestJS + Supertest

### Estrutura

```
apps/backend/
├── test/
│   ├── jest-e2e.json
│   └── <module>.e2e-spec.ts
└── src/
```

> O bootstrap (`config-project` / `ensure-e2e-scaffold.mjs`) já cria `jest-e2e.json`, `app.e2e-spec.ts`, `playwright.config.ts` e os scripts `test:e2e` / `test:e2e:web`.

### Gerar spec por BC

```bash
# Após implementar CustomerController (POST + GET)
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud \
  --create-fields name,email,cpf \
  --assert-field email \
  --web \
  --module-label Clientes
```

| Template | Quando usar |
|----------|-------------|
| `crud` | POST criar → GET buscar + 404 (fluxo MVP) |
| `module-get` | Scaffold `config-new-module` (GET `/module` only) |
| `feature` | Spec web-only (Playwright em `e2e/<module>.spec.ts`, sem spec de API) |

O template `crud` inclui o cenário de **400 com envelope `{ errors: [...] }`** (contrato §5.1): POST inválido deve retornar a lista completa de erros, nunca só a primeira mensagem.

`config-new-module` chama o gerador automaticamente (`module-get` + spec web).

### jest-e2e.json

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

### package.json (backend)

```json
{
  "scripts": {
    "test:e2e": "jest --config ./test/jest-e2e.json --runInBand"
  },
  "devDependencies": {
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2"
  }
}
```

### Exemplo — Customer API

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Customers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /customers then GET /customers/:id', async () => {
    const create = await request(app.getHttpServer())
      .post('/customers')
      .send({ name: 'João', email: 'joao@example.com', cpf: '12345678901' })
      .expect(201);

    const id = create.body.id;

    await request(app.getHttpServer())
      .get(`/customers/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('joao@example.com');
      });
  });
});
```

### Banco em E2E

- CI: Postgres service (ver `config-cicd/references/cicd-pattern.md`)
- Local: `docker-compose up -d` + `DATABASE_URL` apontando para test db
- Preferir **reset entre testes** ou transação rollback quando possível

## Web E2E — Playwright

### Estrutura

```
apps/web-angular/          (ou web-vue, apps/web)
├── e2e/
│   ├── playwright.config.ts
│   └── customers.spec.ts
```

### playwright.config.ts (trecho)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4200' },
  webServer: [
    { command: 'npm run start:dev', cwd: '../backend', port: 3000, reuseExistingServer: !process.env.CI },
    { command: 'ng serve', port: 4200, reuseExistingServer: !process.env.CI },
  ],
});
```

### Exemplo — cadastro de cliente

```typescript
import { test, expect } from '@playwright/test';

test('cadastra cliente via formulário', async ({ page }) => {
  await page.goto('/customers/new');
  await page.fill('#name', 'João Silva');
  await page.fill('#email', 'joao@example.com');
  await page.fill('#cpf', '12345678901');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/customers$/);
  await expect(page.getByText('João Silva')).toBeVisible();
});
```

## Checklist por BC

- [ ] API: POST criar → GET buscar (Supertest)
- [ ] API: cenário de erro (400/404) quando aplicável
- [ ] Web: fluxo principal da feature (Playwright), se houver UI
- [ ] `npm run test:e2e` passa localmente com docker-compose
- [ ] CI executa e2e após unit tests

## Integração backlog

| Task | Ação |
|------|------|
| `test:e2e` | Criar specs API (+ web se feature tiver UI) |
