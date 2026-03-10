# Shared Web Contract

## Goal

Padronizar o frontend com shell administrativo reutilizavel, separando rotas privadas/publicas, camada compartilhada em `src/shared` e módulo funcional de referência em `src/modules/examples`.

## Command

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark
```

## Inputs

- `--theme`: nome de cor (`fuchsia`, `emerald`, `blue`, `amber`, etc.) ou hexadecimal (`#RRGGBB`).
- `--mode`: `dark` (default) ou `light`.
- `--skip-install`: nao instala dependencias NPM.
- `--dry-run`: so imprime o que seria alterado.

## Deterministic Sequence

1. Resolve frontend pelo `skills.config.json`.
2. Instala/atualiza dependencias compartilhadas do shell e UI.
3. Remove arquivos legados conhecidos.
4. Gera/atualiza arquivos do App Router (`private/public/example`).
5. Gera/atualiza `src/shared` com componentes base para dashboard.
6. Gera/atualiza `src/modules/examples` (data, components, pages).
7. Emite resumo de criados/atualizados/inalterados e registra no `.log/skills.log`.

## Deterministic Outputs

### Frontend root

- `<frontendAppPath>/components.json`

### App Router

- `<frontendAppPath>/src/app/layout.tsx`
- `<frontendAppPath>/src/app/page.tsx`
- `<frontendAppPath>/src/app/globals.css`
- `<frontendAppPath>/src/app/(private)/layout.tsx`
- `<frontendAppPath>/src/app/(private)/private/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/layout.tsx`
- `<frontendAppPath>/src/app/(private)/example/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/buttons/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/forms/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/tables/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/widgets/page.tsx`
- `<frontendAppPath>/src/app/(public)/layout.tsx`
- `<frontendAppPath>/src/app/(public)/public/page.tsx`

### Shared layer

- `<frontendAppPath>/src/shared/index.ts`
- `<frontendAppPath>/src/shared/lib/class-name.util.ts`
- `<frontendAppPath>/src/shared/hooks/shell.hook.ts`
- `<frontendAppPath>/src/shared/context/shell.context.tsx`
- `<frontendAppPath>/src/shared/template/index.ts`
- `<frontendAppPath>/src/shared/template/admin-shell.component.tsx`
- `<frontendAppPath>/src/shared/template/public-boxed-layout.component.tsx`
- `<frontendAppPath>/src/shared/components/ui/button.tsx`
- `<frontendAppPath>/src/shared/components/ui/input.tsx`
- `<frontendAppPath>/src/shared/components/ui/dropdown-menu.tsx`
- `<frontendAppPath>/src/shared/components/ui/sheet.tsx`
- `<frontendAppPath>/src/shared/components/ui/badge.tsx`
- `<frontendAppPath>/src/shared/components/ui/card.tsx`
- `<frontendAppPath>/src/shared/components/ui/checkbox.tsx`
- `<frontendAppPath>/src/shared/components/ui/combobox.tsx`
- `<frontendAppPath>/src/shared/components/ui/dialog.tsx`
- `<frontendAppPath>/src/shared/components/ui/label.tsx`
- `<frontendAppPath>/src/shared/components/ui/popover.tsx`
- `<frontendAppPath>/src/shared/components/ui/radio-group.tsx`
- `<frontendAppPath>/src/shared/components/ui/separator.tsx`
- `<frontendAppPath>/src/shared/components/ui/table.tsx`
- `<frontendAppPath>/src/shared/components/ui/tabs.tsx`
- `<frontendAppPath>/src/shared/components/ui/textarea.tsx`
- `<frontendAppPath>/src/shared/components/ui/toaster.tsx`

### Examples module

- `<frontendAppPath>/src/modules/examples/index.ts`
- `<frontendAppPath>/src/modules/examples/data/example-menu.data.ts`
- `<frontendAppPath>/src/modules/examples/components/example-navigation.component.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-overview.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-buttons.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-forms.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-tables.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-widgets.page.tsx`

## Runtime dependencies installed

- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`
- `sonner`
- `@radix-ui/react-slot`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-separator`
- `@radix-ui/react-tabs`

## Dev dependency installed

- `shadcn`

## Expected behavior

- Private shell com sidebar full-height, topbar, menu de usuario e area de conteudo.
- Grupo `Modulos` inicia com apenas um módulo: `Examples`.
- Módulo `/example` possui layout próprio com menu lateral local.
- Primeiro item do menu local do módulo é sempre `Voltar ao dashboard` (link para `/private`).
- Seções de exemplos disponíveis: visão geral, botões/dialog/toast, formulários, tabelas e widgets.
- Sidebar desktop colapsavel exibindo apenas icones quando fechado.
- Ao passar mouse (ou foco por teclado) sobre icone colapsado, exibir label do item.
- Mobile sem sidebar fixa: navegacao lateral somente via drawer.
- Public layout sem shell admin, centralizado e boxed para auth/landing.
