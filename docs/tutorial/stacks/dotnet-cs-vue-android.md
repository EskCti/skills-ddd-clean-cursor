# Stack: ASP.NET Core + Vue 3 + Android

**Combinação**: Backend C# (ASP.NET Core) · Frontend Vue 3 + PrimeVue · Mobile Android (Kotlin + Compose)

**Projeto de referência neste monorepo**: RetailOps — `apps/backend`, `apps/web-vue`, `apps/mobile-android`

**Pré-requisito**: [Tutorial 01](../01-pipeline-discovery-planning.md) · [Checklist README](../README.md#checklist-antes-do-código) · [Tutorial 02 — Hub](../02-fullstack-project-setup.md) · [Tutorial 04 — OpenSpec](../04-ciclo-completo-openspec.md) (comandos)

**Quando usar**: reimplementação legado PHP com API .NET, admin Vue, app Android nativo.

> **Formato de tasks**: **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`. **Nunca** só `Frontend Page (Vue)` no épico; incluir entity → usecase → repository → page.

---

## Pipeline de análise (antes de codar)

```
req-discovery (+ delivery-inventory.md)
       → req-ddd-modeling (+ superfícies/BC no tático)
       → req-migration-strategy
       → delivery-profile.md          ← stack + API/Web/Mobile por BC (OBRIGATÓRIO)
       → req-agile-planning → backlog.md
       → openspec-propose / apply / archive
```

Sem `delivery-profile.md`, o backlog tende a listar só backend + `Frontend Page` — ver EP-001 corrigido no RetailOps.

No `req-agile-planning`, para cada US com web/mobile, o backlog deve listar **todas** as camadas do template full-stack (ver `docs/planning/<projeto>/backlog.md`).

---

## Etapa 0 — Orquestração

> Projeto `RetailOps`: ASP.NET Core + Vue 3 + Android. Backlog em `docs/planning/loja-php/backlog.md`.

**Agents (bootstrap EP-000):**

```
openspec-apply-change "bootstrap-retailops"
├── Config Project (C#)           → apps/backend, RetailOps.sln
├── Config Project (Vue)            → apps/web-vue
├── Config Shared Web (Vue)         → shell admin
├── Config Project (Android)        → apps/mobile-android
├── Config Docker (C#) + Config CI/CD (C#)
└── Config Shared Core (C#) + Config EF Core (C#)
```

---

## Etapa 1 — BC Identity (EP-001) — ordem correta

### Backend (C#)

```
Config Auth Core (C#) → Core Value Object → Core Entity → Core Domain Service
→ Core Use Case → Backend Data (C#) → Backend Controller (C#)
→ Unit Tests (C#) + E2E Tests (C#)
```

### Frontend Vue (obrigatório no tasks.md)

```
Frontend Entity (Vue) → Frontend UseCase (Vue) → Frontend Repository (Vue)
→ Frontend Page (Vue) → Frontend Form (Vue)
→ Frontend UseCase (Vue)   # test:unit-web / Vitest no prompt
```

Estrutura alvo:

```
apps/web-vue/src/modules/auth/
├── domain/          # AuthUser, Result
├── application/     # LoginUseCase, RestoreSessionUseCase
├── infrastructure/  # AuthHttpRepository
└── (stores/ só sessão — sem fetch de negócio)
```

### Mobile Android

```
Mobile Entity (Android) → Mobile UseCase (Android) → Mobile Repository (Android)
→ Mobile Screen (Android)
→ Mobile UseCase (Android)   # test:unit-mobile / JUnit no prompt
```

Contrato `IAuthRepository` em `profile/domain/repository/`, impl em `profile/data/`.

---

## Erro que já ocorreu no RetailOps (EP-001)

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `stores/auth.ts` com `fetch` direto | `tasks.md` só tinha `Frontend Page (Vue)` | Adicionar tasks §12 em `openspec/changes/ep-001-auth/tasks.md` |
| Sem Vitest / JUnit mobile | Backlog sem `test:unit-web` / `test:unit-mobile` | Incluir no `req-agile-planning` e no backlog |
| Apply marcou 23/23 ✓ | Apply não validava checklist CA | Usar `openspec-apply-change` atualizado (passo 6) |

---

## OpenSpec

- Propose: expandir template do backlog — ver guardrails em `openspec-propose`
- Apply: `/opsx:apply ep-001-auth` — concluir seções **12–14** antes de archive
- Archive: só quando acceptance **11.x** e CA front/mobile estiverem `[x]`

---

## Próximos épicos

Mesmo padrão: backend C# inside-out + bloco Vue + bloco Android (se aplicável) + testes por superfície.

Incremental só API: [backend-incremental](./backend-incremental.md).
