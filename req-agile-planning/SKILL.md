---
name: req-agile-planning
stack: agnostic
description: Organizar requisitos (de sistemas existentes em qualquer linguagem ou de descrições livres) em planejamento ágil com épicos, user stories e tasks alinhados a DDD/Clean Architecture, com tasks referenciando os skills TS/KT/CS deste repositório. Usar quando o pedido envolver criação de backlog, planejamento de sprint ou organização de trabalho técnico por camada arquitetural.
---

# Agile Planning

Transformar requisitos (documentados ou descritos) em um backlog ágil estruturado com Épicos, User Stories e Tasks, **alinhado a DDD e Clean Architecture**.

**Fluxo completo (recomendado)**:

```
req-discovery → req-ddd-modeling → [req-migration-strategy] → req-agile-planning
       ↓
  backlog.md (EP-000 bootstrap inclui docker + cicd)
       ↓
openspec-propose "bootstrap-<nome>" → openspec-apply-change
  (config-project-fullstack orquestra: config-project-* + config-docker + config-cicd + config-shared-core)
       ↓
Por BC/épico: openspec-propose → openspec-apply-change → openspec-archive-change
```

**Fluxo**: o sistema fonte pode ter sido analisado em qualquer linguagem (PHP, Go, Python, etc. via `req-discovery`). As tasks do backlog sempre referenciam os **skills deste repositório**. Na implementação, o usuário escolhe **TypeScript** (sem sufixo), **Kotlin** (sufixo `-kt`) ou **C#** (sufixo `-cs`). Consultar `req-discovery/references/ddd-clean-mapping.md`.

---

## Entrada

O skill aceita **qualquer uma destas fontes**:

| Fonte                                              | Exemplo                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| Saída do `req-ddd-modeling`                         | `<docsPath>/modeling/<projeto>/ddd-strategic-model.md` + `ddd-tactical-model.md` |
| Arquivo `requirements.md` do `req-discovery`       | `<docsPath>/discovery/<sistema>/requirements.md`                        |
| Arquivo `ddd-analysis.md` do `req-discovery`       | `<docsPath>/discovery/<sistema>/ddd-analysis.md`                        |
| Descrição livre do usuário                         | "Preciso de um sistema de e-commerce com carrinho, pagamento e entrega" |
| URL de issue tracker                               | Link de GitHub Issues, Jira, etc.                                       |
| Documento existente                                | Qualquer `.md` ou `.txt` com requisitos                                 |

Se nenhuma fonte for fornecida, pergunte:

> "De onde vêm os requisitos? Me passe:\n> 1. O caminho de um `requirements.md` (gerado pelo req-discovery)\n> 2. Uma descrição do que precisa ser construído\n> 3. Uma URL de issues existentes"

---

## Workflow

### Fase 1 — Compreensão

1. **Ler/receber os requisitos** da fonte fornecida
2. **Ler saída do `req-ddd-modeling`** se existir — `ddd-strategic-model.md` (subdomínios, BCs, context map) e `ddd-tactical-model.md` (entities, VOs, events por BC) são a fonte mais rica
3. **Senão, ler `ddd-analysis.md`** se existir — os Bounded Contexts já mapeados viram Épicos diretamente
4. **Identificar domínios/módulos** — agrupar funcionalidades relacionadas (se nenhum modelo DDD existir, inferir Bounded Contexts dos requisitos)
4. **Mapear dependências** — quais funcionalidades dependem de outras
5. **Identificar MVP** — perguntar ao usuário o que é prioridade

Se os requisitos vierem do `req-discovery`, ler também `screens.md` e `domain-model.md` se existirem.

### Fase 2 — Estruturação em Épicos (= Bounded Contexts)

Cada **Bounded Context** identificado na discovery vira **1 Épico**. Se não houver `ddd-analysis.md`, inferir os contexts dos requisitos.

Adicionalmente, criar **Épicos Técnicos** (enablers) para infraestrutura compartilhada:

```
┌─────────────────────────────────────────────────────┐
│                  MAPA DE ÉPICOS                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐                                   │
│  │ EP-000 [TECH]│  Setup projeto, shared kernel,    │
│  │  Bootstrap   │  config banco, CI/CD              │
│  └──────┬───────┘                                   │
│         │                                           │
│  ┌──────▼───────┐   ┌──────────────┐               │
│  │   EP-001     │   │   EP-002     │               │
│  │ BC: Auth &   │   │ BC: Catálogo │               │
│  │   Usuários   │   │   Produtos   │               │
│  └──────┬───────┘   └──────┬───────┘               │
│         │                  │                        │
│  ┌──────▼───────┐   ┌─────▼────────┐               │
│  │   EP-003     │   │   EP-004     │               │
│  │ BC: Carrinho │   │ BC: Pagamento│               │
│  └──────────────┘   └──────────────┘               │
│                                                     │
│  ──── = dependência                                 │
│  [TECH] = épico técnico (enabler)                   │
└─────────────────────────────────────────────────────┘
```

Regras para Épicos:

- Cada Bounded Context → 1 Épico funcional
- Infra compartilhada → Épico técnico `[TECH]` (bootstrap, shared, banco, CI)
- Um épico deve ser entregável de forma independente ou com dependências explícitas
- Estimativa de alto nível: P (pequeno), M (médio), G (grande), GG (muito grande)

**Épico técnico de bootstrap** (EP-000) deve sempre existir e incluir **Docker + CI/CD no setup** (não deixar para o final):

- Orquestração → `config-project-fullstack` (quando backend + frontend e/ou mobile)
- Backend → `config-project` / `config-project-kt` / `config-project-cs`
- Frontend → `config-project-angular` / `config-project-vue` (se aplicável)
- Mobile → `config-project-flutter` / `config-project-android` (se aplicável)
- Docker produção → `config-docker` / `config-docker-kt` / `config-docker-cs`
- CI/CD → `config-cicd` / `config-cicd-kt` / `config-cicd-cs`
- Shared kernel → `config-shared-core` / `config-shared-core-kt` / `config-shared-core-cs`
- Banco → `config-prisma` / `config-jpa-kt` / `config-efcore-cs`

> Com OpenSpec: agrupar EP-000 na mudança `bootstrap-<nome>` via `openspec-propose` → `openspec-apply-change`.

**Épico de auth** (quando aplicável) deve usar:

- Auth core → **Agent:** `Config Auth Core Basic` | `Config Auth Core Basic (Kotlin)` | `Config Auth Core (C#)`
- Auth backend → **Agent:** `Config Auth Backend Basic` | `Config Auth Backend Basic (Kotlin)` | `Config Auth Backend Basic (C#)`
- Auth web (somente Next.js) → **Agent:** `Config Auth Web Basic`

### Fase 3 — Quebra em User Stories

Para cada Épico, criar User Stories no formato:

```
Como <persona>,
quero <ação/funcionalidade>,
para que <benefício/valor>.
```

Regras para Stories:

- Cada story deve ser **independente e testável**
- Incluir **critérios de aceitação** (Given/When/Then ou checklist)
- Estimativa de complexidade: 1, 2, 3, 5, 8, 13 (Fibonacci)
- Prioridade: Must / Should / Could / Won't (MoSCoW)

### Fase 4 — Decomposição em Tasks (por camada DDD)

Para cada Story, criar Tasks técnicas **tipadas por camada arquitetural**, seguindo a ordem de dentro para fora da Clean Architecture:

```
Ordem de implementação (inside-out):
── BACKEND ──────────────────────────────────────────────────
1.  domain:vo              → core-value-object
2.  domain:entity          → core-entity
3.  domain:service         → core-domain-service
4.  domain:repository      → core-repository
5.  app:dto                → core-dto
6.  app:usecase            → core-use-case
7.  app:query              → core-query-cqrs
8.  infra:persistence      → backend-data (adapter de persistência)
9.  infra:migration        → config-db (schema/migration)
10. interface:controller   → backend-controller

── FRONTEND WEB (Clean Architecture completa) ───────────────
11. interface:entity       → frontend-entity-angular | frontend-entity-vue
12. interface:usecase      → frontend-usecase-angular | frontend-usecase-vue
13. interface:repository   → frontend-repository-angular | frontend-repository-vue
14. interface:page         → frontend-page-angular | frontend-page-vue
15. interface:form-web     → frontend-form-angular | frontend-form-vue
16. interface:form         → Frontend Form Schema (Next.js)

── MOBILE (Clean Architecture completa) ─────────────────────
17. interface:mobile-entity     → mobile-entity-flutter | mobile-entity-android
18. interface:mobile-usecase    → mobile-usecase-flutter | mobile-usecase-android
19. interface:mobile-repository → mobile-repository-flutter | mobile-repository-android
20. interface:mobile            → mobile-screen-flutter | mobile-screen-android
21. interface:mobile-form       → mobile-form-flutter | mobile-form-android

── QUALIDADE (meta: ≥95% domain + application) ──────────────
22. test:unit              → testes unitários (entity, VO, use case)
23. test:coverage          → validar cobertura ≥95% em domain + application
24. test:e2e               → teste de fluxo completo
```

> **OpenSpec**: para features que envolvem múltiplas camadas (backend + frontend + mobile), recomenda-se usar `openspec-propose` antes de iniciar a implementação. O `tasks.md` deve copiar o formato do backlog (**Agent** + **Prompt** por task). O `openspec-apply-change` aciona cada **Agent** listado na ordem inside-out.

Formato de task — **inclui o agent Cursor a acionar e o prompt sugerido**:

Se a stack já foi definida (ex.: C#), gerar com agent e prompt específicos:

```markdown
- [ ] `domain:entity` Criar entidade Customer com VOs CustomerName, Email, CPF (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade Customer em C# com os VOs CustomerName, Email e CPF. Aggregate root com método Create() retornando Result<T> e Equals/GetHashCode por Id."

- [ ] `domain:vo` Criar VO CustomerName com validação 2-100 chars (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie o VO CustomerName em C# — record, construtor privado, Create() com Result<T>, validação: não vazio, trim, 2-100 chars."

- [ ] `app:usecase` Criar CreateCustomerUseCase (~2h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "Crie o CreateCustomerUseCase em C# que verifica CPF duplicado via ICustomerRepository, cria Customer, persiste e retorna CustomerOutDto."

- [ ] `infra:persistence` Criar adapter CustomerEfRepository (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Crie CustomerEfRepository em C# implementando ICustomerRepository com EF Core. Separar CustomerDbo do domínio com mapeamentos ToDomain/FromDomain."

- [ ] `interface:controller` Criar POST /api/customers e GET /api/customers/{id} (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "Crie CustomerController em C# com POST /api/customers (CreateCustomerUseCase) e GET /api/customers/{id} (FindCustomerByIdQuery). Retornar 201 no POST e 404 quando não encontrado."
```

Se a stack **não foi escolhida ainda**, mostrar as 3 opções:

```markdown
- [ ] `domain:entity` Criar entidade Customer com VOs Name e Email (~2h)
  - **Agent TS:** `Core Entity` | **KT:** `Core Entity (Kotlin)` | **CS:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade Customer com os VOs CustomerName e Email. Aggregate root."
```

### Mapeamento: Prefixo de Task → Agent Cursor

| Prefixo | Agent TS | Agent KT | Agent CS |
| ---------------------- | ----------------------- | -------------------------------- | ----------------------- |
| `domain:vo` | `Core Value Object` | `Core Value Object (Kotlin)` | `Core Value Object (C#)` |
| `domain:entity` | `Core Entity` | `Core Entity (Kotlin)` | `Core Entity (C#)` |
| `domain:service` | `Core Domain Service` | `Core Domain Service (Kotlin)` | `Core Domain Service (C#)` |
| `domain:repository` | `Core Repository` | `Core Repository (Kotlin)` | `Core Repository (C#)` |
| `app:dto` | `Core DTO` | `Core DTO (Kotlin)` | `Core DTO (C#)` |
| `app:usecase` | `Core Use Case` | `Core Use Case (Kotlin)` | `Core Use Case (C#)` |
| `app:query` | `Core Query CQRS` | `Core Query CQRS (Kotlin)` | `Core Query CQRS (C#)` |
| `infra:persistence` | `Backend Prisma Data` | `Backend Data (Kotlin)` | `Backend Data (C#)` |
| `infra:migration` | `Config Prisma` | `Config JPA (Kotlin)` | `Config EF Core (C#)` |
| `infra:setup` | `Config Project` | `Config Project (Kotlin)` | `Config Project (C#)` |
| `infra:shell-web` | `Config Shared Web` / `(Angular)` / `(Vue)` | — | — |
| `domain:shared` | `Config Shared Core` | `Config Shared Core (Kotlin)` | `Config Shared Core (C#)` |
| `infra:auth` | `Config Auth Core Basic` | `Config Auth Core Basic (Kotlin)` | `Config Auth Core (C#)` |
| `interface:controller` | `Backend Controller` | `Backend Controller (Kotlin)` | `Backend Controller (C#)` |
| `interface:form` | `Frontend Form Schema` | — | — |
| `interface:entity` | `Frontend Entity (Angular)` ou `Frontend Entity (Vue)` | — | — |
| `interface:usecase` | `Frontend UseCase (Angular)` ou `Frontend UseCase (Vue)` | — | — |
| `interface:repository` | `Frontend Repository (Angular)` ou `Frontend Repository (Vue)` | — | — |
| `interface:page` | `Frontend Page (Angular)` ou `Frontend Page (Vue)` | — | — |
| `interface:form-web` | `Frontend Form (Angular)` ou `Frontend Form (Vue)` | — | — |
| `interface:mobile-entity` | `Mobile Entity (Flutter)` ou `Mobile Entity (Android)` | — | — |
| `interface:mobile-usecase` | `Mobile UseCase (Flutter)` ou `Mobile UseCase (Android)` | — | — |
| `interface:mobile-repository` | `Mobile Repository (Flutter)` ou `Mobile Repository (Android)` | — | — |
| `interface:mobile` | `Mobile Screen (Flutter)` ou `Mobile Screen (Android)` | — | — |
| `interface:mobile-form` | `Mobile Form (Flutter)` ou `Mobile Form (Android)` | — | — |
| `infra:docker` | `Config Docker (TypeScript)` | `Config Docker (Kotlin)` | `Config Docker (C#)` |
| `infra:cicd` | `Config CI/CD (TypeScript)` | `Config CI/CD (Kotlin)` | `Config CI/CD (C#)` |
| `infra:fullstack` | `Config Project Full-Stack` | `Config Project Full-Stack` | `Config Project Full-Stack` |
| `test:unit` | `Unit Tests (TypeScript)` | `Unit Tests (Kotlin)` | `Unit Tests (C#)` |
| `test:coverage` | `Unit Tests (TypeScript)` | `Unit Tests (Kotlin)` | `Unit Tests (C#)` |
| `test:e2e` | `E2E Tests (TypeScript)` | `E2E Tests (Kotlin)` | `E2E Tests (C#)` |

Regras para Tasks:

- Cada task deve ser **completável em 1-4 horas**
- Deve indicar a **camada DDD** como prefixo (`domain:`, `app:`, `infra:`, `interface:`, `test:`)
- **Sempre incluir o nome exato do agent Cursor** (`display_name` do `agents/openai.yaml` do skill) — **nunca** cite pasta de skill (`core-entity`, `frontend-entity-vue`) no lugar do Agent
- Em projetos full-stack, cada BC com frontend/mobile deve incluir **todas** as tasks `interface:entity` → `interface:form-web` e/ou `interface:mobile-*` (uma task por camada, cada uma com seu Agent)
- **Sempre incluir um prompt sugerido** — específico o suficiente para o agent entregar o código correto sem ambiguidade
- Se a stack foi definida pelo usuário, usar apenas o agent da stack escolhida
- O prompt deve incluir: nome da classe, VOs/dependências envolvidas, comportamento esperado
- Deve ser atribuível a uma pessoa

> **Nota**: o sistema fonte analisado pode ser qualquer linguagem (PHP, Go, Python, etc.). As tasks sempre referenciam os skills deste repositório (TS, KT ou CS) porque o objetivo é **reimplementar** usando DDD/Clean Architecture.

### Fase 5 — Priorização e Roadmap

1. **Ordenar épicos** por valor de negócio e dependência
2. **Sugerir agrupamento em sprints/releases** (se o usuário quiser)
3. **Identificar MVP** — menor conjunto de épicos para primeira entrega

---

## Diretório de Saída

Os artefatos são salvos no diretório **do projeto consumidor** (não do repositório de skills):

```
<projectRoot>/
├── <docsPath>/                          ← configurável via skills.config.json
│   └── planning/
│       └── <nome-do-projeto>/           ← kebab-case do nome do projeto
│           ├── backlog.md               ← backlog completo (obrigatório)
│           ├── epics-summary.md         ← visão executiva (opcional)
│           └── sprint-plan.md           ← plano de sprint (quando solicitado)
```

### Resolução do caminho

O `docsPath` é resolvido pela precedência:

1. Argumento explícito do usuário: "salve em `docs/planejamento`"
2. `skills.config.json` → `defaults.docsPath` (ex.: `"docs"`)
3. `skills.config.local.json` → override local
4. Fallback: `docs`

Exemplo concreto — se o projeto se chama "meu-erp" e `docsPath = "docs"`:

```
meu-projeto/
├── docs/
│   ├── discovery/
│   │   └── meu-erp/
│   │       └── requirements.md          ← entrada (do req-discovery)
│   └── planning/
│       └── meu-erp/
│           ├── backlog.md
│           ├── epics-summary.md
│           └── sprint-plan.md
├── apps/
├── packages/
└── ...
```

> Se o diretório `<docsPath>/planning/` não existir, crie-o automaticamente.

### Quando vem do `req-discovery`

Se o `requirements.md` veio do skill `req-discovery`, use o mesmo `<nome-do-sistema>` como `<nome-do-projeto>` para manter a rastreabilidade:

```
docs/discovery/meu-erp/requirements.md   ← requisitos
docs/discovery/meu-erp/ddd-analysis.md   ← análise DDD (bounded contexts, entities, VOs)
docs/planning/meu-erp/backlog.md          ← saída (épicos + stories + tasks por camada)
```

---

## Artefatos de Saída

### `backlog.md` (obrigatório — documento unificado)

```markdown
# Backlog — <Nome do Projeto>

**Baseado em**: <fonte dos requisitos>
**Análise DDD**: <ddd-analysis.md ou inferido>
**Data**: <data>
**Total**: <N> épicos (<B> bounded contexts + <T> técnicos), <M> stories, <P> tasks
**Stack**: agnóstico (escolha TS, KT ou CS na implementação)

## Roadmap

### Release 0 — Bootstrap

- EP-000 [TECH]: Setup do projeto e infraestrutura base

### Release 1 — MVP

- EP-001: <Bounded Context 1>
- EP-002: <Bounded Context 2>

### Release 2 — Expansão

- EP-003: <Bounded Context 3>
- EP-004: <Bounded Context 4>

---

## EP-000 [TECH]: Bootstrap e Infraestrutura

**Descrição**: Setup inicial do projeto full-stack, shared kernel, Docker de produção e CI/CD
**Tamanho**: M
**Dependências**: nenhuma
**Release**: 0
**OpenSpec**: mudança sugerida `bootstrap-<nome-projeto>`

### US-000: Setup do Projeto

> Como desenvolvedor, quero o projeto configurado com Docker e CI/CD, para começar a implementar módulos com entrega contínua desde o início.

**Tasks**:

- [ ] `infra:fullstack` Orquestrar setup completo (~1h)
  - **Agent:** `Config Project Full-Stack`
  - **Prompt:** "Configure projeto <Nome>: backend <TS/KT/CS>, frontend <Angular/Vue/Next>, mobile <Flutter/Android/nenhum>. Docker e CI/CD no bootstrap. Usar OpenSpec."
- [ ] `infra:setup` Bootstrap backend + frontend (~2h)
  - **Agent TS:** `Config Project` / `Config Project (Angular)` / `Config Project (Vue)` | **KT:** `Config Project (Kotlin)` | **CS:** `Config Project (C#)`
  - **Prompt:** "Bootstrap monorepo com docker-compose dev (Postgres)."
- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent Next.js:** `Config Shared Web` | **Angular:** `Config Shared Web (Angular)` | **Vue:** `Config Shared Web (Vue)`
  - **Prompt:** "Configure shell: sidebar colapsável, topbar, rodapé, dashboard vazio. Mescle rotas do shell."
- [ ] `infra:setup` Bootstrap mobile (se aplicável) (~2h)
  - **Agent:** `Config Project (Flutter)` ou `Config Project (Android)`
  - **Prompt:** "Configure app mobile apontando para API local."
- [ ] `infra:docker` Dockerfiles multi-stage de produção (~1h)
  - **Agent TS:** `Config Docker (TypeScript)` | **KT:** `Config Docker (Kotlin)` | **CS:** `Config Docker (C#)`
  - **Prompt:** "Crie Dockerfile multi-stage + docker-compose.prod.yml."
- [ ] `infra:cicd` Pipeline GitHub Actions (~2h)
  - **Agent TS:** `Config CI/CD (TypeScript)` | **KT:** `Config CI/CD (Kotlin)` | **CS:** `Config CI/CD (C#)`
  - **Prompt:** "CI em PR (lint + test + coverage ≥95% domain/app). CD em main (build Docker + deploy)."
- [ ] `domain:shared` Criar shared kernel (~2h)
  - **Agent TS:** `Config Shared Core` | **KT:** `Config Shared Core (Kotlin)` | **CS:** `Config Shared Core (C#)`
  - **Prompt:** "Configure Shared Kernel: Entity, ValueObject, Result<T>, IUseCase, IRepository."
- [ ] `infra:db` Configurar banco de dados (~1h)
  - **Agent TS:** `Config Prisma` | **KT:** `Config JPA (Kotlin)` | **CS:** `Config EF Core (C#)`
  - **Prompt:** "Configure Postgres + migrations iniciais."

---

## EP-001: <Nome do Bounded Context>

**Bounded Context**: BC-001
**Descrição**: <resumo do contexto de domínio>
**Tamanho**: M
**Dependências**: EP-000
**Release**: 1

### US-001: <Título da Story>

> Como <persona>, quero <ação>, para que <benefício>.

**Prioridade**: Must
**Estimativa**: 5 pontos
**Ref**: RF-001, RF-002

**Critérios de Aceitação**:

- [ ] Dado <contexto>, quando <ação>, então <resultado>
- [ ] Dado <contexto>, quando <ação>, então <resultado>

**Tasks (inside-out)**:

- [ ] `domain:vo` Criar VO <NomeVO> com validação (~1h)
  - **Agent TS:** `Core Value Object` | **KT:** `Core Value Object (Kotlin)` | **CS:** `Core Value Object (C#)`
  - **Prompt:** "Crie o VO <NomeVO> com validação: <regra>. Imutável, Create() com Result<T>."
- [ ] `domain:entity` Criar entidade <X> com VOs <lista> (~2h)
  - **Agent TS:** `Core Entity` | **KT:** `Core Entity (Kotlin)` | **CS:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade <X> com os VOs <lista>. Aggregate root. Método Create() com Result<T>."
- [ ] `domain:repository` Criar interface <X>Repository (~1h)
  - **Agent TS:** `Core Repository` | **KT:** `Core Repository (Kotlin)` | **CS:** `Core Repository (C#)`
  - **Prompt:** "Crie a interface I<X>Repository com operações: create, findById, <outras>."
- [ ] `app:dto` Criar Create<X>InDTO e <X>OutDTO (~1h)
  - **Agent TS:** `Core DTO` | **KT:** `Core DTO (Kotlin)` | **CS:** `Core DTO (C#)`
  - **Prompt:** "Crie Create<X>InDto (campos de entrada) e <X>OutDto (campos de saída)."
- [ ] `app:usecase` Criar Create<X>UseCase (~2h)
  - **Agent TS:** `Core Use Case` | **KT:** `Core Use Case (Kotlin)` | **CS:** `Core Use Case (C#)`
  - **Prompt:** "Crie Create<X>UseCase que <descrição do fluxo: validações, criação, persistência, retorno>."
- [ ] `app:query` Criar Find<X>ByIdQuery (~1h)
  - **Agent TS:** `Core Query CQRS` | **KT:** `Core Query CQRS (Kotlin)` | **CS:** `Core Query CQRS (C#)`
  - **Prompt:** "Crie Find<X>ByIdQuery retornando <X>OutDto por ID."
- [ ] `infra:persistence` Criar adapter de persistência (~2h)
  - **Agent TS:** `Backend Prisma Data` | **KT:** `Backend Data (Kotlin)` | **CS:** `Backend Data (C#)`
  - **Prompt:** "Crie o adapter <X>Repository implementando I<X>Repository. Separar entidade de persistência do domínio."
- [ ] `infra:migration` Criar migration/schema (~1h)
  - **Agent TS:** `Config Prisma` | **KT:** `Config JPA (Kotlin)` | **CS:** `Config EF Core (C#)`
  - **Prompt:** "Crie a migration para a tabela <X> com campos: <lista>."
- [ ] `interface:controller` Criar endpoints REST (~2h)
  - **Agent TS:** `Backend Controller` | **KT:** `Backend Controller (Kotlin)` | **CS:** `Backend Controller (C#)`
  - **Prompt:** "Crie <X>Controller com POST /api/<xs> e GET /api/<xs>/{id}. Usar Create<X>UseCase e Find<X>ByIdQuery."
- [ ] `interface:entity` Criar entidade frontend <X> (~1h)
  - **Agent Angular:** `Frontend Entity (Angular)` | **Vue:** `Frontend Entity (Vue)` | **Next.js:** `Frontend Form Schema`
  - **Prompt:** "Crie entidade <X> frontend com Result<T>, espelhando o domínio do backend."
- [ ] `interface:usecase` Criar use cases frontend (~2h)
  - **Agent Angular:** `Frontend UseCase (Angular)` | **Vue:** `Frontend UseCase (Vue)`
  - **Prompt:** "Crie Create<X>UseCase e List<X>sUseCase injetando I<X>Repository. Retornar Promise<Result>."
- [ ] `interface:repository` Criar repositório HTTP (~2h)
  - **Agent Angular:** `Frontend Repository (Angular)` | **Vue:** `Frontend Repository (Vue)`
  - **Prompt:** "Crie <X>HttpRepository implementando I<X>Repository. Mapear DTOs; try/catch → Result.err."
- [ ] `interface:page` Criar página de listagem (~2h)
  - **Agent Angular:** `Frontend Page (Angular)` | **Vue:** `Frontend Page (Vue)`
  - **Prompt:** "Listagem de <xs> injetando List<X>sUseCase. Tabela PrimeNG/PrimeVue; sem HTTP direto."
- [ ] `interface:form-web` Criar formulário de cadastro/edição (~2h)
  - **Agent Angular:** `Frontend Form (Angular)` | **Vue:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário com validação; injeta Create<X>UseCase; exibe erros de negócio (Result)."
- [ ] `interface:mobile-entity` Criar entidade mobile <X> (~1h)
  - **Agent Flutter:** `Mobile Entity (Flutter)` | **Android:** `Mobile Entity (Android)`
  - **Prompt:** "Entidade <X> Dart/Kotlin pura com sealed Result."
- [ ] `interface:mobile-usecase` Criar use cases mobile (~2h)
  - **Agent Flutter:** `Mobile UseCase (Flutter)` | **Android:** `Mobile UseCase (Android)`
  - **Prompt:** "Create<X>UseCase e List<X>sUseCase injetando I<X>Repository."
- [ ] `interface:mobile-repository` Criar repositório HTTP mobile (~2h)
  - **Agent Flutter:** `Mobile Repository (Flutter)` | **Android:** `Mobile Repository (Android)`
  - **Prompt:** "RepositoryImpl com Dio/Retrofit; mapear DTOs; catch → Failure."
- [ ] `interface:mobile` Criar tela de listagem mobile (~2h)
  - **Agent Flutter:** `Mobile Screen (Flutter)` | **Android:** `Mobile Screen (Android)`
  - **Prompt:** "Tela de listagem de <xs>; notifier/ViewModel injeta UseCase; pull-to-refresh."
- [ ] `interface:mobile-form` Criar formulário mobile (~2h)
  - **Agent Flutter:** `Mobile Form (Flutter)` | **Android:** `Mobile Form (Android)`
  - **Prompt:** "Formulário de cadastro; trata result.when/onSuccess; exibe erros de negócio."
- [ ] `test:unit` Testes da entity, VOs e use case (~2h)
  - **Agent TS:** `Unit Tests (TypeScript)` | **KT:** `Unit Tests (Kotlin)` | **CS:** `Unit Tests (C#)`
  - **Prompt:** "Crie testes unitários para VOs, Entity e Create<X>UseCase. Mock repository. Cobrir fluxo feliz e erros de negócio."
- [ ] `test:coverage` Validar cobertura ≥95% em domain + application (~30min)
  - **Agent:** mesmo de test:unit
  - **Prompt:** "Execute testes com coverage. Ajuste até ≥95% lines em domain+application. CI usa scripts/check-coverage.mjs."
- [ ] `test:e2e` Teste do fluxo completo (~2h)
  - **Agent TS:** `E2E Tests (TypeScript)` | **KT:** `E2E Tests (Kotlin)` | **CS:** `E2E Tests (C#)`
  - **Prompt:** "Crie E2E: API POST criar → GET buscar (Supertest/MockMvc/WebApplicationFactory). Se houver UI, Playwright para fluxo principal."

### US-002: <Título da Story>

...

---

## EP-002: <Nome do Épico>

...
```

### `epics-summary.md` (opcional — visão executiva)

```markdown
# Resumo de Épicos — <Nome do Projeto>

| ID     | Épico           | Tamanho | Stories | Tasks | Dep.   | Release |
| ------ | --------------- | ------- | ------- | ----- | ------ | ------- |
| EP-001 | Auth & Usuários | M       | 5       | 18    | -      | 1       |
| EP-002 | Catálogo        | G       | 8       | 30    | EP-001 | 1       |
| EP-003 | Carrinho        | M       | 4       | 14    | EP-002 | 2       |

**Totais**: X stories, Y tasks, ~Z horas estimadas
```

### `sprint-plan.md` (opcional — quando o usuário pedir)

```markdown
# Plano de Sprint — <Nome do Projeto>

## Sprint 1 (2 semanas)

**Objetivo**: <objetivo da sprint>
**Capacidade**: ~X pontos

| Story  | Pontos | Status |
| ------ | ------ | ------ |
| US-001 | 5      | To Do  |
| US-002 | 3      | To Do  |
| US-003 | 5      | To Do  |

**Total**: 13 pontos
```

---

## Colaboração com o Usuário

Durante a criação do backlog, interaja ativamente:

1. **Validar épicos**: "Identifiquei N épicos. Faz sentido? Falta algo?"
2. **Confirmar prioridades**: "O que é MVP para você? Quais funcionalidades são obrigatórias na primeira entrega?"
3. **Estimar capacidade**: "Qual o tamanho do time? Sprints de quantas semanas?"
4. **Ajustar granularidade**: Se o usuário quiser mais ou menos detalhe nas tasks

---

## Integração com Outros Skills

### Antes (fontes):

- **`req-ddd-modeling`** → fornece `ddd-strategic-model.md` + `ddd-tactical-model.md` (fonte mais rica, com subdomínios, BCs, context map e padrões táticos)
- **`req-discovery`** → fornece `requirements.md` como entrada principal
- **`openspec-explore`** → investigação prévia do problema

### Depois (implementação):

- **`config-project-fullstack`** → orquestra bootstrap (backend + frontend + mobile + docker + cicd)
- **`openspec-propose`** → criar proposta de change (`bootstrap-<nome>` ou `ep-XXX-<bc>`)
- **`openspec-apply-change`** → implementar tasks de uma story/épico
- **`openspec-archive-change`** → fechar mudança completada
- **`config-new-module`** / **`config-new-module-kt`** / **`config-new-module-cs`** → scaffolding de módulos

Ofereça essas integrações ao finalizar:

> "Backlog criado! Próximos passos:\n> 1. Criar mudança de bootstrap (`openspec-propose \"bootstrap-<nome>\"`) com docker + cicd\n> 2. Implementar via `openspec-apply-change` ou agents diretos\n> 3. Por BC: propose → apply → archive"

---

## Formato de Exportação

Se o usuário pedir, o backlog pode ser convertido para:

- **GitHub Issues**: um issue por story, labels por épico e prioridade
- **JSON estruturado**: para importação em ferramentas externas
- **CSV**: para planilhas

Para GitHub Issues, usar:

```bash
gh issue create --title "US-001: <título>" --body "<corpo>" --label "epic:<nome>,priority:<must|should|could>"
```

---

## Guardrails

- **Valide com o usuário** — não finalize o backlog sem aprovação dos épicos
- **Não invente requisitos** — organize apenas o que foi fornecido ou confirmado
- **Marque suposições** — quando inferir algo, indique com `[suposição]`
- **Mantenha rastreabilidade** — cada story deve referenciar o requisito de origem (RF-XXX)
- **Seja pragmático** — tasks devem ser acionáveis, não abstratas
- **Respeite a granularidade** — se o usuário quer menos detalhe, gere apenas épicos e stories
- **Não force metodologia** — se o usuário não usa Scrum, adapte a terminologia (ex.: "iteração" em vez de "sprint")

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
