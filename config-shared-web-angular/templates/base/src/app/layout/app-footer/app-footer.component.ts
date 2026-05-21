import { Component, input } from '@angular/core';

@Component({
  selector: 'app-app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
      <p>&copy; {{ year }} {{ appName() }}. Todos os direitos reservados.</p>
    </footer>
  `,
})
export class AppFooterComponent {
  readonly appName = input('__APP_NAME__');
  readonly year = new Date().getFullYear();
}
