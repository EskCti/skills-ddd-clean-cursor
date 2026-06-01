# Agrupamento de commits — skills-ddd-clean-cursor

Referência para o agent **Organized Git Commits**. Ajuste paths conforme o `git status` real.

## Mapa path → commit sugerido

| Glob / pasta | Tipo | Escopo commit | Exemplo de mensagem |
|--------------|------|---------------|---------------------|
| `skills-standards.md` | docs | padrões globais | `docs: padronizar Tailwind e shells web em skills-standards` |
| `req-*` | feat | req | `feat(req): alinhar pipeline de análise e backlog ao ciclo full-stack` |
| `config-project-fullstack/` | feat | config | `feat(config): adicionar orquestrador config-project-fullstack` |
| `config-docker*/` `config-cicd*/` | feat | config | `feat(config): adicionar skills Docker e CI/CD para TS, Kotlin e C#` |
| `config-project-angular/` `config-project-vue/` `config-project-flutter/` `config-project-android/` | feat | config | `feat(config): bootstrap Angular, Vue, Flutter e Android` |
| `config-project/` E2E, `config-new-module*/` | feat | config | `feat(config): scaffold E2E automático no bootstrap NestJS` |
| `config-project-cs/` | feat | config | `feat(config): template C# com UnitTests e IntegrationTests` |
| `config-project-rs/` `config-shared-core-rs/` `config-new-module-rs/` `config-sqlx-rs/` | feat | config | `feat(config): bootstrap Rust Axum modular por BC` |
| `core-*-rs/` `backend-*-rs/` | feat | core/backend | `feat(rust): skills domain/application/infra Axum` |
| `config-docker-rs/` `config-cicd-rs/` `test-*-rs/` | feat | config/test | `feat(rust): docker, CI/CD e testes Rust` |
| `test-unit*/` `test-e2e*/` + jest/gradle thresholds | feat | test | `feat(test): skills de testes unitários e E2E para TS, Kotlin e C#` |
| `frontend-*-angular/` `frontend-*-vue/` | feat | frontend | `feat(frontend): skills Clean Architecture para Angular e Vue` |
| `mobile-*-flutter/` `mobile-*-android/` | feat | mobile | `feat(mobile): skills Clean Architecture para Flutter e Android` |
| `config-shared-web-angular/` `config-shared-web-vue/` `utils/init-frontend-shell.mjs` + patch `config-shared-web/` | feat | config | `feat(config): shells web Tailwind para Angular e Vue` |
| `docs/` `README.md` | docs | tutoriais | `docs: tutoriais full-stack, stacks por combinação e ciclo OpenSpec` |
| 1 arquivo residual | chore | alinhamento | `chore: alinhar core-entity ao padrão de skills atualizado` |

## Ordem recomendada

Fundamentos primeiro → features → documentação → chore:

```
standards → req → fullstack → docker/cicd → bootstrap stacks → E2E → CS template
→ test skills → frontend → mobile → shared-web shells → docs → chore
```

## Anti-patterns

| Evitar | Fazer |
|--------|-------|
| `git add .` | `git add req-agile-planning/ req-migration-strategy/` |
| Commit único gigante | 8–15 commits revisáveis |
| `WIP`, `fix`, `update` | `feat(config): ...` com corpo |
| Misturar docs + código no mesmo commit | Separar `docs:` de `feat:` |
| Commitar antes de analisar diff | Sempre `git status` + `git diff` primeiro |

## Checklist antes de fechar

- [ ] Nenhum secret staged (`.env`, keys, tokens)
- [ ] Cada commit compila semanticamente sozinho (mesmo que o repo seja só docs/skills)
- [ ] Mensagens em português ou inglês — **consistente por PR** (este repo usa português nas mensagens recentes)
- [ ] Working tree clean ou usuário informado do que ficou pendente
