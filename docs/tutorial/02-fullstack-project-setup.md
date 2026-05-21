# Tutorial 02 — Full-Stack: Escolha da Combinação

**Objetivo**: Depois da [análise (Tutorial 01)](./01-pipeline-discovery-planning.md), escolher backend + frontend + mobile e seguir o guia da combinação — sempre orquestrado por `config-project-fullstack`.

> **Regra**: Nenhum setup full-stack começa “no escuro”. O `backlog.md` (épicos, BCs, tasks por camada) vem do pipeline `req-*`. O agent **`config-project-fullstack`** traduz a combinação escolhida na sequência exata de agents.

---

## Fluxo comum (todas as combinações)

```
Tutorial 01 — req-discovery → req-ddd-modeling → req-migration-strategy → req-agile-planning
                                    │
                                    ▼
                           backlog.md + epics-summary.md
                                    │
                                    ▼
              config-project-fullstack  ← informar backend + frontend + mobile
                                    │
                    ┌───────────────┼───────────────────────┐
                    ▼               ▼                       ▼
            config-project-*   config-shared-web*     config-docker + config-cicd
            (bootstrap)        shell Tailwind           + config-shared-core
            stacks/*           sidebar/topbar/rodapé
                    │
                    ▼
         Por BC (inside-out): core-* → backend-* → test-unit-* → test-e2e-*
                    │
         Por feature web: frontend-entity → usecase → repository → page/form
                    │
         Por tela mobile: mobile-entity → usecase → repository → screen/form
                    │
                    ▼
         [Opcional] Tutorial 04 — OpenSpec (propose → apply → archive)
```

### Prompt inicial — `config-project-fullstack`

> Tenho o backlog em `docs/planning/<projeto>/backlog.md` gerado pelo req-agile-planning.
> Quero criar o projeto `<nome>` com:
> - Backend: [ NestJS | Spring Boot | ASP.NET Core ]
> - Frontend: [ Next.js | Angular | Vue 3 | Nenhum ]
> - Mobile: [ Flutter | Android | Nenhum ]
> Docker e CI/CD no bootstrap. Usar OpenSpec para rastrear mudanças.

O agent responde com: agents de bootstrap, sufixo de skills (`-kt`, `-cs` ou nenhum), ordem de EP-000 e link lógico para o tutorial da combinação abaixo.

---

## Matriz de combinações

| Backend | Frontend | Mobile | Quando usar | Tutorial |
|---------|----------|--------|-------------|----------|
| **NestJS** | **Angular** | **Flutter** | Enterprise TS, PrimeNG, app iOS+Android | [nestjs-angular-flutter](./stacks/nestjs-angular-flutter.md) |
| **NestJS** | **Vue 3** | **Flutter** | Produtividade UI (PrimeVue), legado PHP→TS | [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) |
| **NestJS** | **Next.js** | **Flutter** | SSR/SEO, time full TS, tipos compartilhados | [nestjs-next-flutter](./stacks/nestjs-next-flutter.md) |
| **Spring Boot** | **Vue 3** | **Flutter** | Ecossistema JVM + UI Vue | [spring-vue-flutter](./stacks/spring-vue-flutter.md) |
| **ASP.NET Core** | **Angular** | **Android** | .NET enterprise + nativo Android | [dotnet-angular-android](./stacks/dotnet-angular-android.md) |
| **Qualquer** | — | — | Strangler Fig, só backend / migração incremental | [backend-incremental](./stacks/backend-incremental.md) |

Matriz completa e justificativas: [`config-project-fullstack/references/fullstack-stack-matrix.md`](../../config-project-fullstack/references/fullstack-stack-matrix.md)

---

## EP-000 no backlog (padrão full-stack)

Independente da combinação, o **req-agile-planning** deve gerar tasks semelhantes:

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] infra:setup       → config-project-fullstack + config-project-* da combinação
- [ ] infra:shell-web   → config-shared-web | config-shared-web-angular | config-shared-web-vue
- [ ] infra:docker      → config-docker[-kt|-cs]
- [ ] infra:cicd        → config-cicd[-kt|-cs]
- [ ] infra:shared-core → config-shared-core[-kt|-cs]
- [ ] infra:e2e-scaffold → ensure-e2e-scaffold / create-e2e-spec (TS) ou test-e2e-kt / test-e2e-cs
```

---

## Fases por camada (referência rápida)

| Fase | Agents | OpenSpec (opcional) |
|------|--------|---------------------|
| Bootstrap | `config-project-*`, `config-shared-web*`, `config-docker*`, `config-cicd*`, `config-shared-core*` | `openspec-propose "bootstrap-<nome>"` |
| BC backend | `core-*`, `backend-*`, `test-unit-*`, `test-e2e-*` | `openspec-propose "bc-<nome>"` |
| Feature web | `frontend-entity-*`, `frontend-usecase-*`, `frontend-repository-*`, `frontend-page-*`, `frontend-form-*` | `openspec-propose "feat-<nome>-<fw>"` |
| Feature mobile | `mobile-entity-*`, `mobile-usecase-*`, `mobile-repository-*`, `mobile-screen-*`, `mobile-form-*` | `openspec-propose "feat-<nome>-<mobile>"` |
| Auth | `config-auth-core-*`, `config-auth-backend-*`, `config-auth-web-*` | `openspec-propose "feat-auth"` |

Ordem inside-out detalhada: [README — Ordem de Implementação](./README.md#ordem-de-implementação-inside-out)

---

## Qual tutorial seguir?

| Situação | Caminho |
|----------|---------|
| Projeto **novo** com web + mobile | 01 → **02 (este)** → tutorial da combinação em `stacks/` |
| **Legado** com migração por BC | 01 → **backend-incremental** → depois combinação full-stack para UI |
| Legado + OpenSpec integrado | 01 → 02 → [nestjs-vue-flutter](./stacks/nestjs-vue-flutter.md) **ou** [Tutorial 04](./04-ciclo-completo-openspec.md) (narrativa) |
| Já tem backend, falta frontend/mobile | 01 → combinação escolhida (pular bootstrap backend se existir) |
| Dúvida de stack | `config-project-fullstack` + matriz acima |

---

## Próximos passos

- Escolha uma linha da [matriz](#matriz-de-combinações) e abra o tutorial em `stacks/`
- [Tutorial 04 — Ciclo OpenSpec](./04-ciclo-completo-openspec.md) — narrativa legado com OpenSpec (stack NestJS + Vue + Flutter)
- [Tutorial 01](./01-pipeline-discovery-planning.md) — se ainda não tiver `backlog.md`
