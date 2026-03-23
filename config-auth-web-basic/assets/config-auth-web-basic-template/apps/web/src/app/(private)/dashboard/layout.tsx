'use client';
import { Blocks, LayoutDashboard, Fingerprint } from 'lucide-react';
import { PrivateAppShell } from '@/modules/auth/template/private-app-shell.component';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';

const dashboardItem: SidebarMenuItem = {
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  match: 'exact',
};

const moduleItems: SidebarMenuItem[] = [
  {
    id: 'auth',
    label: 'Autenticação',
    href: '/auth',
    icon: Fingerprint,
  },
  {
    id: 'example',
    label: 'Examples',
    href: '/example',
    icon: Blocks,
  },
];

function MainNavigation() {
  return (
    <SidebarMenu
      mainItem={dashboardItem}
      sections={[
        {
          id: 'modules',
          label: 'Módulos',
          items: moduleItems,
        },
      ]}
    />
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PrivateAppShell sidebar={<MainNavigation />}>{children}</PrivateAppShell>;
}
