# Integração do Shell (Angular)

## Após o script

1. **Rotas** — em `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { shellRoutes } from './app.routes.shell';

export const routes: Routes = [
  // { path: 'auth', loadChildren: ... }  ← rotas públicas
  ...shellRoutes,
];
```

2. **Modo dark/light** — em `src/index.html`:

```html
<body class="dark">
```

3. **angular.json** — confirmar `"styles": ["src/styles.scss"]`.

## Customizar menu

Edite `src/app/layout/shell-navigation.config.ts` ou passe inputs para `AdminShellComponent`.

## Novos módulos (BC)

Adicione item em `DEFAULT_SHELL_SECTIONS` e crie rota lazy em `app.routes.shell.ts` (ou no merge final).
