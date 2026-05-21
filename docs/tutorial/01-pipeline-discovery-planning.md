# Tutorial 01 — Pipeline de Requisitos e Planejamento

Agents usados: `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → `req-agile-planning`

**Cenário**: Sistema legado PHP/Laravel (`loja-php`) com clientes, produtos e pedidos. A análise `req-*` é **agnóstica de stack** — a combinação backend + frontend + mobile é escolhida depois no [Hub Full-Stack](./02-fullstack-project-setup.md).

### Após o backlog — qual caminho?

| Caminho | Stack exemplo | Tutorial de implementação |
|---------|---------------|---------------------------|
| **Incremental** (Strangler Fig) | ASP.NET Core (C#) | [backend-incremental](./stacks/backend-incremental.md) |
| **Full-stack legado** | NestJS + Vue + Flutter | [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) ou [Tutorial 04](./04-ciclo-completo-openspec.md) |

> **Neste tutorial 01**, os exemplos de `req-agile-planning` usam sufixo **`-cs`** (caminho incremental C#). Se escolher NestJS, as mesmas tasks aparecem **sem sufixo** — ver [Tutorial 04](./04-ciclo-completo-openspec.md).

---

## Etapa 1 — req-discovery: Analisar o Sistema Legado

**Objetivo**: Extrair requisitos funcionais, regras de negócio e mapeamento DDD do sistema existente.

### Como acionar o agent

No Cursor, abra o agente **"Requirement Discovery"** ou use o skill diretamente:

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
├── requirements.md      ← requisitos funcionais e não-funcionais
├── ddd-analysis.md      ← bounded contexts, entities, VOs, use cases
└── domain-model.md      ← mapeamento técnico detalhado
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

**Objetivo**: Aplicar o Roadmap DDD (Estratégico → Tático → Operacional) sobre os requisitos levantados.

### Como acionar

> Aplique o Roadmap DDD sobre os requisitos em `docs/discovery/loja-php/requirements.md` e `ddd-analysis.md`. Classifique os subdomínios, construa o context map com relações tipadas e documente a linguagem ubíqua.

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

**Fase Tática** — para cada BC, identifica VOs, Entities, Aggregates, Domain Events:

```markdown
## BC: Orders (Pedidos)

Value Objects: Money, Quantity, OrderStatus
Entities: Order (root), OrderItem
Aggregates: Order → [OrderItem]
Domain Services: DiscountPolicy, ShippingCalculator
Domain Events: OrderPlaced, OrderCancelled, PaymentConfirmed
Repository: IOrderRepository
```

**Fase Operacional** — recomenda topologia:

> Recomendação: **Monólito Modular** (1 módulo = 1 BC). Migrar para microserviços apenas quando BCs Core tiverem cargas diferenciadas ou times separados.

### Artefatos gerados

```
docs/modeling/loja-php/
├── ddd-strategic-model.md   ← subdomínios, BCs, context map, linguagem ubíqua
├── ddd-tactical-model.md    ← VOs, entities, aggregates, events por BC
└── ddd-operational-notes.md ← topologia recomendada, sequência de implementação
```

---

## Etapa 3 — req-migration-strategy: Plano de Migração do Legado

**Objetivo**: Definir como migrar o PHP legado para o novo sistema C# sem downtime.

### Como acionar

> Defina a estratégia de migração do sistema PHP em `docs/discovery/loja-php/` para DDD/Clean Architecture em C#. O sistema tem 500 usuários ativos em produção.

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
Fase 0: Bootstrap novo projeto C# + ACL setup           (1 sprint)
Fase 1: BC Auth → migrar autenticação                   (1 sprint)
Fase 2: BC Customers → menor acoplamento                (2 sprints)
Fase 3: BC Catalog → produtos e categorias              (2 sprints)
Fase 4: BC Orders + Pricing → Core, mais complexo       (3 sprints)
Desligamento do legado                                   (após Fase 4)
```

**ACL desenhada** para o BC Orders (lê pedidos do legado durante transição):

```
Legado PHP            ACL (C#)                Novo Domínio
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

## Etapa 4 — req-agile-planning: Gerar o Backlog

**Objetivo**: Transformar o modelo DDD em épicos, stories e tasks técnicas. **Exemplo abaixo: stack C# (`-cs`)** — caminho incremental. Para NestJS + Vue + Flutter, veja [Tutorial 04](./04-ciclo-completo-openspec.md).

### Como acionar

> Organize os requisitos de `docs/modeling/loja-php/ddd-strategic-model.md` e `ddd-tactical-model.md` em um backlog ágil. Stack escolhida: C#. Prioridade: Auth primeiro, depois Customers, depois Orders.

### O que o agent faz

Cria épicos a partir dos Bounded Contexts + épico técnico de bootstrap:

```
EP-000 [TECH]: Bootstrap e Infraestrutura
EP-001: BC Auth & Usuários
EP-002: BC Customers (Clientes)
EP-003: BC Catalog (Catálogo de Produtos)
EP-004: BC Orders + Pricing (Pedidos + Precificação)
```

Para cada story, gera tasks **inside-out** com referência ao skill C#:

```markdown
## EP-002: BC Customers

### US-004: Cadastro de Cliente

> Como atendente, quero cadastrar clientes, para registrar novos compradores.

**Critérios de Aceitação:**
- Dado nome válido e CPF válido, quando cadastrar, então cliente criado com id
- Dado CPF já cadastrado, quando cadastrar, então retornar erro "CPF já existe"

**Tasks:**
- [ ] `domain:vo` Criar VO Email → skill: core-value-object-cs (~1h)
- [ ] `domain:vo` Criar VO CPF com validação de dígitos → skill: core-value-object-cs (~1h)
- [ ] `domain:vo` Criar VO CustomerName → skill: core-value-object-cs (~1h)
- [ ] `domain:entity` Criar entidade Customer com VOs → skill: core-entity-cs (~2h)
- [ ] `domain:repository` Criar ICustomerRepository → skill: core-repository-cs (~1h)
- [ ] `app:dto` Criar CreateCustomerInDto e CustomerOutDto → skill: core-dto-cs (~1h)
- [ ] `app:usecase` Criar CreateCustomerUseCase → skill: core-use-case-cs (~2h)
- [ ] `app:query` Criar FindCustomerByIdQuery → skill: core-query-cqrs-cs (~1h)
- [ ] `infra:persistence` Criar CustomerEfRepository → skill: backend-data-cs (~2h)
- [ ] `infra:migration` Criar migration Customers → skill: config-efcore-cs (~1h)
- [ ] `interface:controller` Criar CustomerController → skill: backend-controller-cs (~2h)
- [ ] `test:unit` Testes de Customer, CPF, Email → skill: `test-unit-cs` (~2h)
- [ ] `test:coverage` Validar ≥95% domain+application (~30min)
- [ ] `test:e2e` POST /api/customers → GET /api/customers/{id} → skill: `test-e2e-cs` (~2h)
```

### Artefatos gerados

```
docs/planning/loja-php/
├── backlog.md        ← épicos + stories + tasks com skills C# referenciados
└── epics-summary.md  ← visão executiva com estimativas
```

---

## Resumo do Pipeline

```
req-discovery        req-ddd-modeling     req-migration-strategy  req-agile-planning
(análise PHP)   →    (subdomínios,    →   (Strangler Fig,    →    (backlog com
requirements.md      context map,         sequência,              tasks -cs)
ddd-analysis.md      linguagem ubíqua)    ACL design)
domain-model.md      ddd-strategic-model  migration-strategy.md   backlog.md
                     ddd-tactical-model   acl-design.md           epics-summary.md
```

> Próximo passo: [Tutorial 02 — Hub Full-Stack](./02-fullstack-project-setup.md) → escolher combinação em [`stacks/`](./stacks/README.md)

> Migração incremental (só backend): [Backend incremental](./stacks/backend-incremental.md)

> Ciclo integrado com OpenSpec: [Tutorial 04](./04-ciclo-completo-openspec.md)
