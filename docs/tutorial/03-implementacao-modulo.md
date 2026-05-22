# Tutorial 03 — Implementação Incremental (Backend)

Este conteúdo foi reorganizado por **combinação de stack**. O guia de backend isolado (migração Strangler Fig, NestJS / Spring / ASP.NET sem UI) está em:

**→ [Stack: Backend Incremental](./stacks/backend-incremental.md)**

---

## Quando usar

- Migração **módulo a módulo** enquanto o legado ainda roda
- EP do backlog com **apenas** camadas `domain:`, `app:`, `infra:`, `interface:controller` (sem `interface:page` / `interface:mobile`)
- Stack **Kotlin** ou **C#** antes de adicionar frontend

## Fluxo recomendado

1. [Tutorial 01 — Análise](./01-pipeline-discovery-planning.md) → `delivery-profile.md` + `backlog.md` (Web/Mobile = **Nenhum** no perfil)
2. [Checklist](./README.md#checklist-antes-do-código) — validar antes de codar
3. [Backend incremental](./stacks/backend-incremental.md) → implementar BC (só API)
4. Depois: [Tutorial 02 — Hub](./02-fullstack-project-setup.md) + stack web/mobile para UI

> **Não substitui o Tutorial 02** para projeto full-stack desde o início — use o [Hub Full-Stack](./02-fullstack-project-setup.md) e escolha a combinação na matriz.
