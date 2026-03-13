'use client';
import { ArrowLeft, Shield, UserCircle2, Users } from 'lucide-react';
import { AdminRoute } from '@/modules/auth';
import { PrivateAppShell } from '@/modules/auth/template/private-app-shell.component';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';

const authMenuItems: SidebarMenuItem[] = [
  {
    id: 'overview',
    label: 'Auth Dashboard',
    href: '/auth',
    match: 'exact',
    icon: Shield,
  },
  {
    id: 'users',
    label: 'Usuários',
    href: '/auth/users',
    icon: Users,
  },
  {
    id: 'profile',
    label: 'Perfil',
    href: '/auth/profile',
    icon: UserCircle2,
  },
];

export function AuthSidebarMenu() {
  return (
    <SidebarMenu
      mainItem={{
        id: 'back',
        label: 'Voltar',
        href: '/dashboard',
        icon: ArrowLeft,
      }}
      sections={[
        {
          id: 'auth',
          label: 'Autenticação',
          items: authMenuItems,
        },
      ]}
    />
  );
}

export default function AuthenticationModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <PrivateAppShell sidebar={<AuthSidebarMenu />}>{children}</PrivateAppShell>
    </AdminRoute>
  );
}
