# Stack: ASP.NET Core + Angular + Android

**Combinação**: Backend C# (ASP.NET Core) · Frontend Angular 17+ · Mobile Android (Kotlin + Compose)

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · [Tutorial 02 — Hub Full-Stack](../02-fullstack-project-setup.md)

**Quando usar**: .NET enterprise, Angular no web, Android nativo com Compose.

Agents: `config-project-fullstack` → `config-project-cs` → `config-project-angular` → `config-shared-web-angular` → `config-project-android` → `config-docker-cs` → `config-cicd-cs` → skills **`-cs`** (backend) + Angular/Android (sem sufixo mobile `-android`)

---

## Etapa 0 — Orquestração

> Projeto `LojaDDD`: ASP.NET Core + Angular + Android. Backlog em `docs/planning/`. Docker/CI/CD no bootstrap.

```
openspec-apply-change "bootstrap-lojaddd"
├── config-project-cs         → solução .NET + UnitTests + IntegrationTests
├── config-project-angular    → apps/web-angular (NestJS **ou** API C# — ver nota)
├── config-shared-web-angular → shell Tailwind (sidebar, topbar, rodapé)
├── config-project-android    → Compose + Retrofit
├── config-docker-cs
├── config-cicd-cs
└── config-shared-core-cs
```

**Nota**: O `config-project-angular` documenta monorepo com **NestJS** + Angular. Com backend **C#**, rode `config-project-cs` primeiro e `config-project-angular` adaptando o frontend para consumir a API ASP.NET (`proxy.conf.json` → `http://localhost:5000`). O `config-project-fullstack` orienta a ordem correta.

---

## Etapa 1 — Bootstrap C# (`config-project-cs`)

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
├── tests/LojaDDD.UnitTests/        # test-unit-cs
├── tests/LojaDDD.IntegrationTests/ # test-e2e-cs (WebApplicationFactory)
├── apps/web-angular/               # após config-project-angular
└── mobile-android/                 # após config-project-android
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

Agents: `config-project-angular`, `config-project-android`

---

## Etapa 3 — BC Customers (backend `-cs`)

```
config-new-module-cs → core-*-cs → backend-controller-cs
test-unit-cs → test-e2e-cs
```

**Agent `E2E Tests (C#)`:**

> WebApplicationFactory: POST /api/customers → GET /api/customers/{id} em `LojaDDD.IntegrationTests`.

Implementação passo a passo: [Backend incremental](./backend-incremental.md).

---

## Etapa 4 — Feature Angular

```
frontend-entity-angular → frontend-usecase-angular → frontend-repository-angular
frontend-page-angular → frontend-form-angular
```

Referência detalhada: [NestJS + Angular + Flutter — Frontend](./nestjs-angular-flutter.md) (mesmas skills Angular; API aponta para ASP.NET).

---

## Etapa 5 — Feature Android

```
mobile-entity-android → mobile-usecase-android → mobile-repository-android
mobile-screen-android → mobile-form-android
```

**Agent `mobile-screen-android`:**

> CustomerListScreen Compose + ViewModel StateFlow, Retrofit repository, pull-to-refresh.

---

## Checklist

- [ ] Análise → backlog (tasks `-cs` no backend)
- [ ] ASP.NET Core + Angular + Android + Docker + CI/CD
- [ ] BC Customers: Coverlet ≥95% + IntegrationTests
- [ ] Angular: listagem + formulário PrimeNG
- [ ] Android: telas Compose
- [ ] OpenSpec archive nas mudanças

---

## Próximos passos

- [Backend incremental](./backend-incremental.md) — módulo C# em detalhe
- [Hub Full-Stack](../02-fullstack-project-setup.md)
