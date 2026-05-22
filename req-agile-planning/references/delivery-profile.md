# Perfil de entrega (delivery profile)

Artefato **obrigatório** antes de gerar `backlog.md` em projetos que tenham **web admin** e/ou **mobile**. Fixa a stack e define, por Bounded Context, se haverá API, painel web e app — evitando backlog só com backend ou só com `interface:page`.

## Posição no pipeline

```
req-discovery
  └── delivery-inventory.md     ← telas/rotas legado por área (superfícies)
req-ddd-modeling
  └── ddd-tactical-model.md     ← bloco “Superfícies de entrega” por BC
req-migration-strategy          ← opcional
delivery-profile.md             ← ESTE artefato (stack fixa + tabela API/Web/Mobile)
req-agile-planning
  └── backlog.md                ← tasks com Agent + Prompt por camada
```

Sem `delivery-profile.md`, o `req-agile-planning` tende a gerar épicos **agnósticos** ou US incompletas (ex.: só `Backend Controller` + `Frontend Page`).

---

## Onde salvar

```
<docsPath>/planning/<projeto>/delivery-profile.md
```

- Mesmo `<projeto>` que `discovery/<projeto>/` e `modeling/<projeto>/`.
- Entrada recomendada: `discovery/<projeto>/delivery-inventory.md`.

---

## Universo de tecnologias (escolher UMA combinação por projeto)

Não listar “pode ser A ou B” no backlog. Escolher **uma linha** da tabela [Combinações válidas](#combinações-válidas-recomendadas) e preencher o template com agents **concretos**.

### Backend (API + domínio)

| Opção | Runtime / framework | Persistência típica | Sufixo skills | Pasta monorepo |
|-------|---------------------|---------------------|---------------|----------------|
| **TypeScript** | NestJS | Prisma + Postgres | _(sem sufixo)_ | `apps/backend` |
| **Kotlin** | Spring Boot | JPA/Flyway + Postgres | `-kt` | `apps/backend` |
| **C#** | ASP.NET Core 8+ | EF Core + Postgres | `-cs` | `apps/backend` |

> **Kotlin no backend** = Spring Boot (JVM). **Kotlin no mobile** = Android nativo (Compose) — camadas diferentes.

### Web (painel admin)

| Opção | Framework | UI components | Shell skill | Pasta monorepo |
|-------|-----------|---------------|-------------|----------------|
| **Next.js** | App Router, React | Tailwind + formulários (RHF/Zod via shared-web) | `Config Shared Web` | `apps/web` |
| **Vue 3** | Composition API, Pinia | **PrimeVue** 4 + Tailwind | `Config Shared Web (Vue)` | `apps/web-vue` |
| **Angular 17+** | Standalone, signals | **PrimeNG** + Tailwind | `Config Shared Web (Angular)` | `apps/web-angular` |

| Propósito | Melhor fit |
|-----------|------------|
| Admin interno (tabelas, menus, CRUD, RBAC) | **Vue + PrimeVue** ou **Angular + PrimeNG** |
| Site/marketing, SSR, SEO, app Next full-stack TS | **Next.js** (geralmente com NestJS) |

### Mobile

| Opção | Stack | HTTP | Pasta monorepo |
|-------|-------|------|----------------|
| **Flutter** | Dart, Riverpod, Dio | iOS + Android (um código) | `apps/mobile-flutter` |
| **Android** | Kotlin, Compose, Hilt, Retrofit | Android nativo | `apps/mobile-android` |

---

## Combinações válidas (recomendadas)

Triades com tutorial e bootstrap documentados em `config-project-fullstack` / `docs/tutorial/stacks/`:

| ID | Backend | Web | Mobile | Tutorial |
|----|---------|-----|--------|----------|
| T1 | NestJS (TS) | Angular + PrimeNG | Flutter | `nestjs-angular-flutter` |
| T2 | NestJS (TS) | Vue 3 + PrimeVue | Flutter | `nestjs-vue-flutter` |
| T3 | NestJS (TS) | Next.js | Flutter | `nestjs-next-flutter` |
| J1 | Spring Boot (KT) | Vue 3 + PrimeVue | Flutter | `spring-vue-flutter` |
| N1 | ASP.NET Core (CS) | Angular + PrimeNG | Android | `dotnet-angular-android` |
| N2 | ASP.NET Core (CS) | Vue 3 + PrimeVue | Android | `dotnet-cs-vue-android` |

Outras misturas (ex.: C# + Next + Flutter) podem funcionar, mas exigem adaptação manual de skills/tutorials — preferir uma linha acima.

### Modo só backend (Strangler / API only)

| Backend | Web | Mobile |
|---------|-----|--------|
| NestJS, Spring Boot ou ASP.NET Core | **Nenhum** | **Nenhum** |

Ver seção [Somente backend](#somente-backend-incremental).

---

## Mapeamento rápido: perfil → sufixo e agents

Preencher **uma coluna** no `delivery-profile.md` do projeto.

### Backend

| Perfil | Sufixo | Exemplos de Agent |
|--------|--------|-------------------|
| TS | — | `Core Entity`, `Core Use Case (C#)` → `Core Use Case`, `Backend Controller`, `Backend Prisma Data` |
| KT | `-kt` | `Core Entity (Kotlin)`, `Backend Controller (Kotlin)`, `Backend Data (Kotlin)` |
| CS | `-cs` | `Core Entity (C#)`, `Backend Controller (C#)`, `Backend Data (C#)` |

### Web (escolher Angular **ou** Vue **ou** Next — não os três)

| Perfil | Agents frontend |
|--------|-----------------|
| Angular | `Frontend Entity (Angular)` → `Frontend UseCase (Angular)` → `Frontend Repository (Angular)` → `Frontend Page (Angular)` → `Frontend Form (Angular)` |
| Vue | `Frontend Entity (Vue)` → `Frontend UseCase (Vue)` → `Frontend Repository (Vue)` → `Frontend Page (Vue)` → `Frontend Form (Vue)` |
| Next.js | `Frontend Form Schema` + páginas em `apps/web`; auth pronta: `Config Auth Web Basic` |

### Mobile (Flutter **ou** Android)

| Perfil | Agents mobile |
|--------|---------------|
| Flutter | `Mobile Entity (Flutter)` → `Mobile UseCase (Flutter)` → `Mobile Repository (Flutter)` → `Mobile Screen (Flutter)` → `Mobile Form (Flutter)` |
| Android | `Mobile Entity (Android)` → `Mobile UseCase (Android)` → `Mobile Repository (Android)` → `Mobile Screen (Android)` → `Mobile Form (Android)` |

### Testes por superfície

| Superfície | Prefixo task | Agent (orientação) |
|------------|--------------|-------------------|
| Backend domain/app | `test:unit`, `test:coverage` | `Unit Tests (TypeScript)` / `(Kotlin)` / `(C#)` |
| Backend HTTP | `test:e2e` | `E2E Tests (TypeScript)` / `(Kotlin)` / `(C#)` |
| Web use cases/repos | `test:unit-web` | `Frontend UseCase (Vue)` ou `(Angular)` — Vitest/Jest no prompt |
| Mobile use cases | `test:unit-mobile` | `Mobile UseCase (Android)` ou `(Flutter)` — JUnit no prompt |
| UI E2E web | `test:e2e` (TS stack) | `E2E Tests (TypeScript)` — Playwright no prompt |

---

## EP-000 — agents de bootstrap (por triade)

Usar no `backlog.md` com **Agent** + **Prompt** (não só nomes de skills).

### T2 — NestJS + Vue + Flutter

| Task | Agent |
|------|-------|
| `infra:fullstack` | `Config Project Full-Stack` |
| `infra:setup` backend | `Config Project` |
| `infra:setup` web | `Config Project (Vue)` |
| `infra:shell-web` | `Config Shared Web (Vue)` |
| `infra:setup` mobile | `Config Project (Flutter)` |
| `infra:docker` | `Config Docker (TypeScript)` |
| `infra:cicd` | `Config CI/CD (TypeScript)` |
| `domain:shared` | `Config Shared Core` |
| `infra:db` | `Config Prisma` |

### N2 — ASP.NET Core + Vue + Android (ex.: RetailOps)

| Task | Agent |
|------|-------|
| `infra:fullstack` | `Config Project Full-Stack` |
| `infra:setup` backend | `Config Project (C#)` |
| `infra:setup` web | `Config Project (Vue)` |
| `infra:shell-web` | `Config Shared Web (Vue)` |
| `infra:setup` mobile | `Config Project (Android)` |
| `infra:docker` | `Config Docker (C#)` |
| `infra:cicd` | `Config CI/CD (C#)` |
| `domain:shared` | `Config Shared Core (C#)` |
| `infra:db` | `Config EF Core (C#)` |

### N1 — ASP.NET Core + Angular + Android

Igual N2, trocando `Config Project (Vue)` / `Config Shared Web (Vue)` por `(Angular)`.

### T1 — NestJS + Angular + Flutter

Igual T2, trocando Vue por `Config Project (Angular)` + `Config Shared Web (Angular)`.

### T3 — NestJS + Next.js + Flutter

Igual T2, trocando Vue por `Config Project` (monorepo com `apps/web` Next) + `Config Shared Web`; auth: `Config Auth Web Basic`.

---

## Superfícies por BC — legenda

| Valor | Significado no backlog |
|-------|------------------------|
| **Sim** | Incluir **todas** as tasks da camada (inside-out). Ver blocos abaixo. |
| **Parcial** | Apenas subset (ex.: relatórios web, sem CRUD) — listar no campo Observação. |
| **Não** | Não gerar tasks web/mobile para este BC na release; API pode ser **Sim**. |
| **N/A** | BC não existe nesta release. |

### Bloco de tasks obrigatório quando **Web = Sim**

```
interface:entity → interface:usecase → interface:repository
  → interface:page → interface:form-web (se houver formulário)
  → test:unit-web (recomendado)
```

**Proibido:** só `interface:page` ou `interface:page` + `interface:form-web` sem entity/usecase/repository.

### Bloco de tasks obrigatório quando **Mobile = Sim**

```
interface:mobile-entity → interface:mobile-usecase → interface:mobile-repository
  → interface:mobile → interface:mobile-form (se cadastro/edição)
  → test:unit-mobile (recomendado)
```

### Bloco de tasks obrigatório quando **API = Sim**

```
domain:vo → domain:entity → domain:service (se aplicável)
  → domain:repository (port) → app:dto → app:usecase → app:query (se leitura)
  → infra:persistence → interface:controller
  → test:unit → test:e2e (fluxos críticos da US)
```

---

## Auth (épico / BC Identity)

| Camada | TS + Next | TS + Angular/Vue | CS / KT |
|--------|-----------|------------------|---------|
| Core + API | `Config Auth Core Basic` + `Config Auth Backend Basic` | idem (sufixo `-kt` / `-cs`) | idem |
| Web admin | `Config Auth Web Basic` (**somente Next.js**) | `Frontend Entity` → … → `Frontend Page` (login, guards, permissões) | idem |

---

## Template — copiar para `planning/<projeto>/delivery-profile.md`

```markdown
# Perfil de entrega — <Nome do Projeto>

**Data**: <YYYY-MM-DD>
**Legado**: <caminho ou URL>
**Combinação**: <T1|T2|T3|J1|N1|N2|Backend only>
**Inventário**: `docs/discovery/<projeto>/delivery-inventory.md`

## Stack alvo (fixa — uma opção por linha)

| Camada | Escolha | Tecnologia | Pasta no monorepo |
|--------|---------|------------|-------------------|
| Backend | TS \| KT \| CS | <NestJS \| Spring Boot \| ASP.NET Core 8> | `apps/backend` |
| Web admin | Next \| Vue \| Angular \| **Nenhum** | <detalhe abaixo> | `apps/web` \| `apps/web-vue` \| `apps/web-angular` |
| Mobile | Flutter \| Android \| **Nenhum** | <detalhe abaixo> | `apps/mobile-flutter` \| `apps/mobile-android` |
| Banco | — | <Prisma \| Flyway/JPA \| EF Core> + Postgres | — |

**Sufixo de skills**: `—` (TS) \| `-kt` \| `-cs`

**Detalhe web**: <ex.: Vue 3 + PrimeVue 4 + Tailwind · Angular 17+ + PrimeNG · Next.js App Router>

**Detalhe mobile**: <ex.: Flutter Riverpod+Dio · Kotlin Compose+Hilt+Retrofit>

## Superfícies por Bounded Context (MVP / Release X)

| BC / Épico | API REST | Web admin | Mobile | Observação |
|------------|----------|-----------|--------|------------|
| EP-000 Bootstrap | Sim | <Sim/Não> | <Sim/Não> | shell, health |
| EP-001 … | Sim | Sim | Sim | ex.: login + permissões + perfil |
| EP-00N … | Sim | Não | Não | só API nesta release |

## Resumo do inventário de UI (legado)

- **Web**: <menus, módulos PHP, rotas principais>
- **Mobile**: <apps ou fluxos de campo>
- **Somente API**: <batch, integrações, fiscal>

## Regras para o `backlog.md`

1. EP-000 conforme triade [EP-000 — agents de bootstrap](#ep-000--agents-de-bootstrap-por-triade).
2. Cada US respeita colunas API/Web/Mobile desta tabela.
3. Não usar linha “Template full-stack” — expandir tasks com Agent + Prompt.
4. Estimar tasks ~20–35 por BC médio com web+mobile (não ~8 só backend).
```

---

## Exemplos preenchidos

### N2 — RetailOps (loja-php)

| Camada | Tecnologia | Pasta |
|--------|------------|-------|
| Backend | ASP.NET Core 8 | `apps/backend` |
| Web | Vue 3 + PrimeVue | `apps/web-vue` |
| Mobile | Kotlin + Compose | `apps/mobile-android` |
| Banco | EF Core + Postgres | — |

Sufixo: `-cs`. Agents web: `Frontend * (Vue)`. Mobile: `Mobile * (Android)`.

### T2 — Legado PHP → monorepo TS

| Camada | Tecnologia | Pasta |
|--------|------------|-------|
| Backend | NestJS | `apps/backend` |
| Web | Vue 3 + PrimeVue | `apps/web-vue` |
| Mobile | Flutter | `apps/mobile-flutter` |
| Banco | Prisma | — |

Sufixo: _(sem sufixo)_. CI/CD: `Config CI/CD (TypeScript)`.

---

## Somente backend (incremental)

```markdown
## Stack alvo

| Camada | Tecnologia |
|--------|------------|
| Backend | <NestJS \| Spring Boot \| ASP.NET Core 8> |
| Web admin | **Nenhum** |
| Mobile | **Nenhum** |

## Superfícies por BC

| BC | API REST | Web admin | Mobile |
|----|----------|-----------|--------|
| EP-001 Auth | Sim | Não | Não |
```

- Backlog **sem** `interface:entity` (Vue/Angular/Next) nem `interface:mobile-*`.
- Tutorial: `backend-incremental`.
- OpenSpec por BC continua válido.

---

## Checklist antes de gerar `backlog.md`

O agent `req-agile-planning` deve validar:

- [ ] `delivery-profile.md` existe e tem **uma** stack fixa (não “agnóstico”).
- [ ] Tabela de superfícies cobre **todos** os épicos do release planejado.
- [ ] Para cada BC com Web=**Sim**, o backlog terá entity → usecase → repository → page (não só page).
- [ ] Para cada BC com Mobile=**Sim**, o backlog terá mobile-entity → … → mobile-screen.
- [ ] EP-000 inclui docker + cicd + shell web (se Web≠Nenhum) + bootstrap mobile (se Mobile≠Nenhum).
- [ ] `delivery-inventory.md` do discovery foi lido ou resumido na seção “Inventário”.
- [ ] Triade escolhida consta em [Combinações válidas](#combinações-válidas-recomendadas).
- [ ] `ddd-tactical-model.md` tem **Apresentação — Web/Mobile** nos BCs com superfície Sim (ver `req-ddd-modeling/references/client-presentation-model.md`).
- [ ] Cada US no `backlog.md` com web/mobile tem subseções **Telas e fluxos (web)** / **(mobile)** antes das tasks `interface:*`.

---

## Referências cruzadas

- Skill: `req-agile-planning` — Fase 0 e checklist BC web/mobile.
- Matriz completa: `config-project-fullstack/references/fullstack-stack-matrix.md`.
- Discovery: `req-discovery` — `delivery-inventory.md`.
- Apresentação por BC: `req-ddd-modeling/references/client-presentation-model.md`.
- Tutorial hub: `docs/tutorial/02-fullstack-project-setup.md`.
- Template de tasks por feature: `docs/planning/<projeto>/backlog.md` (seção “Template — Tasks full-stack por feature”).
