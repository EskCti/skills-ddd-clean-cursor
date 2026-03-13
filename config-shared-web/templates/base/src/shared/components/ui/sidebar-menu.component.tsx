'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Circle } from 'lucide-react';

type SidebarIcon = ComponentType<{ className?: string }>;

export type SidebarMenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: SidebarIcon;
  description?: string;
  match?: 'exact' | 'prefix';
};

export type SidebarMenuSection = {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
  dividerBefore?: boolean;
};

export type SidebarMenuProps = {
  mainItem?: SidebarMenuItem;
  sections: SidebarMenuSection[];
  collapsed?: boolean;
};

const ITEM_BASE_CLASS =
  'group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground';
const COLLAPSED_CLASS = 'justify-center px-2';
const ACTIVE_CLASS = 'bg-accent text-accent-foreground';

function joinClassNames(values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function isItemActive(pathname: string, item: SidebarMenuItem) {
  if (item.match === 'exact') {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarItemLink({
  item,
  active,
  collapsed,
}: {
  item: SidebarMenuItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon ?? Circle;

  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={joinClassNames([ITEM_BASE_CLASS, collapsed && COLLAPSED_CLASS, active && ACTIVE_CLASS])}
    >
      <Icon className="size-4 shrink-0" />
      <span className={joinClassNames(['truncate', collapsed && 'sr-only'])}>{item.label}</span>
      {collapsed ? (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
          {item.label}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarMenu({ mainItem, sections, collapsed = false }: SidebarMenuProps) {
  const pathname = usePathname();

  return (
    <nav className="px-2 py-4">
      {mainItem ? (
        <>
          <div className="space-y-1">
            <SidebarItemLink item={mainItem} active={isItemActive(pathname, mainItem)} collapsed={collapsed} />
          </div>
          <div className="my-4 h-px bg-border" />
        </>
      ) : null}

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {section.dividerBefore && sectionIndex > 0 ? <div className="mb-4 h-px bg-border" /> : null}
            {section.label ? (
              !collapsed ? (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {section.label}
                </p>
              ) : (
                <p className="sr-only">{section.label}</p>
              )
            ) : null}

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItemLink key={item.id} item={item} active={isItemActive(pathname, item)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
