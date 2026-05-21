# Vue Project Pattern (Vue 3 + PrimeVue 4)

## main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.app-dark' }
  }
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
```

## vite.config.ts (proxy para NestJS)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})
```

## Estrutura de store Pinia (por BC)

```typescript
// stores/customer.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer } from '@/services/customer.service'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    // chamar service
    loading.value = false
  }

  return { customers, loading, fetchAll }
})
```

## Checklist

- [ ] Vue 3 + TypeScript + Vue Router + Pinia (npm create vue@latest)
- [ ] **Tailwind CSS v4** configurado (`references/tailwind-setup.md`)
- [ ] PrimeVue 4 instalado com tema Aura (widgets complexos)
- [ ] PrimeIcons instalado
- [ ] Proxy Vite configurado para /api → NestJS
- [ ] CORS habilitado no NestJS
- [ ] Pinia store por Bounded Context
