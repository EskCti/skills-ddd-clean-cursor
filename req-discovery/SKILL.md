---
name: req-discovery
stack: agnostic
description: Levantar requisitos de um sistema existente (qualquer linguagem/arquitetura — PHP, Go, Python, Java, MVC, monolito, etc.) a partir de URL ou caminho local, e documentar usando DDD/Clean Architecture. Usar quando o pedido envolver análise de sistema legado, extração de funcionalidades, ou documentação de requisitos para reimplementação com os skills deste repositório.
---

# Requirement Discovery

Analisar um sistema existente (**qualquer linguagem ou arquitetura**) e extrair requisitos funcionais e não-funcionais documentados em **DDD e Clean Architecture**.

**IMPORTANTE: Este skill é de análise, não de implementação.** Você pode navegar, ler código, capturar telas e investigar, mas NÃO deve alterar o sistema analisado.

**Fluxo**: o sistema fonte pode ser PHP/MVC, Go, Python, Java, monolito — qualquer coisa. A saída é **sempre** estruturada em Bounded Contexts, Entities, Value Objects e camadas Clean Architecture, pronta para ser implementada com os skills deste repositório (TypeScript ou Kotlin). Consultar `references/ddd-clean-mapping.md` para o mapa completo.

---

## Entrada

O usuário deve fornecer **uma das seguintes fontes**:

| Tipo | Exemplo | Método de análise |
|------|---------|-------------------|
| **URL** (web app) | `https://app.example.com` | Navegação via browser, captura de telas, mapeamento de fluxos |
| **Caminho local** (codebase) | `/home/user/projetos/meu-sistema` | Leitura de código, estrutura de diretórios, modelos, rotas, testes |
| **Ambos** | URL + path | Análise combinada (mais completa) |

Se o usuário não especificar, pergunte:

> "Qual sistema você quer analisar? Me passe a URL (para web app) ou o caminho local (para codebase). Se tiver ambos, melhor ainda."

---

## Workflow

### Fase 1 — Reconhecimento

#### Se URL fornecida (análise via browser):

1. **Navegar para a URL** e capturar a tela inicial
2. **Mapear navegação principal** — menus, sidebar, breadcrumbs, links
3. **Identificar telas/páginas** — listar todas as rotas/views acessíveis
4. **Para cada tela relevante**:
   - Capturar screenshot
   - Listar elementos interativos (formulários, botões, tabelas, filtros)
   - Documentar campos de formulário (tipo, validação visível, obrigatoriedade)
   - Identificar ações disponíveis (CRUD, upload, export, etc.)
5. **Mapear fluxos** — sequências de telas que formam processos (ex.: cadastro → confirmação → dashboard)
6. **Identificar perfis de acesso** — se há login, roles visíveis, áreas restritas

#### Se caminho local fornecido (análise de código):

1. **Escanear estrutura de diretórios** — identificar padrão arquitetural (monolito, monorepo, microservices)
2. **Identificar stack tecnológica** — frameworks, linguagens, ORM, banco de dados
3. **Mapear entidades/modelos** — schemas de banco, entities, models
4. **Mapear rotas/endpoints** — controllers, routes, API definitions
5. **Identificar regras de negócio** — use cases, services, validators, domain logic
6. **Mapear testes existentes** — o que está coberto, o que revela sobre comportamento esperado
7. **Identificar integrações** — APIs externas, filas, webhooks, email, pagamento

**Dicas por linguagem (sistema fonte)** — onde encontrar conceitos que serão mapeados para DDD:

> O sistema analisado pode seguir MVC, monolito, ou qualquer padrão. A tabela abaixo indica **onde procurar** no código-fonte os equivalentes que serão traduzidos para conceitos DDD na saída.

| Stack do sistema fonte | Onde estão as Entities | Onde estão as regras de negócio | Onde estão as rotas | Onde está a persistência |
|------------------------|----------------------|-------------------------------|--------------------|-----------------------|
| **PHP/Laravel** | `app/Models/*.php` (Eloquent) | Models, FormRequest, Services | `routes/api.php`, `routes/web.php` | Eloquent, `database/migrations/` |
| **PHP/Symfony** | `src/Entity/*.php` (Doctrine) | Services, Validators | `src/Controller/*.php` | `src/Repository/*.php` |
| **Go** | structs em `model/`, `domain/`, `internal/` | functions/methods em `service/` | `handler/`, `routes.go`, mux/gin | `repository/`, `store/` |
| **Python/Django** | `models.py` | views, forms, validators | `urls.py` | Django ORM, `migrations/` |
| **Python/FastAPI** | Pydantic/SQLAlchemy models | depends, services | `@app.get/post()`, `routers/` | SQLAlchemy, Alembic |
| **Java/Spring** | `@Entity` classes | `@Service` classes | `@RestController` | `@Repository`, JPA |
| **Ruby/Rails** | `app/models/*.rb` (ActiveRecord) | Models, Concerns, Services | `config/routes.rb` | ActiveRecord, `db/migrate/` |
| **TypeScript/Node** | `*.entity.ts`, `*.model.ts` | `*.service.ts`, `*.usecase.ts` | `*.controller.ts`, `routes/` | Prisma, TypeORM, Mongoose |

**Tradução MVC → DDD** (para sistemas que não seguem DDD):

| Conceito no MVC | Equivalente DDD na saída |
|-----------------|-------------------------|
| Model (Eloquent, ActiveRecord, etc.) | Entity + Repository port |
| Controller action | Use Case |
| Form validation / FormRequest | Value Object + DTO |
| Service class | Domain Service ou Use Case |
| Migration | Schema do Infrastructure |
| View/Template | Interface (frontend) |
| Middleware | Cross-cutting concern (auth, logging) |
| Route definition | Controller endpoint |

> A saída (requirements.md, ddd-analysis.md) é **sempre em DDD/Clean Architecture**, independente do padrão do sistema fonte. O objetivo é documentar o domínio para reimplementação usando os skills deste repositório.

#### Se ambos fornecidos:

- Executar ambas as análises
- Cruzar informações: telas do browser com endpoints do código
- Identificar funcionalidades no código que não aparecem na UI (APIs internas, jobs, etc.)

### Fase 2 — Classificação

Organizar os achados em categorias:

1. **Módulos/Domínios** — agrupar funcionalidades por contexto de negócio
2. **Requisitos Funcionais** — o que o sistema faz (cada funcionalidade)
3. **Requisitos Não-Funcionais** — como o sistema faz (performance, segurança, UX)
4. **Integrações** — sistemas externos conectados
5. **Regras de Negócio** — validações, cálculos, fluxos condicionais
6. **Perfis de Acesso** — quem pode fazer o quê

### Fase 3 — Análise DDD / Clean Architecture

Mapear os achados para conceitos de DDD e camadas da Clean Architecture:

#### 3.1 — Identificar Bounded Contexts

Cada contexto é um limite de domínio autônomo. Sinais:

| Sinal observado | Indica |
|----------------|--------|
| Menu/seção separada na UI | Possível bounded context |
| Grupo de tabelas relacionadas | Aggregate candidate |
| API com prefixo de rota diferente (`/auth/*`, `/orders/*`) | Bounded context |
| Módulo/package separado no código | Bounded context explícito |
| Vocabulário/termos diferentes para conceitos similares | Linguagem ubíqua diferente |

Cada Bounded Context identificado → 1 módulo no código → 1 Épico no planejamento.

#### 3.2 — Mapear Entidades e Value Objects

Para cada Bounded Context:

```
┌──────────────────────────────────────┐
│ Bounded Context: <nome>              │
├──────────────────────────────────────┤
│ Entities (com identidade):           │
│   • Customer (id, name, email, ...)  │
│   • Order (id, items, total, ...)    │
│                                      │
│ Value Objects (sem identidade):      │
│   • Email (validação de formato)     │
│   • Money (valor + moeda)            │
│   • Address (rua, cidade, cep)       │
│                                      │
│ Aggregates:                          │
│   • Order → [OrderItem, Payment]     │
│                                      │
│ Domain Services:                     │
│   • PricingPolicy                    │
│   • ShippingCalculator               │
└──────────────────────────────────────┘
```

Critérios de classificação:

| Conceito | Critério de identificação |
|----------|--------------------------|
| **Entity** | Tem ID único, ciclo de vida, aparece em CRUD |
| **Value Object** | Sem ID, definido por seus atributos, validação encapsulada |
| **Aggregate** | Entity raiz que controla acesso a entities filhas |
| **Domain Service** | Regra de negócio que envolve múltiplas entities/VOs |

#### 3.3 — Mapear Camadas de Aplicação

Para cada funcionalidade identificada, classificar por camada:

| Camada | O que identificar |
|--------|-------------------|
| **Domain** | Entities, VOs, Domain Services, Repository ports |
| **Application** | Use Cases, DTOs, Queries CQRS |
| **Infrastructure** | Persistence adapters, integrações externas, messaging |
| **Interface** | Controllers/Routes (API), Forms/Pages (UI) |

#### 3.4 — Gerar Diagrama de Contexto

```
┌─────────────────────────────────────────────────┐
│                 CONTEXT MAP                     │
│                                                 │
│  ┌───────────┐         ┌───────────┐           │
│  │   Auth    │────────▶│  Billing  │           │
│  │ (upstream)│         │(downstream)│           │
│  └───────────┘         └───────────┘           │
│       │                                         │
│       ▼                                         │
│  ┌───────────┐         ┌───────────┐           │
│  │  Catalog  │◀───────▶│  Orders   │           │
│  │           │ shared  │           │           │
│  └───────────┘ kernel  └───────────┘           │
│                                                 │
│  Relações: ──▶ upstream/downstream              │
│             ◀──▶ shared kernel                  │
│             ···▶ conformist                     │
└─────────────────────────────────────────────────┘
```

### Fase 4 — Documentação

Gerar os artefatos de saída no diretório configurado.

---

## Diretório de Saída

Os artefatos são salvos no diretório **do projeto consumidor** (não do repositório de skills):

```
<projectRoot>/
├── <docsPath>/                          ← configurável via skills.config.json
│   └── discovery/
│       └── <nome-do-sistema>/           ← kebab-case do nome do sistema
│           ├── requirements.md          ← requisitos funcionais/não-funcionais (obrigatório)
│           ├── ddd-analysis.md          ← bounded contexts, entities, VOs, camadas (obrigatório)
│           ├── screens.md               ← mapeamento de telas (se via browser)
│           └── domain-model.md          ← modelo de domínio detalhado (se via código)
```

### Resolução do caminho

O `docsPath` é resolvido pela precedência:

1. Argumento explícito do usuário: "salve em `docs/analise`"
2. `skills.config.json` → `defaults.docsPath` (ex.: `"docs"`)
3. `skills.config.local.json` → override local
4. Fallback: `docs`

Exemplo concreto — se o sistema se chama "meu-erp" e `docsPath = "docs"`:

```
meu-projeto/
├── docs/
│   └── discovery/
│       └── meu-erp/
│           ├── requirements.md
│           ├── screens.md
│           └── domain-model.md
├── apps/
├── packages/
└── ...
```

> Se o diretório `<docsPath>/discovery/` não existir, crie-o automaticamente.

---

## Artefatos de Saída

### `requirements.md` (obrigatório)

```markdown
# Requisitos — <Nome do Sistema>

**Fonte**: <URL e/ou caminho local>
**Data da análise**: <data>
**Método**: <browser / código / combinado>

## Visão Geral

<Resumo do sistema em 2-3 parágrafos: propósito, público-alvo, principais funcionalidades>

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | ... |
| Backend | ... |
| Banco de Dados | ... |
| Infra | ... |

## Módulos Identificados

### <Módulo 1>

**Descrição**: <o que este módulo faz>

#### Requisitos Funcionais

- **RF-001**: <descrição clara da funcionalidade>
  - Tela/Endpoint: <referência>
  - Campos: <se formulário, listar campos>
  - Validações: <regras identificadas>
  - Ações: <o que acontece>

#### Regras de Negócio

- **RN-001**: <descrição da regra>

### <Módulo 2>
...

## Requisitos Não-Funcionais

- **RNF-001**: <descrição> (ex.: autenticação JWT, rate limiting, etc.)

## Integrações

| Sistema | Tipo | Descrição |
|---------|------|-----------|
| ... | API REST / Webhook / ... | ... |

## Perfis de Acesso

| Perfil | Permissões |
|--------|-----------|
| Admin | ... |
| Usuário | ... |

## Fluxos Principais

### <Fluxo 1>: <nome>

```
Tela A → Ação → Tela B → Confirmação → Tela C
```

<descrição do fluxo>

## Lacunas e Observações

- <funcionalidade sem teste>
- <endpoint sem documentação>
- <comportamento ambíguo>
```

### `screens.md` (quando análise via browser)

```markdown
# Mapeamento de Telas — <Nome do Sistema>

## <Tela 1>: <nome/rota>

**URL**: <url completa>
**Tipo**: dashboard / formulário / listagem / detalhe / ...

### Elementos
- <elemento 1>: <tipo> — <descrição>
- <elemento 2>: <tipo> — <descrição>

### Ações Disponíveis
- <ação 1>: <o que faz> → <para onde vai>
```

### `ddd-analysis.md` (obrigatório — análise DDD/Clean Architecture)

```markdown
# Análise DDD / Clean Architecture — <Nome do Sistema>

**Baseado em**: <fonte dos requisitos>
**Data da análise**: <data>

## Context Map

<diagrama ASCII do mapa de contextos com relações upstream/downstream>

## Bounded Contexts

### BC-001: <Nome do Contexto>

**Descrição**: <propósito deste contexto>
**Relação**: upstream de BC-002 / downstream de BC-003 / shared kernel com BC-004

#### Entities

| Entity | Atributos Principais | Aggregate Root? |
|--------|---------------------|-----------------|
| Customer | id, name, email, status | Sim |
| Address | id, street, city, zip | Não (child de Customer) |

#### Value Objects

| VO | Tipo | Validação |
|----|------|-----------|
| Email | string | formato email, lowercase |
| Money | number + string | valor >= 0, moeda ISO |
| CustomerName | string | não vazio, max 100 chars |

#### Domain Services

| Service | Regra |
|---------|-------|
| PricingPolicy | Calcula desconto baseado em volume |

#### Repository Ports

| Repository | Operações |
|-----------|-----------|
| CustomerRepository | create, findById, findByEmail, update, delete |

#### Use Cases

| Use Case | Tipo | Descrição |
|----------|------|-----------|
| CreateCustomer | comando | Cadastra novo cliente com validações |
| FindCustomerById | query | Busca cliente por ID |
| ListCustomers | query | Lista paginada com filtros |

#### DTOs

| DTO | Direção | Campos |
|-----|---------|--------|
| CreateCustomerInDTO | entrada | name, email, address |
| CustomerOutDTO | saída | id, name, email, createdAt |

#### Controllers/Endpoints

| Verbo | Rota | Use Case |
|-------|------|----------|
| POST | /api/customers | CreateCustomer |
| GET | /api/customers/:id | FindCustomerById |
| GET | /api/customers | ListCustomers |

### BC-002: <Nome do Contexto>
...

## Mapeamento de Camadas (Clean Architecture)

| Camada | Artefatos Identificados | Skill Agnóstico |
|--------|------------------------|-----------------|
| Domain | Entities, VOs, Domain Services, Repository ports | core-entity, core-value-object, core-domain-service, core-repository |
| Application | Use Cases, DTOs, Queries | core-use-case, core-dto, core-query-cqrs |
| Infrastructure | Adapters de persistência, integrações | backend-prisma-data / backend-data-kt |
| Interface | Controllers, Forms | backend-controller, frontend-form-schema |

## Dependências entre Contexts

| De | Para | Tipo | Dados Compartilhados |
|----|------|------|---------------------|
| Orders | Auth | upstream/downstream | userId |
| Orders | Catalog | shared kernel | productId, productName |

## Recomendações Arquiteturais

- <recomendação 1>
- <recomendação 2>
```

### `domain-model.md` (quando análise de código — detalhamento técnico)

```markdown
# Modelo de Domínio — <Nome do Sistema>

## Entidades por Bounded Context

### BC-001: <Nome>

#### <Entidade 1>
- campo1: tipo (obrigatório) → candidato a VO: sim/não
- campo2: tipo (opcional) → candidato a VO: sim/não
- Relações: <relação com outras entidades>
- Aggregate Root: sim/não
- Regras de negócio internas: <lista>

## Diagrama de Aggregates

<diagrama ASCII dos aggregates com entities raiz e filhas>

## Mapeamento Entity ↔ Tabela/Collection

| Entity | Tabela/Collection | Observações |
|--------|------------------|-------------|
| Customer | customers | - |
| Order | orders | FK: customer_id |
```

---

## Visualização

Use diagramas ASCII extensivamente durante a análise:

```
┌─────────────────────────────────────────┐
│           ARQUITETURA GERAL            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐    ┌─────────┐            │
│  │ Frontend │───▶│ Backend │            │
│  │ Next.js  │    │ NestJS  │            │
│  └─────────┘    └────┬────┘            │
│                      │                  │
│                 ┌────▼────┐            │
│                 │   DB    │            │
│                 │ Postgres│            │
│                 └─────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Integração com Outros Skills

### Pipeline completo

```
Sistema fonte               req-discovery              req-agile-planning            implementação
(qualquer linguagem)        ─────────────              ──────────────────            ──────────────
PHP MVC / Go / Python  ──▶  requirements.md     ──▶    backlog.md             ──▶   skills TS ou KT
Java / Ruby / etc.          ddd-analysis.md            (tasks com skill ref)        openspec-propose
                            domain-model.md            epics-summary.md             openspec-apply-change
                            screens.md                 sprint-plan.md
```

> O sistema fonte é apenas **lido**. A saída é **sempre** DDD/Clean Architecture. A implementação usa **sempre** os skills deste repositório (TypeScript ou Kotlin).

### Próximos passos após discovery

| Objetivo | Skill | Entrada |
|----------|-------|---------|
| Organizar em épicos/stories/tasks DDD | `req-agile-planning` | `requirements.md` + `ddd-analysis.md` |
| Explorar aspecto específico | `openspec-explore` | Bounded Context ou módulo |
| Implementar módulo (TS) | `config-new-module` | Bounded Context → módulo NestJS |
| Implementar módulo (KT) | `config-new-module-kt` | Bounded Context → módulo Spring Boot |
| Criar proposta de change | `openspec-propose` | Épico ou Story do backlog |

### Tasks → Skills deste repositório

O `ddd-analysis.md` traduz conceitos do sistema fonte para DDD. O `req-agile-planning` gera tasks que referenciam os skills deste repositório. Na implementação, o usuário escolhe a stack:

- **TypeScript**: skills sem sufixo → NestJS + Prisma + React
- **Kotlin**: skills com sufixo `-kt` → Spring Boot + JPA + Gradle

Todos os conceitos DDD identificados (Entity, VO, Use Case, Repository, Controller) têm skill correspondente em ambas as stacks. Consultar `references/ddd-clean-mapping.md`.

Ofereça essas opções ao finalizar:

> "Análise concluída! O sistema foi mapeado para DDD/Clean Architecture.\n> Próximos passos:\n> 1. Organizar em planejamento ágil (`req-agile-planning`) — épicos, stories e tasks referenciando skills TS ou KT\n> 2. Explorar um bounded context específico (`openspec-explore`)\n> 3. Começar a implementar um módulo (`config-new-module` para TS ou `config-new-module-kt` para KT)"

---

## Guardrails

- **Não altere** o sistema analisado — apenas observe e documente
- **Não invente** requisitos — documente apenas o que foi observado ou inferido do código
- **Marque inferências** — quando um requisito é inferido (não explícito), indique com `[inferido]`
- **Marque lacunas** — funcionalidades ambíguas devem ser listadas como "Observações"
- **Peça credenciais** se necessário — se o sistema requer login, pergunte ao usuário
- **Respeite limites** — não tente acessar áreas que requerem credenciais não fornecidas
- **Seja factual** — descreva o que o sistema faz, não o que deveria fazer

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
