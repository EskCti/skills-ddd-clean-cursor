---
name: config-shared-web
description: Inicializar e padronizar a camada web compartilhada para apps admin em Next.js com Shadcn UI, ícones Lucide, grupos de rotas `app/(private)` e `app/(public)`, e estrutura `src/shared` contendo componentes base, hooks, context e template administrativo responsivo. Usar quando o pedido envolver bootstrap/rebootstrap do shell web, criação de layout dashboard reutilizavel com sidebar parametrizavel, topbar com dropdown de usuario e toggle mobile em drawer.
---

# Config Shared Web

## Overview

Executar bootstrap deterministico do shell web compartilhado no frontend (`apps/web` por default), criando estrutura base de UI para admin dashboard com modo dark por padrao e tema configuravel (default: `fuchsia`).

## Workflow

1. Definir tema desejado com o usuario (`--theme <name-or-hex>`). Se nao houver escolha, usar `fuchsia`.
2. Executar script principal:
   - `node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark`
3. Validar rotas e estrutura criada:
   - `src/app/(private)`
   - `src/app/(public)`
   - `src/shared/components`
   - `src/shared/hooks`
   - `src/shared/context`
   - `src/shared/template`
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
5. Registrar execucao no `.log/skills.log` (o script faz isso automaticamente).

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
- Arquivo `components.json` alinhado para aliases em `src/shared`.
- Grupos de rota:
  - `src/app/(private)` com layout administrativo
  - `src/app/(public)` com layout boxed/centralizado
- Estrutura compartilhada:
  - `src/shared/components/ui` (button, input, dropdown-menu, sheet)
  - `src/shared/lib/class-name.util.ts` (`cn` helper)
  - `src/shared/context/shell.context.tsx`
  - `src/shared/hooks/shell.hook.ts`
  - `src/shared/template/admin-shell.component.tsx`
  - `src/shared/template/public-boxed-layout.component.tsx`
- Tema dark por padrao e tokens de cor atualizados em `src/app/globals.css`.
- Layout privado com sidebar parametrizavel (prop `sidebar`) e `children` como body.
- Estado de shell (open/close sidebar, mobile detection, toggle) centralizado em contexto/hook.
- Menu com icones e grupos com label de separacao (exemplo inicial com `Dashboard` + grupo `Modulos`).
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
- Consultar `references/shared-web-contract.md` para contrato completo dos arquivos gerados.
- Consultar `../skills-standards.md` para diretrizes globais de padronizacao.
