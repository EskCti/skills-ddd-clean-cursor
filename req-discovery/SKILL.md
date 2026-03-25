---
name: req-discovery
stack: agnostic
description: Levantar requisitos de um sistema existente a partir de URL (web app) ou caminho local (codebase). Usar quando o pedido envolver análise de sistema legado, extração de funcionalidades, mapeamento de telas/fluxos ou documentação de requisitos a partir de sistema real.
---

# Requirement Discovery

Analisar um sistema existente e extrair requisitos funcionais e não-funcionais de forma estruturada.

**IMPORTANTE: Este skill é de análise, não de implementação.** Você pode navegar, ler código, capturar telas e investigar, mas NÃO deve alterar o sistema analisado.

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

### Fase 3 — Documentação

Gerar os artefatos de saída no diretório configurado.

---

## Diretório de Saída

Os artefatos são salvos no diretório **do projeto consumidor** (não do repositório de skills):

```
<projectRoot>/
├── <docsPath>/                          ← configurável via skills.config.json
│   └── discovery/
│       └── <nome-do-sistema>/           ← kebab-case do nome do sistema
│           ├── requirements.md          ← requisitos (obrigatório)
│           ├── screens.md               ← mapeamento de telas (se via browser)
│           └── domain-model.md          ← modelo de domínio (se via código)
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

### `domain-model.md` (quando análise de código)

```markdown
# Modelo de Domínio — <Nome do Sistema>

## Entidades

### <Entidade 1>
- campo1: tipo (obrigatório/opcional)
- campo2: tipo
- Relações: <relação com outras entidades>

## Diagrama de Relações

<diagrama ASCII das relações entre entidades>
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

Após a discovery, o usuário pode:

- **`req-agile-planning`**: transformar os requisitos em épicos, stories e tasks
- **`openspec-propose`**: criar uma proposta de change para reimplementação
- **`openspec-explore`**: explorar aspectos específicos encontrados

Ofereça essas opções ao finalizar:

> "Análise concluída! Quer que eu organize isso em planejamento ágil (épicos/stories/tasks)? Ou prefere explorar algum aspecto específico?"

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
