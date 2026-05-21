export type SidebarMenuItem = {
  id: string;
  label: string;
  route: string;
  icon?: string;
  match?: 'exact' | 'prefix';
};

export type SidebarMenuSection = {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
};
