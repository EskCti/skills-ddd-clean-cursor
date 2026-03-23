'use client';
import { Blocks, LayoutDashboard } from 'lucide-react';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';
import { AdminShell } from '@/shared/template/admin-shell.component';

const dashboardItem: SidebarMenuItem = {
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  match: 'exact',
};

const moduleItems: SidebarMenuItem[] = [
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
  return <AdminShell sidebar={<MainNavigation />}>{children}</AdminShell>;
}
