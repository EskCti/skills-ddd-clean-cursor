---
name: req-agile-planning
stack: agnostic
description: Organizar requisitos (de sistemas existentes em qualquer linguagem ou de descrições livres) em planejamento ágil com épicos, user stories e tasks alinhados a DDD/Clean Architecture, com tasks referenciando os skills TS/KT/CS deste repositório. Usar quando o pedido envolver criação de backlog, planejamento de sprint ou organização de trabalho técnico por camada arquitetural.
---

# Agile Planning

Transformar requisitos (documentados ou descritos) em um backlog ágil estruturado com Épicos, User Stories e Tasks, **alinhado a DDD e Clean Architecture**.

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

**Épico técnico de bootstrap** (EP-000) deve sempre existir e incluir:

- Setup do projeto (skill: `config-project` / `config-project-kt` / `config-project-cs`)
- Shared kernel (skill: `config-shared-core` / `config-shared-core-kt` / `config-shared-core-cs`)
- Configuração de banco (skill: `config-prisma` / `config-jpa-kt` / `config-efcore-cs`)

**Épico de auth** (quando aplicável) deve usar:

- Auth core (skill: `config-auth-core-basic` / `config-auth-core-basic-kt` / `config-auth-core-basic-cs`)
- Auth backend (skill: `config-auth-backend-basic` / `config-auth-backend-basic-kt` / `config-auth-backend-basic-cs`)

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
1. domain:vo         → core-value-object
2. domain:entity     → core-entity
3. domain:service    → core-domain-service
4. domain:repository → core-repository
5. app:dto           → core-dto
6. app:usecase       → core-use-case
7. app:query         → core-query-cqrs
8. infra:persistence → backend-data (adapter de persistência)
9. infra:migration   → config-db (schema/migration)
10. interface:controller → backend-controller
11. interface:form    → frontend-form-schema
12. test:unit         → (testes da camada domain + app)
13. test:e2e          → (teste de fluxo completo)
```

Formato de task — **sempre agnóstico**, sem sufixo de stack:

```markdown
- [ ] `domain:entity` Criar entidade Customer com VOs Name e Email → skill: core-entity (~2h)
- [ ] `domain:vo` Criar VO CustomerName com validação → skill: core-value-object (~1h)
- [ ] `app:usecase` Criar CreateCustomerUseCase → skill: core-use-case (~2h)
- [ ] `infra:persistence` Criar adapter para CustomerRepository → skill: backend-data (~2h)
- [ ] `interface:controller` Criar POST /api/customers → skill: backend-controller (~2h)
```

Na implementação, o desenvolvedor resolve o skill para a stack escolhida:

| Prefixo na task        | Skill TS              | Skill KT                | Skill CS                |
| ---------------------- | --------------------- | ----------------------- | ----------------------- |
| `domain:entity`        | `core-entity`         | `core-entity-kt`        | `core-entity-cs`        |
| `domain:vo`            | `core-value-object`   | `core-value-object-kt`  | `core-value-object-cs`  |
| `domain:repository`    | `core-repository`     | `core-repository-kt`    | `core-repository-cs`    |
| `app:usecase`          | `core-use-case`       | `core-use-case-kt`      | `core-use-case-cs`      |
| `app:dto`              | `core-dto`            | `core-dto-kt`           | `core-dto-cs`           |
| `app:query`            | `core-query-cqrs`     | `core-query-cqrs-kt`    | `core-query-cqrs-cs`    |
| `infra:persistence`    | `backend-prisma-data` | `backend-data-kt`       | `backend-data-cs`       |
| `infra:migration`      | `config-prisma`       | `config-jpa-kt`         | `config-efcore-cs`      |
| `interface:controller` | `backend-controller`  | `backend-controller-kt` | `backend-controller-cs` |

Regras para Tasks:

- Cada task deve ser **completável em 1-4 horas**
- Deve indicar a **camada DDD** como prefixo (`domain:`, `app:`, `infra:`, `interface:`, `test:`)
- Deve referenciar o **skill** correspondente (sufixo `[-kt/-cs]` para indicar que existe em múltiplas stacks)
- A escolha TS, KT ou CS é feita no momento da implementação, não no planejamento
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

**Descrição**: Setup inicial do projeto, shared kernel e banco de dados
**Tamanho**: M
**Dependências**: nenhuma
**Release**: 0

### US-000: Setup do Projeto

> Como desenvolvedor, quero o projeto configurado, para que eu possa começar a implementar módulos.

**Tasks**:

- [ ] `infra:setup` Inicializar monorepo → skill: config-project (~2h)
- [ ] `domain:shared` Criar shared kernel (Entity, VOs, UseCase) → skill: config-shared-core (~2h)
- [ ] `infra:db` Configurar banco de dados → skill: config-prisma | config-jpa-kt | config-efcore-cs (~1h)
- [ ] `infra:auth` Setup de autenticação (se aplicável) → skill: config-auth-core-basic | config-auth-core-basic-kt | config-auth-core-basic-cs (~3h)

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

- [ ] `domain:vo` Criar VO <NomeVO> com validação → skill: core-value-object (~1h)
- [ ] `domain:entity` Criar entidade <X> com VOs → skill: core-entity (~2h)
- [ ] `domain:repository` Criar interface <X>Repository → skill: core-repository (~1h)
- [ ] `app:dto` Criar Create<X>InDTO e <X>OutDTO → skill: core-dto (~1h)
- [ ] `app:usecase` Criar Create<X>UseCase → skill: core-use-case (~2h)
- [ ] `app:query` Criar Find<X>ByIdQuery → skill: core-query-cqrs (~1h)
- [ ] `infra:persistence` Criar adapter de persistência → skill: backend-prisma-data | backend-data-kt | backend-data-cs (~2h)
- [ ] `infra:migration` Criar migration/schema → skill: config-prisma | config-jpa-kt | config-efcore-cs (~1h)
- [ ] `interface:controller` Criar endpoints REST → skill: backend-controller | backend-controller-kt | backend-controller-cs (~2h)
- [ ] `interface:form` Criar formulário frontend → skill: frontend-form-schema (~2h)
- [ ] `test:unit` Testes da entity, VOs e use case (~2h)
- [ ] `test:e2e` Teste do fluxo completo (~2h)

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

- **`openspec-propose`** → criar proposta de change para um épico específico
- **`openspec-apply-change`** → implementar tasks de uma story
- **`config-new-module`** / **`config-new-module-kt`** / **`config-new-module-cs`** → scaffolding de módulos identificados nos épicos

Ofereça essas integrações ao finalizar:

> "Backlog criado! Próximos passos:\n> 1. Criar proposta de implementação para um épico (`openspec-propose`)\n> 2. Começar a implementar uma story diretamente\n> 3. Refinar stories específicas (TS, KT ou CS)"

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
ra e convencoes gerais entre skills.
