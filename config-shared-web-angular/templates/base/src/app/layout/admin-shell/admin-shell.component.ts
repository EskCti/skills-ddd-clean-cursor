import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import type { SidebarMenuItem, SidebarMenuSection } from '../sidebar-menu/sidebar-menu.model';
import { DEFAULT_SHELL_SECTIONS, DEFAULT_SHELL_MAIN_ITEM } from '../shell-navigation.config';
import { ShellService } from '../../shared/services/shell.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SidebarMenuComponent, AppFooterComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground">
      <div class="flex min-h-screen">
        <aside
          class="hidden border-r border-border bg-card lg:flex lg:flex-col"
          [class.w-18]="!shell.sidebarOpen()"
          [class.w-72]="shell.sidebarOpen()"
        >
          <div
            class="flex h-16 border-b border-border"
            [class.items-center]="true"
            [class.justify-center]="!shell.sidebarOpen()"
            [class.gap-2]="shell.sidebarOpen()"
            [class.px-4]="shell.sidebarOpen()"
            [class.px-2]="!shell.sidebarOpen()"
          >
            <a
              routerLink="/dashboard"
              aria-label="Ir para dashboard"
              class="flex items-center gap-2"
              [class.justify-center]="!shell.sidebarOpen()"
            >
              <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">
                AP
              </div>
              @if (shell.sidebarOpen()) {
                <div class="truncate text-sm font-semibold">{{ appName() }}</div>
              }
            </a>
          </div>
          <div class="flex-1 overflow-y-auto">
            <app-sidebar-menu
              [mainItem]="resolvedMainItem()"
              [sections]="resolvedSections()"
              [collapsed]="!shell.sidebarOpen()"
            />
          </div>
        </aside>

        @if (shell.mobileSidebarOpen()) {
          <div class="fixed inset-0 z-40 bg-black/50 lg:hidden" (click)="shell.closeMobileSidebar()"></div>
          <aside class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card lg:hidden">
            <div class="flex h-16 items-center gap-2 border-b border-border px-4">
              <a routerLink="/dashboard" class="flex items-center gap-2 text-sm font-semibold" (click)="shell.closeMobileSidebar()">
                <span class="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">AP</span>
                <span>{{ appName() }}</span>
              </a>
            </div>
            <div class="flex-1 overflow-y-auto">
              <app-sidebar-menu [mainItem]="resolvedMainItem()" [sections]="resolvedSections()" />
            </div>
          </aside>
        }

        <div class="flex min-h-screen flex-1 flex-col">
          <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
            <button
              type="button"
              (click)="shell.toggleSidebar()"
              aria-label="Alternar menu lateral"
              class="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
            >
              ☰
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                aria-label="Notificações"
                class="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
              >
                🔔
              </button>

              <div class="relative">
                <button
                  type="button"
                  class="inline-flex h-auto items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-accent"
                >
                  <span class="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                    👤
                  </span>
                  <span class="hidden min-w-0 flex-col items-start text-left md:flex">
                    <span class="max-w-35 truncate text-sm leading-4">{{ userName() }}</span>
                    <span class="max-w-35 truncate text-xs text-muted-foreground">{{ userEmail() }}</span>
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main class="flex-1 p-4 md:p-6">
            <router-outlet />
          </main>

          <app-app-footer [appName]="appName()" />
        </div>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  readonly shell = inject(ShellService);
  readonly appName = input('__APP_NAME__');
  readonly userName = input('Usuario');
  readonly userEmail = input('usuario@aplicacao.local');
  readonly mainItem = input<SidebarMenuItem | undefined>();
  readonly sections = input<SidebarMenuSection[] | undefined>();

  resolvedMainItem(): SidebarMenuItem {
    return this.mainItem() ?? DEFAULT_SHELL_MAIN_ITEM;
  }

  resolvedSections(): SidebarMenuSection[] {
    return this.sections() ?? DEFAULT_SHELL_SECTIONS;
  }
}
