import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShellService {
  readonly sidebarOpen = signal(true);
  readonly mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.mobileSidebarOpen.update((open) => !open);
      return;
    }

    this.sidebarOpen.update((open) => !open);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
