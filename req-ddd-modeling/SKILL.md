---
name: req-ddd-modeling
stack: agnostic
description: Aplicar modelagem DDD estratégica e tática sobre requisitos identificados, produzindo modelo de subdomínios, bounded contexts com cardinalidade, context map, linguagem ubíqua e padrões táticos (entidades, VOs, serviços, eventos de domínio). Usar quando o pedido envolver análise de domínio, mapeamento de subdomínios, definição de bounded contexts ou decisão arquitetural monólito/microserviços.
---

# DDD Modeling

Aplicar o **Roadmap DDD** (Estratégico → Tático → Operacional) sobre requisitos previamente levantados, produzindo um modelo de domínio formal que guia a implementação.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     ROADMAP DO DESENVOLVIMENTO                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│  │  ESTRATÉGICO   │  │    TÁTICO      │  │  OPERACIONAL   │             │
│  │                │  │                │  │                │             │
│  │ Compreender o  │  │ Aplicar padrões│  │ Implementar em │             │
│  │ domínio e      │──▶ de modelagem  │──▶ código com     │             │
│  │ organizar em   │  │ para soluções  │  │ frameworks     │             │
│  │ contextos      │  │ consistentes   │  │ sem comprometer│             │
│  │ delimitados    │  │ e sustentáveis │  │ regras de      │             │
│  │                │  │                │  │ negócio        │             │
│  └────────────────┘  └────────────────┘  └────────────────┘             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Este skill é de análise e modelagem, não de implementação.** A saída alimenta o `req-agile-planning` para gerar tasks com referência aos skills de implementação (TS, KT, CS).

---

## Entrada

O skill aceita **qualquer uma destas fontes**:

| Fonte | Exemplo |
|-------|---------|
| **Saída do `req-discovery`** | `requirements.md` + `ddd-analysis.md` |
| **Descrição livre** | "Sistema de farmácia com produtos, filiais, estoque e vendas" |
| **Documento de requisitos** | Qualquer formato textual com requisitos |
| **Codebase existente** | Caminho local para análise direta |

---

## Fase 1 — Análise Estratégica

### 1.1 — Identificar o Domínio

> "O domínio de uma aplicação é o conjunto de conhecimentos, regras, conceitos e processos do negócio que o sistema precisa representar e sustentar."

Documentar:
- **Nome do domínio** (ex.: "PharmaCore — Gestão de Farmácia")
- **Propósito principal** (o problema que resolve)
- **Escopo** (o que está dentro e fora do domínio)

### 1.2 — Identificar Subdomínios

Decompor o domínio em subdomínios classificados por importância:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Core** | Diferencial competitivo — regras únicas do negócio | Vendas, Precificação |
| **Supporting** | Suporta o core mas não é diferencial | Estoque, Filiais |
| **Generic** | Funcionalidade commodity — pode usar soluções prontas | Autenticação, Notificação, Pagamento |

Para cada subdomínio, documentar:

```
┌──────────────────────────────────────┐
│ Subdomínio: <nome>                   │
│ Tipo: Core | Supporting | Generic    │
│ Responsabilidade: <descrição>        │
│ Complexidade: Alta | Média | Baixa   │
│ Estratégia: Build | Buy | Outsource  │
└──────────────────────────────────────┘
```

### 1.3 — Definir Bounded Contexts

Cada Bounded Context é uma **fronteira de software** — um limite dentro do qual um modelo de domínio é consistente e a linguagem ubíqua tem significado preciso.

**Subdomínio vs Contexto Delimitado:**

| Aspecto | Subdomínio | Contexto Delimitado |
|---------|-----------|---------------------|
| **Natureza** | Parte do negócio | Fronteira de software |
| **Foco** | O problema a ser resolvido | A solução em código |
| **Origem** | Surge da análise do negócio | Surge do design do sistema |
| **Linguagem** | Linguagem do negócio | Linguagem consistente do modelo |
| **Papel** | Define **o que** precisa existir | Define **como** isso será implementado |

**Cardinalidade Subdomínio ↔ Bounded Context:**

Não existe cardinalidade fixa. O mapeamento depende da complexidade:

```
1:1  Um subdomínio → 1 Bounded Context
     Quando o negócio é coeso e as regras cabem em um único limite.
     Ex.: Subdomínio "Produtos" → BC "Catálogo"

1:N  Um subdomínio → Vários Bounded Contexts
     Quando diferentes partes exigem modelos, regras ou ritmos distintos.
     Ex.: Subdomínio "Vendas" → BC "Pedidos" + BC "Pagamentos" + BC "Entrega"

N:1  Vários subdomínios → 1 Bounded Context
     Quando subdomínios menores compartilham baixa complexidade.
     Ex.: "Configurações" + "Cadastros auxiliares" → BC "Administração"
```

Para cada Bounded Context:

```
┌──────────────────────────────────────┐
│ Bounded Context: <nome>              │
│ Subdomínio(s): <lista>               │
│ Cardinalidade: 1:1 | 1:N | N:1      │
│ Responsabilidade: <descrição>        │
│ Módulo no código: <nome do módulo>   │
└──────────────────────────────────────┘
```

### 1.4 — Construir Context Map

Mapear as relações entre Bounded Contexts:

| Relação | Significado | Diagrama |
|---------|-------------|----------|
| **Upstream/Downstream** | Um contexto fornece dados ao outro | `A ──▶ B` (A upstream, B downstream) |
| **Shared Kernel** | Dois contextos compartilham parte do modelo | `A ◀──▶ B` |
| **Conformist** | Downstream adota o modelo do upstream sem adaptação | `A ══▶ B` |
| **Anti-Corruption Layer (ACL)** | Downstream traduz o modelo do upstream | `A ──▶ [ACL] ──▶ B` |
| **Open Host Service (OHS)** | Upstream expõe API pública estável | `A [OHS] ──▶ B` |
| **Published Language** | Comunicação via formato compartilhado (JSON, eventos) | `A ──[PL]──▶ B` |
| **Customer/Supplier** | Downstream pode influenciar evolução do upstream | `A ←──▶ B` |
| **Separate Ways** | Contextos evoluem independentemente, sem integração | `A    B` |

Gerar diagrama ASCII:

```
┌─────────────────────────────────────────────────────────────────┐
│                       CONTEXT MAP                                │
│                                                                   │
│  ┌──────────┐          ┌──────────┐          ┌──────────┐        │
│  │ Catálogo │──[OHS]──▶│ Pedidos  │──[ACL]──▶│ Pagamento│        │
│  │ (Core)   │          │ (Core)   │          │ (Generic)│        │
│  └──────────┘          └────┬─────┘          └──────────┘        │
│                             │                                     │
│                        [Downstream]                               │
│                             │                                     │
│                       ┌─────▼─────┐          ┌──────────┐        │
│                       │  Entrega  │          │   Auth   │        │
│                       │(Supporting)│          │ (Generic)│        │
│                       └───────────┘          └──────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.5 — Documentar Linguagem Ubíqua

Para cada Bounded Context, criar glossário de termos:

```markdown
### Linguagem Ubíqua — BC "Pedidos"

| Termo | Significado neste contexto |
|-------|---------------------------|
| Pedido | Intenção de compra com itens, quantidades e valores |
| Item | Produto + quantidade dentro de um pedido |
| Desconto | Redução percentual ou absoluta aplicada ao total |
| Fechamento | Momento em que o pedido é confirmado e enviado para pagamento |
```

> **Importante**: o mesmo termo pode ter significados diferentes em BCs distintos. Ex.: "Produto" no Catálogo tem descrição e preço; em Estoque tem lote e quantidade.

---

## Fase 2 — Análise Tática

Para cada Bounded Context, identificar os **building blocks** (ferramentas táticas) do DDD:

### Ferramentas Táticas

| Padrão | O que é | Quando usar |
|--------|---------|-------------|
| **Value Object** | Encapsula um valor do domínio e suas regras, garantindo consistência por meio da imutabilidade | Campos com validação (Email, CPF, Money, Name) |
| **Entity** | Modela elementos do negócio com identidade própria e comportamento ao longo do tempo | Objetos com ID e ciclo de vida (User, Order, Product) |
| **Aggregate** | Cluster de entities/VOs com uma raiz que garante invariantes | Entity raiz que controla filhas (Order → OrderItems) |
| **Domain Service** | Encapsula regras de negócio que não pertencem naturalmente a uma única entidade | Cálculos entre entities (PricingPolicy, ShippingCalculator) |
| **Domain Event** | Representa fatos importantes que ocorreram no domínio e podem gerar reações no sistema | Ações que disparam consequências (OrderPlaced, PaymentConfirmed) |
| **Repository** | Contrato de persistência para aggregates | CRUD de entities raiz |
| **Factory** | Criação complexa de aggregates | Quando `Create()` é complexo demais |

### Mapeamento por Bounded Context

Para cada BC, produzir:

```
┌──────────────────────────────────────────────┐
│ Bounded Context: Pedidos                      │
│ Subdomínio: Vendas (Core)                     │
├──────────────────────────────────────────────┤
│                                                │
│ Value Objects:                                 │
│   • Money (valor + moeda + operações)          │
│   • Quantity (inteiro positivo)                 │
│   • OrderStatus (enum: Draft/Placed/Paid/...)  │
│                                                │
│ Entities:                                      │
│   • Order (id, items, total, status, customer)  │
│   • OrderItem (id, product, quantity, price)    │
│                                                │
│ Aggregates:                                    │
│   • Order [raiz] → OrderItem[]                  │
│                                                │
│ Domain Services:                               │
│   • DiscountPolicy (cálculo de desconto)        │
│   • OrderTotalCalculator                        │
│                                                │
│ Domain Events:                                 │
│   • OrderPlaced (quando pedido é confirmado)    │
│   • OrderCancelled (quando pedido é cancelado)  │
│                                                │
│ Repository Ports:                              │
│   • IOrderRepository (save, findById, findAll)  │
│                                                │
└──────────────────────────────────────────────┘
```

---

## Fase 3 — Análise Operacional

### 3.1 — Topologia de Infraestrutura

> Monólito e microsserviços dizem respeito à forma como a aplicação é implantada e operada na infraestrutura, não à qualidade da modularização ou da modelagem do negócio.

Recomendar topologia baseada em critérios:

| Critério | Monólito modular | Microserviços |
|----------|-----------------|---------------|
| Equipe | < 3 devs | > 5 devs com ownership por BC |
| Deploy | Cadência única ok | BCs com ritmos de deploy diferentes |
| Escala | Carga uniforme | BCs com cargas muito diferentes |
| Maturidade | Domínio ainda explorando | Domínio maduro e estável |
| Complexidade | Preferir simplicidade | Complexidade gerenciável |

**Recomendação padrão**: começar com **monólito modular** (um módulo por BC), migrar para microserviços quando houver evidência concreta de necessidade.

### 3.2 — Mapeamento para Skills

Cada artefato identificado nas fases anteriores mapeia para um skill de implementação:

| Artefato DDD | Skill TS | Skill KT | Skill CS |
|-------------|----------|----------|----------|
| Bounded Context (módulo) | `config-new-module` | `config-new-module-kt` | `config-new-module-cs` |
| Value Object | `core-value-object` | `core-value-object-kt` | `core-value-object-cs` |
| Entity / Aggregate | `core-entity` | `core-entity-kt` | `core-entity-cs` |
| Domain Service | `core-domain-service` | `core-domain-service-kt` | `core-domain-service-cs` |
| Repository port | `core-repository` | `core-repository-kt` | `core-repository-cs` |
| Use Case | `core-use-case` | `core-use-case-kt` | `core-use-case-cs` |
| DTO | `core-dto` | `core-dto-kt` | `core-dto-cs` |
| Query CQRS | `core-query-cqrs` | `core-query-cqrs-kt` | `core-query-cqrs-cs` |
| Persistence adapter | `backend-prisma-data` | `backend-data-kt` | `backend-data-cs` |
| Controller | `backend-controller` | `backend-controller-kt` | `backend-controller-cs` |

---

## Saída

Gerar os seguintes documentos em `<docsPath>/modeling/<project-name>/`:

### `ddd-strategic-model.md`

```markdown
# Modelo Estratégico — <Nome do Projeto>

## Domínio
(nome, propósito, escopo)

## Subdomínios
(tabela com tipo, responsabilidade, complexidade, estratégia)

## Bounded Contexts
(tabela com subdomínio(s), cardinalidade, responsabilidade, módulo)

## Context Map
(diagrama ASCII com relações tipadas)

## Linguagem Ubíqua
(glossário por Bounded Context)
```

### `ddd-tactical-model.md`

```markdown
# Modelo Tático — <Nome do Projeto>

## <Bounded Context 1>
(VOs, Entities, Aggregates, Domain Services, Domain Events, Repositories)

## <Bounded Context 2>
(...)
```

### `ddd-operational-notes.md`

```markdown
# Notas Operacionais — <Nome do Projeto>

## Topologia Recomendada
(monólito modular ou microserviços + justificativa)

## Mapeamento BC → Módulo
(tabela BC → módulo no código → skill de scaffold)

## Prioridade de Implementação
(quais BCs implementar primeiro, baseado em subdomínio Core)
```

---

## Integração com Outros Skills

### Pipeline completo

```
Sistema fonte            req-discovery         req-ddd-modeling          req-migration-strategy   req-agile-planning       implementação
(qualquer linguagem) →   (leitura) →           (modelagem DDD) →        [opcional]         →    (planejamento) →         config-project-fullstack
                         requirements.md       ddd-strategic-model.md   migration-strategy.md  backlog.md               + openspec-* + config-docker/cicd
                         ddd-analysis.md       ddd-tactical-model.md  acl-design.md          epics-summary.md         + core-* / frontend-* / mobile-*
                                               ddd-operational-notes.md sprint-plan.md
```

> O `req-ddd-modeling` pode ser usado **diretamente** sem `req-discovery` — basta fornecer uma descrição do domínio.

### Depois (consumidores):

- **`req-migration-strategy`** → se o sistema for legado em produção
- **`req-agile-planning`** → usa o modelo DDD para gerar épicos (1 por BC), stories e tasks (EP-000 com docker/cicd)
- **`config-project-fullstack`** → orquestra bootstrap completo
- **`openspec-propose`** → proposta de change para bootstrap ou BC específico

Ofereça essas opções ao finalizar:

> "Modelagem DDD concluída!\n> Próximos passos:\n> 1. [Se legado] Estratégia de migração (`req-migration-strategy`)\n> 2. Gerar backlog (`req-agile-planning`) — EP-000 inclui docker + cicd\n> 3. Bootstrap full-stack (`config-project-fullstack` + OpenSpec)\n> 4. Implementar BC (`openspec-propose \"bc-<nome>\"`)"

---

## Guardrails

- **Não invente subdomínios** — baseie-se nos requisitos observados
- **Prefira 1:1** (subdomínio → BC) como default; 1:N ou N:1 apenas com justificativa
- **Comece com monólito modular** — só recomende microserviços com evidência
- **Documente a linguagem ubíqua** — termos devem ser acordados, não assumidos
- **Domain Events são opcionais** — só incluir quando há reações cross-context claras
- **Não misture camadas** — Entities no Domain, Use Cases na Application, never vice-versa

## References

- Consultar `references/ddd-strategic-patterns.md` para padrões estratégicos detalhados.
- Consultar `references/ddd-tactical-patterns.md` para padrões táticos detalhados.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
