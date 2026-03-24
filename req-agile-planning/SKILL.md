---
name: req-agile-planning
stack: agnostic
description: Organizar requisitos em planejamento ágil com épicos, user stories e tasks. Usar quando o pedido envolver criação de backlog, planejamento de sprint, quebra de funcionalidades em stories ou organização de trabalho técnico em tarefas estimáveis.
---

# Agile Planning

Transformar requisitos (documentados ou descritos) em um backlog ágil estruturado com Épicos, User Stories e Tasks.

---

## Entrada

O skill aceita **qualquer uma destas fontes**:

| Fonte | Exemplo |
|-------|---------|
| Arquivo `requirements.md` do `req-discovery` | `openspec/discovery/<sistema>/requirements.md` |
| Descrição livre do usuário | "Preciso de um sistema de e-commerce com carrinho, pagamento e entrega" |
| URL de issue tracker | Link de GitHub Issues, Jira, etc. |
| Documento existente | Qualquer `.md` ou `.txt` com requisitos |

Se nenhuma fonte for fornecida, pergunte:

> "De onde vêm os requisitos? Me passe:\n> 1. O caminho de um `requirements.md` (gerado pelo req-discovery)\n> 2. Uma descrição do que precisa ser construído\n> 3. Uma URL de issues existentes"

---

## Workflow

### Fase 1 — Compreensão

1. **Ler/receber os requisitos** da fonte fornecida
2. **Identificar domínios/módulos** — agrupar funcionalidades relacionadas
3. **Mapear dependências** — quais funcionalidades dependem de outras
4. **Identificar MVP** — perguntar ao usuário o que é prioridade

Se os requisitos vierem do `req-discovery`, ler também `screens.md` e `domain-model.md` se existirem.

### Fase 2 — Estruturação em Épicos

Agrupar requisitos em Épicos (temas de alto nível):

```
┌─────────────────────────────────────────┐
│             MAPA DE ÉPICOS              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐   ┌──────────┐           │
│  │  EP-001  │   │  EP-002  │           │
│  │  Auth &  │   │ Catálogo │           │
│  │ Usuários │   │ Produtos │           │
│  └────┬─────┘   └────┬─────┘           │
│       │               │                │
│  ┌────▼─────┐   ┌────▼─────┐           │
│  │  EP-003  │   │  EP-004  │           │
│  │ Carrinho │   │Pagamento │           │
│  └──────────┘   └──────────┘           │
│                                         │
│  ──── = dependência                     │
└─────────────────────────────────────────┘
```

Regras para Épicos:
- Um épico representa um **tema de negócio** completo (ex.: "Autenticação", "Gestão de Pedidos")
- Deve ser entregável de forma independente ou com dependências explícitas
- Estimativa de alto nível: P (pequeno), M (médio), G (grande), GG (muito grande)

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

### Fase 4 — Decomposição em Tasks

Para cada Story, criar Tasks técnicas:

Regras para Tasks:
- Cada task deve ser **completável em 1-4 horas**
- Deve ser atribuível a uma pessoa
- Tipos: `dev`, `test`, `infra`, `docs`, `design`
- Tasks técnicas incluem: criar entidade, criar endpoint, criar tela, escrever teste, configurar infra

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
docs/discovery/meu-erp/requirements.md   ← entrada
docs/planning/meu-erp/backlog.md          ← saída
```

---

## Artefatos de Saída

### `backlog.md` (obrigatório — documento unificado)

```markdown
# Backlog — <Nome do Projeto>

**Baseado em**: <fonte dos requisitos>
**Data**: <data>
**Total**: <N> épicos, <M> stories, <P> tasks

## Roadmap

### Release 1 — MVP
- EP-001: <nome>
- EP-002: <nome>

### Release 2 — Expansão
- EP-003: <nome>
- EP-004: <nome>

---

## EP-001: <Nome do Épico>

**Descrição**: <resumo do épico>
**Tamanho**: M
**Dependências**: nenhuma
**Release**: 1

### US-001: <Título da Story>

> Como <persona>, quero <ação>, para que <benefício>.

**Prioridade**: Must
**Estimativa**: 5 pontos

**Critérios de Aceitação**:
- [ ] Dado <contexto>, quando <ação>, então <resultado>
- [ ] Dado <contexto>, quando <ação>, então <resultado>

**Tasks**:
- [ ] `dev` Criar entidade <X> com validações (~2h)
- [ ] `dev` Criar endpoint POST /api/<x> (~2h)
- [ ] `dev` Criar tela de <funcionalidade> (~3h)
- [ ] `test` Escrever testes unitários da entidade (~1h)
- [ ] `test` Escrever teste e2e do fluxo (~2h)

### US-002: <Título da Story>
...

---

## EP-002: <Nome do Épico>
...
```

### `epics-summary.md` (opcional — visão executiva)

```markdown
# Resumo de Épicos — <Nome do Projeto>

| ID | Épico | Tamanho | Stories | Tasks | Dep. | Release |
|----|-------|---------|---------|-------|------|---------|
| EP-001 | Auth & Usuários | M | 5 | 18 | - | 1 |
| EP-002 | Catálogo | G | 8 | 30 | EP-001 | 1 |
| EP-003 | Carrinho | M | 4 | 14 | EP-002 | 2 |

**Totais**: X stories, Y tasks, ~Z horas estimadas
```

### `sprint-plan.md` (opcional — quando o usuário pedir)

```markdown
# Plano de Sprint — <Nome do Projeto>

## Sprint 1 (2 semanas)
**Objetivo**: <objetivo da sprint>
**Capacidade**: ~X pontos

| Story | Pontos | Status |
|-------|--------|--------|
| US-001 | 5 | To Do |
| US-002 | 3 | To Do |
| US-003 | 5 | To Do |

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
- **`req-discovery`** → fornece `requirements.md` como entrada principal
- **`openspec-explore`** → investigação prévia do problema

### Depois (implementação):
- **`openspec-propose`** → criar proposta de change para um épico específico
- **`openspec-apply-change`** → implementar tasks de uma story
- **`config-new-module`** / **`config-new-module-kt`** → scaffolding de módulos identificados nos épicos

Ofereça essas integrações ao finalizar:

> "Backlog criado! Próximos passos:\n> 1. Criar proposta de implementação para um épico (`openspec-propose`)\n> 2. Começar a implementar uma story diretamente\n> 3. Refinar stories específicas"

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
