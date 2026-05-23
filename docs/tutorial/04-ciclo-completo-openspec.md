# Tutorial 04 — Ciclo Completo com OpenSpec: do Legado ao Full-Stack

Agents usados: `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → **`delivery-profile`** → `req-agile-planning` → `config-project-fullstack` → `openspec-propose` → `openspec-apply-change` → `openspec-archive-change`

**Cenário (walkthrough deste doc)**: legado PHP/Laravel → **NestJS** + **Vue 3 + PrimeVue** + **Flutter**, com OpenSpec.

**Este monorepo (RetailOps)**: mesma análise (`loja-php`), stack de implementação **ASP.NET Core + Vue 3 + Android** — siga [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md) para agents de código; use **este tutorial** só para comandos OpenSpec (`propose` / `apply` / `archive`).

> **Formato de tasks**: em `backlog.md` e `tasks.md`, use sempre **Agent** (`display_name` do `agents/openai.yaml`) + **Prompt** — nunca pasta de skill (`core-entity`, `frontend-entity-vue`). Ver `req-agile-planning`.
>
> **Checklist CA (web/mobile)**: cada épico com UI deve ter tasks separadas para `interface:entity` → `interface:usecase` → `interface:repository` → `interface:page` — **não** apenas `Frontend Page (Vue)`. `openspec-propose` expande o template; `openspec-apply-change` valida antes de marcar `[x]`.
>
> **Stack C# + Vue + Android** (este monorepo): [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md).

## Como usar este tutorial

| Caminho | Quando | Passos |
|---------|--------|--------|
| **Modular** (recomendado) | Tutoriais focados por fase | [01 Análise](./01-pipeline-discovery-planning.md) → [02 Hub](./02-fullstack-project-setup.md) → [NestJS + Vue + Flutter](./stacks/nestjs-vue-flutter.md) — use **este doc** como referência OpenSpec (propose / apply / archive) |
| **Narrativa legado** | Walkthrough único do legado ao deploy | Siga as **Fases 1–3 abaixo** (se já fez o 01, pule a Fase 1) |

**Stack deste walkthrough**: NestJS + Vue 3 + Flutter — guia de implementação: [stacks/nestjs-vue-flutter.md](./stacks/nestjs-vue-flutter.md)

> Outras combinações legado (ex.: .NET + Angular + Android): [dotnet-angular-android](./stacks/dotnet-angular-android.md). Incremental só backend: [backend-incremental](./stacks/backend-incremental.md).

## 🚀 **Exemplos Práticos para Stack C# + Vue + Android**

Para o projeto **RetailOps** (este monorepo), siga os exemplos específicos abaixo:

### **Épico de Exemplo: EP-001 Auth (C# + Vue + Android)**

```markdown
## EP-001: Auth e Usuários (C# + Vue + Android)

### 1. Domínio C# — Auth
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."
  - **Specs:** ["password-policy"]

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root User com Email e PasswordVO; validações de domínio."
  - **Specs:** ["user-entity"]

- [ ] `domain:repository` IUserRepository interface (~30min)
  - **Agent:** `Core Repository (C#)`
  - **Prompt:** "Interface IUserRepository com CreateAsync, GetByEmailAsync."
  - **Specs:** ["repository-pattern"]

### 2. Aplicação C# — Auth
- [ ] `application:dto` LoginRequest, RegisterRequest, AuthResponse (~1h)
  - **Agent:** `Core DTO (C#)`
  - **Prompt:** "DTOs para endpoints de autenticação com validações."
  - **Specs:** ["auth-dtos"]

- [ ] `application:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "LoginUseCase valida credenciais; RegisterUseCase cria User."
  - **Specs:** ["auth-usecases"]

### 3. Infraestrutura C# — Auth
- [ ] `infrastructure:data` UserRepository (EF Core) (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Implementação UserRepository com EF Core DbContext."
  - **Specs:** ["efcore-repository"]

- [ ] `infrastructure:controller` AuthController (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "Controller com endpoints POST /auth/login e /auth/register."
  - **Specs:** ["auth-controller"]

### 4. Frontend Vue — Auth
- [ ] `frontend:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T> para frontend."
  - **Specs:** ["vue-entity"]

- [ ] `frontend:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP client para /auth/login e /auth/register."
  - **Specs:** ["vue-repository"]

- [ ] `frontend:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login com PrimeVue e validação."
  - **Specs:** ["vue-login"]

### 5. Mobile Android — Auth
- [ ] `mobile:entity` AuthUser entity Android (~1h)
  - **Agent:** `Mobile Entity (Android)`
  - **Prompt:** "Data class AuthUser com sealed Result em Kotlin."
  - **Specs:** ["android-entity"]

- [ ] `mobile:repository` AuthRepositoryImpl Android (~2h)
  - **Agent:** `Mobile Repository (Android)`
  - **Prompt:** "Retrofit service para endpoints de autenticação."
  - **Specs:** ["android-repository"]

- [ ] `mobile:screen` LoginScreen Android (~2h)
  - **Agent:** `Mobile Screen (Android)`
  - **Prompt:** "Tela de login com Jetpack Compose e ViewModel."
  - **Specs:** ["android-login"]
```

### **Workflow Otimizado com Cache de Contexto**

```csharp
// Exemplo: Reutilização de EmailVO entre skills C#
public class CreateUserSkill : BaseSkill<CreateUserParams, User>
{
    public override async Task<Result<User>> Execute(CreateUserParams parameters)
    {
        var context = ContextFactory.GetManager(parameters.ChangeId);
        
        // Cache de EmailVO (evita recálculo)
        var emailVo = context.GetOrCreate(
            CACHE_KEYS.DOMAIN_VO.EMAIL,
            () => EmailVO.Create(parameters.Email).Value
        );
        
        // Cache de PasswordVO  
        var passwordVo = context.GetOrCreate(
            CACHE_KEYS.DOMAIN_VO.PASSWORD,
            () => PasswordVO.Create(parameters.Password).Value
        );
        
        // Cria usuário com objetos cacheados
        var userResult = User.Create(emailVo, passwordVo);
        
        // Armazena usuário no cache para outros skills
        if (userResult.IsSuccess)
        {
            context.Set(CACHE_KEYS.DOMAIN_ENTITY.USER, userResult.Value);
        }
        
        return userResult;
    }
}
```

### **Script de Execução para Stack C#**

```bash
#!/bin/bash
# scripts/execute-csharp-change.sh

CHANGE_ID=$1

echo "🚀 Executando change $CHANGE_ID para stack C# + Vue + Android"

# 1. Validar dependências específicas da stack
echo "🔍 Validando dependências C#..."
./scripts/validate-csharp-dependencies.sh --change $CHANGE_ID

# 2. Executar tasks backend C#
echo "⚡ Executando tasks backend C#..."
openspec-apply-change $CHANGE_ID --filter "csharp"

# 3. Executar tasks frontend Vue
echo "🎨 Executando tasks frontend Vue..."
openspec-apply-change $CHANGE_ID --filter "vue"

# 4. Executar tasks mobile Android
echo "📱 Executando tasks mobile Android..."
openspec-apply-change $CHANGE_ID --filter "android"

# 5. Executar testes integrados
echo "🧪 Executando testes integrados..."
dotnet test --filter "Category=Integration"

echo "✅ Change $CHANGE_ID executado com sucesso para stack completa!"
```

Para mais detalhes específicos da stack, consulte: [dotnet-cs-vue-android](./stacks/dotnet-cs-vue-android.md)

---

## Visão Geral do Ciclo

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CICLO COMPLETO COM OPENSPEC                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FASE 1 — ANÁLISE (detalhe no Tutorial 01)                              │
│                                                                          │
│  Legado PHP  →  req-discovery  →  req-ddd-modeling  →  req-migration   │
│                     delivery-inventory   (+ Apresentação Web/Mobile)    │
│                                          →  delivery-profile.md         │
│                                          →  req-agile-planning          │
│                                              backlog.md (+ Telas/fluxos)│
│                                                                          │
│  FASE 2 — SETUP DO PROJETO (com Docker + CI/CD no bootstrap)            │
│                                                                          │
│  openspec-propose "bootstrap-loja-nova"                                  │
│       ↓                                                                  │
│  openspec-apply-change "bootstrap-loja-nova"                             │
│  ├── config-project-vue        → NestJS + Vue 3 + Tailwind + compose  │
│  ├── config-shared-web-vue     → shell admin (sidebar, topbar, rodapé)│
│  ├── config-project-flutter    → Flutter + Riverpod + Dio               │
│  ├── config-docker             → Dockerfiles multi-stage (produção)     │
│  ├── config-cicd               → GitHub Actions CI + CD                   │
│  └── config-shared-core        → shared DDD kernel                      │
│       ↓                                                                  │
│  openspec-archive-change "bootstrap-loja-nova"                           │
│                                                                          │
│  FASE 3 — IMPLEMENTAÇÃO (por épico/BC, com OpenSpec)                     │
│                                                                          │
│  Por cada épico do backlog.md:                                          │
│  openspec-propose "ep-XXX-<nome>"                                        │
│       ↓                                                                  │
│  openspec-apply-change "ep-XXX-<nome>"                                   │
│  ├── Core Value Object / Core Entity / Backend Controller (backend)     │
│  ├── Frontend Entity → UseCase → Repository → Page → Form (Vue)         │
│  └── Mobile Entity → UseCase → Repository → Screen → Form (Flutter)     │
│       ↓                                                                  │
│  openspec-archive-change "ep-XXX-<nome>"                                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1 — Análise do Legado

> Se já concluiu o [Tutorial 01](./01-pipeline-discovery-planning.md) (incluindo `delivery-profile.md`, backlog com **Telas e fluxos** e [checklist](./README.md#checklist-antes-do-código)), pule para a [Fase 2](#fase-2--setup-do-projeto).

### Etapa 1.1 — req-discovery

**Agent**: **Requirement Discovery** (`req-discovery`)

> Analise o sistema legado PHP/Laravel em `/projetos/loja-php`. Identifique Bounded Contexts, regras de negócio e mapeamento DDD/Clean Architecture. Documente **inventário de entrega** (painéis web, apps mobile, só API) em `delivery-inventory.md`. Stack alvo deste walkthrough: NestJS + Vue 3 + Flutter.

**Saída** (em `docs/discovery/loja-php/`):

```
requirements.md
delivery-inventory.md    ← API | Web | Mobile por área do legado
ddd-analysis.md
├── BC-001: Auth
├── BC-002: Customers
└── BC-003: Orders
```

### Etapa 1.2 — req-ddd-modeling

**Agent**: **DDD Modeling** (`req-ddd-modeling`)

> Aplique o Roadmap DDD sobre `docs/discovery/loja-php/`. No `ddd-tactical-model.md`, por BC: domínio (backend) + **Superfícies de entrega** + seções **Apresentação — Web admin** / **Apresentação — Mobile** quando Sim (template em `req-ddd-modeling/references/client-presentation-model.md`).

**Saída** (em `docs/modeling/loja-php/`):

```
ddd-strategic-model.md
ddd-tactical-model.md
├── BC Auth: domínio + Apresentação Web (login, permissões) + Mobile (perfil) se aplicável
├── BC Customers: …
└── BC Orders: …
```

### Etapa 1.3 — req-migration-strategy

**Agent**: **Migration Strategy** (`req-migration-strategy`)

> Estratégia de migração do legado PHP para **NestJS + Vue + Flutter**. Base: `docs/modeling/loja-php/ddd-tactical-model.md`.

**Saída**: `docs/migration/loja-php/migration-strategy.md` (Strangler Fig, sequência de BCs, ACL).

### Etapa 1.4 — delivery-profile (obrigatório)

**Agent**: **Agile Planning** (Fase 0) ou prompt manual — ver [Tutorial 01 § 3.5](./01-pipeline-discovery-planning.md#etapa-35--perfil-de-entrega-antes-do-backlog)

> Com base em `delivery-inventory.md` e no MVP (Auth, Customers, Orders), crie `docs/planning/loja-php/delivery-profile.md`: stack **NestJS + Vue 3 + PrimeVue + Flutter**; tabela **API | Web admin | Mobile** por BC.

**Saída**: `docs/planning/loja-php/delivery-profile.md`

### Etapa 1.5 — req-agile-planning

**Agent**: **Agile Planning** (`req-agile-planning`)

> Gere `backlog.md` lendo `delivery-profile.md` e `ddd-tactical-model.md` (Apresentação). Stack fixa: **NestJS + Vue + Flutter**. Em **cada US** com web/mobile: subseções **Telas e fluxos (web)** / **(mobile)** + tasks inside-out (entity → usecase → repository → page; mobile-entity → …). **Proibir** “Template full-stack” em uma linha.

**Saída**: `docs/planning/loja-php/backlog.md` (trecho)

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] `infra:fullstack` Orquestrar setup completo (~1h)
  - **Agent:** `Config Project Full-Stack`
  - **Prompt:** "Configure: backend NestJS, frontend Vue 3 + Tailwind, mobile Flutter (Riverpod + Dio). Docker e CI/CD no bootstrap. Usar OpenSpec."

- [ ] `infra:setup` Bootstrap Vue monorepo (~2h)
  - **Agent:** `Config Project (Vue)`
  - **Prompt:** "Bootstrap monorepo NestJS + Vue 3 + docker-compose dev (Postgres)."

- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent:** `Config Shared Web (Vue)`
  - **Prompt:** "Configure shell: sidebar colapsável, topbar, rodapé, dashboard vazio. Mescle rotas do shell."

- [ ] `infra:setup` Bootstrap Flutter (~2h)
  - **Agent:** `Config Project (Flutter)`
  - **Prompt:** "Configure app Flutter apontando para API local."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Crie Dockerfile multi-stage + docker-compose.prod.yml."

- [ ] `infra:cicd` GitHub Actions CI + CD (~2h)
  - **Agent:** `Config CI/CD (TypeScript)`
  - **Prompt:** "CI em PR (lint + test + coverage ≥95% domain/app). CD em main (build Docker + deploy)."

- [ ] `domain:shared` Shared kernel DDD (~2h)
  - **Agent:** `Config Shared Core`
  - **Prompt:** "Configure Entity, ValueObject, Result<T>, IUseCase, IRepository."

- [ ] `infra:db` Prisma + Postgres (~1h)
  - **Agent:** `Config Prisma`
  - **Prompt:** "Configure Postgres + schema inicial."

## EP-001: Auth e Usuários

- [ ] `domain:vo` Criar PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."

- [ ] `domain:entity` Criar User entity (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Crie User com Email e PasswordVO. Aggregate root."

- [ ] `domain:repository` IUserRepository (~30min)
  - **Agent:** `Core Repository`
  - **Prompt:** "Interface IUserRepository: create, findByEmail."

- [ ] `app:dto` LoginInputDto, RegisterInputDto, AuthOutputDto (~1h)
  - **Agent:** `Core DTO`
  - **Prompt:** "DTOs de login, registro e resposta com JWT."

- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Agent:** `Core Use Case`
  - **Prompt:** "LoginUseCase valida credenciais; RegisterUseCase cria User e persiste."

- [ ] `infra:persistence` UserPrismaRepository (~2h)
  - **Agent:** `Backend Prisma Data`
  - **Prompt:** "Implemente IUserRepository com Prisma."

- [ ] `interface:controller` AuthController POST /auth/login e /auth/register (~2h)
  - **Agent:** `Backend Controller`
  - **Prompt:** "Endpoints JWT; usar LoginUseCase e RegisterUseCase."

- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T>."

- [ ] `interface:usecase` LoginUseCase + RegisterUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "Use cases injetando IAuthRepository."

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP para /auth/login e /auth/register; mapear DTOs."

- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login injetando LoginUseCase."

- [ ] `interface:form-web` RegisterView Vue (~2h)
  - **Agent:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário de registro; exibe erros de Result."

- [ ] `interface:mobile-entity` AuthUser entity Flutter (~1h)
  - **Agent:** `Mobile Entity (Flutter)`
  - **Prompt:** "Entidade AuthUser Dart pura com sealed Result."

- [ ] `interface:mobile-usecase` LoginUseCase Flutter (~2h)
  - **Agent:** `Mobile UseCase (Flutter)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository."

- [ ] `interface:mobile-repository` AuthRepositoryImpl Flutter (~2h)
  - **Agent:** `Mobile Repository (Flutter)`
  - **Prompt:** "Dio para /auth/login; catch → Failure."

- [ ] `interface:mobile` LoginPage Flutter (~2h)
  - **Agent:** `Mobile Screen (Flutter)`
  - **Prompt:** "Tela de login com Riverpod AsyncNotifier."

- [ ] `test:unit` + `test:coverage` Testes domain+app ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Testes de User, VOs e LoginUseCase; mock repository."

- [ ] `test:e2e` Login API POST /auth/login (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
  - **Prompt:** "Supertest POST /auth/login; Playwright no fluxo Vue se aplicável."

## EP-002: Customers

- [ ] `test:unit` + `test:coverage` VOs, Customer entity, CreateCustomerUseCase ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
- [ ] `test:e2e` POST /customers → GET /customers/:id (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
```

---

## Fase 2 — Setup do Projeto

### Etapa 2.1 — config-project-fullstack (planejamento)

**Agent**: `config-project-fullstack`

> Vamos criar o projeto "loja-nova". Decisões: Backend: NestJS (TypeScript), Frontend: Vue 3 + PrimeVue 4, Mobile: Flutter. Autenticação JWT básica será adicionada no EP-001. Docker e CI/CD fazem parte do bootstrap. Usar OpenSpec para rastrear mudanças.

**O agent responde com a sequência:**

```
1. Agent: openspec-propose
   Prompt: "Crie a mudança 'bootstrap-loja-nova' com proposta, design e tasks
            para setup NestJS + Vue + Flutter, incluindo config-docker e config-cicd."

2. Agent: openspec-apply-change "bootstrap-loja-nova"
   Tasks (em ordem):
   ├── Config Project (Vue)           → monorepo NestJS + Vue 3 + docker-compose dev
   ├── Config Shared Web (Vue)      → shell admin Tailwind (sidebar, topbar, rodapé)
   ├── Config Project (Flutter)     → app Flutter + Riverpod + Dio
   ├── Config Docker (TypeScript)   → Dockerfile multi-stage + docker-compose.prod.yml
   ├── Config CI/CD (TypeScript)    → GitHub Actions CI + CD
   ├── Config Shared Core           → Entity, ValueObject, Result<T>, IUseCase, IRepository
   └── Config Prisma                → schema inicial Postgres

3. Agent: openspec-archive-change "bootstrap-loja-nova"
```

### Etapa 2.2 — openspec-propose bootstrap

**Agent**: `openspec-propose`

> Crie a mudança "bootstrap-loja-nova" para documentar o setup do projeto com NestJS + Vue + Flutter, Prisma, shared kernel, Docker de produção e GitHub Actions.

**Artefatos em** `openspec/changes/bootstrap-loja-nova/`:

```markdown
<!-- proposal.md -->
# bootstrap-loja-nova

## O que
Setup inicial: monorepo NestJS + Vue + Flutter, infra de produção e CI/CD.

## Por que
Base necessária para implementar todos os BCs funcionais com entrega contínua desde o início.

## Escopo
- Backend NestJS com Prisma e Postgres (dev + prod)
- Frontend Vue 3 + PrimeVue com proxy Vite
- Mobile Flutter com Riverpod + Dio
- Shared kernel DDD
- Dockerfile multi-stage + docker-compose.prod.yml
- GitHub Actions (CI em PR, CD em main)
```

```markdown
<!-- tasks.md -->
- [ ] `infra:setup` Bootstrap Vue monorepo (~2h)
  - **Agent:** `Config Project (Vue)`
  - **Prompt:** "Monorepo NestJS + Vue 3 + docker-compose dev."

- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent:** `Config Shared Web (Vue)`
  - **Prompt:** "Sidebar, topbar, rodapé, dashboard vazio."

- [ ] `infra:setup` Bootstrap Flutter (~2h)
  - **Agent:** `Config Project (Flutter)`
  - **Prompt:** "App Flutter + Riverpod + Dio."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Dockerfile multi-stage NestJS + docker-compose.prod.yml."

- [ ] `infra:cicd` GitHub Actions (~2h)
  - **Agent:** `Config CI/CD (TypeScript)`
  - **Prompt:** "CI em PR; CD em main."

- [ ] `domain:shared` Shared kernel DDD (~2h)
  - **Agent:** `Config Shared Core`
  - **Prompt:** "Entity, VO, Result<T>, IUseCase, IRepository."

- [ ] `infra:db` Prisma + Postgres (~1h)
  - **Agent:** `Config Prisma`
  - **Prompt:** "Schema inicial Postgres."
```

### Etapa 2.3 — openspec-apply-change bootstrap

**Agent**: `openspec-apply-change`

> Implemente a mudança "bootstrap-loja-nova".

O apply executa as tasks na ordem do `tasks.md`, acionando cada **Agent** listado.

**Estrutura resultante:**

```
loja-nova/
├── apps/
│   ├── backend/           ← NestJS + Prisma
│   ├── web-vue/           ← Vue 3 + PrimeVue 4 (Aura theme)
│   └── mobile-flutter/    ← Flutter + Riverpod + Dio
├── packages/
│   └── shared-core/       ← Entity, VO, Result
├── openspec/
│   └── changes/
│       └── bootstrap-loja-nova/
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── docker-compose.yml         ← dev (Postgres local)
├── docker-compose.prod.yml    ← produção
├── apps/backend/Dockerfile    ← multi-stage
└── .env
```

### Etapa 2.4 — openspec-archive-change bootstrap

**Agent**: `openspec-archive-change`

> Archive a mudança "bootstrap-loja-nova".

```
✓ bootstrap-loja-nova arquivado
  - 7/7 tasks completadas (inclui shell web, docker + cicd)
  - Duração: ~4h
```

---

## Fase 3 — EP-001: Auth via OpenSpec

### Etapa 3.1 — openspec-propose

**Agent**: `openspec-propose`

> Crie a mudança "ep-001-auth" copiando **todas** as tasks expandidas do EP-001 em `docs/planning/loja-php/backlog.md` (backend C# + bloco Vue entity/usecase/repository/page + bloco Android + test:unit/e2e API + test:unit-web/mobile). Não omitir camadas de frontend.

**tasks.md gerado** (em `openspec/changes/ep-001-auth/tasks.md`):

```markdown
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Aggregate root User com Email e PasswordVO."

- [ ] `domain:repository` IUserRepository (port) (~30min)
  - **Agent:** `Core Repository`
  - **Prompt:** "Interface IUserRepository: create, findByEmail."

- [ ] `app:dto` LoginInputDto, RegisterInputDto, AuthOutputDto (~1h)
  - **Agent:** `Core DTO`
  - **Prompt:** "DTOs de login, registro e resposta JWT."

- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Agent:** `Core Use Case`
  - **Prompt:** "LoginUseCase valida credenciais; RegisterUseCase cria User."

- [ ] `infra:persistence` UserPrismaRepository (~2h)
  - **Agent:** `Backend Prisma Data`
  - **Prompt:** "Implemente IUserRepository com Prisma."

- [ ] `interface:controller` AuthController POST /auth/login e POST /auth/register (~2h)
  - **Agent:** `Backend Controller`
  - **Prompt:** "Endpoints JWT usando LoginUseCase e RegisterUseCase."

- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T>."

- [ ] `interface:usecase` LoginUseCase + RegisterUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "Use cases injetando IAuthRepository."

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP para /auth/login e /auth/register."

- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login injetando LoginUseCase."

- [ ] `interface:form-web` RegisterView Vue (~2h)
  - **Agent:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário de registro; exibe erros de Result."

- [ ] `interface:mobile-entity` AuthUser entity Flutter (~1h)
  - **Agent:** `Mobile Entity (Flutter)`
  - **Prompt:** "Entidade AuthUser Dart pura."

- [ ] `interface:mobile-usecase` LoginUseCase Flutter (~2h)
  - **Agent:** `Mobile UseCase (Flutter)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository."

- [ ] `interface:mobile-repository` AuthRepositoryImpl Flutter (~2h)
  - **Agent:** `Mobile Repository (Flutter)`
  - **Prompt:** "Dio para /auth/login."

- [ ] `interface:mobile` LoginPage Flutter (~2h)
  - **Agent:** `Mobile Screen (Flutter)`
  - **Prompt:** "Tela de login com Riverpod."

- [ ] `test:unit` + `test:coverage` User, VOs, LoginUseCase ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Mock repository; fluxo feliz e erros."

- [ ] `test:e2e` POST /auth/login (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
  - **Prompt:** "Supertest POST /auth/login."
```

### Etapa 3.2 — openspec-apply-change

**Agent**: `openspec-apply-change`

> Implemente a mudança "ep-001-auth".

O apply **valida o checklist** de camadas (passo 6 do skill) e executa **task a task**, acionando o **Agent** + skill correspondente na sequência inside-out:

> Se `tasks.md` tiver seção **§12 Frontend CA** / **§14 Tests** pendentes, continuar até lá antes de `openspec-archive-change`. MVP (`interface:page` com fetch na store) não substitui entity/usecase/repository.

```
Implementando ep-001-auth (18 tasks)

Task 1/18: domain:vo PasswordVO
  → Agent: Core Value Object
  → Criado: packages/shared-core/src/vo/password.vo.ts
  ✓ Task completa

Task 2/18: domain:entity User
  → Agent: Core Entity
  → Criado: packages/auth/core/src/entity/user.entity.ts
  ✓ Task completa

[... continua até task 7/18 — Backend Controller ...]

Task 8/18: interface:entity AuthUser Vue
  → Agent: Frontend Entity (Vue)
  ✓ Task completa

Task 9/18: interface:usecase LoginUseCase Vue
  → Agent: Frontend UseCase (Vue)
  ✓ Task completa

[... tasks 10–12: Frontend Repository, Page, Form ...]

Task 13/18: interface:mobile-entity AuthUser Flutter
  → Agent: Mobile Entity (Flutter)
  ✓ Task completa

[... tasks 14–16: Mobile UseCase, Repository, Screen ...]

Task 17/18: test:unit + test:coverage
  → Agent: Unit Tests (TypeScript)
  ✓ Task completa

Task 18/18: test:e2e POST /auth/login
  → Agent: E2E Tests (TypeScript)
  ✓ Task completa

Progresso: 18/18 tasks completas
Pronto para arquivar. Use openspec-archive-change.
```

### Etapa 3.3 — openspec-archive-change

**Agent**: `openspec-archive-change`

> Archive a mudança "ep-001-auth".

```
✓ ep-001-auth arquivado
  - 18/18 tasks completadas
  - BCs cobertos: Auth (backend + frontend Vue + mobile Flutter)
  - Duração estimada: ~17h
```

---

## Fase 3 — EP-002: Customers (fluxo resumido)

O pattern do EP-001 se repete para o BC Customers:

```
1. openspec-propose "ep-002-customers"
   → tasks.md com: VOs, Customer entity, CreateCustomerUseCase, CustomerController,
     Frontend Entity/UseCase/Repository/Page/Form (Vue),
     Mobile Entity/UseCase/Repository/Screen/Form (Flutter),
     Unit Tests, E2E Tests — cada task com **Agent** + **Prompt**

2. openspec-apply-change "ep-002-customers"
   → aciona cada Agent na sequência inside-out

3. openspec-archive-change "ep-002-customers"
```

---

## Fase 3 — EP-003: Orders (fluxo resumido)

Orders é o Core Domain — mais complexo. O diferencial está no design:

```
openspec-propose "ep-003-orders"
```

O **proposal.md** deve descrever o agregado Order com cuidado:

```markdown
## Design de Orders

### Aggregate
- Order (aggregate root) com lista de OrderItem
- Money VO (valor + moeda, sem float)
- OrderStatus VO (enum: PENDING → CONFIRMED → SHIPPED → DELIVERED)

### Regras de negócio críticas
- Não é possível adicionar item a pedido confirmado
- Total = sum(item.price * item.quantity)
- Cancelamento só possível em PENDING
```

O tasks.md terá ~16 tasks cobrindo backend completo + listagem de pedidos no Vue + tela de pedidos no Flutter + testes.

---

## 🎯 **Exemplos Específicos: Stack C# + Vue + Android (RetailOps)**

Para o projeto **RetailOps** (este monorepo), que usa a stack **ASP.NET Core + Vue 3 + Android (Kotlin Compose)**, seguimos o mesmo ciclo OpenSpec com skills específicos:

### **Mapeamento Skills por Stack**

| Camada | TypeScript (NestJS) | C# (ASP.NET Core) | Kotlin (Android) | Vue 3 |
|--------|---------------------|-------------------|------------------|-------|
| Value Object | `core-value-object` | `core-value-object-cs` | `mobile-entity-android` | `frontend-entity-vue` |
| Entity | `core-entity` | `core-entity-cs` | `mobile-entity-android` | `frontend-entity-vue` |
| Use Case | `core-use-case` | `core-use-case-cs` | `mobile-usecase-android` | `frontend-usecase-vue` |
| Repository | `core-repository` | `core-repository-cs` | `mobile-repository-android` | `frontend-repository-vue` |
| Controller | `backend-controller` | `backend-controller-cs` | — | — |
| Page/Screen | — | — | `mobile-screen-android` | `frontend-page-vue` |
| Form | — | — | `mobile-form-android` | `frontend-form-vue` |

### **Exemplo Prático: EP-001 Auth no RetailOps**

#### **Workflow Específico para Stack C#**

```
1. req-discovery → req-ddd-modeling → req-migration-strategy
2. delivery-profile → req-agile-planning (backlog.md)
3. openspec-propose "ep-001-auth-cs"
4. openspec-validate-dependencies "ep-001-auth-cs"
5. openspec-apply-change "ep-001-auth-cs"
6. openspec-archive-change "ep-001-auth-cs"
```

#### **Tasks.md para Auth em C#**

```markdown
## EP-001: Auth e Usuários (C# + Vue + Android)

### 1. Domínio C# — Auth
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object (C#)`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."
  - **Specs:** ["password-policy"]

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Aggregate root User com Email e PasswordVO; validações de domínio."
  - **Specs:** ["user-entity"]

- [ ] `domain:service` PasswordChangeService (~1h)
  - **Agent:** `Core Domain Service (C#)`
  - **Prompt:** "Serviço de domínio para troca de senha com validação de senha atual."
  - **Specs:** ["password-change"]

### 2. Aplicação C# — Auth
- [ ] `app:dto` RegisterUserRequest, LoginRequest, AuthResponse (~1h)
  - **Agent:** `Core DTO (C#)`
  - **Prompt:** "DTOs de entrada/saída para endpoints de auth com validações."
  - **Specs:** ["auth-contracts"]

- [ ] `app:usecase` RegisterUserUseCase, LoginUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
  - **Prompt:** "Use cases com IUserRepository e JWT token generation."
  - **Specs:** ["auth-usecases"]

- [ ] `app:query` FindUsersQuery (~2h)
  - **Agent:** `Core Query CQRS (C#)`
  - **Prompt:** "Query para listagem de usuários com paginação e filtros."
  - **Specs:** ["users-query"]

### 3. Infraestrutura C# — Auth
- [ ] `infra:repository` IUserRepository interface (~30min)
  - **Agent:** `Core Repository (C#)`
  - **Prompt:** "Interface IUserRepository com métodos Create, FindByEmail."
  - **Specs:** ["user-repository"]

- [ ] `infra:persistence` UserEntityTypeConfiguration (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Configuração EF Core para User entity com TenantId."
  - **Specs:** ["efcore-config"]

- [ ] `infra:persistence` UserRepositoryImpl (~2h)
  - **Agent:** `Backend Data (C#)`
  - **Prompt:** "Implementação IUserRepository com DbContext."
  - **Specs:** ["user-repository-impl"]

### 4. Apresentação C# — Auth
- [ ] `interface:controller` AuthController (~2h)
  - **Agent:** `Backend Controller (C#)`
  - **Prompt:** "Endpoints POST /api/auth/register, POST /api/auth/login com JWT."
  - **Specs:** ["auth-endpoints"]

### 5. Frontend Vue — Auth
- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T> para frontend Vue."
  - **Specs:** ["vue-auth-entity"]

- [ ] `interface:usecase` LoginUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "Use case Vue injetando IAuthRepository."
  - **Specs:** ["vue-auth-usecase"]

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP client para /api/auth/login e /api/auth/register."
  - **Specs:** ["vue-auth-repository"]

- [ ] `interface:page` LoginPage Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login com formulário e tratamento de erros."
  - **Specs:** ["vue-login-page"]

### 6. Mobile Android — Auth
- [ ] `interface:mobile-entity` AuthUser entity Android (~1h)
  - **Agent:** `Mobile Entity (Android)`
  - **Prompt:** "Data class AuthUser com sealed Result em Kotlin."
  - **Specs:** ["android-auth-entity"]

- [ ] `interface:mobile-usecase` LoginUseCase Android (~2h)
  - **Agent:** `Mobile UseCase (Android)`
  - **Prompt:** "Use case Android com injeção de IAuthRepository."
  - **Specs:** ["android-auth-usecase"]

- [ ] `interface:mobile-repository` AuthRepositoryImpl Android (~2h)
  - **Agent:** `Mobile Repository (Android)`
  - **Prompt:** "Implementação Retrofit para endpoints de auth."
  - **Specs:** ["android-auth-repository"]

- [ ] `interface:mobile` LoginScreen Android (~2h)
  - **Agent:** `Mobile Screen (Android)`
  - **Prompt:** "Tela de login Jetpack Compose com ViewModel."
  - **Specs:** ["android-login-screen"]

### 7. Testes — Auth
- [ ] `test:unit` User entity, PasswordVO, LoginUseCase (~2h)
  - **Agent:** `Unit Tests (C#)`
  - **Prompt:** "Testes unitários com xUnit e Moq; cobertura ≥95%."
  - **Specs:** ["auth-unit-tests"]

- [ ] `test:e2e` POST /api/auth/login (~2h)
  - **Agent:** `E2E Tests (C#)`
  - **Prompt:** "Testes E2E com WebApplicationFactory."
  - **Specs:** ["auth-e2e-tests"]
```

#### **Validação Automática com `openspec-validate-dependencies`**

Para a stack C#, o skill valida:

1. **Ordem Clean Architecture**: domain → application → infrastructure → presentation
2. **Dependências específicas C#**:
   - `core-value-object-cs` antes de `core-entity-cs`
   - `core-entity-cs` antes de `core-repository-cs`
   - `core-repository-cs` antes de `backend-controller-cs`
3. **Integração frontend/mobile**:
   - `frontend-entity-vue` antes de `frontend-usecase-vue`
   - `mobile-entity-android` antes de `mobile-usecase-android`

#### **Exemplo de Template Padronizado**

Use o [template YAML](../../.agents/skills/docs/templates/openspec-task-template.yaml) para garantir consistência:

```yaml
task_template:
  id: "interface:controller"
  prefix: "interface:controller"
  description: "Criar AuthController"
  estimate: "~2h"
  agent: "Backend Controller (C#)"
  prompt: "Endpoints POST /api/auth/register, POST /api/auth/login com JWT."
  specs: ["auth-endpoints"]
  dependencies: ["app:usecase", "infra:persistence"]
```

#### **Dashboard de Progresso**

Para monitorar o ciclo OpenSpec com C#:

| Fase | Status | Tasks | Duração | Skills Utilizados |
|------|--------|-------|---------|-------------------|
| Bootstrap | ✅ | 7/7 | ~4h | `config-project-cs`, `config-shared-web-vue`, `config-project-android` |
| EP-001 Auth | 🟡 | 12/18 | ~10h | `core-entity-cs`, `backend-controller-cs`, `frontend-page-vue`, `mobile-screen-android` |
| EP-002 Customers | ⏳ | 0/16 | — | `core-entity-cs`, `backend-controller-cs`, `frontend-form-vue` |

#### **Checklist de Validação para Tasks C#**

Antes de executar `openspec-apply-change`, verifique:

✅ **Domínio C#**
- [ ] Value Objects com validações de domínio
- [ ] Entities com invariantes preservados
- [ ] Domain Services com regras de negócio puras

✅ **Aplicação C#**
- [ ] DTOs com validações de entrada
- [ ] Use Cases com tratamento de erros via Result<T>
- [ ] Queries CQRS com projeções otimizadas

✅ **Infraestrutura C#**
- [ ] Repository interfaces no domínio
- [ ] EF Core configurations com TenantId
- [ ] Implementações de repositório com mapeamento

✅ **Apresentação C#**
- [ ] Controllers com atributos [Authorize]
- [ ] Endpoints com validação de modelo
- [ ] Respostas HTTP padronizadas

✅ **Frontend Vue**
- [ ] Entities Vue com Result<T>
- [ ] Use Cases Vue com injeção de dependência
- [ ] Pages Vue com tratamento de erros

✅ **Mobile Android**
- [ ] Entities Android com sealed Result
- [ ] Use Cases Android com coroutines
- [ ] Screens Android com ViewModel

#### **Integração Contínua com OpenSpec**

Para a stack C#, configure:

1. **GitHub Actions para C#**:
   ```yaml
   name: CI C# + Vue + Android
   on: [push, pull_request]
   jobs:
     test-csharp:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Setup .NET
           uses: actions/setup-dotnet@v4
         - name: Run tests
           run: dotnet test --verbosity normal --collect:"XPlat Code Coverage"
     build-vue:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Setup Node.js
           uses: actions/setup-node@v4
         - name: Build Vue
           run: npm run build
   ```

2. **Validação de Dependências no CI**:
   ```yaml
   - name: Validate OpenSpec dependencies
     run: |
       dotnet run --project tools/OpenSpecValidator -- validate-dependencies ep-001-auth-cs
   ```

3. **Deploy Automático**:
   ```yaml
   deploy:
     needs: [test-csharp, build-vue]
     runs-on: ubuntu-latest
     if: github.ref == 'refs/heads/main'
     steps:
       - name: Deploy to Azure
         run: az webapp deployment source config-zip ...
   ```

#### **Cache de Contexto entre Skills**

 Para otimizar o ciclo OpenSpec com C#:

 1. **Contexto Compartilhado**:
    ```json
    {
      "stack": "csharp-vue-android",
      "project_name": "RetailOps",
      "tenant_id_strategy": "TenantIdMiddleware",
      "auth_provider": "JWT",
      "database": "PostgreSQL + EF Core"
    }
    ```

 2. **Cache por Camada**:
    - **Domínio**: Value Objects reutilizados entre BCs
    - **Aplicação**: Use Cases com padrões similares
    - **Infraestrutura**: Configurações EF Core compartilhadas

 3. **Performance Tips**:
    - Reutilizar skills `-cs` para consistência
    - Usar templates padronizados para tasks similares
    - Validar dependências antes da execução

### **Template Padronizado para Tasks**

Para garantir consistência, use o [template padronizado](../templates/openspec-task-template.yaml) que define:

1. **Estrutura padrão**: prefixo, agent, prompt, specs, dependencies
2. **Validações automáticas**: ordem Clean Architecture, dependências
3. **Exemplos por camada**: domain, application, infrastructure, presentation

### **Otimização com Cache de Contexto entre Skills**

Para maximizar a eficiência do ciclo OpenSpec, implementamos um sistema de cache de contexto que permite skills compartilharem dados e evitar recálculos desnecessários.

#### **Arquitetura do Cache de Contexto**

```
┌─────────────────────────────────────────────────────────┐
│              Cache de Contexto OpenSpec                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Skill A   │    │   Skill B   │    │   Skill C   │ │
│  │  (Password) │    │   (Email)   │    │   (User)    │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                  │        │
│         └──────────────────┼──────────────────┘        │
│                            │                           │
│                    ┌───────▼───────┐                   │
│                    │ Context Cache │                   │
│                    │   Manager     │                   │
│                    └───────┬───────┘                   │
│                            │                           │
│                    ┌───────▼───────┐                   │
│                    │   Shared      │                   │
│                    │   Data Store  │                   │
│                    └───────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Exemplo Prático: EP-001 Auth com Cache**

```typescript
// Exemplo: Skill de criação de usuário com cache de EmailVO
export class CreateUserSkill {
  async execute(params: CreateUserParams): Promise<Result<User>> {
    const { changeId, email, password } = params;
    const context = ContextFactory.getManager(changeId);
    
    // 1. Verificar se EmailVO já está no cache
    let emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    
    if (!emailVo) {
      // Calcular EmailVO (custo computacional)
      const emailResult = EmailVO.create(email);
      if (emailResult.isFailure()) {
        return Result.fail(emailResult.error);
      }
      
      emailVo = emailResult.value;
      // Armazenar no cache para reutilização
      context.set(CACHE_KEYS.DOMAIN_VO.EMAIL, emailVo);
    }
    
    // 2. Verificar se PasswordVO já está no cache
    let passwordVo = context.get(CACHE_KEYS.DOMAIN_VO.PASSWORD);
    
    if (!passwordVo) {
      const passwordResult = PasswordVO.create(password);
      if (passwordResult.isFailure()) {
        return Result.fail(passwordResult.error);
      }
      
      passwordVo = passwordResult.value;
      context.set(CACHE_KEYS.DOMAIN_VO.PASSWORD, passwordVo);
    }
    
    // 3. Criar usuário com VOs do cache
    const userResult = UserEntity.create({
      email: emailVo,
      password: passwordVo,
      // ... outros campos
    });
    
    if (userResult.isFailure()) {
      return Result.fail(userResult.error);
    }
    
    // 4. Persistir usuário
    return this.userRepository.create(userResult.value);
  }
}
```

#### **Chaves de Cache Padronizadas**

```typescript
// Definição de chaves de cache para reutilização entre skills
export const CACHE_KEYS = {
  DOMAIN_VO: {
    EMAIL: 'domain:vo:email',
    PASSWORD: 'domain:vo:password',
    MONEY: 'domain:vo:money',
    SKU: 'domain:vo:sku',
  },
  DOMAIN_ENTITY: {
    USER: 'domain:entity:user',
    PRODUCT: 'domain:entity:product',
    ORDER: 'domain:entity:order',
  },
  APP_DTO: {
    LOGIN_REQUEST: 'app:dto:login-request',
    REGISTER_REQUEST: 'app:dto:register-request',
  },
  INFRA_CONFIG: {
    DB_CONTEXT: 'infra:config:db-context',
    REPOSITORY_IMPL: 'infra:config:repository-impl',
  },
} as const;
```

#### **Benefícios do Cache de Contexto**

1. **Performance**: Reduz recálculos de Value Objects entre skills
2. **Consistência**: Garante que todos os skills usem a mesma instância de dados
3. **Reutilização**: Permite compartilhamento de configurações entre BCs
4. **Rastreabilidade**: Mantém histórico de cálculos por changeId

#### **Implementação no Ciclo OpenSpec**

```yaml
# Exemplo de task com cache explícito
- [ ] `domain:entity` UserEntity com cache de VOs (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Crie UserEntity que utiliza EmailVO e PasswordVO do cache de contexto."
  - **Cache Keys:** ["domain:vo:email", "domain:vo:password"]
  - **Specs:** ["user-entity-cache"]
```

#### **Métricas de Otimização**

| Métrica | Sem Cache | Com Cache | Melhoria |
|---------|-----------|-----------|----------|
| **Tempo de execução** | 45min | 25min | ~44% |
| **Cálculos repetidos** | 8 | 2 | ~75% |
| **Consumo de memória** | 120MB | 80MB | ~33% |

### **Integração com Skills Existentes**

O projeto RetailOps já implementou múltiplas changes usando este ciclo:

- ✅ `bootstrap-retailops` - Setup inicial com `config-project-vue`, `config-shared-web-vue`
- ✅ `ep-001-auth` - Autenticação com `core-entity-cs`, `backend-controller-cs`
- ✅ `ep-002-platform` - Plataforma com `core-query-cqrs-cs`, `frontend-usecase-vue`
- ⏳ `ep-003-store-settings` - Configurações da loja (em andamento)
- ⏳ `ep-004-crm` - CRM (em andamento)

### **Referências para Stack C# + Vue + Android**

- [Guia completo da stack](../stacks/dotnet-cs-vue-android.md)
- [Template padronizado](../templates/openspec-task-template.yaml)
- [Exemplos detalhados](../templates/openspec-stack-cs-vue-android-example.md)
- [Cache de Contexto - Exemplo Prático](../examples/context-cache-usage-example.md)
- [Skills Standards](../../skills-standards.md)

---

## Anti-patterns a Evitar com OpenSpec

### 1. Mudança muito grande

```
❌ Errado: uma mudança "todo-o-projeto" com 50 tasks

✓ Certo: uma mudança por épico/BC, cada uma com 5-15 tasks
         bootstrap-loja-nova, ep-001-auth, ep-002-customers, ep-003-orders
```

### 2. Pular o openspec-propose

```
❌ Errado: chamar openspec-apply-change sem ter criado o proposal/tasks antes
           → sem rastreabilidade, sem design documentado

✓ Certo: sempre openspec-propose → revisar tasks.md → openspec-apply-change
```

### 3. Não arquivar mudanças completadas

```
❌ Errado: ep-001-auth completo mas não arquivado
           → polui a lista de changes "ativos"

✓ Certo: openspec-archive-change logo após o apply terminar
```

### 4. Usar OpenSpec para hotfixes urgentes

```
❌ Errado: criar uma mudança openspec para corrigir um bug urgente em produção

✓ Certo: hotfixes urgentes → agents diretos (`Core Entity`, `Backend Controller`, etc.)
         Registrar como débito técnico para documentação posterior
```

### 5. Adiar Docker/CI/CD para depois das features

```
❌ Errado: implementar todos os BCs e só então configurar Docker + CI/CD
           → sem feedback de build/deploy desde o início

✓ Certo: incluir `Config Docker (TypeScript)` e `Config CI/CD (TypeScript)` na mudança bootstrap-loja-nova
         (conforme config-project-fullstack e [Hub Full-Stack](./02-fullstack-project-setup.md))
```

### 6. Pular camadas no frontend/mobile

```
❌ Errado: frontend-page-vue chamando HttpClient diretamente, sem entity/usecase/repository

✓ Certo: Frontend Entity (Vue) → Frontend UseCase (Vue) → Frontend Repository (Vue) → Frontend Page (Vue)
         (mesmo padrão Clean Architecture do backend; uma task por camada, cada uma com seu Agent)
```

---

## Resumo do Ciclo

| Fase | O que acontece | Agents |
|------|----------------|--------|
| Análise | Discovery + DDD + migração + delivery-profile + backlog | Requirement Discovery, DDD Modeling, Migration Strategy, Agile Planning (+ `delivery-profile.md`) |
| Setup | Bootstrap + shell + Docker + CI/CD + shared kernel | openspec-* + Config Project (*) + Config Shared Web (*) + Config Docker + Config CI/CD + Config Shared Core |
| Por BC | Propose → Apply (inside-out) → Archive | openspec-* + Core * + Backend * + Frontend * + Mobile * + Unit Tests + E2E Tests |

**Regra de ouro**: uma mudança OpenSpec por Bounded Context/épico, cobrindo **todas as camadas daquele BC** (backend + frontend + mobile). O `tasks.md` deve listar **Agent** + **Prompt** por task (copiado do `backlog.md`). O `openspec-apply-change` aciona cada Agent na sequência correta.

---

> Voltar ao [índice de tutoriais](./README.md)

> Para projeto novo: [02 Hub Full-Stack](./02-fullstack-project-setup.md) → [NestJS + Vue + Flutter](./stacks/nestjs-vue-flutter.md).

> Backend incremental: [stacks/backend-incremental.md](./stacks/backend-incremental.md).
