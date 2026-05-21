# Tutorial 03 — Implementação Incremental (Backend)

Este conteúdo foi reorganizado por **combinação de stack**. O guia de backend isolado (migração Strangler Fig, NestJS / Spring / ASP.NET sem UI) está em:

**→ [Stack: Backend Incremental](./stacks/backend-incremental.md)**

---

## Quando usar

- Migração **módulo a módulo** enquanto o legado ainda roda
- EP do backlog com **apenas** camadas `domain:`, `app:`, `infra:`, `interface:controller` (sem `interface:page` / `interface:mobile`)
- Stack **Kotlin** ou **C#** antes de adicionar frontend

## Fluxo recomendado

1. [Tutorial 01 — Análise](./01-pipeline-discovery-planning.md) → `backlog.md`
2. [Tutorial 02 — Hub Full-Stack](./02-fullstack-project-setup.md) → confirmar que incremental é o caminho
3. [Backend incremental](./stacks/backend-incremental.md) → implementar BC
4. Depois: escolher combinação web/mobile no hub e implementar features de UI

> Para projeto **novo** com backend + frontend + mobile desde o início, use o [Hub Full-Stack](./02-fullstack-project-setup.md) em vez deste atalho.
