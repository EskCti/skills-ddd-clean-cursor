# Angular Project Pattern

## proxy.conf.json (apps/web-angular/)

```json
{
  "/api": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## app.config.ts (Angular 17+ standalone)

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
};
```

## app.routes.ts

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/customers.routes').then(m => m.CUSTOMERS_ROUTES),
  },
];
```

## Estrutura de feature (por Bounded Context)

```
apps/web-angular/src/app/features/customers/
├── customers.routes.ts
├── components/
│   ├── customer-list.component.ts
│   └── customer-form.component.ts
├── services/
│   └── customer.service.ts
└── models/
    └── customer.model.ts
```

## Checklist

- [ ] Angular 17+ standalone instalado (ng new --standalone)
- [ ] **Tailwind CSS v4** configurado (`references/tailwind-setup.md`)
- [ ] PrimeNG + PrimeIcons instalados (widgets; sem PrimeFlex)
- [ ] proxy.conf.json configurado para /api → NestJS
- [ ] CORS habilitado no NestJS (app.enableCors())
- [ ] Lazy loading por feature (loadComponent / loadChildren)
- [ ] HttpClient com interceptor de auth configurado
