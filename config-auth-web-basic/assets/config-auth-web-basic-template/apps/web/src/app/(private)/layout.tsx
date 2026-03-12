'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, FlaskConical, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { AuthSidebarMenu, PrivateRoute, RequireAdmin } from '@/modules/auth';
import { useAuth } from '@/modules/auth/data';
import { ExampleSidebarMenu } from '@/modules/examples/components/example-navigation.component';
import { ShellProvider } from '@/shared/context/shell.context';
import { useShell } from '@/shared/hooks/shell.hook';
import { cn } from '@/shared/lib/class-name.util';
import { AdminShell } from '@/shared/template/admin-shell.component';

type MenuIcon = ComponentType<{ className?: string }>;

type MenuItem = {
  label: string;
  href: string;
  icon: MenuIcon;
};

const dashboardItem: MenuItem = {
  label: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
};

const moduleItems: MenuItem[] = [
  { label: 'Autenticação', href: '/auth', icon: ShieldCheck },
  { label: 'Exemplos', href: '/example', icon: FlaskConical },
];

function SidebarLink({ item, active, collapsed }: { item: MenuItem; active?: boolean; collapsed: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        collapsed && 'justify-center px-2',
        active && 'bg-accent text-accent-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
      {collapsed ? (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
          {item.label}
        </span>
      ) : null}
    </Link>
  );
}

function DefaultSidebarMenu({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <nav className="px-2 py-4">
      <div className="space-y-1">
        <SidebarLink
          item={dashboardItem}
          collapsed={collapsed}
          active={pathname === '/dashboard' || pathname.startsWith('/dashboard/')}
        />
      </div>

      <div className="my-4 h-px bg-border" />

      {!collapsed ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Modulos</p>
      ) : (
        <p className="sr-only">Modulos</p>
      )}

      <div className="space-y-1">
        {moduleItems.map((item) =>
          item.href === '/auth' ? (
            <RequireAdmin key={item.label}>
              <SidebarLink
                item={item}
                collapsed={collapsed}
                active={pathname === item.href || pathname.startsWith(item.href + '/')}
              />
            </RequireAdmin>
          ) : (
            <SidebarLink
              key={item.label}
              item={item}
              collapsed={collapsed}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ),
        )}
      </div>
    </nav>
  );
}

function ModuleAwareSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isSidebarOpen, isMobile } = useShell();
  const collapsed = !isMobile && !isSidebarOpen;

  if (pathname === '/example' || pathname.startsWith('/example/')) {
    return <ExampleSidebarMenu collapsed={collapsed} />;
  }

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    if (!user?.admin) {
      return <DefaultSidebarMenu collapsed={collapsed} pathname={pathname} />;
    }

    return <AuthSidebarMenu collapsed={collapsed} />;
  }

  return <DefaultSidebarMenu collapsed={collapsed} pathname={pathname} />;
}

export default function PrivateGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/auth/sign-in');
  };

  return (
    <ShellProvider defaultOpen>
      <PrivateRoute>
        <AdminShell
          sidebar={<ModuleAwareSidebar />}
          logoIcon={<Boxes className="size-5" />}
          logoText="Application"
          logoHref="/dashboard"
          userName={user?.name ?? 'Usuario'}
          userEmail={user?.email ?? 'usuario@aplicacao.local'}
          userAvatarUrl={user?.avatarUrl ?? null}
          profileHref="/auth/profile"
          onLogout={handleLogout}
        >
          {children}
        </AdminShell>
      </PrivateRoute>
    </ShellProvider>
  );
}
