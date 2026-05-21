import type { SidebarMenuItem, SidebarMenuSection } from './sidebar-menu/sidebar-menu.model';

export const DEFAULT_SHELL_MAIN_ITEM: SidebarMenuItem = {
  id: 'dashboard',
  label: 'Dashboard',
  route: '/dashboard',
  match: 'exact',
};

export const DEFAULT_SHELL_SECTIONS: SidebarMenuSection[] = [
  {
    id: 'modules',
    label: 'Módulos',
    items: [
      {
        id: 'example',
        label: 'Examples',
        route: '/example',
        match: 'prefix',
      },
    ],
  },
];
