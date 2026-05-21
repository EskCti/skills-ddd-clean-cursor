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
Descrição: Setup full-stack, shared kernel, shell web, Docker (produção) e CI/CD
Agents: Config Project Full-Stack → Config Project (*) + Config Shared Web (*) + Config Docker + Config CI/CD + Config Shared Core
OpenSpec: openspec-propose "bootstrap-<nome>"
Justificativa: <quais épicos funcionais desbloqueiam>
Tamanho: M
Tasks: N
```

## Tipos de Task (por camada DDD / Clean Architecture)

Tasks são tipadas pela camada arquitetural e incluem o **agent Cursor** a acionar e um **prompt sugerido**.

### Formato padrão de task

```markdown
- [ ] `<prefixo>` <descrição da tarefa> (~<tempo>)
  - **Agent:** `<display_name do agent>` (ou TS | KT | CS se stack não definida)
  - **Prompt:** "<instrução específica para o agent — classe, VOs, comportamento>"
```

### Domain Layer

| Tipo | Descrição | Agent TS | Agent KT | Agent CS |
|------|-----------|----------|----------|----------|
| `domain:vo` | Value Object | `Core Value Object` | `Core Value Object (Kotlin)` | `Core Value Object (C#)` |
| `domain:entity` | Entidade de domínio | `Core Entity` | `Core Entity (Kotlin)` | `Core Entity (C#)` |
| `domain:service` | Serviço de domínio | `Core Domain Service` | `Core Domain Service (Kotlin)` | `Core Domain Service (C#)` |
| `domain:repository` | Contrato de repositório (port) | `Core Repository` | `Core Repository (Kotlin)` | `Core Repository (C#)` |
| `domain:shared` | Shared Kernel | `Config Shared Core` | `Config Shared Core (Kotlin)` | `Config Shared Core (C#)` |

### Application Layer

| Tipo | Descrição | Agent TS | Agent KT | Agent CS |
|------|-----------|----------|----------|----------|
| `app:dto` | Data Transfer Object | `Core DTO` | `Core DTO (Kotlin)` | `Core DTO (C#)` |
| `app:usecase` | Caso de uso | `Core Use Case` | `Core Use Case (Kotlin)` | `Core Use Case (C#)` |
| `app:query` | Query CQRS (leitura) | `Core Query CQRS` | `Core Query CQRS (Kotlin)` | `Core Query CQRS (C#)` |

### Infrastructure Layer

| Tipo | Agent TS | Agent KT | Agent CS |
|------|----------|----------|----------|
| `infra:persistence` | `Backend Prisma Data` | `Backend Data (Kotlin)` | `Backend Data (C#)` |
| `infra:migration` | `Config Prisma` | `Config JPA (Kotlin)` | `Config EF Core (C#)` |
| `infra:setup` | `Config Project` | `Config Project (Kotlin)` | `Config Project (C#)` |
| `infra:shell-web` | `Config Shared Web` / `(Angular)` / `(Vue)` | — | — |
| `domain:shared` | `Config Shared Core` | `Config Shared Core (Kotlin)` | `Config Shared Core (C#)` |
| `infra:auth` | `Config Auth Core Basic` | `Config Auth Core Basic (Kotlin)` | `Config Auth Core (C#)` |
| `infra:db` | `Config Prisma` | `Config JPA (Kotlin)` | `Config EF Core (C#)` |
| `infra:docker` | `Config Docker (TypeScript)` | `Config Docker (Kotlin)` | `Config Docker (C#)` |
| `infra:cicd` | `Config CI/CD (TypeScript)` | `Config CI/CD (Kotlin)` | `Config CI/CD (C#)` |

### Interface Layer

| Tipo | Descrição | Agent TS | Agent KT | Agent CS |
|------|-----------|----------|----------|----------|
| `interface:controller` | Endpoint HTTP | `Backend Controller` | `Backend Controller (Kotlin)` | `Backend Controller (C#)` |
| `interface:form` | Formulário frontend (Next.js) | `Frontend Form Schema` | — | — |
| `interface:entity` | Entidade de domínio frontend | `Frontend Entity (Angular)` ou `Frontend Entity (Vue)` | — | — |
| `interface:usecase` | Caso de uso frontend (application) | `Frontend UseCase (Angular)` ou `Frontend UseCase (Vue)` | — | — |
| `interface:repository` | Repositório HTTP frontend | `Frontend Repository (Angular)` ou `Frontend Repository (Vue)` | — | — |
| `interface:page` | Página/listagem frontend | `Frontend Page (Angular)` ou `Frontend Page (Vue)` | — | — |
| `interface:form-web` | Formulário frontend (Angular/Vue) | `Frontend Form (Angular)` ou `Frontend Form (Vue)` | — | — |
| `interface:mobile-entity` | Entidade de domínio mobile | `Mobile Entity (Flutter)` ou `Mobile Entity (Android)` | — | — |
| `interface:mobile-usecase` | Caso de uso mobile (application) | `Mobile UseCase (Flutter)` ou `Mobile UseCase (Android)` | — | — |
| `interface:mobile-repository` | Repositório HTTP mobile | `Mobile Repository (Flutter)` ou `Mobile Repository (Android)` | — | — |
| `interface:mobile` | Tela mobile (apresentação) | `Mobile Screen (Flutter)` ou `Mobile Screen (Android)` | — | — |
| `interface:mobile-form` | Formulário mobile | `Mobile Form (Flutter)` ou `Mobile Form (Android)` | — | — |

### Qualidade

| Tipo | Descrição | Agent / meta |
|------|-----------|--------------|
| `test:unit` | Teste unitário | `Unit Tests (TypeScript/Kotlin/C#)` |
| `test:coverage` | Gate ≥95% domain+app | `Unit Tests (...)` + `scripts/check-coverage.mjs` |
| `test:e2e` | Teste end-to-end | **Agent:** `E2E Tests (TS/KT/CS)` — Supertest, MockMvc ou WebApplicationFactory (+ Playwright se UI) |
| `docs` | Documentação | API docs, README, ADR |

### Exemplo de task completa (stack C# definida)

```markdown
- [ ] `domain:entity` Criar entidade Order com VOs Money e OrderStatus (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade Order em C# com VOs Money (valor + moeda) e OrderStatus (enum). Aggregate root com OrderItems como filhos. Métodos AddItem(), PlaceOrder(). Create() retornando Result<T>."
```

### Exemplo de task (stack não definida)

```markdown
- [ ] `domain:entity` Criar entidade Order com VOs Money e OrderStatus (~2h)
  - **Agent TS:** `Core Entity` | **KT:** `Core Entity (Kotlin)` | **CS:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade Order com VOs Money e OrderStatus. Aggregate root com AddItem() e PlaceOrder()."
```

### Ordem de implementação (inside-out)

```
── BACKEND (camadas internas primeiro) ──────────────────────
1. domain:vo              → Validações fundamentais
2. domain:entity          → Modelo de domínio
3. domain:service         → Regras transversais
4. domain:repository      → Contrato de persistência
5. app:dto                → Contratos de API
6. app:usecase            → Orquestração
7. app:query              → Leitura otimizada
8. infra:persistence      → Adapter real
9. infra:migration        → Schema de banco
10. interface:controller  → Endpoints HTTP

── FRONTEND WEB (Clean Architecture igual ao backend) ───────
11. interface:entity      → Entidade domínio TypeScript (Result<T>)
12. interface:usecase     → UseCase (injeta IRepository, Promise<Result>)
13. interface:repository  → HttpRepository (DTO mapping, try/catch → err)
14. interface:page        → Listagem (injeta UseCase, não HTTP direto)
15. interface:form-web    → Formulário (exibe result.error de negócio)
16. interface:form        → Formulário Next.js (se aplicável)

── MOBILE (Clean Architecture igual ao backend) ─────────────
17. interface:mobile-entity      → Entidade Dart/Kotlin pura (sealed Result)
18. interface:mobile-usecase     → UseCase (injeta IRepository, Future<Result>)
19. interface:mobile-repository  → RepositoryImpl (Dio/Retrofit, catch → Failure)
20. interface:mobile             → Tela (notifier/ViewModel injeta UseCase)
21. interface:mobile-form        → Formulário (trata result.when/onSuccess)

── QUALIDADE ─────────────────────────────────────────────────
22. test:unit             → Testes de domínio/app (entity, VO, use case)
23. test:coverage         → Validar ≥95% coverage em domain + application
24. test:e2e              → Testes de fluxo
```

### Escolha de stack (na implementação)

| Stack | Sufixo | Framework | Automação |
|-------|--------|-----------|-----------|
| **TypeScript** | (nenhum) | NestJS + Prisma + Next.js | Templates + scripts |
| **Kotlin** | `-kt` | Spring Boot + JPA + Gradle | Templates + scripts |
| **C#** | `-cs` | ASP.NET Core + EF Core | Templates + scripts |
| **Angular** | `-angular` | Angular 17+ + Tailwind + PrimeNG (widgets) | Templates |
| **Vue** | `-vue` | Vue 3 + Tailwind + PrimeVue + Pinia | Templates |
| **Flutter** | `-flutter` | Flutter + Riverpod + Dio | Templates |
| **Android** | `-android` | Jetpack Compose + Hilt + Retrofit | Templates |

> O sistema fonte analisado pelo `req-discovery` pode ser qualquer linguagem (PHP, Go, Python, Java, etc.). As tasks do backlog referenciam skills TS, KT, CS e/ou frontend/mobile deste repositório, pois o objetivo é reimplementar usando DDD/Clean Architecture + frontend/mobile moderno.

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
