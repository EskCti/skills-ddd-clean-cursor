import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { SidebarMenuItem, SidebarMenuSection } from './sidebar-menu.model';
import { ShellService } from '../../shared/services/shell.service';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="px-2 py-4">
      @if (mainItem()) {
        <div class="space-y-1">
          <a
            [routerLink]="mainItem()!.route"
            routerLinkActive="bg-accent text-accent-foreground"
            [routerLinkActiveOptions]="{ exact: mainItem()!.match !== 'prefix' }"
            (click)="shell.closeMobileSidebar()"
            class="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span class="inline-flex size-4 shrink-0 items-center justify-center text-xs">⌂</span>
            <span [class.sr-only]="collapsed()">{{ mainItem()!.label }}</span>
            @if (collapsed()) {
              <span class="sr-only">{{ mainItem()!.label }}</span>
            } @else {
              <span class="truncate">{{ mainItem()!.label }}</span>
            }
          </a>
        </div>
        <div class="my-4 h-px bg-border"></div>
      }

      <div class="space-y-4">
        @for (section of sections(); track section.id) {
          <div>
            @if (section.label) {
              @if (!collapsed()) {
                <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {{ section.label }}
                </p>
              } @else {
                <p class="sr-only">{{ section.label }}</p>
              }
            }

            <div class="space-y-1">
              @for (item of section.items; track item.id) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-accent text-accent-foreground"
                  [routerLinkActiveOptions]="{ exact: item.match !== 'prefix' }"
                  (click)="shell.closeMobileSidebar()"
                  [attr.aria-label]="collapsed() ? item.label : null"
                  class="group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  [class.justify-center]="collapsed()"
                  [class.px-2]="collapsed()"
                >
                  <span class="inline-flex size-4 shrink-0 items-center justify-center text-xs">•</span>
                  @if (!collapsed()) {
                    <span class="truncate">{{ item.label }}</span>
                  }
                  @if (collapsed()) {
                    <span
                      class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-md group-hover:block"
                    >
                      {{ item.label }}
                    </span>
                  }
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>
  `,
})
export class SidebarMenuComponent {
  readonly shell = inject(ShellService);
  readonly mainItem = input<SidebarMenuItem | undefined>();
  readonly sections = input<SidebarMenuSection[]>([]);
  readonly collapsed = input(false);
}
