---
name: config-shared-web
description: Inicializar e padronizar a camada web compartilhada para apps admin em Next.js com Shadcn UI, ícones Lucide, grupos de rotas `app/(private)` e `app/(public)`, estrutura `src/shared` com componentes de dashboard e módulo `src/modules/examples` com rotas de demonstração. Usar quando o pedido envolver bootstrap/rebootstrap do shell web, criação de layout dashboard reutilizavel e setup inicial de componentes/páginas de referência.
---

# Config Shared Web

## Overview

Executar bootstrap deterministico do shell web compartilhado no frontend (`apps/web` por default), criando estrutura base de UI para admin dashboard com modo dark por padrao e tema configuravel (default: `fuchsia`), incluindo:

- shell administrativo com grupos de rotas private/public;
- componentes UI principais para aplicações dashboard;
- módulo funcional `examples` em `src/modules/examples`;
- rotas `app/(private)/example/*` com menu próprio (primeiro item sempre volta ao dashboard).

## Workflow

1. Definir tema desejado com o usuario (`--theme <name-or-hex>`). Se nao houver escolha, usar `fuchsia`.
2. Executar script principal:
   - `node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark`
3. Validar rotas e estrutura criada:
   - `src/app/(private)`
   - `src/app/(public)`
   - `src/app/(private)/example`
   - `src/shared/components`
   - `src/shared/hooks`
   - `src/shared/context`
   - `src/shared/template`
   - `src/modules/examples`
4. Confirmar layout admin com:
   - sidebar parametrizavel por prop
   - itens de menu com icones
   - menu colapsado exibindo apenas icones no desktop
   - hover/focus no icone colapsado exibindo label do item
   - separadores/labels de grupo (ex.: `Modulos`)
   - logo com icone + texto (texto oculto quando colapsado)
   - topbar com toggle
   - dropdown de usuario com logout
   - comportamento responsivo (mobile apenas drawer)
5. Confirmar menu do módulo `example`:
   - primeiro item: `Voltar ao dashboard` (link para `/private`)
   - demais itens: visao geral, botoes/dialog, formularios, tabelas, widgets
6. Registrar execucao no `.log/skills.log` (o script faz isso automaticamente).

## Commands

Bootstrap completo com tema fuchsia em modo dark (padrao recomendado):

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark
```

Escolher outro tema sem prompt (exemplo com hex):

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme '#22c55e' --mode dark
```

Executar sem instalar dependencias (somente arquivos):

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --skip-install
```

Simular alteracoes sem gravar arquivos:

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --dry-run
```

## O que o script garante

- Dependencias para stack Shadcn/Lucide no frontend (`apps/web/package.json`) via `npm --workspace <frontend> install`.
- Dependencias extras para componentes de dashboard (tabs, radio, checkbox, label, popover, separator e mensagens toast).
- Arquivo `components.json` alinhado para aliases em `src/shared`.
- Grupos de rota:
  - `src/app/(private)` com layout administrativo
  - `src/app/(public)` com layout boxed/centralizado
  - `src/app/(private)/example/*` para catálogo de exemplos
- Estrutura compartilhada:
  - `src/shared/components/ui` (button, input, dropdown-menu, sheet, card, badge, dialog, combobox, tabs, table, checkbox, radio-group, label, textarea, popover, separator, toaster)
  - `src/shared/lib/class-name.util.ts` (`cn` helper)
  - `src/shared/context/shell.context.tsx`
  - `src/shared/hooks/shell.hook.ts`
  - `src/shared/template/admin-shell.component.tsx`
  - `src/shared/template/public-boxed-layout.component.tsx`
- Estrutura de módulo funcional:
  - `src/modules/examples/data`
  - `src/modules/examples/components`
  - `src/modules/examples/pages`
  - `src/modules/examples/index.ts`
- Tema dark por padrao e tokens de cor atualizados em `src/app/globals.css`.
- Layout privado com sidebar parametrizavel (prop `sidebar`) e `children` como body.
- Estado de shell (open/close sidebar, mobile detection, toggle) centralizado em contexto/hook.
- Dashboard principal com um módulo inicial (`Examples`) no grupo `Modulos`.
- Layout do módulo `example` com navegação local e primeiro item obrigatório para retorno ao dashboard.
- Sidebar desktop colapsavel (somente icones no estado colapsado).
- No estado colapsado, hover/focus sobre icones exibe label contextual do item.
- Em mobile, navegacao lateral exibida somente via drawer.
- Logo no sidebar com icone + texto (texto escondido no estado colapsado).
- Padrao de nomenclatura global aplicado para novos arquivos customizados: `<nome-kebab>.<tipo>.<ext>`.
- Excecoes permitidas: arquivos fixos de framework (`page.tsx`, `layout.tsx`) e componentes importados no padrao original do Shadcn.

## Notes

- Script idempotente: pode ser reexecutado para reconciliar arquivos.
- Se o frontend configurado em `skills.config.json` nao existir, o script falha com erro explicito.
- O item de logout e placeholder para evolucao futura com outra skill.
- O modulo `examples` funciona como referência inicial para escalar novas interfaces.
- Consultar `references/shared-web-contract.md` para contrato completo dos arquivos gerados.
- Consultar `../skills-standards.md` para diretrizes globais de padronizacao.
