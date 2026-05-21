# Tailwind CSS Setup (Angular 17+)

Padrão de estilização do repositório: **Tailwind CSS v4** para layout, tipografia e responsividade. PrimeNG apenas para widgets complexos (DataTable, Calendar, etc.) — **não** usar PrimeFlex.

## Instalação

```bash
cd apps/web-angular
npm install tailwindcss @tailwindcss/postcss postcss --save-dev
```

## postcss.config.json

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

## src/styles.scss

```scss
@import 'tailwindcss';

:root {
  --background: #f4f4f5;
  --foreground: #111827;
  --primary: #d946ef;
  --border: #d4d4d8;
  --radius: 0.625rem;
}

.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --primary: #d946ef;
  --border: #27272a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-border: var(--border);
  --radius-lg: var(--radius);
}
```

## angular.json

Garantir que `styles` inclui `src/styles.scss` (substituir ou complementar `styles.css` padrão).

## Uso em componentes

```typescript
@Component({
  selector: 'app-customer-list',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4 p-4 md:p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
        <p-button label="Novo" icon="pi pi-plus" routerLink="new" />
      </div>
      <!-- p-table PrimeNG para dados tabulares -->
    </div>
  `,
})
export class CustomerListComponent {}
```

## Checklist

- [ ] Tailwind v4 instalado (`tailwindcss` + `@tailwindcss/postcss`)
- [ ] `@import 'tailwindcss'` em `styles.scss`
- [ ] Tokens CSS alinhados ao padrão `config-shared-web` (background, primary, border)
- [ ] PrimeFlex **não** instalado — layout via classes Tailwind
- [ ] PrimeNG apenas para widgets que justifiquem (tabela, calendário, toast)
