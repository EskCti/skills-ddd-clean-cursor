# Unit Test Pattern (TypeScript)

## Meta de cobertura

| Escopo | Mínimo | Enforced |
|--------|--------|----------|
| Domain + Application (por módulo/BC) | **95% lines** | `jest.config.ts` + CI |
| Infrastructure / Controllers | ≥80% | Recomendado |
| Presentation (frontend) | ≥70% | Recomendado |

Consultar `../skills-standards.md` seção **Test Coverage Standard**.

## Paths de teste

```
packages/<module>/core/test/
├── entity/<name>.entity.test.ts
├── vo/<name>.vo.test.ts
├── use-case/<name>.use-case.test.ts
└── queries/<name>.query.test.ts

apps/backend/src/<module>/
├── domain/...
├── application/...
└── test/ (ou packages separados)
```

## O que testar (por camada)

### Value Object (`domain:vo`)

- Create/tryCreate com input **válido** → sucesso
- Inputs **inválidos** (vazio, formato, limites) → erro com mensagem
- Normalização (trim, lowercase) quando aplicável
- Igualdade por valor (`equals`)

### Entity (`domain:entity`)

- Factory `create`/`tryCreate` válido
- Invariantes violadas (VOs inválidos combinados)
- Métodos de domínio (`deactivate`, transições de estado)
- Igualdade por `id` (não por todos os campos)
- `cloneWith` reaplica validação

### Use Case (`app:usecase`)

- Fluxo feliz (mock de repository retorna esperado)
- Regras de negócio (duplicata, not found, unauthorized)
- Repository falha → erro propagado como `Result.fail`
- Verificar que **repository foi chamado** com args corretos

### Query CQRS (`app:query`)

- Retorno correto por ID existente
- `null` ou empty quando não encontrado
- Paginação/filtros quando aplicável

## jest.config.ts (padrão)

```typescript
import type { Config } from 'jest';

const COVERAGE_MIN = 95;

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/test/'],
  coverageThreshold: {
    global: {
      lines: COVERAGE_MIN,
      branches: COVERAGE_MIN,
      functions: COVERAGE_MIN,
      statements: COVERAGE_MIN,
    },
  },
};

export default config;
```

Para módulos com pastas `domain/` e `application/` explícitas, restringir `collectCoverageFrom`:

```typescript
collectCoverageFrom: [
  'src/**/domain/**/*.ts',
  'src/**/application/**/*.ts',
  'src/**/entity/**/*.ts',
  'src/**/vo/**/*.ts',
  'src/**/use-case/**/*.ts',
  'src/**/use-cases/**/*.ts',
  'src/**/queries/**/*.ts',
  '!src/**/index.ts',
],
```

## Scripts package.json

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage && node ../../scripts/check-coverage.mjs 95 domain application entity vo use-case use-cases queries"
  }
}
```

## Checklist por BC

- [ ] Todo VO público tem teste de válido + inválido
- [ ] Entity tem teste de factory + métodos de domínio
- [ ] UseCase tem teste feliz + pelo menos 1 cenário de erro de negócio
- [ ] Repository mockado (nunca banco real em unit test)
- [ ] `npm test` passa com coverage ≥95% no escopo domain+application
- [ ] CI (`config-cicd`) executa coverage gate

## Anti-patterns

- Testar implementação de framework (Nest decorators, Prisma client real)
- Assert apenas `toBeDefined()` sem validar comportamento
- Testes que dependem de ordem de execução
- Ignorar branches (`if/else`) — cobrir ambos os caminhos
