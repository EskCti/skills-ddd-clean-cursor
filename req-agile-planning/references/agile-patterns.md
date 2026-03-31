# Agile Planning Patterns

## Hierarquia de Itens

```
Tema (opcional)
  └── Épico (EP-XXX)
        └── User Story (US-XXX)
              └── Task (TK-XXX)
                    └── Subtask (opcional)
```

## Formato de User Story

```
Como <persona/role>,
quero <ação ou funcionalidade>,
para que <valor de negócio ou benefício>.
```

### Boas Stories (INVEST)

| Critério | Descrição |
|----------|-----------|
| **I**ndependent | Pode ser desenvolvida sem depender de outra story |
| **N**egotiable | Os detalhes podem ser discutidos com o PO |
| **V**aluable | Entrega valor visível ao usuário ou negócio |
| **E**stimable | O time consegue estimar o esforço |
| **S**mall | Cabe em uma sprint (idealmente 1-5 dias) |
| **T**estable | Tem critérios claros de aceite |

## Critérios de Aceitação (Given/When/Then)

```
Dado que <pré-condição>,
quando <ação do usuário>,
então <resultado esperado>.
```

## Estimativa (Fibonacci)

| Pontos | Complexidade | Referência |
|--------|-------------|-----------|
| 1 | Trivial | Mudança de texto, config |
| 2 | Simples | CRUD básico, campo novo |
| 3 | Moderado | Funcionalidade com validação |
| 5 | Complexo | Fluxo multi-step, integração |
| 8 | Muito complexo | Feature nova com lógica de negócio |
| 13 | Épico | Deve ser quebrado em stories menores |

## Priorização MoSCoW

| Prioridade | Significado | Quando usar |
|-----------|-------------|------------|
| **Must** | Obrigatório para o MVP | Sem isso o produto não funciona |
| **Should** | Importante, mas não bloqueante | Melhora significativa de UX/valor |
| **Could** | Desejável se houver tempo | Nice-to-have, diferencial |
| **Won't** | Fora de escopo desta release | Documentar para futuro |

## Templates de Épico

### Épico Funcional (= Bounded Context)
```
EP-XXX: <Nome>
Bounded Context: BC-XXX
Descrição: <o que este contexto de domínio entrega>
Valor: <por que é importante>
Entities: <lista de entities identificadas>
Dependências: <outros épicos necessários>
Tamanho: P/M/G/GG
Stories: N
```

### Épico Técnico (enabler)
```
EP-000: [TECH] Bootstrap
Descrição: Setup do projeto, shared kernel, banco
Skills: config-project, config-shared-core, config-prisma / config-jpa-kt
Justificativa: <quais épicos funcionais desbloqueiam>
Tamanho: P/M/G/GG
Tasks: N
```

## Tipos de Task (por camada DDD / Clean Architecture)

Tasks são tipadas pela camada arquitetural e referenciam o skill agnóstico correspondente.

### Domain Layer

| Tipo | Descrição | Skill | Exemplos |
|------|-----------|-------|----------|
| `domain:vo` | Value Object | core-value-object | Criar Email, Money, CustomerName |
| `domain:entity` | Entidade de domínio | core-entity | Criar Customer, Order, Product |
| `domain:service` | Serviço de domínio | core-domain-service | PricingPolicy, ShippingCalculator |
| `domain:repository` | Contrato de repositório (port) | core-repository | CustomerRepository interface |

### Application Layer

| Tipo | Descrição | Skill | Exemplos |
|------|-----------|-------|----------|
| `app:dto` | Data Transfer Object | core-dto | CreateCustomerInDTO, CustomerOutDTO |
| `app:usecase` | Caso de uso | core-use-case | CreateCustomerUseCase |
| `app:query` | Query CQRS (leitura) | core-query-cqrs | FindCustomerByIdQuery |

### Infrastructure Layer

| Tipo | Skill TS | Skill KT | Skill CS |
|------|----------|----------|----------|
| `infra:persistence` | `backend-prisma-data` | `backend-data-kt` | `backend-data-cs` |
| `infra:migration` | `config-prisma` | `config-jpa-kt` | `config-efcore-cs` |
| `infra:setup` | `config-project`, `config-new-module` | `config-project-kt`, `config-new-module-kt` | `config-project-cs`, `config-new-module-cs` |
| `infra:auth` | `config-auth-core-basic`, `config-auth-backend-basic` | `config-auth-core-basic-kt`, `config-auth-backend-basic-kt` | `config-auth-core-basic-cs`, `config-auth-backend-basic-cs` |
| `infra:db` | `config-prisma` | `config-jpa-kt` | `config-efcore-cs` |

### Interface Layer

| Tipo | Descrição | Skill | Exemplos |
|------|-----------|-------|----------|
| `interface:controller` | Endpoint HTTP | backend-controller | POST /api/customers |
| `interface:form` | Formulário frontend | frontend-form-schema | CustomerForm + schema |

### Qualidade

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| `test:unit` | Teste unitário | Entity, VO, UseCase |
| `test:e2e` | Teste end-to-end | Fluxo completo |
| `docs` | Documentação | API docs, README, ADR |

### Ordem de implementação (inside-out)

```
1. domain:vo         → Validações fundamentais
2. domain:entity     → Modelo de domínio
3. domain:service    → Regras transversais
4. domain:repository → Contrato de persistência
5. app:dto           → Contratos de API
6. app:usecase       → Orquestração
7. app:query         → Leitura otimizada
8. infra:persistence → Adapter real
9. infra:migration   → Schema de banco
10. interface:controller → Endpoints
11. interface:form    → UI
12. test:unit         → Testes de domínio/app
13. test:e2e          → Testes de fluxo
```

### Escolha de stack (na implementação)

| Stack | Sufixo | Framework | Automação |
|-------|--------|-----------|-----------|
| **TypeScript** | (nenhum) | NestJS + Prisma + React | Templates + scripts |
| **Kotlin** | `-kt` | Spring Boot + JPA + Gradle | Templates + scripts |
| **C#** | `-cs` | ASP.NET Core + EF Core | Templates + scripts |

> O sistema fonte analisado pelo `req-discovery` pode ser qualquer linguagem (PHP, Go, Python, Java, etc.). As tasks do backlog referenciam skills TS, KT ou CS deste repositório, pois o objetivo é reimplementar usando DDD/Clean Architecture.

## Padrão de Rastreabilidade

Cada Story deve referenciar o(s) requisito(s) de origem:

```
### US-015: Filtrar produtos por categoria

> Ref: RF-023, RF-024

> Como comprador,
> quero filtrar produtos por categoria,
> para encontrar rapidamente o que procuro.
```

## Anti-Patterns a Evitar

- Stories sem critério de aceitação
- Tasks vagas ("implementar backend")
- Épicos com mais de 15 stories (quebrar)
- Stories com mais de 8 pontos (quebrar)
- Tasks estimadas em mais de 4 horas (quebrar)
- Stories que não entregam valor isoladamente
- Épicos sem owner ou prioridade
