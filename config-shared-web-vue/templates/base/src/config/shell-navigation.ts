export type SidebarMenuItem = {
  id: string
  label: string
  to: string
  match?: 'exact' | 'prefix'
}

export type SidebarMenuSection = {
  id: string
  label?: string
  items: SidebarMenuItem[]
}

export const DEFAULT_SHELL_MAIN_ITEM: SidebarMenuItem = {
  id: 'dashboard',
  label: 'Dashboard',
  to: '/dashboard',
  match: 'exact',
}

export const DEFAULT_SHELL_SECTIONS: SidebarMenuSection[] = [
  {
    id: 'modules',
    label: 'Módulos',
    items: [
      {
        id: 'example',
        label: 'Examples',
        to: '/example',
        match: 'prefix',
      },
    ],
  },
]
