---
name: req-migration-strategy
stack: agnostic
description: Definir a estratégia de migração de um sistema legado para a nova arquitetura DDD/Clean Architecture, escolhendo o padrão de transição (Strangler Fig, Big Bang, incremental), priorizando Bounded Contexts pela sequência de migração, desenhando a Anti-Corruption Layer (ACL) e gerando o plano de coexistência entre legado e novo sistema. Usar quando o pedido envolver migração de legado, strangler fig, plano de transição, ACL ou coexistência de sistemas.
---

# Migration Strategy

Definir a estratégia de migração de um sistema legado para DDD/Clean Architecture, produzindo um plano de transição claro com sequência de migração, padrão de coexistência e Anti-Corruption Layer.

**Este skill é de análise e planejamento, não de implementação.** Requer que `req-discovery` e/ou `req-ddd-modeling` já tenham sido executados.

---

## Entrada

| Fonte | Exemplo |
|-------|---------|
| Saída do `req-discovery` | `ddd-analysis.md` + `requirements.md` |
| Saída do `req-ddd-modeling` | `ddd-strategic-model.md` + `ddd-tactical-model.md` |
| Descrição do sistema legado | "Sistema PHP monolítico, 150 tabelas, sem testes" |

Se nenhum documento de discovery existir, perguntar:

> "Você já rodou o `req-discovery` sobre o sistema legado? Se não, me descreva o sistema: linguagem, tamanho estimado, quais módulos existem e qual o maior risco de migração."

---

## Fase 1 — Diagnóstico do Legado

### 1.1 — Classificar o Estado Atual

| Dimensão | Sinal | Impacto na Migração |
|----------|-------|---------------------|
| **Cobertura de testes** | < 20% → alto risco | Cada mudança pode quebrar sem perceber |
| **Acoplamento** | Tabelas cruzadas, God classes | Dificulta extração de módulos |
| **Banco compartilhado** | Todas as features na mesma base | Exige strangler ou schema separation |
| **Documentação** | Ausente ou desatualizada | Requer mais discovery antes de migrar |
| **Dependências externas** | APIs, integrações críticas | Precisam de ACL |
| **Tráfego/uso** | Alto volume em produção | Big Bang é arriscado |

### 1.2 — Avaliar Risco por Bounded Context

Para cada BC identificado no `ddd-analysis.md`, avaliar:

```
┌──────────────────────────────────────────────────────┐
│ BC: <nome>                                            │
│ Risco: Alto | Médio | Baixo                           │
│ Complexidade: Alta | Média | Baixa                    │
│ Valor de negócio: Core | Supporting | Generic         │
│ Dependências no legado: <lista de módulos/tabelas>    │
│ Integrações externas: <lista>                         │
│ Cobertura de testes no legado: <estimativa%>          │
└──────────────────────────────────────────────────────┘
```

---

## Fase 2 — Escolha do Padrão de Migração

### Comparativo

| Padrão | Quando usar | Risco | Velocidade |
|--------|-------------|-------|------------|
| **Strangler Fig** | Sistema em produção, migração incremental | Baixo | Lenta |
| **Branch by Abstraction** | Componente interno com acoplamento alto | Médio | Média |
| **Big Bang** | Sistema pequeno, equipe disponível, sem SLA crítico | Alto | Rápida |
| **Parallel Run** | Dados críticos, validação de paridade | Baixo | Lenta |

**Recomendação padrão**: **Strangler Fig** para sistemas em produção com usuários ativos. Big Bang apenas para sistemas pequenos ou internos.

### Strangler Fig — Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    STRANGLER FIG                            │
│                                                             │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────────┐ │
│  │ Requisição│───▶│    Façade /   │───▶│ Novo Sistema     │ │
│  │ (cliente) │    │    Router     │    │ (DDD/Clean Arch) │ │
│  └──────────┘    │               │    └──────────────────┘ │
│                  │    (proxy)    │         (BC migrado)     │
│                  │               │                          │
│                  │               │───▶┌──────────────────┐ │
│                  └───────────────┘    │ Sistema Legado   │ │
│                                       │ (BC ainda não    │ │
│                                       │  migrado)        │ │
│                                       └──────────────────┘ │
│                                                             │
│  Sprint a sprint, mais BCs migram para o novo sistema.      │
│  Quando todos migrados, o legado é desligado.               │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 3 — Desenho da Anti-Corruption Layer (ACL)

A ACL isola o novo sistema das estruturas de dados e vocabulário do legado.

### Quando usar ACL

- O legado usa modelo de dados diferente do DDD (tabelas mapeadas diretamente em models)
- O legado tem nomes/conceitos que não devem contaminar o domínio novo
- Integração com APIs legadas que retornam estruturas flat/anêmicas

### Estrutura da ACL

```
┌─────────────────────────────────────────────────────┐
│              Anti-Corruption Layer                   │
│                                                      │
│  Legado        ACL                    Novo Domínio   │
│  ─────────     ─────────────────     ─────────────  │
│  cliente_tb ──▶ LegacyCustomerDto ──▶ Customer (VO) │
│  { nm_cli,  ──▶ translate()       ──▶ { name,       │
│    cd_email,                            email,       │
│    dt_nasc }                            birthDate }  │
│                                                      │
│  Componentes:                                        │
│  • LegacyXxxAdapter  → lê do legado                 │
│  • LegacyXxxMapper   → traduz estruturas             │
│  • IXxxPort          → interface do novo domínio     │
└─────────────────────────────────────────────────────┘
```

### Artefatos de ACL por BC migrado

```markdown
#### ACL — BC "<nome>"

| Entidade Legado | Campo Legado | Conceito DDD | VO/Entity Novo |
|-----------------|-------------|--------------|----------------|
| cliente_tb      | nm_cli      | CustomerName | CustomerName VO |
| cliente_tb      | cd_email    | Email        | Email VO |
| pedido_tb       | vl_total    | Money        | Money VO (BRL) |
```

---

## Fase 4 — Sequência de Migração

### Critério de Priorização

Migrar na ordem:

1. **Generic BCs primeiro** (Auth, Notificações) — menor risco, ganho imediato
2. **Supporting BCs** com menos acoplamento — validar o processo
3. **Core BCs** por último — maior valor, maior cuidado

```
┌─────────────────────────────────────────────────────────┐
│             SEQUÊNCIA DE MIGRAÇÃO                        │
│                                                          │
│  Fase 0 (agora):    Bootstrap novo projeto + ACL setup  │
│                                                          │
│  Fase 1:            BCs Generic (Auth, Notificação)     │
│  Fase 2:            BCs Supporting de baixo acoplamento  │
│  Fase 3:            BCs Supporting de alto acoplamento   │
│  Fase 4:            BCs Core                            │
│                                                          │
│  Desligamento:      Legado desligado após Fase 4         │
└─────────────────────────────────────────────────────────┘
```

### Critérios de Conclusão por BC

- [ ] Feature parity validada (parallel run ou testes)
- [ ] Tráfego 100% no novo sistema
- [ ] Dados migrados ou sincronizados
- [ ] ACL removida (legado não mais consultado para este BC)
- [ ] Tabelas legadas arquivadas

---

## Saída

Gerar em `<docsPath>/migration/<project-name>/`:

### `migration-strategy.md` (obrigatório)

```markdown
# Estratégia de Migração — <Nome do Sistema>

**Baseado em**: <ddd-analysis.md / ddd-strategic-model.md>
**Data**: <data>
**Padrão escolhido**: Strangler Fig | Big Bang | Branch by Abstraction

## Diagnóstico do Legado

(estado atual, riscos identificados, dívida técnica)

## Padrão de Migração

(justificativa da escolha)

## Sequência de Migração

| Fase | BC | Tipo | Risco | Estimativa | Dependências |
|------|----|------|-------|------------|--------------|
| 0    | Bootstrap | TECH | Baixo | 1 sprint | — |
| 1    | Auth | Generic | Baixo | 1 sprint | Fase 0 |
| 2    | <BC> | Supporting | Médio | 2 sprints | Fase 1 |
| 3    | <BC> | Core | Alto | 3 sprints | Fase 2 |

## Plano de Coexistência

(como legado e novo rodam em paralelo, routing, feature flags)

## Anti-Corruption Layer

(quais BCs precisam de ACL, mapeamento de campos)

## Critérios de Desligamento

(quando o legado pode ser desligado por BC)
```

### `acl-design.md` (quando há integração com legado durante migração)

```markdown
# Anti-Corruption Layer — <Nome do Sistema>

## BC "<nome>" — ACL

### Mapeamento de Dados

| Entidade Legado | Campo | Conceito DDD | Tipo Novo |
|-----------------|-------|--------------|-----------|
| ...             | ...   | ...          | ...       |

### Componentes

- `Legacy<Nome>Adapter` — lê dados do legado
- `Legacy<Nome>Mapper` — traduz para entidades DDD
- `I<Nome>LegacyPort` — interface no domínio novo
```

---

## Integração com Outros Skills

### Pipeline completo (com migração)

```
req-discovery → req-ddd-modeling → req-migration-strategy → delivery-profile.md → req-agile-planning → implementação
delivery-inventory.md  ddd-tactical-model   acl-design.md           (stack+Web/Mobile/BC)  backlog.md (full-stack)
requirements.md      ddd-strategic-model  migration-strategy.md                          + openspec-apply-change
```

### Próximos passos após migration strategy

| Objetivo | Skill |
|----------|-------|
| Gerar backlog com tarefas de migração por fase | `req-agile-planning` |
| Bootstrap do projeto novo (com docker + cicd) | `config-project-fullstack` → `openspec-propose "bootstrap-<nome>"` |
| Scaffoldar módulo do BC a ser migrado | `config-new-module[-kt|-cs]` |
| Implementar ACL (adapter + mapper) | `backend-data[-kt|-cs]` + `core-repository[-kt|-cs]` |

Ao finalizar, oferecer:

> "Estratégia de migração definida!\n> Próximos passos:\n> 1. Criar `delivery-profile.md` (stack C#/Vue/Android + colunas API/Web/Mobile por BC)\n> 2. Gerar backlog full-stack por fase (`req-agile-planning`)\n> 3. Bootstrap (`config-project-fullstack`)\n> 4. Migrar BC (`openspec-propose \"ep-001-<bc>\"`)"

---

## Guardrails

- **Nunca recomendar Big Bang** para sistemas com > 20 usuários ativos sem validação explícita
- **Sempre desenhar ACL** quando o legado usa nomes/estruturas diferentes do domínio
- **Migrar Generic BCs primeiro** — Auth e Notificação validam o processo com menor risco
- **Documentar feature flags** se o roteamento entre legado e novo for condicional
- **Parallel Run obrigatório** para BCs Core antes do cutover

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
