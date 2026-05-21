# Tailwind CSS Setup (Vue 3 + Vite)

Padrão de estilização do repositório: **Tailwind CSS v4** para layout, tipografia e responsividade. PrimeVue apenas para widgets complexos (DataTable, DatePicker, etc.).

## Instalação

```bash
cd apps/web-vue
npm install tailwindcss @tailwindcss/vite --save-dev
```

## vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
```

## src/assets/main.css

```css
@import 'tailwindcss';

:root {
  --background: #f4f4f5;
  --foreground: #111827;
  --primary: #d946ef;
  --border: #d4d4d8;
  --radius: 0.625rem;
}

.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --primary: #d946ef;
  --border: #27272a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-border: var(--border);
  --radius-lg: var(--radius);
}
```

## main.ts

```typescript
import './assets/main.css'
// ... PrimeVue, Pinia, router
```

## Uso em views

```vue
<template>
  <div class="flex flex-col gap-4 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
      <Button label="Novo Cliente" icon="pi pi-plus" @click="router.push('/customers/new')" />
    </div>
    <!-- DataTable PrimeVue para listagem -->
  </div>
</template>
```

## Checklist

- [ ] Tailwind v4 instalado (`tailwindcss` + `@tailwindcss/vite`)
- [ ] Plugin `@tailwindcss/vite` em `vite.config.ts`
- [ ] `@import 'tailwindcss'` em `main.css` importado no `main.ts`
- [ ] Tokens CSS alinhados ao padrão `config-shared-web`
- [ ] Layout e shell via classes Tailwind (não CSS scoped para estrutura global)
