import { Routes } from '@angular/router';

/**
 * Rotas do shell admin. Mescle com app.routes.ts existente:
 * - use shellRoutes como grupo principal de rotas autenticadas
 * - preserve rotas públicas (login) fora deste grupo
 */
export const shellRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'example',
        loadComponent: () =>
          import('./features/examples/example-overview.component').then((m) => m.ExampleOverviewComponent),
      },
    ],
  },
];
