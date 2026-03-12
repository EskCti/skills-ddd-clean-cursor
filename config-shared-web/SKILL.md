---
name: config-shared-web
description: Inicializar e padronizar a camada web compartilhada para apps admin em Next.js com scaffold base agnostico de biblioteca de componentes, grupos de rotas `app/(private)` e `app/(public)`, estrutura `src/shared` (incluindo i18n e form validator), modulo `src/modules/examples` e adapter de UI selecionavel (default: Shadcn). Usar quando o pedido envolver bootstrap/rebootstrap do shell web, criacao de layout dashboard reutilizavel e setup inicial de componentes/paginas de referencia.
---

# Config Shared Web

## Overview

Executa bootstrap deterministico do shell web compartilhado no frontend (`apps/web` por default) em duas camadas:

- camada base (`templates/base`): estrutura do projeto, rotas, modulo examples, `src/shared` (context/hook/template), internacionalizacao e validador de formularios;
- camada de biblioteca de UI (`templates/ui-libraries/<library>`): dependencias, setup da biblioteca e componentes basicos.

Adapter default: `shadcn`.

## Workflow

1. Definir parametros com o usuario:
   - `--theme <name-or-hex>` (default: `fuchsia`)
   - `--mode <dark|light>` (default: `dark`)
   - `--ui-library <name>` (default: `shadcn`)
2. Executar script principal:
   - `node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark --ui-library shadcn`
3. Validar estrutura base criada:
   - `src/app/(private)`
   - `src/app/(public)`
   - `src/app/(private)/example`
   - `src/modules/examples`
   - `src/modules/dashboard/components`
   - `src/shared/i18n`
   - `src/shared/components/form/validator`
   - `src/shared/context`
   - `src/shared/hooks`
   - `src/shared/template`
   - `public/illustrations/empty-dashboard.svg`
   - `public/illustrations/empty-dashboard-dark.svg`
4. Validar estrutura da biblioteca de UI selecionada:
   - para `shadcn`: `components.json`, `src/shared/components/ui`, `src/shared/lib/class-name.util.ts`
5. Confirmar layout admin com:
   - sidebar parametrizavel via prop `sidebar`
   - menu colapsado exibindo apenas icones no desktop
   - hover/focus no icone colapsado exibindo label do item
   - topbar com toggle
   - dropdown de usuario com logout
   - comportamento responsivo (mobile via drawer)
6. Registrar execucao no `.log/skills.log` (automatico no script).

## Commands

Bootstrap completo com Shadcn em modo dark (padrao):

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark --ui-library shadcn
```

Escolher outro tema e modo light:

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme '#22c55e' --mode light --ui-library shadcn
```

Executar sem instalar dependencias (somente arquivos):

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --ui-library shadcn --skip-install
```

Simular alteracoes sem gravar arquivos:

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --ui-library shadcn --dry-run
```

## O que o script garante

### Camada base (independente da biblioteca de UI)

- Grupos de rota:
  - `src/app/(private)` com layout administrativo
  - `src/app/(private)/dashboard` como entrada do shell
  - `src/app/(public)` com layout boxed/centralizado
  - `src/app/(private)/example/*` para catalogo de exemplos
- Estrutura compartilhada base:
  - `src/shared/context`
  - `src/shared/hooks`
  - `src/shared/template`
  - `src/shared/i18n`
  - `src/shared/components/form/validator`
- Estrutura de modulo funcional:
  - `src/modules/dashboard/components` (estado vazio de dashboard)
  - `src/modules/examples/data`
  - `src/modules/examples/components`
  - `src/modules/examples/pages`
- Assets de ilustracao para dashboard vazio:
  - `public/illustrations/empty-dashboard.svg`
  - `public/illustrations/empty-dashboard-dark.svg`
- Tema base em `src/app/globals.css` com token dinamico de cor primaria (`--theme`).
- Classe de modo no `body` controlada por `--mode` (`dark` ou `light`).

### Camada UI library (adapter)

- Seleciona adapter por `--ui-library`.
- Permite estender a skill sem mexer no scaffold base.
- Adapter `shadcn` aplica:
  - dependencias runtime e dev necessarias;
  - `components.json`;
  - `src/shared/lib/class-name.util.ts`;
  - `src/shared/components/ui/*`, incluindo componentes compostos (`metric-card`, `table-card`, `pagination-controls`, `delete-confirmation-dialog` e correlatos).

### Comportamento de shell

- Sidebar desktop colapsavel (somente icones no estado colapsado).
- Em mobile, navegacao lateral exibida somente via drawer.
- Logo no sidebar com icone + texto (texto oculto quando colapsado).
- Item de logout como placeholder para evolucao futura.
- Dashboard privado inicial renderiza `EmptyDashboardState` com ilustracao SVG.

## Notes

- Script idempotente: pode ser reexecutado para reconciliar arquivos.
- Ao detectar integracao existente com modulos externos em arquivos de `src/app` (ex.: `@/modules/auth`, `@/modules/dashboard`), o script preserva esses arquivos em vez de sobrescrever com template base.
- Se o frontend configurado em `skills.config.json` nao existir, o script falha com erro explicito.
- Para adicionar nova biblioteca no futuro:
  - criar adapter em `scripts/ui-libraries/<nome>.mjs`;
  - criar templates em `templates/ui-libraries/<nome>`.
- Consultar `references/shared-web-contract.md` para o contrato completo dos arquivos gerados.
- Consultar `../skills-standards.md` para diretrizes globais de padronizacao.
