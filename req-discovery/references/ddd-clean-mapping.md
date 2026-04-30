# DDD & Clean Architecture — Mapeamento para Skills

Este documento mapeia conceitos de DDD/Clean Architecture para os skills deste repositório.

**Premissa**: o sistema fonte pode ser qualquer linguagem/arquitetura (PHP MVC, Go, Python, Java, monolito, etc.). A **saída** é sempre DDD/Clean Architecture. A **implementação** usa sempre os skills deste repositório (TypeScript, Kotlin ou C#).

```
Sistema fonte     req-discovery     req-ddd-modeling       req-agile-planning     Skills TS/KT/CS
(qualquer)   ──▶  (leitura)    ──▶  (modelagem DDD)  ──▶   (planejamento)   ──▶  (implementação)
                  requirements.md   ddd-strategic-model.md backlog.md
                  ddd-analysis.md   ddd-tactical-model.md  epics-summary.md
```

## Camadas da Clean Architecture → Skills

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           INTERFACE (API/UI)                            │
│  Skills: backend-controller[-kt|-cs] · frontend-form-schema             │
├──────────────────────────────────────────────────────────────────────────┤
│                          APPLICATION                                    │
│  Skills: core-use-case[-kt|-cs] · core-dto[-kt|-cs]                    │
│          core-query-cqrs[-kt|-cs]                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                            DOMAIN                                       │
│  Skills: core-entity[-kt|-cs] · core-value-object[-kt|-cs]             │
│          core-domain-service[-kt|-cs] · core-repository[-kt|-cs]        │
├──────────────────────────────────────────────────────────────────────────┤
│                         INFRASTRUCTURE                                  │
│  TS: backend-prisma-data · config-prisma                                │
│  KT: backend-data-kt · config-jpa-kt                                   │
│  CS: backend-data-cs · config-efcore-cs                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## Conceitos DDD → Skills de Implementação

| Conceito DDD | O que é | Skill TS | Skill KT | Skill CS |
|-------------|---------|----------|----------|----------|
| **Bounded Context** | Limite de domínio → 1 módulo | `config-new-module` | `config-new-module-kt` | `config-new-module-cs` |
| **Entity** | Objeto com identidade e ciclo de vida | `core-entity` | `core-entity-kt` | `core-entity-cs` |
| **Value Object** | Objeto imutável sem identidade | `core-value-object` | `core-value-object-kt` | `core-value-object-cs` |
| **Aggregate** | Cluster de entities com raiz | `core-entity` | `core-entity-kt` | `core-entity-cs` |
| **Domain Service** | Regra entre múltiplas entities | `core-domain-service` | `core-domain-service-kt` | `core-domain-service-cs` |
| **Repository (port)** | Contrato de persistência | `core-repository` | `core-repository-kt` | `core-repository-cs` |
| **Repository (adapter)** | Implementação de persistência | `backend-prisma-data` | `backend-data-kt` | `backend-data-cs` |
| **Use Case** | Orquestração de aplicação | `core-use-case` | `core-use-case-kt` | `core-use-case-cs` |
| **DTO** | Contrato de entrada/saída | `core-dto` | `core-dto-kt` | `core-dto-cs` |
| **Query (CQRS)** | Leitura otimizada | `core-query-cqrs` | `core-query-cqrs-kt` | `core-query-cqrs-cs` |
| **Controller** | Endpoint HTTP | `backend-controller` | `backend-controller-kt` | `backend-controller-cs` |
| **Form/Schema** | Validação frontend | `frontend-form-schema` | — | — |

## Leitura do Sistema Fonte — Como Identificar Conceitos

O sistema sendo analisado pode ser MVC, monolito, microservices, ou qualquer padrão. A tabela abaixo mapeia o que existe no sistema fonte para o conceito DDD que será usado na saída:

| No sistema fonte (MVC) | Conceito DDD na saída | Skill de implementação |
|------------------------|----------------------|----------------------|
| Model (Eloquent, ActiveRecord, GORM, etc.) | Entity + Repository port | `core-entity` + `core-repository` |
| Controller action / handler | Use Case | `core-use-case` |
| Form validation / FormRequest / struct tags | Value Object + DTO | `core-value-object` + `core-dto` |
| Service class / business logic | Domain Service ou Use Case | `core-domain-service` ou `core-use-case` |
| Migration / schema | Infrastructure (migration) | `config-prisma` / `config-jpa-kt` |
| View / Template / frontend | Interface layer | `frontend-form-schema` |
| Middleware / guard | Cross-cutting concern | `config-auth-*` |
| Route definition | Controller endpoint | `backend-controller` |
| Seção/módulo separado | Bounded Context | `config-new-module` |

## Fluxo de Task por Funcionalidade

Quando uma funcionalidade é identificada, as tasks seguem a ordem inside-out:

```
1. DOMAIN (de dentro para fora)
   ├── 1.1  Value Objects    → core-value-object[-kt|-cs]
   ├── 1.2  Entity           → core-entity[-kt|-cs]
   ├── 1.3  Domain Service   → core-domain-service[-kt|-cs]  (se houver)
   └── 1.4  Repository port  → core-repository[-kt|-cs]

2. APPLICATION
   ├── 2.1  DTOs (in/out)    → core-dto[-kt|-cs]
   ├── 2.2  Use Case         → core-use-case[-kt|-cs]
   └── 2.3  Query (CQRS)     → core-query-cqrs[-kt|-cs]

3. INFRASTRUCTURE
   ├── 3.1  Persistence      → backend-prisma-data (TS) / backend-data-kt (KT) / backend-data-cs (CS)
   └── 3.2  Schema/Migration → config-prisma (TS) / config-jpa-kt (KT) / config-efcore-cs (CS)

4. INTERFACE
   ├── 4.1  Controller       → backend-controller[-kt|-cs]
   └── 4.2  Form/Page        → frontend-form-schema

5. QUALITY
   ├── 5.1  Testes unitários (entity, VO, use case)
   └── 5.2  Teste e2e (fluxo completo)
```

## Notação de Task

Nas tasks do `req-agile-planning`, usar o formato:

```markdown
- [ ] `domain:entity` Criar entidade Customer com VOs Name e Email → skill: core-entity[-kt|-cs] (~2h)
- [ ] `domain:vo` Criar VO CustomerName com validação → skill: core-value-object[-kt|-cs] (~1h)
- [ ] `app:usecase` Criar CreateCustomerUseCase → skill: core-use-case[-kt|-cs] (~2h)
- [ ] `app:dto` Criar CreateCustomerInDTO e CustomerOutDTO → skill: core-dto[-kt|-cs] (~1h)
- [ ] `infra:persistence` Criar adapter para CustomerRepository → skill: backend-prisma-data|backend-data-kt|backend-data-cs (~2h)
- [ ] `interface:controller` Criar POST /api/customers → skill: backend-controller[-kt|-cs] (~2h)
- [ ] `test:unit` Testes unitários da entidade e VOs (~1h)
- [ ] `test:e2e` Teste e2e do fluxo de cadastro (~2h)
```

O `[-kt|-cs]` significa: sem sufixo para TS, `-kt` para Kotlin, `-cs` para C#. A escolha é feita no momento da implementação.

## Escolha da Stack

| Stack | Skills disponíveis | Framework |
|-------|-------------------|-----------|
| **TypeScript** | Todos sem sufixo | NestJS + Prisma + React |
| **Kotlin** | Todos com `-kt` | Spring Boot + JPA + Gradle |
| **C#** | Todos com `-cs` | ASP.NET Core + EF Core |

## Bounded Contexts na Discovery

Sinais para identificar Bounded Contexts no sistema fonte:

| Sinal no sistema fonte | Indica |
|------------------------|--------|
| Menu/seção separada na UI | Possível bounded context |
| Grupo de tabelas relacionadas | Aggregate |
| Prefixo de rota diferente (`/auth/*`, `/orders/*`) | Bounded context |
| Módulo/package/namespace separado | Bounded context explícito |
| Equipe diferente mantém | Bounded context organizacional |
| Termos/vocabulário diferentes | Linguagem ubíqua diferente |

Cada Bounded Context identificado → 1 Épico no planejamento → 1 módulo na implementação.

## Modelagem DDD (req-ddd-modeling)

Quando disponível, o `req-ddd-modeling` fornece análise mais profunda que a discovery:

| Conceito | Discovery (`ddd-analysis.md`) | Modelagem (`ddd-strategic-model.md` + `ddd-tactical-model.md`) |
|----------|-------------------------------|----------------------------------------------------------------|
| Subdomínios (Core/Supporting/Generic) | Não inclui | Classificação completa |
| Cardinalidade Subdomínio ↔ BC (1:1, 1:N, N:1) | Não inclui | Análise detalhada |
| Context Map com relações tipadas | Básico | Completo (OHS, ACL, Shared Kernel, etc.) |
| Linguagem Ubíqua | Não inclui | Glossário por BC |
| Domain Events | Não inclui | Identificados por BC |
| Topologia (monólito/microserviços) | Não inclui | Recomendação com justificativa |

O `req-agile-planning` usa a saída do `req-ddd-modeling` como fonte preferencial quando disponível.
1 Épico no planejamento → 1 módulo na implementação.
