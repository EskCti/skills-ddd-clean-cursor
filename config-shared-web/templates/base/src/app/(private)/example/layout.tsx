'use client';

import { ArrowLeft, FormInput, MousePointerClick, Rows3, Table2 } from 'lucide-react';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';
import { AdminShell } from '@/shared/template/admin-shell.component';

const exampleItems: SidebarMenuItem[] = [
  {
    id: 'buttons',
    label: 'Buttons',
    href: '/example/buttons',
    icon: MousePointerClick,
  },
  {
    id: 'forms',
    label: 'Forms',
    href: '/example/forms',
    icon: FormInput,
  },
  {
    id: 'tables',
    label: 'Tables',
    href: '/example/tables',
    icon: Table2,
  },
  {
    id: 'widgets',
    label: 'Widgets',
    href: '/example/widgets',
    icon: Rows3,
  },
];

function ExampleSidebarMenu() {
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
          id: 'examples',
          label: 'Examples',
          items: exampleItems,
        },
      ]}
    />
  );
}

export default function ExampleModuleLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell sidebar={<ExampleSidebarMenu />}>{children}</AdminShell>;
}
