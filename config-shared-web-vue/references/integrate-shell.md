# Integração do Shell (Vue)

## Após o script

1. **Vite + Tailwind** — em `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

2. **CSS** — em `src/main.ts`:

```typescript
import './assets/main.css'
```

3. **Rotas** — em `src/router/index.ts`:

```typescript
import { shellRoutes } from './shell.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // { path: '/login', component: LoginView },
    ...shellRoutes,
  ],
})
```

4. **Modo dark/light** — em `index.html`:

```html
<html lang="pt-BR" class="dark">
```

## Customizar menu

Edite `src/config/shell-navigation.ts` ou passe props para `AdminShell.vue`.

## Novos módulos (BC)

Adicione item em `DEFAULT_SHELL_SECTIONS` e rota em `shell.routes.ts`.
