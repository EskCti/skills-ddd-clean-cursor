'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Separator } from '@/shared/components/ui/separator';
import { useShell } from '@/shared/hooks/shell.hook';
import { cn } from '@/shared/lib/class-name.util';
import Image from 'next/image';

type AdminShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
  logoIcon?: ReactNode;
  logoText?: ReactNode;
  logoHref?: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string | null;
  profileHref?: string;
  onLogout?: () => void;
};

export function AdminShell({
  sidebar,
  children,
  logoIcon,
  logoText,
  logoHref = '/dashboard',
  userName = 'Usuario',
  userEmail = 'usuario@aplicacao.local',
  userAvatarUrl,
  profileHref = '/auth/profile',
  onLogout,
}: AdminShellProps) {
  const router = useRouter();
  const { isSidebarOpen, isMobile, setSidebarOpen, toggleSidebar } = useShell();
  const collapsed = !isMobile && !isSidebarOpen;
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const brandIcon = logoIcon ?? <span className="text-xs font-bold tracking-tight">AP</span>;
  const brandText = logoText ?? 'Application';
  const resolvedAvatarUrl = userAvatarUrl && failedAvatarUrl !== userAvatarUrl ? userAvatarUrl : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={cn('hidden border-r border-border bg-card lg:flex lg:flex-col', collapsed ? 'w-18' : 'w-72')}>
          <div
            className={cn(
              'flex h-16 border-b border-border',
              collapsed ? 'items-center justify-center px-2' : 'items-center gap-2 px-4',
            )}
          >
            <Link
              href={logoHref}
              aria-label="Ir para dashboard"
              className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2')}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                {brandIcon}
              </div>
              {!collapsed ? <div className="truncate text-sm font-semibold">{brandText}</div> : null}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </aside>

        <Sheet open={isMobile && isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 border-border bg-card p-0">
            <SheetHeader className="border-b border-border px-4 py-3 text-left">
              <SheetTitle>
                <Link
                  href={logoHref}
                  aria-label="Ir para dashboard"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    {brandIcon}
                  </span>
                  <span>{brandText}</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto">{sidebar}</div>
          </SheetContent>
        </Sheet>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Alternar menu lateral">
              <Menu className="size-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notificacoes">
                <Bell className="size-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto gap-2 px-2.5 py-1.5">
                    {resolvedAvatarUrl ? (
                      <Image
                        src={resolvedAvatarUrl}
                        alt={`Avatar de ${userName}`}
                        className="size-8 rounded-full border border-border object-cover"
                        onError={() => setFailedAvatarUrl(userAvatarUrl ?? null)}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                        <UserRound className="size-4" />
                      </span>
                    )}

                    <span className="hidden min-w-0 flex-col items-start text-left md:flex">
                      <span className="max-w-35 truncate text-sm leading-4">{userName}</span>
                      <span className="max-w-35 truncate text-xs text-muted-foreground">{userEmail}</span>
                    </span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <Separator className="my-1" />
                  <DropdownMenuItem onSelect={() => router.push(profileHref)}>
                    <UserRound className="mr-2 size-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-400">
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main class="flex-1 p-4 md:p-6">{children}</main>

          <footer className="border-t border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
            <p>
              &copy; {new Date().getFullYear()} {brandText}. Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
