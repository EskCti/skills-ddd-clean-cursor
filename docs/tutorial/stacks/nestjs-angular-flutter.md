# Stack: NestJS + Angular + Flutter

**Combinação**: Backend TypeScript (NestJS) · Frontend Angular 17+ (PrimeNG) · Mobile Flutter

**Pré-requisito**: [Tutorial 01 — Análise e Planejamento](../01-pipeline-discovery-planning.md) (`backlog.md` pronto) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents usados: `Config Project Full-Stack` → `Config Project (Angular)` → `Config Shared Web (Angular)` → `Config Project (Flutter)` → `Config Docker (TypeScript)` → `Config CI/CD (TypeScript)` → `Config Shared Core` → `openspec-propose` → `openspec-apply-change` → `Unit Tests (TypeScript)` → `E2E Tests (TypeScript)`

**Cenário**: Você vai criar do zero um sistema de gestão de clientes chamado `clientes-app` com NestJS (TypeScript) como backend, Angular 17+ com PrimeNG como frontend web e Flutter como aplicativo mobile. Autenticação JWT básica e rastreamento de mudanças com OpenSpec.

---

## Etapa 0 — Decisões de Stack com Config Project Full-Stack

Antes de gerar qualquer arquivo, acione o agent **`Config Project Full-Stack`** para obter o roteiro completo de agents a chamar:

> Quero criar um projeto do zero chamado "clientes-app". Backend: NestJS (TypeScript), Frontend: Angular 17+ com PrimeNG, Mobile: Flutter. Com autenticação JWT básica. Quero usar OpenSpec para rastrear mudanças.

### Resposta esperada do agent

O agent retorna a sequência de chamadas a fazer:

```
1. openspec-propose "bootstrap-clientes-app"
   → Registrar a mudança de bootstrap no OpenSpec

2. openspec-apply-change "bootstrap-clientes-app"
   ├── Config Project (Angular)      → Monorepo NestJS + Angular 17+ + Tailwind + docker-compose (dev)
   ├── Config Shared Web (Angular)   → Shell admin (sidebar, topbar, rodapé)
   ├── Config Project (Flutter)      → App Flutter com Riverpod + Dio + go_router
   ├── Config Docker (TypeScript)    → Dockerfiles multi-stage de produção + docker-compose.prod.yml
   ├── Config CI/CD (TypeScript)     → GitHub Actions (CI em PR + CD em main)
   └── Config Shared Core            → Shared kernel DDD: Entity, ValueObject, Result<T>, IUseCase, IRepository

3. [Por Bounded Context — backend + frontend + mobile na mesma change, recomendado]
   openspec-propose "bc-customers"
   → openspec-apply-change "bc-customers"
      ├── Core Value Object           → CustomerName, Email, CPF
      ├── Core Entity                 → Customer
      ├── Core Repository             → ICustomerRepository
      ├── Core DTO                    → CreateCustomerInputDto, CustomerOutputDto
      ├── Core Use Case               → CreateCustomerUseCase
      ├── Core Query CQRS             → GetCustomerByIdQuery
      ├── Backend Prisma Data         → CustomerPrismaRepository
      ├── Backend Controller          → CustomerController
      ├── Frontend Entity (Angular)   → Customer entity + Result<T>
      ├── Frontend UseCase (Angular)  → CreateCustomerUseCase, ListCustomersUseCase
      ├── Frontend Repository (Angular) → CustomerHttpRepository
      ├── Frontend Page (Angular)     → CustomerListComponent
      ├── Frontend Form (Angular)     → CustomerFormComponent
      ├── Mobile Entity (Flutter)     → Customer entity + sealed Result
      ├── Mobile UseCase (Flutter)    → CreateCustomerUseCase, ListCustomersUseCase
      ├── Mobile Repository (Flutter) → CustomerRepositoryImpl (Dio)
      ├── Mobile Screen (Flutter)     → CustomerListPage
      ├── Mobile Form (Flutter)       → CustomerFormPage
      ├── Unit Tests (TypeScript)     → VOs, Entity, UseCase (≥95% domain+application)
      └── E2E Tests (TypeScript)      → Supertest POST/GET; Playwright após frontend

4. [Alternativa — feature UI isolada após API pronta]
   openspec-propose "feat-customer-angular"
   → Frontend Entity (Angular) → … → Frontend Form (Angular)

5. [Auth JWT — somente backend nesta stack Angular]
   Config Auth Core Basic → Config Auth Backend Basic
   (UI de login Angular: implementar manualmente ou change feat-auth-angular)
```

> **Consulte `config-project-fullstack/references/fullstack-stack-matrix.md`** para a tabela completa de decisão de stack e quando usar OpenSpec.

---

## Etapa 1 — Bootstrap Backend + Frontend Angular

### Agent: `Config Project (Angular)`

> Bootstrap monorepo NestJS backend + Angular 17+ standalone com Tailwind CSS, proxy /api, docker-compose. Nome do projeto: clientes-app.

### Etapa 1B — Shell admin (`config-shared-web-angular`)

> Agent: `Config Shared Web (Angular)`

```bash
node .agents/skills/config-shared-web-angular/scripts/init-shared-web-angular.mjs \
  --frontend-path apps/web-angular --theme fuchsia --mode dark
```

Mescle `app.routes.shell.ts` em `app.routes.ts`. Defina `<body class="dark">` no `index.html`.

### Estrutura gerada

```
clientes-app/
├── apps/
│   ├── backend/                    ← NestJS (TypeScript)
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts             ← porta 4000
│   │   │   └── shared/
│   │   │       └── kernel/         ← placeholder para shared kernel
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── test/                   ← E2E API (Supertest)
│   │   │   ├── jest-e2e.json
│   │   │   └── app.e2e-spec.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web-angular/                ← Angular 17+ + Tailwind + shell admin
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout/admin-shell/   ← sidebar + topbar + rodapé
│       │   │   ├── app.config.ts
│       │   │   ├── app.routes.ts
│       │   │   └── app.routes.shell.ts
│       │   └── environments/
│       ├── proxy.conf.json         ← redireciona /api → localhost:4000
│       ├── angular.json
│       └── package.json
├── docker-compose.yml              ← Postgres 16 para dev local
├── playwright.config.ts            ← Playwright (web E2E)
├── e2e/
│   └── smoke.spec.ts
├── .env
├── .env.example
└── package.json                    ← workspaces raiz
```

### Exemplo do `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true
  }
}
```

O proxy está configurado no `angular.json`:

```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

### Verificar que funciona

```bash
# Subir o banco local
docker-compose up -d

# Backend (porta 4000)
cd apps/backend && npm run start:dev

# Frontend (porta 4200, proxy ativo)
cd apps/web-angular && ng serve

# Testar a conexão
curl http://localhost:4200/api/health
# → {"status":"ok"}

# E2E API (Supertest — scaffold do bootstrap)
npm run test:e2e

# E2E web (Playwright — opcional, requer frontend + backend rodando)
npm run test:e2e:web
```

---

## Etapa 2 — Bootstrap Mobile Flutter

### Agent: `Config Project (Flutter)`

> Configure o app Flutter consumindo a API em http://localhost:4000, estrutura clean por feature, Riverpod, Dio, go_router. Nome do app: clientes_app.

### Estrutura gerada

```
mobile-flutter/
├── lib/
│   ├── core/
│   │   ├── network/
│   │   │   └── dio_client.dart     ← Dio configurado com baseUrl
│   │   ├── error/
│   │   │   └── failures.dart
│   │   └── router/
│   │       └── app_router.dart     ← go_router
│   └── features/
│       └── .gitkeep                ← features adicionadas por módulo
├── test/
├── pubspec.yaml
└── .env                            ← API_URL=http://localhost:4000
```

### Exemplo do `pubspec.yaml` (dependências principais)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5
  dio: ^5.4.3
  go_router: ^13.2.1
  flutter_dotenv: ^5.1.0

dev_dependencies:
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.9
  flutter_test:
    sdk: flutter
```

### Exemplo do `dio_client.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DioClient {
  late final Dio _dio;

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: dotenv.env['API_URL'] ?? 'http://localhost:4000',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ),
    );
  }

  Dio get instance => _dio;
}
```

---

## Etapa 3 — Docker e CI/CD (durante o setup)

> **Importante**: Docker e CI/CD fazem parte do bootstrap do projeto — não deixe para o final. O `docker-compose.yml` de **dev** já vem do `Config Project (Angular)`; aqui configuramos **produção** (Dockerfiles multi-stage) e o pipeline GitHub Actions.

### Via OpenSpec (recomendado)

Se você criou a mudança `bootstrap-clientes-app` na Etapa 0, o `tasks.md` deve incluir:

```markdown
- [ ] `infra:setup` Bootstrap Angular monorepo (~2h)
  - **Agent:** `Config Project (Angular)`
  - **Prompt:** "Monorepo NestJS + Angular 17+ + docker-compose dev."

- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent:** `Config Shared Web (Angular)`
  - **Prompt:** "Sidebar, topbar, rodapé, dashboard vazio."

- [ ] `infra:setup` Bootstrap Flutter (~2h)
  - **Agent:** `Config Project (Flutter)`
  - **Prompt:** "App Flutter + Riverpod + Dio."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Dockerfile multi-stage NestJS + docker-compose.prod.yml."

- [ ] `infra:cicd` GitHub Actions (~2h)
  - **Agent:** `Config CI/CD (TypeScript)`
  - **Prompt:** "CI em PR; CD em main."

- [ ] `domain:shared` Shared kernel DDD (~2h)
  - **Agent:** `Config Shared Core`
  - **Prompt:** "Entity, VO, Result<T>, IUseCase, IRepository."
```

**Agent**: `openspec-apply-change`

> Implemente a mudança 'bootstrap-clientes-app'. Tasks pendentes: Config Docker (TypeScript) e Config CI/CD (TypeScript).

### Agent: `Config Docker (TypeScript)`

> Crie os Dockerfiles multi-stage de produção para o projeto clientes-app (NestJS). Projeto backend em `apps/backend/`.

**O que gera** — `apps/backend/Dockerfile`:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace=apps/backend
COPY apps/backend ./apps/backend
RUN npm run build --workspace=apps/backend

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN adduser -u 1001 -D appuser
USER appuser
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

**`.dockerignore`**:

```
node_modules
**/dist
**/.env
**/.env.*
.git
```

**`docker-compose.prod.yml`**:

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
      dockerfile: apps/backend/Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Validar localmente:

```bash
docker build -f apps/backend/Dockerfile -t clientes-app-backend .
docker-compose -f docker-compose.prod.yml up
```

### Agent: `Config CI/CD (TypeScript)`

> Crie os workflows GitHub Actions para clientes-app. Registry: GHCR. Deploy: Fly.io. CI deve falhar se coverage de domain + application for < 95%.

**`.github/workflows/ci.yml`** — executado em todo PR:

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
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npm run test --workspace=apps/backend -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      - name: Coverage gate (domain + application ≥95%)
        run: node scripts/check-coverage.mjs 95 domain application
```

**`.github/workflows/cd.yml`** — push em `main`:

```yaml
name: CD
on:
  push:
    branches: [main]

env:
  IMAGE: ghcr.io/${{ github.repository }}/backend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: |
            ${{ env.IMAGE }}:${{ github.sha }}
            ${{ env.IMAGE }}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app ${{ secrets.FLY_APP_BACKEND }} --image ${{ env.IMAGE }}:${{ github.sha }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Secrets no GitHub** (Settings → Secrets → Actions):

| Secret | Onde obter |
|--------|-----------|
| `FLY_API_TOKEN` | `flyctl auth token` |
| `FLY_APP_BACKEND` | Nome do app em `flyctl apps create` |
| `GITHUB_TOKEN` | Automático — não precisa criar |

> O script `scripts/check-coverage.mjs` é copiado do skill `Config CI/CD (TypeScript)` (`assets/check-coverage.mjs`) e valida **≥95% lines** em paths de domain/application.

> Para stacks Kotlin ou C#, use `Config Docker (Kotlin)`/`Config Docker (C#)` e `Config CI/CD (Kotlin)`/`Config CI/CD (C#)` com os mesmos prompts, ajustando o caminho do projeto.

---

## Etapa 4 — Shared Kernel

### Agent: `Config Shared Core`

> Crie o shared kernel TypeScript com Entity base, ValueObject, Result<T>, IUseCase, IRepository. Localização: apps/backend/src/shared/kernel/.

### Resultado esperado

```
apps/backend/src/shared/kernel/
├── entity.base.ts          ← Entity com id, equals, hashCode
├── value-object.base.ts    ← ValueObject com equals por propriedades
├── result.ts               ← Result<T> para operações seguras
├── use-case.interface.ts   ← IUseCase<TInput, TOutput>
└── repository.interface.ts ← IRepository<T, TId>
```

### Exemplo do `result.ts` gerado

```typescript
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: string,
    public readonly value?: T,
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result<T>(true, undefined, value);
  }

  static fail<T>(error: string): Result<T> {
    return new Result<T>(false, error);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }
}
```

### Exemplo do `entity.base.ts` gerado

```typescript
export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) return false;
    return this._id === entity._id;
  }
}
```

---

## Etapa 5 — OpenSpec: Criar a Mudança para o BC Customers

### Agent: `openspec-propose`

> Crie a mudança 'bc-customers' para implementar o Bounded Context de Clientes com: Customer entity (Name, Email, CPF como VOs), CreateCustomerUseCase, GetCustomerByIdQuery, CustomerRepository (port + adapter Prisma), CustomerController (POST /customers, GET /customers/:id).

### Artefatos gerados pelo OpenSpec

O agent cria os seguintes arquivos em `openspec/changes/bc-customers/`:

**`proposal.md`** — resumo da mudança:

```markdown
# Proposta: bc-customers

## Contexto
Implementar o Bounded Context de Clientes como primeiro BC do sistema clientes-app.

## O que será feito
- Value Objects: CustomerName, Email, CPF com validações
- Entity: Customer (aggregate root)
- Repository: ICustomerRepository (port) + CustomerPrismaRepository (adapter)
- Application: CreateCustomerUseCase, GetCustomerByIdQuery
- DTOs: CreateCustomerInputDto, CustomerOutputDto
- API: CustomerController (POST /customers, GET /customers/:id)

## Justificativa
BC Customers é o core do sistema e não tem dependências externas.

## Status
- [ ] Proposta
- [ ] Design
- [ ] Tasks
- [ ] Em andamento
- [ ] Concluído
```

**`design.md`** — design técnico:

```markdown
# Design Técnico: bc-customers

## Diagrama de camadas

Domain Layer
  Customer (Entity)
    ├── CustomerName (VO) — min 2, max 100 chars, trim
    ├── Email (VO) — RFC 5322, lowercase
    └── CPF (VO) — 11 dígitos, algoritmo verificador

Application Layer
  CreateCustomerUseCase
    input:  CreateCustomerInputDto
    output: Result<CustomerOutputDto>
    regra:  CPF não pode ser duplicado

  GetCustomerByIdQuery
    input:  string (uuid)
    output: Result<CustomerOutputDto | null>

Infrastructure Layer
  CustomerPrismaRepository implements ICustomerRepository
    ← Prisma Client com modelo Customer no schema.prisma

Interface Layer
  CustomerController
    POST   /customers    → CreateCustomerUseCase
    GET    /customers/:id → GetCustomerByIdQuery

## Dependências entre tasks
VO → Entity → Repository port → DTO → UseCase → Infra → Controller
```

**`tasks.md`** — tasks formatadas por agent (**Agent** + **Prompt**):

```markdown
# Tasks: bc-customers

- [ ] `domain:vo` CustomerName, Email, CPF (~2h)
  - **Agent:** `Core Value Object`
  - **Prompt:** "Crie VOs CustomerName, Email e CPF com Create() → Result<T>."

- [ ] `domain:entity` Customer aggregate root (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Aggregate root Customer com VOs; create() e deactivate()."

- [ ] `domain:repository` ICustomerRepository interface (~1h)
  - **Agent:** `Core Repository`
  - **Prompt:** "Port ICustomerRepository: create, findById, findByCPF, findAll."

- [ ] `app:dto` CreateCustomerInputDto, CustomerOutputDto (~1h)
  - **Agent:** `Core DTO`
  - **Prompt:** "DTOs de entrada e saída para Customer."

- [ ] `app:usecase` CreateCustomerUseCase (~2h)
  - **Agent:** `Core Use Case`
  - **Prompt:** "Verifica CPF duplicado; persiste Customer."

- [ ] `app:query` GetCustomerByIdQuery (~1h)
  - **Agent:** `Core Query CQRS`
  - **Prompt:** "Query retornando CustomerOutputDto por ID."

- [ ] `infra:persistence` CustomerPrismaRepository (~2h)
  - **Agent:** `Backend Prisma Data`
  - **Prompt:** "Implemente ICustomerRepository com Prisma."

- [ ] `interface:controller` CustomerController (~2h)
  - **Agent:** `Backend Controller`
  - **Prompt:** "POST /customers e GET /customers/:id."

- [ ] `interface:entity` Customer entity Angular (~1h)
  - **Agent:** `Frontend Entity (Angular)`
  - **Prompt:** "Entidade Customer com Result<T>."

- [ ] `interface:usecase` CreateCustomer + ListCustomers Angular (~2h)
  - **Agent:** `Frontend UseCase (Angular)`
  - **Prompt:** "Use cases injetando ICustomerRepository."

- [ ] `interface:repository` CustomerHttpRepository (~2h)
  - **Agent:** `Frontend Repository (Angular)`
  - **Prompt:** "HTTP para /customers; mapear DTOs."

- [ ] `interface:page` CustomerListComponent (~2h)
  - **Agent:** `Frontend Page (Angular)`
  - **Prompt:** "Listagem PrimeNG DataTable; lazy load."

- [ ] `interface:form-web` CustomerFormComponent (~2h)
  - **Agent:** `Frontend Form (Angular)`
  - **Prompt:** "Reactive Forms; exibe erros de Result."

- [ ] `test:unit` + `test:coverage` VOs, Entity, UseCase ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Mock repository; fluxo feliz e CPF duplicado."

- [ ] `test:e2e` POST/GET /customers (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
  - **Prompt:** "Supertest CRUD; Playwright após frontend."
```

---

## Etapa 6 — OpenSpec Apply: Implementar o BC Customers

### Agent: `openspec-apply-change`

> Implemente a mudança 'bc-customers'.

### Sequência interna do apply

O agent lê o `tasks.md` e aciona cada **Agent** na ordem correta:

#### 1. `Core Value Object` → CustomerName, Email, CPF

```typescript
// apps/backend/src/customers/domain/value-objects/customer-name.vo.ts
export class CustomerName extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: { value: string }) {
    super(props);
  }

  static create(name: string): Result<CustomerName> {
    if (!name || name.trim().length < 2)
      return Result.fail('Nome deve ter ao menos 2 caracteres');
    if (name.trim().length > 100)
      return Result.fail('Nome deve ter no máximo 100 caracteres');
    return Result.ok(new CustomerName({ value: name.trim() }));
  }
}
```

#### 2. `Core Entity` → Customer

```typescript
// apps/backend/src/customers/domain/entities/customer.entity.ts
export class Customer extends Entity<string> {
  private _name: CustomerName;
  private _email: Email;
  private _cpf: CPF;
  private _isActive: boolean;

  private constructor(id: string, name: CustomerName, email: Email, cpf: CPF) {
    super(id);
    this._name = name;
    this._email = email;
    this._cpf = cpf;
    this._isActive = true;
  }

  static create(
    name: string,
    email: string,
    cpf: string,
    id?: string,
  ): Result<Customer> {
    const nameResult = CustomerName.create(name);
    const emailResult = Email.create(email);
    const cpfResult = CPF.create(cpf);

    if (nameResult.isFailure) return Result.fail(nameResult.error!);
    if (emailResult.isFailure) return Result.fail(emailResult.error!);
    if (cpfResult.isFailure) return Result.fail(cpfResult.error!);

    return Result.ok(
      new Customer(
        id ?? crypto.randomUUID(),
        nameResult.value!,
        emailResult.value!,
        cpfResult.value!,
      ),
    );
  }

  get name() { return this._name.value; }
  get email() { return this._email.value; }
  get cpf() { return this._cpf.value; }
  get isActive() { return this._isActive; }

  deactivate(): void { this._isActive = false; }
}
```

#### 3. `Core Repository` → ICustomerRepository

```typescript
// apps/backend/src/customers/domain/repositories/customer.repository.ts
export interface ICustomerRepository {
  create(customer: Customer): Promise<Result<Customer>>;
  findById(id: string): Promise<Result<Customer | null>>;
  findByCPF(cpf: string): Promise<Result<Customer | null>>;
  findAll(page: number, pageSize: number): Promise<Result<Customer[]>>;
  update(customer: Customer): Promise<Result<void>>;
}
```

#### 4. `Core DTO` → CreateCustomerInputDto, CustomerOutputDto

```typescript
export class CreateCustomerInputDto {
  name: string;
  email: string;
  cpf: string;
}

export class CustomerOutputDto {
  id: string;
  name: string;
  email: string;
  cpf: string;
  isActive: boolean;
}
```

#### 5. `Core Use Case` → CreateCustomerUseCase

```typescript
@Injectable()
export class CreateCustomerUseCase
  implements IUseCase<CreateCustomerInputDto, CustomerOutputDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(input: CreateCustomerInputDto): Promise<Result<CustomerOutputDto>> {
    // Verificar duplicata de CPF
    const existing = await this.customerRepo.findByCPF(input.cpf);
    if (existing.value !== null)
      return Result.fail('CPF já cadastrado no sistema');

    // Criar entidade (invariantes validados internamente)
    const customerResult = Customer.create(input.name, input.email, input.cpf);
    if (customerResult.isFailure) return Result.fail(customerResult.error!);

    // Persistir
    const created = await this.customerRepo.create(customerResult.value!);
    if (created.isFailure) return Result.fail(created.error!);

    const c = created.value!;
    return Result.ok({ id: c.id, name: c.name, email: c.email, cpf: c.cpf, isActive: c.isActive });
  }
}
```

#### 6. `Core Query CQRS` → GetCustomerByIdQuery

```typescript
@Injectable()
export class GetCustomerByIdQuery {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Result<CustomerOutputDto | null>> {
    const result = await this.customerRepo.findById(id);
    if (result.isFailure) return Result.fail(result.error!);
    if (!result.value) return Result.ok(null);

    const c = result.value;
    return Result.ok({ id: c.id, name: c.name, email: c.email, cpf: c.cpf, isActive: c.isActive });
  }
}
```

#### 7. `Backend Prisma Data` → CustomerPrismaRepository

```typescript
@Injectable()
export class CustomerPrismaRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Result<Customer>> {
    await this.prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf,
        isActive: customer.isActive,
      },
    });
    return Result.ok(customer);
  }

  async findById(id: string): Promise<Result<Customer | null>> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    if (!row) return Result.ok(null);
    return Result.ok(
      Customer.create(row.name, row.email, row.cpf, row.id).value!,
    );
  }

  async findByCPF(cpf: string): Promise<Result<Customer | null>> {
    const row = await this.prisma.customer.findUnique({ where: { cpf } });
    if (!row) return Result.ok(null);
    return Result.ok(
      Customer.create(row.name, row.email, row.cpf, row.id).value!,
    );
  }

  async findAll(page: number, pageSize: number): Promise<Result<Customer[]>> {
    const rows = await this.prisma.customer.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
    });
    const customers = rows.map(
      (r) => Customer.create(r.name, r.email, r.cpf, r.id).value!,
    );
    return Result.ok(customers);
  }

  async update(customer: Customer): Promise<Result<void>> {
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { name: customer.name, email: customer.email, isActive: customer.isActive },
    });
    return Result.ok(undefined);
  }
}
```

#### 8. `Backend Controller` → CustomerController

```typescript
@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly getCustomerById: GetCustomerByIdQuery,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomerInputDto): Promise<CustomerOutputDto> {
    const result = await this.createCustomer.execute(dto);
    if (result.isFailure) throw new BadRequestException(result.error);
    return result.value!;
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CustomerOutputDto> {
    const result = await this.getCustomerById.execute(id);
    if (result.isFailure) throw new InternalServerErrorException(result.error);
    if (!result.value) throw new NotFoundException('Cliente não encontrado');
    return result.value;
  }
}
```

### Testar a API

```bash
# Criar cliente
curl -X POST http://localhost:4000/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@example.com","cpf":"12345678901"}'
# → {"id":"uuid...","name":"João Silva","email":"joao@example.com","cpf":"12345678901","isActive":true}

# Buscar por ID
curl http://localhost:4000/customers/uuid-gerado
# → {"id":"uuid...","name":"João Silva",...}
```

### Qualidade: testes unitários e E2E

Após implementar o BC, acione os agents de qualidade **antes** de arquivar a mudança OpenSpec:

#### Agent: `Unit Tests (TypeScript)`

> Crie testes unitários para o BC Customers: CPF VO (validação), Customer entity (create/deactivate), CreateCustomerUseCase (CPF duplicado). Meta: ≥95% lines em `domain/` e `application/`.

```bash
npm test --workspace=apps/backend -- --coverage
node scripts/check-coverage.mjs 95 domain application
```

#### Agent: `E2E Tests (TypeScript)`

> Gere e ajuste specs E2E para o BC Customers após o controller estar pronto.

```bash
node test-e2e/scripts/create-e2e-spec.mjs customers \
  --template crud \
  --create-fields name,email,cpf \
  --assert-field email \
  --web \
  --module-label Clientes

npm run test:e2e
npm run test:e2e:web   # após frontend Angular pronto
```

---

## Etapa 7 — Frontend Angular: Domínio + Listagem + Formulário

### Proposta da mudança

### Agent: `openspec-propose`

> Crie a mudança 'feat-customer-angular' para implementar clientes no Angular com Clean Architecture: Frontend Entity (Angular), Frontend UseCase (Angular), Frontend Repository (Angular), Frontend Page (Angular) e Frontend Form (Angular) — uma task por camada no tasks.md.

### Implementação

### Agent: `openspec-apply-change`

> Implemente a mudança 'feat-customer-angular'.

O apply aciona cada **Agent** (domínio → aplicação → infra → apresentação):

#### 1. `Frontend Entity (Angular)` → Customer entity + Result

#### 2. `Frontend UseCase (Angular)` → CreateCustomerUseCase, ListCustomersUseCase

#### 3. `Frontend Repository (Angular)` → CustomerHttpRepository

#### 4. `Frontend Page (Angular)` → CustomerListComponent

```typescript
// apps/web-angular/src/app/features/customers/list/customer-list.component.ts
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [TableModule, ButtonModule, RouterLink, AsyncPipe],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-3">
        <h2>Clientes</h2>
        <p-button label="Novo Cliente" icon="pi pi-plus"
                  [routerLink]="['/customers/new']" />
      </div>

      <p-table
        [value]="customers()"
        [loading]="loading()"
        [lazy]="true"
        (onLazyLoad)="onLazyLoad($event)"
        [totalRecords]="total()"
        [paginator]="true"
        [rows]="10"
        styleClass="p-datatable-striped"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">Nome <p-sortIcon field="name"/></th>
            <th>Email</th>
            <th>CPF</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-customer>
          <tr>
            <td>{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.cpf }}</td>
            <td>
              <p-tag [severity]="customer.isActive ? 'success' : 'danger'"
                     [value]="customer.isActive ? 'Ativo' : 'Inativo'" />
            </td>
            <td>
              <p-button icon="pi pi-eye" [text]="true" size="small"
                        [routerLink]="['/customers', customer.id]" />
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class CustomerListComponent {
  private readonly customerService = inject(CustomerService);

  customers = signal<CustomerOutputDto[]>([]);
  loading = signal(false);
  total = signal(0);

  onLazyLoad(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.loading.set(true);
    this.customerService.findAll(page, event.rows ?? 10).subscribe({
      next: (res) => {
        this.customers.set(res.data);
        this.total.set(res.total);
      },
      complete: () => this.loading.set(false),
    });
  }
}
```

#### 5. `Frontend Form (Angular)` → CustomerFormComponent

```typescript
// apps/web-angular/src/app/features/customers/form/customer-form.component.ts
@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, CardModule],
  template: `
    <p-card header="Novo Cliente">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="flex flex-column gap-3">

          <div class="flex flex-column gap-1">
            <label for="name">Nome</label>
            <input pInputText id="name" formControlName="name"
                   [ngClass]="{'ng-invalid ng-dirty': isInvalid('name')}" />
            <small class="p-error" *ngIf="isInvalid('name')">
              Nome obrigatório (mín. 2 caracteres)
            </small>
          </div>

          <div class="flex flex-column gap-1">
            <label for="email">Email</label>
            <input pInputText id="email" type="email" formControlName="email"
                   [ngClass]="{'ng-invalid ng-dirty': isInvalid('email')}" />
            <small class="p-error" *ngIf="isInvalid('email')">Email inválido</small>
          </div>

          <div class="flex flex-column gap-1">
            <label for="cpf">CPF</label>
            <input pInputText id="cpf" formControlName="cpf"
                   placeholder="000.000.000-00"
                   [ngClass]="{'ng-invalid ng-dirty': isInvalid('cpf')}" />
            <small class="p-error" *ngIf="isInvalid('cpf')">CPF inválido</small>
          </div>

          <div class="flex justify-content-end gap-2 mt-2">
            <p-button label="Cancelar" severity="secondary" [outlined]="true"
                      [routerLink]="['/customers']" type="button" />
            <p-button label="Salvar" type="submit"
                      [loading]="saving()" [disabled]="form.invalid" />
          </div>

        </div>
      </form>
    </p-card>
  `,
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  saving = signal(false);

  form = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    cpf:   ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.customerService.create(this.form.value as CreateCustomerInputDto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Cliente cadastrado!' });
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: err.error?.message ?? 'Erro ao salvar' });
        this.saving.set(false);
      },
    });
  }
}
```

---

## Etapa 8 — Mobile Flutter: Domínio + Tela + Formulário

### Proposta da mudança

### Agent: `openspec-propose`

> Crie a mudança 'feat-customer-flutter' para clientes no Flutter: Mobile Entity (Flutter), Mobile UseCase (Flutter), Mobile Repository (Flutter), Mobile Screen (Flutter) e Mobile Form (Flutter).

### Implementação

### Agent: `openspec-apply-change`

> Implemente 'feat-customer-flutter'.

O apply aciona cada **Agent** (domínio → aplicação → infra → apresentação):

#### 1. `Mobile Entity (Flutter)` → Customer entity + sealed Result

#### 2. `Mobile UseCase (Flutter)` → CreateCustomerUseCase, ListCustomersUseCase

#### 3. `Mobile Repository (Flutter)` → CustomerRepositoryImpl (Dio)

#### 4. `Mobile Screen (Flutter)` → CustomerListPage

```dart
// mobile-flutter/lib/features/customers/presentation/pages/customer_list_page.dart
@riverpod
class CustomerListNotifier extends _$CustomerListNotifier {
  @override
  Future<List<CustomerDto>> build() async {
    return ref.read(customerRepositoryProvider).findAll(page: 1, pageSize: 20);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(customerRepositoryProvider).findAll(page: 1, pageSize: 20),
    );
  }
}

class CustomerListPage extends ConsumerWidget {
  const CustomerListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customerListNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/customers/new'),
        child: const Icon(Icons.add),
      ),
      body: customersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (customers) => RefreshIndicator(
          onRefresh: () => ref.read(customerListNotifierProvider.notifier).refresh(),
          child: ListView.builder(
            itemCount: customers.length,
            itemBuilder: (context, index) {
              final c = customers[index];
              return ListTile(
                title: Text(c.name),
                subtitle: Text(c.email),
                trailing: Icon(
                  c.isActive ? Icons.check_circle : Icons.cancel,
                  color: c.isActive ? Colors.green : Colors.red,
                ),
                onTap: () => context.push('/customers/${c.id}'),
              );
            },
          ),
        ),
      ),
    );
  }
}
```

#### 5. `Mobile Form (Flutter)` → CustomerFormPage

```dart
// mobile-flutter/lib/features/customers/presentation/pages/customer_form_page.dart
class CustomerFormPage extends ConsumerStatefulWidget {
  const CustomerFormPage({super.key});

  @override
  ConsumerState<CustomerFormPage> createState() => _CustomerFormPageState();
}

class _CustomerFormPageState extends ConsumerState<CustomerFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _cpfCtrl = TextEditingController();
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Novo Cliente')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(labelText: 'Nome'),
                validator: (v) =>
                    (v == null || v.trim().length < 2) ? 'Nome inválido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (v) =>
                    (v == null || !v.contains('@')) ? 'Email inválido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cpfCtrl,
                decoration: const InputDecoration(labelText: 'CPF (somente números)'),
                keyboardType: TextInputType.number,
                validator: (v) =>
                    (v == null || v.length != 11) ? 'CPF deve ter 11 dígitos' : null,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _saving ? null : _submit,
                  child: _saving
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Salvar'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(customerRepositoryProvider).create(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        cpf: _cpfCtrl.text.trim(),
      );
      if (mounted) context.pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}
```

---

## Resultado Final — Estrutura do Projeto

Após todas as etapas, o repositório terá a seguinte estrutura:

```
clientes-app/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── customers/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/      ← Customer.entity.ts
│   │   │   │   │   ├── value-objects/ ← CustomerName, Email, CPF
│   │   │   │   │   └── repositories/  ← ICustomerRepository
│   │   │   │   ├── application/
│   │   │   │   │   ├── dtos/          ← CreateCustomerInputDto, CustomerOutputDto
│   │   │   │   │   ├── use-cases/     ← CreateCustomerUseCase
│   │   │   │   │   └── queries/       ← GetCustomerByIdQuery
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── persistence/   ← CustomerPrismaRepository
│   │   │   │   └── interface/
│   │   │   │       └── http/          ← CustomerController
│   │   │   └── shared/
│   │   │       └── kernel/            ← Entity, ValueObject, Result<T>
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── Dockerfile                 ← multi-stage produção
│   └── web-angular/
│       └── src/app/features/customers/
│           ├── list/  ← CustomerListComponent
│           └── form/  ← CustomerFormComponent
├── mobile-flutter/
│   └── lib/features/customers/
│       └── presentation/pages/
│           ├── customer_list_page.dart
│           └── customer_form_page.dart
├── openspec/
│   └── changes/
│       ├── bootstrap-clientes-app/    ← inclui docker + cicd no setup
│       ├── bc-customers/
│       ├── feat-customer-angular/
│       └── feat-customer-flutter/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml
└── .env.example
```

---

## Checklist do Projeto

```
Bootstrap
- [ ] openspec-propose "bootstrap-clientes-app" executado
- [ ] Config Project (Angular): monorepo NestJS + Angular criado
- [ ] Config Shared Web (Angular): shell Tailwind configurado
- [ ] Scaffold E2E: `test/jest-e2e.json`, `playwright.config.ts`, `npm run test:e2e` passa
- [ ] Config Project (Flutter): app Flutter criado
- [ ] Config Docker (TypeScript): Dockerfile multi-stage + docker-compose.prod.yml
- [ ] Config CI/CD (TypeScript): GitHub Actions CI + CD configurados
- [ ] Config Shared Core: Entity, ValueObject, Result<T> disponíveis
- [ ] docker-compose up -d: banco Postgres rodando (dev)
- [ ] docker build testado localmente

BC Customers (backend + frontend + mobile)
- [ ] openspec-propose "bc-customers" executado: proposal.md, design.md, tasks.md criados
- [ ] openspec-apply-change "bc-customers" executado
- [ ] VOs: CustomerName, Email, CPF com validações
- [ ] Entity Customer: create() factory, deactivate()
- [ ] ICustomerRepository: interface definida
- [ ] DTOs: CreateCustomerInputDto, CustomerOutputDto
- [ ] CreateCustomerUseCase: verifica CPF duplicado
- [ ] GetCustomerByIdQuery
- [ ] CustomerPrismaRepository: findById, findByCPF, findAll, create
- [ ] CustomerController: POST /customers, GET /customers/:id
- [ ] Migration Prisma aplicada

Qualidade (BC Customers)
- [ ] **Agent `Unit Tests (TypeScript)`**: testes de VOs, Entity, CreateCustomerUseCase
- [ ] Coverage ≥95% domain+application (`npm test` + `scripts/check-coverage.mjs`)
- [ ] **Agent `E2E Tests (TypeScript)`**: `create-e2e-spec.mjs customers --template crud --web`

Frontend Angular
- [ ] Frontend Entity (Angular): Customer entity + Result<T>
- [ ] Frontend UseCase (Angular): CreateCustomerUseCase, ListCustomersUseCase
- [ ] Frontend Repository (Angular): CustomerHttpRepository (HttpClient)
- [ ] Frontend Page (Angular): CustomerListComponent — p-table lazy loading
- [ ] Frontend Form (Angular): CustomerFormComponent — Reactive Forms + validações
- [ ] Rotas configuradas: /customers, /customers/new

Mobile Flutter
- [ ] Mobile Entity (Flutter): Customer entity + sealed Result
- [ ] Mobile UseCase (Flutter): CreateCustomerUseCase, ListCustomersUseCase
- [ ] Mobile Repository (Flutter): CustomerRepositoryImpl (Dio)
- [ ] Mobile Screen (Flutter): CustomerListPage — Riverpod + RefreshIndicator
- [ ] Mobile Form (Flutter): CustomerFormPage — validações + submit
```

---

## Próximos Passos

- **[Tutorial 04 — Ciclo OpenSpec](../04-ciclo-completo-openspec.md)** — Integrar análise → stack → archive de mudanças
- **[Backend incremental](./backend-incremental.md)** — Migração módulo a módulo (Strangler Fig) sem refazer o full-stack
- **Outras combinações** — [Hub Full-Stack](../02-fullstack-project-setup.md#matriz-de-combinações)

> Consulte `config-project-fullstack/references/fullstack-stack-matrix.md` para comparar stacks.
