# Shared Web Contract

## Goal

Padronizar o frontend com shell administrativo reutilizavel, separando rotas privadas/publicas, camada compartilhada em `src/shared`, modulo funcional de referencia em `src/modules/examples` e bootstrap modular por biblioteca de componentes.

## Command

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark --ui-library shadcn
```

## Inputs

- `--theme`: nome de cor (`fuchsia`, `emerald`, `blue`, `amber`, etc.) ou hexadecimal (`#RRGGBB`).
- `--mode`: `dark` (default) ou `light`.
- `--ui-library`: nome da biblioteca de UI (default: `shadcn`).
- `--skip-install`: nao instala dependencias NPM.
- `--dry-run`: so imprime o que seria alterado.

## Deterministic Sequence

1. Resolve frontend pelo `skills.config.json`.
2. Resolve scaffold base + adapter de UI selecionado.
3. Valida contrato minimo dos templates (base + adapter) antes de aplicar alteracoes.
4. Instala/atualiza dependencias agregadas de base + biblioteca de UI (quando aplicavel).
5. Remove arquivos legados conhecidos.
6. Gera/atualiza arquivos do App Router (`private/public/example/dashboard`).
7. Gera/atualiza `src/shared` base (incluindo `i18n` e `components/form/validator`).
8. Gera/atualiza `src/modules/examples` (data, components, pages) e `src/modules/dashboard/components`.
9. Gera/atualiza assets de dashboard vazio em `public/illustrations`.
10. Gera/atualiza arquivos da biblioteca de UI selecionada.
11. Preserva arquivos de `src/app` quando detectar integracao existente com modulos externos (ex.: `@/modules/auth`, `@/modules/dashboard`) e o template atual nao incluir essa integracao.
12. Emite resumo de criados/atualizados/preservados/inalterados e registra no `.log/skills.log`.

## Deterministic Outputs

### Frontend root (por adapter)

- `<frontendAppPath>/components.json` (shadcn)

### App Router (base)

- `<frontendAppPath>/src/app/layout.tsx`
- `<frontendAppPath>/src/app/page.tsx`
- `<frontendAppPath>/src/app/globals.css`
- `<frontendAppPath>/src/app/(private)/layout.tsx`
- `<frontendAppPath>/src/app/(private)/dashboard/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/layout.tsx`
- `<frontendAppPath>/src/app/(private)/example/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/buttons/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/forms/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/tables/page.tsx`
- `<frontendAppPath>/src/app/(private)/example/widgets/page.tsx`
- `<frontendAppPath>/src/app/(public)/layout.tsx`
- `<frontendAppPath>/src/app/(public)/public/page.tsx`
- `<frontendAppPath>/public/illustrations/empty-dashboard.svg`
- `<frontendAppPath>/public/illustrations/empty-dashboard-dark.svg`

### Shared layer (base)

- `<frontendAppPath>/src/shared/index.ts`
- `<frontendAppPath>/src/shared/context/shell.context.tsx`
- `<frontendAppPath>/src/shared/hooks/shell.hook.ts`
- `<frontendAppPath>/src/shared/template/index.ts`
- `<frontendAppPath>/src/shared/template/admin-shell.component.tsx`
- `<frontendAppPath>/src/shared/template/public-boxed-layout.component.tsx`
- `<frontendAppPath>/src/shared/i18n/index.ts`
- `<frontendAppPath>/src/shared/i18n/messages.pt.ts`
- `<frontendAppPath>/src/shared/i18n/messages.en.ts`
- `<frontendAppPath>/src/shared/components/form/validator/index.ts`
- `<frontendAppPath>/src/shared/components/form/validator/types.ts`
- `<frontendAppPath>/src/shared/components/form/validator/type-guards.ts`
- `<frontendAppPath>/src/shared/components/form/validator/field-resolvers.ts`
- `<frontendAppPath>/src/shared/components/form/validator/error-helpers.ts`
- `<frontendAppPath>/src/shared/components/form/validator/validator.ts`
- `<frontendAppPath>/src/shared/components/form/validator/validators.ts`

### Shared layer (shadcn adapter)

- `<frontendAppPath>/src/shared/lib/class-name.util.ts`
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
- `<frontendAppPath>/src/shared/components/ui/delete-confirmation-dialog.tsx`
- `<frontendAppPath>/src/shared/components/ui/form-error-message.tsx`
- `<frontendAppPath>/src/shared/components/ui/metric-card.tsx`
- `<frontendAppPath>/src/shared/components/ui/mini-form-card.tsx`
- `<frontendAppPath>/src/shared/components/ui/navigation-link-card.tsx`
- `<frontendAppPath>/src/shared/components/ui/page-section-header.tsx`
- `<frontendAppPath>/src/shared/components/ui/pagination-controls.tsx`
- `<frontendAppPath>/src/shared/components/ui/standard-dialog-content.tsx`
- `<frontendAppPath>/src/shared/components/ui/table-card.tsx`

### Examples module (base)

- `<frontendAppPath>/src/modules/examples/index.ts`
- `<frontendAppPath>/src/modules/examples/data/example-menu.data.ts`
- `<frontendAppPath>/src/modules/examples/components/example-navigation.component.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-dashboard.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-buttons.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-forms.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-tables.page.tsx`
- `<frontendAppPath>/src/modules/examples/pages/example-widgets.page.tsx`

### Dashboard module (base)

- `<frontendAppPath>/src/modules/dashboard/components/empty-dashboard-state.component.tsx`

## Runtime dependencies installed (base)

- `react-hook-form`

## Runtime dependencies installed (shadcn)

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

## Dev dependency installed (shadcn)

- `shadcn`

## Expected behavior

- Private shell com sidebar full-height, topbar, menu de usuario e area de conteudo.
- Grupo `Modulos` com modulo inicial `Examples`.
- Menu local de `Examples` com item de retorno para `/dashboard`.
- Sidebar desktop colapsavel exibindo apenas icones quando fechado.
- Em mobile, navegacao lateral somente via drawer.
- Dashboard privado inicial com estado vazio (`EmptyDashboardState`) e ilustracao SVG.
- Layout publico sem shell admin, centralizado e boxed.
- Internacionalizacao de mensagens via `src/shared/i18n`.
- Validacao de formularios com schema/resolver via `src/shared/components/form/validator`.
