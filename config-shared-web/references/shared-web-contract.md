# Shared Web Contract

## Goal

Padronizar o frontend com shell administrativo reutilizavel, separando rotas privadas/publicas e camada compartilhada em `src/shared`.

## Command

```bash
node .agents/skills/config-shared-web/scripts/init-shared-web.mjs --theme fuchsia --mode dark
```

## Inputs

- `--theme`: nome de cor (`fuchsia`, `emerald`, `blue`, `amber`, etc.) ou hexadecimal (`#RRGGBB`).
- `--mode`: `dark` (default) ou `light`.
- `--skip-install`: nao instala dependencias NPM.
- `--dry-run`: so imprime o que seria alterado.

## Deterministic Outputs

### Frontend root

- `<frontendAppPath>/components.json`

### App Router

- `<frontendAppPath>/src/app/(private)/layout.tsx`
- `<frontendAppPath>/src/app/(private)/private/page.tsx`
- `<frontendAppPath>/src/app/(public)/layout.tsx`
- `<frontendAppPath>/src/app/(public)/public/page.tsx`
- `<frontendAppPath>/src/app/page.tsx`
- `<frontendAppPath>/src/app/layout.tsx`
- `<frontendAppPath>/src/app/globals.css`

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

## Runtime dependencies installed

- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`
- `@radix-ui/react-slot`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-dialog`

## Dev dependency installed

- `shadcn`

## Expected behavior

- Private shell com sidebar full-height, topbar, menu de usuario e area de conteudo.
- Itens do menu com icones e estrutura inicial em grupos (Dashboard isolado + label `Modulos`).
- Sidebar desktop colapsavel exibindo apenas icones quando fechado.
- Ao passar mouse (ou foco por teclado) sobre icone colapsado, exibir label do item.
- Mobile sem sidebar fixa: navegacao lateral somente via drawer.
- Logo do shell com icone + texto; quando colapsado, mostrar apenas icone.
- Topbar com botao toggle + notificacao + dropdown de usuario.
- Public layout sem shell admin, centralizado e boxed para auth/landing.
- Arquivos customizados seguem `<nome-kebab>.<tipo>.<ext>`.
- Excecoes aceitas: nomes fixos de framework e componentes no formato original do Shadcn.
