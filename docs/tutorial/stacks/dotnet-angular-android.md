# Stack: ASP.NET Core + Angular + Android

**Combinação**: Backend C# (ASP.NET Core) · Frontend Angular 17+ · Mobile Android (Kotlin + Compose)

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: .NET enterprise, Angular no web, Android nativo com Compose.

> **Formato de tasks**: use sempre **Agent** (`display_name`) + **Prompt** — ver `req-agile-planning`.

Agents: `Config Project Full-Stack` → `Config Project (C#)` → `Config Project (Angular)` → `Config Shared Web (Angular)` → `Config Project (Android)` → `Config Docker (C#)` → `Config CI/CD (C#)` → `Core * (C#)` + `Frontend * (Angular)` + `Mobile * (Android)`

---

## Etapa 0 — Orquestração

> Projeto `LojaDDD`: ASP.NET Core + Angular + Android. Backlog em `docs/planning/`. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-lojaddd"
├── Config Project (C#)           → solução .NET + UnitTests + IntegrationTests
├── Config Project (Angular)      → apps/web-angular (NestJS **ou** API C# — ver nota)
├── Config Shared Web (Angular)   → shell Tailwind (sidebar, topbar, rodapé)
├── Config Project (Android)      → Compose + Retrofit
├── Config Docker (C#)
├── Config CI/CD (C#)
└── Config Shared Core (C#)
```

**Nota**: O `Config Project (Angular)` documenta monorepo com **NestJS** + Angular. Com backend **C#**, rode `Config Project (C#)` primeiro e `Config Project (Angular)` adaptando o frontend para consumir a API ASP.NET (`proxy.conf.json` → `http://localhost:5000`). O `Config Project Full-Stack` orienta a ordem correta.

---

## Etapa 1 — Bootstrap C#

**Agent:** `Config Project (C#)`

```bash
node config-project-cs/scripts/project-init-cs.mjs --project-name=LojaDDD
dotnet restore && dotnet build && dotnet test
```

**Estrutura:**

```
LojaDDD/
├── LojaDDD.sln
├── src/LojaDDD.Backend/
├── src/LojaDDD.Core/
├── tests/LojaDDD.UnitTests/        # Unit Tests (C#)
├── tests/LojaDDD.IntegrationTests/ # E2E Tests (C#)
├── apps/web-angular/               # após Config Project (Angular)
└── mobile-android/                 # após Config Project (Android)
```

Detalhes: [Backend incremental](./backend-incremental.md) (Passo 0–1).

---

## Etapa 2 — Bootstrap Angular + Android

**Angular** — proxy para API C#:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Android** — Retrofit base URL `http://10.0.2.2:5000` (emulador).

**Agents:** `Config Project (Angular)`, `Config Project (Android)`

---

## Etapa 3 — BC Customers (backend C#)

```
Config New Module (C#) → Core Value Object (C#) → … → Backend Controller (C#)
Unit Tests (C#) → E2E Tests (C#)
```

**Agent:** `E2E Tests (C#)`

> WebApplicationFactory: POST /api/customers → GET /api/customers/{id} em `LojaDDD.IntegrationTests`.

Implementação passo a passo: [Backend incremental](./backend-incremental.md).

---

## Etapa 4 — Feature Angular

```
Frontend Entity (Angular) → Frontend UseCase (Angular) → Frontend Repository (Angular)
Frontend Page (Angular) → Frontend Form (Angular)
```

Referência detalhada: [NestJS + Angular + Flutter — Frontend](./nestjs-angular-flutter.md) (mesmos agents Angular; API aponta para ASP.NET).

---

## Etapa 5 — Feature Android

```
Mobile Entity (Android) → Mobile UseCase (Android) → Mobile Repository (Android)
Mobile Screen (Android) → Mobile Form (Android)
```

**Agent:** `Mobile Screen (Android)`

> CustomerListScreen Compose + ViewModel StateFlow, Retrofit repository, pull-to-refresh.

---

## Checklist

- [ ] Análise → backlog (tasks backend com Agent `(C#)`)
- [ ] ASP.NET Core + Angular + Android + Docker + CI/CD
- [ ] BC Customers: Coverlet ≥95% + IntegrationTests
- [ ] Angular: Frontend Page + Frontend Form
- [ ] Android: Mobile Screen + Mobile Form
- [ ] OpenSpec archive nas mudanças

---

## Próximos passos

- [Backend incremental](./backend-incremental.md) — módulo C# em detalhe
- [Hub Full-Stack](../02-fullstack-project-setup.md)
