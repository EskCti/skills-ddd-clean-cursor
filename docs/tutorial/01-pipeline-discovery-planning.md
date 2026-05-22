# Tutorial 01 — Pipeline de Requisitos e Planejamento

Agents usados: `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → **`delivery-profile`** → `req-agile-planning`

**Cenário**: Sistema legado PHP (`loja-php`) com clientes, produtos e pedidos. A análise de **domínio** é agnóstica de linguagem, mas o pipeline exige **inventário de entrega** (`delivery-inventory.md` → `delivery-profile.md`) antes do backlog — senão o planejamento vira só API/backend. A stack (ex.: C# + Vue + Android) é fixada no perfil de entrega; ver [Hub Full-Stack](./02-fullstack-project-setup.md).

### Após o backlog — qual caminho?

| Caminho | Stack exemplo | Tutorial de implementação |
|---------|---------------|---------------------------|
| **Incremental** (Strangler Fig) | ASP.NET Core (C#) só API | [backend-incremental](./stacks/backend-incremental.md) — `delivery-profile.md` com Web/Mobile = Nenhum |
| **Full-stack C# + Vue + Android** | RetailOps / loja-php | [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) + [Tutorial 04](./04-ciclo-completo-openspec.md) |
| **Full-stack TS** | NestJS + Vue + Flutter | [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) ou [Tutorial 04](./04-ciclo-completo-openspec.md) |

> **Causa raiz de backlog incompleto**: análise só de domínio/API, sem `delivery-inventory.md` + `delivery-profile.md` antes do `req-agile-planning`. O pipeline abaixo corrige isso.

### Leitura recomendada antes de começar

- [README — DDD vs CA](./README.md#ddd-backend-vs-clean-architecture-webmobile)
- [README — Como usar agents no Cursor](./README.md#como-usar-agents-no-cursor)
- [README — Checklist antes do código](./README.md#checklist-antes-do-código)

---

## Etapa 1 — req-discovery: Analisar o Sistema Legado

**Objetivo**: Extrair requisitos funcionais, regras de negócio e mapeamento DDD do sistema existente.

### Como acionar o agent

**Agent**: **Requirement Discovery** (`req-discovery`)

No Cursor, selecione o agent pelo `display_name` acima ou cite `@req-discovery`:

> Analise o sistema legado em `/home/projetos/loja-php` e extraia os requisitos funcionais, regras de negócio e mapeamento DDD para reimplementação em DDD/Clean Architecture (stack a definir no planejamento).

### O que o agent faz

1. Escaneia a estrutura de diretórios do projeto PHP
2. Identifica: stack (Laravel), modelos, rotas, services, migrations
3. Mapeia as entidades: `Cliente`, `Produto`, `Pedido`, `ItemPedido`
4. Traduz MVC → DDD:

```
PHP (fonte)              DDD/Clean (saída)
─────────────────────────────────────────
app/Models/Cliente.php → Entity Customer + Repository port
app/Http/Controllers/  → Use Cases
FormRequest/           → Value Objects + DTOs
database/migrations/   → Infrastructure (schema)
app/Services/          → Domain Services ou Use Cases
```

5. Identifica Bounded Contexts pelo prefixo das rotas:
   - `/api/auth/*` → BC Auth
   - `/api/clientes/*` → BC Customers
   - `/api/produtos/*` → BC Catalog
   - `/api/pedidos/*` → BC Orders

### Artefatos gerados

```
docs/discovery/loja-php/
├── requirements.md         ← requisitos funcionais e não-funcionais
├── ddd-analysis.md           ← bounded contexts, entities, VOs, use cases
├── delivery-inventory.md     ← superfícies web/mobile/API por área (obrigatório se houver UI)
├── screens.md                ← rotas/telas (quando aplicável)
└── domain-model.md           ← mapeamento técnico detalhado
```

### Exemplo de saída — ddd-analysis.md (trecho)

```markdown
## BC-001: Customers

### Entities
| Entity   | Atributos             | Aggregate Root? |
|----------|-----------------------|-----------------|
| Customer | id, name, email, cpf  | Sim             |
| Address  | street, city, zipCode | Não             |

### Value Objects
| VO           | Validação                    |
|--------------|------------------------------|
| Email        | formato, lowercase           |
| CPF          | 11 dígitos + verificadores   |
| CustomerName | não vazio, 2-100 chars       |

### Use Cases
| Use Case         | Tipo    |
|------------------|---------|
| CreateCustomer   | comando |
| FindCustomerById | query   |
| ListCustomers    | query   |
```

---

## Etapa 2 — req-ddd-modeling: Aprofundar a Modelagem DDD

**Objetivo**: Aplicar o Roadmap DDD (Estratégico → Tático → Operacional) sobre os requisitos levantados — **domínio no backend** + **apresentação** web/mobile por BC.

**Agent**: **DDD Modeling** (`req-ddd-modeling`)

### Como acionar

> Aplique o Roadmap DDD sobre `docs/discovery/loja-php/requirements.md`, `ddd-analysis.md` e `delivery-inventory.md`. No `ddd-tactical-model.md`, inclua **Superfícies de entrega** e seções **Apresentação — Web admin** / **Apresentação — Mobile** quando aplicável (ver `req-ddd-modeling/references/client-presentation-model.md`).

### O que o agent faz

**Fase Estratégica** — classifica os subdomínios:

```
┌─────────────────────────────────────────────────────┐
│               SUBDOMÍNIOS — Loja PHP                │
├──────────────────┬───────────┬──────────────────────┤
│ Subdomínio       │ Tipo      │ Estratégia           │
├──────────────────┼───────────┼──────────────────────┤
│ Vendas (Pedidos) │ Core      │ Build                │
│ Precificação     │ Core      │ Build                │
│ Catálogo         │ Supporting│ Build                │
│ Clientes         │ Supporting│ Build                │
│ Autenticação     │ Generic   │ Build (simplificado) │
│ Notificações     │ Generic   │ Outsource            │
└──────────────────┴───────────┴──────────────────────┘
```

**Context Map** com relações tipadas:

```
┌─────────────────────────────────────────────────────────┐
│                      CONTEXT MAP                         │
│                                                          │
│  ┌────────┐   [OHS]   ┌────────┐   [ACL]   ┌─────────┐ │
│  │  Auth  │──────────▶│Customers│──────────▶│  Orders │ │
│  │(Generic)│           │(Support)│           │  (Core) │ │
│  └────────┘           └─────────┘           └────┬────┘ │
│                                                   │      │
│                              [Upstream/Downstream]│      │
│                                                   ▼      │
│  ┌─────────┐                              ┌──────────┐   │
│  │ Catalog │◀────────[Shared Kernel]──────│ Pricing  │   │
│  │(Support)│                              │  (Core)  │   │
│  └─────────┘                              └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Fase Tática** — para cada BC: domínio (backend) + superfícies + **modelo de apresentação** (web/mobile):

```markdown
## BC: Identity & Access

### Domínio (backend)
Value Objects: Email, PermissionCode
Entities: User (root), PermissionGrant
Repository: IUserRepository
Use cases (API): AuthenticateUser, AssignPermissions

### Superfícies de entrega
| API | Web admin | Mobile |
| Sim | Sim       | Sim    |

### Apresentação — Web admin
| Rota | Ação | API |
| /login | login | POST /api/auth/login |
| /users/permissions | editar permissões | GET/PUT …/permissions |

### Apresentação — Mobile
| Tela | Ação | API |
| ProfileScreen | ver perfil | GET /api/me |
```

> Detalhe: `req-ddd-modeling/references/client-presentation-model.md`. Sem apresentação, o backlog tende a vir só com `interface:page`.

**Fase Operacional** — recomenda topologia:

> Recomendação: **Monólito Modular** (1 módulo = 1 BC). Migrar para microserviços apenas quando BCs Core tiverem cargas diferenciadas ou times separados.

### Artefatos gerados

```
docs/modeling/loja-php/
├── ddd-strategic-model.md   ← subdomínios, BCs, context map, linguagem ubíqua
├── ddd-tactical-model.md    ← domínio + superfícies + Apresentação Web/Mobile por BC
└── ddd-operational-notes.md ← topologia recomendada, sequência de implementação
```

---

## Etapa 3 — req-migration-strategy: Plano de Migração do Legado

**Objetivo**: Definir como migrar o legado em produção sem Big Bang (opcional se não for legado).

**Agent**: **Migration Strategy** (`req-migration-strategy`)

### Como acionar

> Defina a estratégia de migração do PHP em `docs/discovery/loja-php/` para DDD/Clean Architecture (stack fixada depois no `delivery-profile.md`). Ex.: Strangler Fig, 500 usuários ativos.

### O que o agent faz

**Diagnóstico do legado**:

```
┌────────────────────────────────────────────────┐
│            DIAGNÓSTICO — Loja PHP              │
├─────────────────────┬──────────────────────────┤
│ Cobertura de testes │ ~5% → risco alto         │
│ Acoplamento         │ Eloquent em controllers   │
│ Banco compartilhado │ Sim — todas as tabelas    │
│ Usuários ativos     │ 500 → Big Bang descartado │
│ Integrações         │ Gateway de pagamento      │
└─────────────────────┴──────────────────────────┘
```

**Padrão recomendado**: Strangler Fig

**Sequência de migração**:

```
Fase 0: Bootstrap novo projeto + ACL setup            (1 sprint)
Fase 1: BC Auth → migrar autenticação                   (1 sprint)
Fase 2: BC Customers → menor acoplamento                (2 sprints)
Fase 3: BC Catalog → produtos e categorias              (2 sprints)
Fase 4: BC Orders + Pricing → Core, mais complexo       (3 sprints)
Desligamento do legado                                   (após Fase 4)
```

**ACL desenhada** para o BC Orders (lê pedidos do legado durante transição):

```
Legado PHP            ACL (novo backend)      Novo Domínio
─────────────         ──────────────────      ─────────────
pedidos (MySQL)  →    LegacyOrderAdapter  →   Order Entity
{ cd_pedido,          LegacyOrderMapper       { id, items,
  vl_total,           translate()              total (Money),
  dt_pedido }                                  status }
```

### Artefatos gerados

```
docs/migration/loja-php/
├── migration-strategy.md   ← padrão Strangler Fig, sequência, plano de coexistência
└── acl-design.md           ← mapeamento de campos legado → VOs/Entities do domínio
```

---

## Etapa 3.5 — Perfil de entrega (antes do backlog)

**Objetivo**: Fixar stack e **quais BCs terão web e mobile**, para o backlog não virar “só backend”.

**Agent**: **Agile Planning** (Fase 0 do skill) ou prompt manual com template em `req-agile-planning/references/delivery-profile.md`.

### Como acionar

> Com base em `delivery-inventory.md` e no MVP, crie `docs/planning/loja-php/delivery-profile.md`. **RetailOps (este repo)**: ASP.NET Core + Vue 3 + Android. **Walkthrough TS (Tutorial 04)**: NestJS + Vue + Flutter. Tabela **API | Web admin | Mobile** por BC.

### Artefato

```
docs/planning/loja-php/delivery-profile.md
```

Ver template: `req-agile-planning/references/delivery-profile.md`.

---

## Etapa 4 — req-agile-planning: Gerar o Backlog full-stack

**Objetivo**: Transformar o modelo DDD em épicos, stories e tasks **por camada** (backend + web + mobile conforme `delivery-profile.md`).

**Agent**: **Agile Planning** (`req-agile-planning`)

### Como acionar

> Leia `delivery-profile.md` e `ddd-tactical-model.md` (Apresentação Web/Mobile). Gere `backlog.md` com stack **do perfil** (não agnóstico). Para **cada US** com Web=Sim: subseção **Telas e fluxos (web)** + tasks `Frontend Entity` → … → `Frontend Page`. Para Mobile=Sim: **Telas e fluxos (mobile)** + `Mobile Entity` → … → `Mobile Screen`. EP-000 full-stack. Validar [checklist do README](./README.md#checklist-antes-do-código).

> **Não** use backlog “agnóstico”, US sem **Telas e fluxos**, nem só `Backend Controller` + `Frontend Page`.

### O que o agent faz

Cria épicos a partir dos Bounded Contexts + épico técnico de bootstrap:

```
EP-000 [TECH]: Bootstrap e Infraestrutura
EP-001: BC Auth & Usuários
EP-002: BC Customers (Clientes)
EP-003: BC Catalog (Catálogo de Produtos)
EP-004: BC Orders + Pricing (Pedidos + Precificação)
```

Para cada story, gera tasks **inside-out** com **Agent** (`display_name`) e **Prompt**:

```markdown
## EP-002: BC Customers

### US-004: Cadastro de Cliente

> Como atendente, quero cadastrar clientes, para registrar novos compradores.

**Critérios de Aceitação:**
- Dado nome válido e CPF válido, quando cadastrar, então cliente criado com id
- Dado CPF já cadastrado, quando cadastrar, então retornar erro "CPF já existe"
- Dado atendente em `/customers/new`, quando salvar, então lista atualizada

### Telas e fluxos (web)

| Rota | Persona | Ação | API |
| `/customers` | atendente | listar | GET /api/customers |
| `/customers/new` | atendente | cadastrar | POST /api/customers |

**Tasks:**
- [ ] `domain:vo` Criar VO Email (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie Email VO com validação de formato."
- [ ] `domain:vo` Criar VO CPF com validação de dígitos (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie CPF VO com algoritmo de dígitos verificadores."
- [ ] `domain:vo` Criar VO CustomerName (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie CustomerName VO: 2-100 chars, trim."
- [ ] `domain:entity` Criar entidade Customer com VOs (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root Customer com Email, CPF, CustomerName."
- [ ] `domain:repository` Criar ICustomerRepository (~1h)
  - **Agent:** `Core Repository (C#)`
  - **Prompt:** "Interface ICustomerRepository: create, findById, findByCpf."
- [ ] `app:dto` Criar CreateCustomerInDto e CustomerOutDto (~1h)
  - **Agent:** `Core DTO (C#)`
  - **Prompt:** "DTOs de entrada e saída para Customer."
- [ ] `app:usecase` Criar CreateCustomerUseCase (~2h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "Verifica CPF duplicado; cria Customer; persiste."
- [ ] `app:query` Criar FindCustomerByIdQuery (~1h)
  - **Agent:** `Core Query CQRS (C#)`
  - **Prompt:** "Query retornando CustomerOutDto por ID."
- [ ] `infra:persistence` Criar CustomerEfRepository (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "EF Core implementando ICustomerRepository."
- [ ] `infra:migration` Criar migration Customers (~1h)
  - **Agent:** `Config EF Core (C#)`
  - **Prompt:** "Migration tabela Customers."
- [ ] `interface:controller` Criar CustomerController (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "POST /api/customers e GET /api/customers/{id}."
- [ ] `interface:entity` … `interface:repository` … `interface:page` … *(se Web=Sim no delivery-profile)*
  - Ver bloco completo no template de `req-agile-planning` (EP-001 no backlog RetailOps é o exemplo corrigido).
- [ ] `test:unit` Testes de Customer, CPF, Email (~2h)
  - **Agent:** `Unit Tests (C#)`
  - **Prompt:** "Mock repository; fluxo feliz e CPF duplicado."
- [ ] `test:coverage` Validar ≥95% domain+application (~30min)
  - **Agent:** `Unit Tests (C#)`
  - **Prompt:** "Executar coverage; ajustar até ≥95%."
- [ ] `test:e2e` POST /api/customers → GET /api/customers/{id} (~2h)
  - **Agent:** `E2E Tests (C#)`
  - **Prompt:** "WebApplicationFactory; POST criar → GET buscar."
```

### Artefatos gerados

```
docs/planning/loja-php/
├── delivery-profile.md  ← stack + API/Web/Mobile por BC (ANTES do backlog)
├── backlog.md           ← épicos + stories + tasks com Agent + Prompt (full-stack)
└── epics-summary.md     ← visão executiva com estimativas
```

---

## Resumo do Pipeline

```
req-discovery           req-ddd-modeling        req-migration-strategy   delivery-profile      req-agile-planning
(análise legado)   →    (BCs, tático)     →   (Strangler, ACL)    →   (stack+superfícies) → (backlog full-stack)
requirements.md         ddd-strategic-model     migration-strategy.md    delivery-profile.md   backlog.md
delivery-inventory.md   ddd-tactical-model      acl-design.md                                  epics-summary.md
ddd-analysis.md         (+ superfícies/BC)
screens.md
domain-model.md
```

> Próximo passo: [Tutorial 02 — Hub Full-Stack](./02-fullstack-project-setup.md) → escolher combinação em [`stacks/`](./stacks/README.md)

> Migração incremental (só backend): [Backend incremental](./stacks/backend-incremental.md)

> Ciclo integrado com OpenSpec: [Tutorial 04](./04-ciclo-completo-openspec.md)
