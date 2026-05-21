import type { RouteRecordRaw } from 'vue-router'

/**
 * Rotas do shell admin. Mescle com router/index.ts existente:
 * - importe shellRoutes como grupo principal autenticado
 * - preserve rotas públicas (login) fora deste grupo
 */
export const shellRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AdminShell.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'example',
        name: 'example',
        component: () => import('@/views/ExampleOverviewView.vue'),
      },
    ],
  },
]
