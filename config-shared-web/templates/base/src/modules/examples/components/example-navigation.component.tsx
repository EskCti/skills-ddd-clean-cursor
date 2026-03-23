'use client';

import { ArrowLeft, FormInput, LayoutGrid, MousePointerClick, Rows3, Table2 } from 'lucide-react';
import { exampleMenuItems } from '@/modules/examples/data/example-menu.data';
import { SidebarMenu, type SidebarMenuItem } from '@/shared/components/ui/sidebar-menu.component';

const iconById = {
  overview: LayoutGrid,
  buttons: MousePointerClick,
  forms: FormInput,
  tables: Table2,
  widgets: Rows3,
} as const;

type ExampleSidebarMenuProps = {
  collapsed: boolean;
};

export function ExampleSidebarMenu({ collapsed }: ExampleSidebarMenuProps) {
  const backItem = exampleMenuItems.find((item) => item.id === 'back');
  const moduleItems: SidebarMenuItem[] = exampleMenuItems
    .filter((item) => item.id !== 'back')
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      description: item.description,
      icon: iconById[item.id as keyof typeof iconById],
      match: item.id === 'overview' ? 'exact' : 'prefix',
    }));

  return (
    <SidebarMenu
      mainItem={{
        id: backItem?.id ?? 'back',
        label: backItem?.label ?? 'Voltar',
        href: backItem?.href ?? '/dashboard',
        icon: ArrowLeft,
        match: 'exact',
      }}
      sections={[
        {
          id: 'examples',
          label: 'Examples',
          items: moduleItems,
        },
      ]}
      collapsed={collapsed}
    />
  );
}
